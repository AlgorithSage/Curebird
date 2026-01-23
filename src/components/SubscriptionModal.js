import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Zap, Crown } from './Icons';

const SubscriptionModal = ({ isOpen, onClose, onSubscribe }) => {
    const [selectedTier, setSelectedTier] = useState('Premium'); // Default to Premium
    const [isProcessing, setIsProcessing] = useState(false);

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
            description: 'Full AI Suite & Analytics',
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


    const handleSubscribe = () => {
        setIsProcessing(true);
        // Mock processing delay (simulating gateway)
        setTimeout(() => {
            setIsProcessing(false);
            onSubscribe(selectedTier);
            onClose();
            alert(`Successfully subscribed to ${selectedTier} plan!`);
        }, 1500);
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
                className="relative w-full max-w-6xl h-[90vh] glass-card border border-white/10 flex flex-col overflow-hidden"
            >
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content Wrapper */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="text-center mb-4 md:mb-8 mt-10 md:mt-4">
                        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 mb-1 md:mb-2 drop-shadow-md">
                            Unlock Your Health Potential
                        </h2>
                        <p className="text-slate-300 text-xs md:text-base">
                            Choose the plan that fits your journey to better health.
                        </p>
                    </div>

                    {/* Tiers Grid - Mobile Scroll / Desktop Grid */}
                    <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
                        {tiers.map((tier) => {
                            const Icon = tier.icon;
                            const isSelected = selectedTier === tier.name;

                            return (
                                <div
                                    key={tier.name}
                                    onClick={() => setSelectedTier(tier.name)}
                                    className={`relative p-3 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center group min-w-[70vw] md:min-w-0 snap-center ${isSelected
                                        ? `bg-gradient-to-br from-slate-900 to-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] md:transform md:scale-[1.02] z-10`
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="hidden md:block absolute -top-4 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/50">
                                            Selected
                                        </div>
                                    )}

                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon size={16} className="text-white md:w-6 md:h-6" />
                                    </div>

                                    <h3 className={`text-lg md:text-2xl font-bold mb-0.5 md:mb-2 ${isSelected ? 'text-amber-400' : 'text-white'}`}>{tier.name}</h3>
                                    <div className="flex items-end justify-center gap-1 mb-2 md:mb-4">
                                        <span className="text-2xl md:text-4xl font-black text-white">{tier.price}</span>
                                        <span className="text-slate-400 text-[10px] md:text-sm mb-1 md:mb-2 font-medium">{tier.period}</span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] md:text-sm mb-3 md:mb-6 min-h-[24px] md:min-h-[40px] leading-relaxed">{tier.description}</p>

                                    <div className="space-y-1 md:space-y-2 w-full text-left mb-3 md:mb-6 flex-grow">
                                        {tier.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-slate-200">
                                                <div className="mt-0.5 min-w-[12px] md:min-w-[16px]"><Check size={12} className="text-emerald-400 md:w-4 md:h-4" /></div>
                                                <span className="text-[11px] md:text-sm leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                        {tier.unavailable.map((feature, idx) => (
                                            <div key={`u-${idx}`} className="hidden md:flex items-start gap-3 text-sm text-slate-600">
                                                <div className="mt-0.5 min-w-[16px]"><X size={16} /></div>
                                                <span className="line-through">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className={`w-full py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all ${isSelected
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
                    <div className="mt-8 pb-8 flex justify-center">
                        {selectedTier === 'Free' ? (
                            <button
                                onClick={handleSubscribe}
                                className="text-slate-400 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all border border-transparent hover:border-white/10"
                            >
                                Continue with Free Plan
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className="bg-amber-500 text-black px-12 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : `Subscribe to ${selectedTier}`} <Crown size={20} className="fill-current" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionModal;
