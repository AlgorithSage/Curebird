from flask import Blueprint, jsonify, request
import razorpay
import os
import hmac
import hashlib
import traceback
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .services import _TRENDS_CACHE # Import if needed, or just standard libs

# Explicitly load .env so key lookups don't depend on another module being
# imported first (previously this only worked because services.py ran load_dotenv).
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

payment_bp = Blueprint('payment_routes', __name__)

# --- Configuration -------------------------------------------------------
key_id = os.getenv('RAZORPAY_KEY_ID')
key_secret = os.getenv('RAZORPAY_KEY_SECRET')
webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET')

# Fixed Plan IDs (create these ONCE in the Razorpay dashboard and set them in
# the environment). If unset, we fall back to creating a plan on the fly so
# local/dev still works — but production should always use fixed IDs.
PLAN_IDS = {
    'Basic': os.getenv('RAZORPAY_PLAN_BASIC'),
    'Premium': os.getenv('RAZORPAY_PLAN_PREMIUM'),
}

# Initialize Razorpay Client
# WARNING: If keys are missing, this might fail on startup, so we wrap in try-except or handle gracefully
try:
    if key_id and key_secret:
        client = razorpay.Client(auth=(key_id, key_secret))
    else:
        print("Razorpay Client Init Warning: Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET")
        client = None
except Exception as e:
    print(f"Razorpay Client Init Warning: {e}")
    client = None


# --- Helpers -------------------------------------------------------------
def _get_db():
    """Lazily initialize firebase-admin and return a Firestore client (or None)."""
    try:
        import firebase_admin
        from firebase_admin import firestore

        if not firebase_admin._apps:
            # Cloud Run supplies the service account automatically.
            firebase_admin.initialize_app()

        return firestore.client()
    except Exception as e:
        print(f"Firebase Init Error: {e}")
        return None


def _persist_subscription(uid, fields):
    """Write subscription fields onto the user document. Best-effort."""
    if not uid:
        print("persist_subscription: no uid provided, skipping DB write")
        return False
    db = _get_db()
    if not db:
        return False
    try:
        from firebase_admin import firestore
        payload = dict(fields)
        payload['subscriptionUpdatedAt'] = firestore.SERVER_TIMESTAMP
        db.collection('users').document(uid).set(payload, merge=True)
        return True
    except Exception as e:
        print(f"persist_subscription error: {e}")
        return False


def _resolve_plan_id(plan_type, selected_plan):
    """Return a fixed plan_id from env, or create one on the fly as a fallback."""
    fixed = PLAN_IDS.get(plan_type)
    if fixed:
        return fixed

    # Fallback: create on the fly (dev only)
    print(f"WARN: No fixed plan id for {plan_type}; creating one on the fly.")
    plan = client.plan.create({
        "period": "monthly",
        "interval": 1,
        "item": {
            "name": selected_plan['name'],
            "amount": selected_plan['amount'],
            "currency": "INR",
            "description": f"{plan_type} Subscription"
        }
    })
    return plan['id']


