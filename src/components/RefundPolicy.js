import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, CreditCard, RefreshCw, AlertCircle } from './Icons';

const RefundPolicy = ({ onNavigate }) => {
    return (
        <div className="min-h-screen font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => onNavigate('Dashboard')} className="flex items-center gap-2 group">
                                <div className="relative w-10 h-10 flex items-center justify-center">
                                    <img src="/favicon.ico" alt="CureBird Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:opacity-90 transition-opacity">
                                    Cure<span className="text-amber-400">Bird</span><span className="text-green-500">.</span>
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate(-1)}
                                className="text-slate-400 hover:text-white transition-colors font-medium border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 px-4 py-2 rounded-lg"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 mb-6 drop-shadow-sm text-glow">
                        Refund & Cancellation Policy
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Transparent guidelines for your Curebird subscription.
                    </p>
                </div>

                <div className="glass-card-amber space-y-20 relative overflow-hidden p-10 md:p-20">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                    {/* 1. Cancellation Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">01</span>
                            Cancellation Policy
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed">
                            <p>
                                You can cancel your Curebird subscription at any time directly through your account settings or by contacting our support team.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-amber-500">
                                <li><strong>Immediate Effect:</strong> Upon cancellation, your subscription will remain active until the end of the current billing cycle.</li>
                                <li><strong>No Penalty:</strong> There are no cancellation fees. You can come back and resubscribe whenever you’re ready.</li>
                                <li><strong>Data Retention:</strong> After cancellation, your medical records remain securely stored in "Free Tier" mode, but premium AI features will be locked.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. Refund Eligibility */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">02</span>
                            Refund Eligibility
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed">
                            <p>
                                We strive for complete satisfaction. However, as Curebird offers instant access to digital services and AI compute, refunds are handled as follows:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        <Calendar className="text-amber-400" size={20} />
                                        14-Day Free Trial
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        You are not charged during your 14-day trial. If you cancel before the trial ends, you will never be charged.
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        <CreditCard className="text-amber-400" size={20} />
                                        First Payment
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        If you forget to cancel after the trial and are charged, we offer a <strong>48-hour grace period</strong>. Contact support within 48 hours of the charge for a full refund.
                                    </p>
                                </div>
                            </div>

                            <p className="pt-4">
                                <strong>Subsequent Renewals:</strong> We do not generally offer refunds for partial months or unused services after the initial 48-hour grace window, as our costs are incurred upfront.
                            </p>
                        </div>
                    </section>

                    {/* 3. Processing Refunds */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm">03</span>
                            Processing Timeline
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Refunds, when approved, are processed immediately by our billing system (Razorpay/Stripe).
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-300 marker:text-purple-500">
                            <li><strong>Bank Timeline:</strong> It typically takes <strong>5-7 business days</strong> for the funds to reflect in your original payment method, depending on your bank.</li>
                            <li><strong>Confirmation:</strong> You will receive an email confirmation once the refund has been initiated.</li>
                        </ul>
                    </section>

                    {/* 4. Contact for Billing */}
                    <section className="bg-amber-500/5 -mx-4 md:-mx-8 p-6 md:p-8 rounded-2xl border border-amber-500/10 flex items-start gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-full text-amber-500 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Billing Support</h3>
                            <p className="text-slate-300 mb-4">
                                If you adhere to the cancellation policy but are still charged, or if you believe there has been a billing error, please contact us immediately.
                            </p>
                            <a href="mailto:support@curebird.tech" className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
                                support@curebird.tech
                            </a>
                        </div>
                    </section>

                    {/* Footer Action */}
                    <div className="pt-8 border-t border-white/10 flex justify-center">
                        <button
                            onClick={() => onNavigate(-1)}
                            className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-white/10"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Curebird. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default RefundPolicy;
