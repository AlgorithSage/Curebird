import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import {  ShieldCheck, ScrollText, AlertTriangle  } from './Icons';

const TermsOfService = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    title="Terms of Service"
                    description="Read our terms and conditions."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            <div className="relative w-full max-w-4xl mx-auto bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-slate-300 p-8 sm:p-12">

                <div className="space-y-8">
                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            1. Acceptance of Terms
                        </h3>
                        <p className="leading-relaxed">
                            By accessing and using CureBird ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
                        </p>
                    </section>

                    <section className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                        <h3 className="text-xl font-semibold text-amber-400 mb-3 flex items-center gap-2">
                            <AlertTriangle size={20} /> 2. Medical Disclaimer
                        </h3>
                        <p className="leading-relaxed text-amber-100/80">
                            CureBird uses artificial intelligence to analyze medical data. <strong className="text-amber-400">The Platform is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong> Never disregard professional medical advice or delay in seeking it because of something you have read or analyzed on this Platform. In case of a medical emergency, call your local emergency services immediately.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h3>
                        <ul className="list-disc pl-5 space-y-2 marker:text-amber-500">
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree to provide accurate and up-to-date medical information.</li>
                            <li>You represent that you have the legal right to upload and analyze any medical records submitted to the Platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">4. Data Privacy & Security</h3>
                        <p className="leading-relaxed">
                            We implement industry-standard security measures to protect your personal health information. However, no method of transmission over the Internet is 100% secure. By using CureBird, you acknowledge that you understand and accept the inherent risks of data transmission.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h3>
                        <p className="leading-relaxed">
                            The CureBird platform, including its AI algorithms, interface design, and branding, is the exclusive property of CureBird Inc. and is protected by copyright and intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">6. Termination</h3>
                        <p className="leading-relaxed">
                            We reserve the right to suspend or terminate your access to the Platform immediately, without prior notice, if you breach these Terms of Service.
                        </p>
                    </section>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 text-center">
                    <button
                        onClick={() => onNavigate('Dashboard')}
                        className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition-all"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
