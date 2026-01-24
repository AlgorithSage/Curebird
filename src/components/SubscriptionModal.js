import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Zap, Crown } from './Icons';
import { API_BASE_URL } from '../config';

const SubscriptionModal = ({ isOpen, onClose, onSubscribe }) => {
    const [selectedTier, setSelectedTier] = useState('Premium'); // Default to Premium
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPromo, setShowPromo] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');

    const handlePromoSubmit = async (e) => {
        e.preventDefault();
        if (!promoCode.trim()) return;

        setIsProcessing(true);
        setPromoError('');

        try {
            // Need user uid to verify/apply
            // But this component might not have user prop explicitly passed in typical usage?
            // Actually it likely does or we need to getting it from context/localstore if not passed.
            // Looking at usage in App.js: <SubscriptionModal ... /> ... wait, App.js uses user state.
            // But we don't have user prop here.
            // However, the backend verify_promo needs uid.
            // Let's assume we can get it from auth or passing it down.
            // Checking App.js again... <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onSubscribe={handleSubscribe} />
            // It doesn't pass User! 
            // I should upgrade App.js to pass user, OR since I can't easily change App.js without another read, 
            // I can rely on the fact that `onAuthChanged` sets `user` in App.js. 
            // Wait, I can use `auth.currentUser.uid` directly from firebase/auth here if I import it.
            // Or better, let's update App.js to pass user to SubscriptionModal.
            // actually, simpler: use imports here.

            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setPromoError("You must be logged in.");
                setIsProcessing(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/pay/verify-promo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCode,
                    uid: currentUser.uid
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Promo Applied! You now have Premium Access.");
                onSubscribe('Premium');
                onClose();
            } else {
                setPromoError(data.error || "Invalid Code");
            }
        } catch (err) {
            console.error(err);
            setPromoError("Validation Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    if (!isOpen) return null;

    const tiers = [
        {
            name: 'Free',
            price: '₹0',
            period: '/forever',
            description: 'Essential record keeping',
            icon: Shield,
            color: 'from-slate-500 to-slate-700',
            features: [
                'Medical Portfolio',
                'All Records Management',
                'Medications Tracking',
                'Appointments Scheduling'
            ],
            unavailable: [
                'Cure Tracker Analysis',
                'Cure Stat Vitals',
                'Cure Analyzer AI',
                'Cure AI'
            ]
        },
        {
            name: 'Basic',
            price: '₹59',
            period: '/month',
            description: 'Advanced tracking & stats',
            icon: Zap,
            color: 'from-emerald-500 to-emerald-700',
            features: [
                'All Free Features',
                'Cure Tracker (Pathology)',
                'Cure Stat (Vitals Dashboard)',
                'Priority Support'
            ],
            unavailable: [
                'Cure Analyzer AI',
                'Cure AI Coach'
            ]
        },
        {
            name: 'Premium',
            price: '₹99',
            period: '/month',
            description: '14 Days Free, then ₹99/mo',
            icon: Crown,
            color: 'from-amber-500 to-amber-700',
            features: [
                'All Basic Features',
                'Cure Analyzer (Report Analysis)',
                'Cure AI Coach (24/7)',
                'Family Profile Sharing',
                'Predictive Health Alerts'
            ],
            unavailable: []
        }
    ];




    const handleSubscribe = async () => {
        if (selectedTier === 'Free') {
            onSubscribe(selectedTier);
            onClose();
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Subscription on Backend
            const response = await fetch(`${API_BASE_URL}/api/pay/create-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selectedTier })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to initiate subscription');

            const { subscription_id, key_id } = data;

            // 2. Open Razorpay Checkout
            const options = {
                key: key_id,
                subscription_id: subscription_id,
                name: "CureBird Health",
                description: `${selectedTier} Plan Subscription (14-Day Free Trial)`,
                image: "/logo192.png", // Ensure this exists or use null
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/api/pay/verify-subscription`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            onSubscribe(selectedTier);
                            onClose();
                            alert(`Welcome to CureBird ${selectedTier}!`);
                        } else {
                            alert("Payment Verification Failed: " + verifyData.error);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Verification Error. Please contact support.");
                    }
                },
                prefill: {
                    name: "CureBird User", // Ideally pull from user context
                    email: "user@example.com",
                    contact: ""
                },
                theme: {
                    color: "#F59E0B" // Amber-500
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Subscription Error:", error);
            alert("Error: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content - Visual Wrapper */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-7xl h-[90vh] glass-card-amber border border-white/10 flex flex-col overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content Wrapper */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
                    <div className="text-center mb-4 md:mb-6 mt-6 md:mt-2">
                        <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 mb-1 drop-shadow-md">
                            Unlock Your Health Potential
                        </h2>
                        <p className="text-slate-300 text-xs md:text-sm">
                            Choose the plan that fits your journey to better health.
                        </p>
                    </div>

                    {/* Tiers Grid - Vertical Stack on Mobile / Grid on Desktop */}
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8 px-1 md:px-0">
                        {tiers.map((tier) => {
                            const Icon = tier.icon;
                            const isSelected = selectedTier === tier.name;

                            return (
                                <div
                                    key={tier.name}
                                    onClick={() => setSelectedTier(tier.name)}
                                    // Reverted to standard vertical stack for logic clarity and clean mobile UI
                                    className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center group ${isSelected
                                        ? `bg-gradient-to-br from-slate-900 to-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] z-10 scale-[1.02] md:scale-100`
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >


                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-2 md:mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon size={16} className="text-white md:w-5 md:h-5" />
                                    </div>

                                    <h3 className={`text-base md:text-lg font-bold mb-0.5 md:mb-1 ${isSelected ? 'text-amber-400' : 'text-white'}`}>{tier.name}</h3>
                                    <div className="flex items-end justify-center gap-1 mb-2 md:mb-3">
                                        <span className="text-xl md:text-3xl font-black text-white">{tier.price}</span>
                                        <span className="text-slate-400 text-[10px] md:text-xs mb-1 font-medium">{tier.period}</span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] md:text-xs mb-3 md:mb-4 min-h-[24px] md:min-h-[32px] leading-relaxed">{tier.description}</p>

                                    <div className="space-y-1 md:space-y-1.5 w-full text-left mb-3 md:mb-4 flex-grow">
                                        {tier.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-[10px] md:text-xs text-slate-200">
                                                <div className="mt-0.5 min-w-[10px] md:min-w-[12px]"><Check size={10} className="text-emerald-400 md:w-3 md:h-3" /></div>
                                                <span className="leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                        {tier.unavailable.map((feature, idx) => (
                                            <div key={`u-${idx}`} className="hidden md:flex items-start gap-2 text-xs text-slate-600">
                                                <div className="mt-0.5 min-w-[12px]"><X size={12} /></div>
                                                <span className="line-through">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className={`w-full py-1.5 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all ${isSelected
                                            ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {isSelected ? 'Selected' : 'Choose Plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Action Area */}
                    <div className="mt-6 pb-6 flex justify-center">
                        {selectedTier === 'Free' ? (
                            <button
                                onClick={handleSubscribe}
                                className="text-slate-400 hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all border border-transparent hover:border-white/10"
                            >
                                Continue with Free Plan
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className="bg-amber-500 text-black px-8 py-3 rounded-full font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : (selectedTier === 'Premium' ? 'Start 14-Day Free Trial' : `Subscribe to ${selectedTier}`)} <Crown size={18} className="fill-current" />
                            </button>
                        )}
                    </div>
                    {selectedTier === 'Premium' && (
                        <p className="text-center text-slate-500 text-xs mt-2 pb-4">
                            You won't be charged today. Auto-renewal starts after 14 days.
                        </p>
                    )}

                    {/* Promo Code Code Section */}
                    <div className="text-center pb-8">
                        {!showPromo ? (
                            <button
                                onClick={() => setShowPromo(true)}
                                className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-amber-500 transition-colors font-bold"
                            >
                                Have a Promo Code?
                            </button>
                        ) : (
                            <form onSubmit={handlePromoSubmit} className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter Code"
                                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-500 outline-none uppercase tracking-wider"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="bg-slate-800 text-amber-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoError && <p className="text-red-400 text-[10px] font-bold">{promoError}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionModal;
