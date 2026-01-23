from flask import Blueprint, jsonify, request
import razorpay
import os
import hmac
import hashlib
import traceback
from datetime import datetime
from .services import _TRENDS_CACHE # Import if needed, or just standard libs

payment_bp = Blueprint('payment_routes', __name__)

# Initialize Razorpay Client
# WARNING: If keys are missing, this might fail on startup, so we wrap in try-except or handle gracefully
try:
    key_id = os.getenv('RAZORPAY_KEY_ID')
    key_secret = os.getenv('RAZORPAY_KEY_SECRET')
    client = razorpay.Client(auth=(key_id, key_secret))
except Exception as e:
    print(f"Razorpay Client Init Warning: {e}")
    client = None

@payment_bp.route('/api/pay/create-subscription', methods=['POST'])
def create_subscription():
    try:
        if not client:
             return jsonify({'error': 'Payment gateway not configured (Missing Keys)'}), 500

        data = request.get_json()
        plan_type = data.get('plan', 'Premium')
        
        # 1. Define Plan Mapping
        plan_details = {
            'Basic': {'amount': 5900, 'name': 'CureBird Basic'},
            'Premium': {'amount': 9900, 'name': 'CureBird Premium'}
        }
        
        selected_plan = plan_details.get(plan_type, plan_details['Premium']) # Default to Premium
        
        try:
             # In production, use fixed Plan IDs from env. Here we create on fly for demo.
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
             plan_id = plan['id']
        except Exception as plan_error:
            print(f"Plan Create Error: {plan_error}")
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
                "created_at": str(datetime.now())
            }
        }

        # 14-Day Free Trial Logic ONLY for Premium
        if plan_type == 'Premium':
            from datetime import timedelta
            future_start_date = datetime.now() + timedelta(days=14)
            start_at_timestamp = int(future_start_date.timestamp())
            
            subscription_options["start_at"] = start_at_timestamp
            subscription_options["notes"]["trial_period"] = "14_days"

        subscription = client.subscription.create(subscription_options)

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
        
        if not all([razorpay_payment_id, razorpay_subscription_id, razorpay_signature]):
            return jsonify({'error': 'Missing verification parameters'}), 400

        # Verify Signature
        # The signature is constructed as: razorpay_payment_id + | + razorpay_subscription_id
        msg = f"{razorpay_payment_id}|{razorpay_subscription_id}"
        
        generated_signature = hmac.new(
            bytes(key_secret, 'utf-8'),
            bytes(msg, 'utf-8'),
            hashlib.sha256
        ).hexdigest()

        if generated_signature == razorpay_signature:
            # SUCCESS
            # Here you would typically update the database
            return jsonify({'success': True, 'status': 'active'})
        else:
            return jsonify({'error': 'Invalid Signature'}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