# --- Routes --------------------------------------------------------------
@payment_bp.route('/api/pay/create-subscription', methods=['POST'])
def create_subscription():
    try:
        if not client:
             return jsonify({'error': 'Payment gateway not configured (Missing Keys)'}), 500

        data = request.get_json()
        plan_type = data.get('plan', 'Premium')
        uid = data.get('uid')

        # 1. Define Plan Mapping
        plan_details = {
            'Basic': {'amount': 5900, 'name': 'CureBird Basic'},
            'Premium': {'amount': 9900, 'name': 'CureBird Premium'}
        }

        selected_plan = plan_details.get(plan_type, plan_details['Premium']) # Default to Premium

        try:
            plan_id = _resolve_plan_id(plan_type, selected_plan)
        except Exception as plan_error:
            print(f"Plan Resolve Error: {plan_error}")
            return jsonify({'error': f"Could not generate subscription plan: {str(plan_error)}"}), 500

        # 2. Create Subscription
        # UPI Autopay requires: customer_notify=1, total_count (optional for finite)

        subscription_options = {
            "plan_id": plan_id,
            "total_count": 120, # 10 Years
            "quantity": 1,
            "customer_notify": 1,
            "notes": {
                "plan_type": plan_type,
                "uid": uid or "",
                "created_at": str(datetime.now())
            }
        }

        # 14-Day Free Trial Logic ONLY for Premium
        if plan_type == 'Premium':
            future_start_date = datetime.now() + timedelta(days=14)
            start_at_timestamp = int(future_start_date.timestamp())

            subscription_options["start_at"] = start_at_timestamp
            subscription_options["notes"]["trial_period"] = "14_days"
            # Set explicit small verification charge (2 INR) to replace default 5 INR auth
            subscription_options["addons"] = [
                {
                    "item": {
                        "name": "Verification Charge",
                        "amount": 200, # 200 paise = 2 INR
                        "currency": "INR"
                    }
                }
            ]

        subscription = client.subscription.create(subscription_options)

        # Record the pending subscription against the user so the webhook can
        # reconcile later even before the browser verify call returns.
        _persist_subscription(uid, {
            'subscriptionId': subscription['id'],
            'subscriptionTier': plan_type,
            'subscriptionStatus': 'created',
            'planId': plan_id,
            'paymentMethod': 'RAZORPAY',
        })

        return jsonify({
            'subscription_id': subscription['id'],
            'key_id': key_id,
            'plan_id': plan_id
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/api/pay/verify-subscription', methods=['POST'])
def verify_subscription():
    try:
        data = request.get_json()

        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_subscription_id = data.get('razorpay_subscription_id')
        razorpay_signature = data.get('razorpay_signature')
        uid = data.get('uid')

        if not all([razorpay_payment_id, razorpay_subscription_id, razorpay_signature]):
            return jsonify({'error': 'Missing verification parameters'}), 400

        if not key_secret:
            return jsonify({'error': 'Payment gateway not configured (Missing Keys)'}), 500

        # Verify Signature
        # The signature is constructed as: razorpay_payment_id + | + razorpay_subscription_id
        msg = f"{razorpay_payment_id}|{razorpay_subscription_id}"

        generated_signature = hmac.new(
            bytes(key_secret, 'utf-8'),
            bytes(msg, 'utf-8'),
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(generated_signature, razorpay_signature):
            # SUCCESS — persist the authenticated subscription to Firestore.
            _persist_subscription(uid, {
                'subscriptionId': razorpay_subscription_id,
                'subscriptionStatus': 'authenticated',
                'lastPaymentId': razorpay_payment_id,
                'subscriptionDate': datetime.now().isoformat(),
            })
            return jsonify({'success': True, 'status': 'active'})
        else:
            return jsonify({'error': 'Invalid Signature'}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/api/pay/webhook', methods=['POST'])
def razorpay_webhook():
    """Receive recurring subscription lifecycle events from Razorpay.

    UPI Autopay / recurring charges happen server-side at Razorpay every cycle
    and are ONLY communicated via this webhook. Configure the endpoint URL and
    secret in Razorpay Dashboard > Settings > Webhooks, subscribing to the
    subscription.* and payment.failed events.
    """
    try:
        raw_body = request.get_data()  # exact bytes, required for signature
        received_sig = request.headers.get('X-Razorpay-Signature', '')

        if not webhook_secret:
            print("Webhook received but RAZORPAY_WEBHOOK_SECRET is not set.")
            return jsonify({'error': 'Webhook not configured'}), 500

        expected_sig = hmac.new(
            bytes(webhook_secret, 'utf-8'),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, received_sig):
            return jsonify({'error': 'Invalid webhook signature'}), 400

        payload = request.get_json(silent=True) or {}
        event = payload.get('event', '')

        # Extract the subscription entity + uid from notes.
        sub_entity = (
            payload.get('payload', {})
                   .get('subscription', {})
                   .get('entity', {})
        )
        subscription_id = sub_entity.get('id')
        notes = sub_entity.get('notes') or {}
        uid = notes.get('uid')

        # Map Razorpay events -> our subscription status.
        status_map = {
            'subscription.activated': 'active',
            'subscription.charged': 'active',
            'subscription.authenticated': 'authenticated',
            'subscription.pending': 'pending',
            'subscription.halted': 'halted',
            'subscription.cancelled': 'cancelled',
            'subscription.completed': 'completed',
            'subscription.paused': 'paused',
            'subscription.resumed': 'active',
        }

        if event == 'payment.failed':
            new_status = 'payment_failed'
        else:
            new_status = status_map.get(event)

        if new_status and (uid or subscription_id):
            fields = {
                'subscriptionStatus': new_status,
                'lastWebhookEvent': event,
            }
            if subscription_id:
                fields['subscriptionId'] = subscription_id

            # Prefer uid from notes; otherwise look the user up by subscriptionId.
            if uid:
                _persist_subscription(uid, fields)
            elif subscription_id:
                db = _get_db()
                if db:
                    try:
                        docs = db.collection('users').where(
                            'subscriptionId', '==', subscription_id
                        ).limit(1).stream()
                        target = next(iter(docs), None)
                        if target:
                            _persist_subscription(target.id, fields)
                        else:
                            print(f"Webhook: no user for subscription {subscription_id}")
                    except Exception as e:
                        print(f"Webhook lookup error: {e}")

        # Always 200 so Razorpay does not needlessly retry acknowledged events.
        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        traceback.print_exc()
        # 500 lets Razorpay retry on genuine processing failures.
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/api/pay/verify-promo', methods=['POST'])
def verify_promo():
    try:
        data = request.json
        promo_code = data.get('code')
        user_uid = data.get('uid')

        if not promo_code or not user_uid:
            return jsonify({'success': False, 'error': 'Missing code or uid'}), 400

        # Hardcoded Developer Secret
        DEV_CODE = "CUREBIRD_DEV_2025"

        if promo_code.strip() == DEV_CODE:
            # Grant Premium Access
            db = _get_db()
            if not db:
                return jsonify({'success': False, 'error': "Database connection failed"}), 500

            from firebase_admin import firestore
            user_ref = db.collection('users').document(user_uid)
            user_ref.update({
                'subscriptionTier': 'Premium',
                'subscriptionStatus': 'active',
                'planId': 'developer_promo_lifetime',
                'subscriptionDate': firestore.SERVER_TIMESTAMP,
                'paymentMethod': 'PROMO_CODE'
            })

            return jsonify({
                'success': True,
                'message': 'Developer Access Granted',
                'tier': 'Premium'
            }), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid Promo Code'}), 400

    except Exception as e:
        print(f"Promo Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
