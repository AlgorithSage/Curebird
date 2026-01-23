import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import { ShieldCheck, ScrollText, AlertTriangle } from './Icons';

const TermsOfService = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
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
                        Terms of Service
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Please read these terms carefully before using the Curebird platform.
                    </p>
                </div>

                <div className="glass-card-amber space-y-20 relative overflow-hidden p-10 md:p-20">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                    {/* 1. Acceptance */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">01</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            By accessing or using <strong>Curebird</strong> ("the Platform"), a digital health platform providing AI-driven health insights, medical record digitization, and epidemiological tracking, you agree to be legally bound by these Terms of Service.
                        </p>
                    </section>

                    {/* 2. Medical Disclaimer - CRITICAL */}
                    <section className="bg-amber-500/5 -mx-4 md:-mx-8 p-6 md:p-8 rounded-2xl border border-amber-500/10">
                        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                            <AlertTriangle className="text-amber-500" size={28} />
                            Critical Medical Disclaimer
                        </h2>
                        <div className="space-y-4 text-amber-100/90 leading-relaxed">
                            <p>
                                <strong>Curebird is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment.</strong>
                            </p>
                            <p>
                                The Platform utilizes artificial intelligence (including Large Language Models via Groq API) to analyze data. AI outputs (from CureAI, Cure Analyzer) may contain errors, hallucinations, or inaccuracies.
                            </p>
                            <p>
                                <strong className="text-amber-400">ALWAYS</strong> consult a qualified healthcare professional for any medical concerns. Never disregard professional medical advice based on information from this Platform. In emergencies, contact emergency services immediately.
                            </p>
                        </div>
                    </section>

                    {/* 3. Description of Services via Docs */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">03</span>
                            Description of Services
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Curebird provides the following features, subject to change:
                        </p>
                        <ul className="grid gap-4 md:grid-cols-2">
                            <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <strong className="block text-white mb-1">Cure Analyzer</strong>
                                <span className="text-sm text-slate-400">Digitization and summarization of medical reports using AI vision models.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <strong className="block text-white mb-1">CureAI Assistant</strong>
                                <span className="text-sm text-slate-400">Context-aware conversational health assistance powered by LLMs.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <strong className="block text-white mb-1">Medical Portfolio</strong>
                                <span className="text-sm text-slate-400">Secure storage and organization of personal health records and vitals.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <strong className="block text-white mb-1">CureStat</strong>
                                <span className="text-sm text-slate-400">Public dashboard visualizing epidemiological trends and air quality data.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 4. AI & Third Party Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm">04</span>
                            AI & Third-Party Services
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Our services rely on third-party integrations to function:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-300 marker:text-purple-500">
                            <li><strong>Groq API:</strong> Used for high-speed AI inference (Llama models) for text generation and vision analysis.</li>
                            <li><strong>Google & Firebase:</strong> Used for secure authentication, database services, and cloud storage.</li>
                            <li><strong>WAQI:</strong> Used for real-time air quality data.</li>
                        </ul>
                        <p className="text-slate-400 text-sm mt-4">
                            By using Curebird, you acknowledge that data may be processed by these third-party providers in accordance with our Privacy Policy.
                        </p>
                    </section>

                    {/* 5. User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center text-sm">05</span>
                            User Responsibilities
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-300 marker:text-sky-500">
                            <li>You must be at least 18 years old or use the platform with parental consent.</li>
                            <li>You agree to provide accurate medical information.</li>
                            <li>You retain ownership of your data but grant Curebird a license to store and process it for the purpose of providing services.</li>
                        </ul>
                    </section>

                    {/* 6. Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm">06</span>
                            Limitation of Liability
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            To the fullest extent permitted by law, Curebird and its developers shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Platform, or from reliance on any AI-generated content.
                        </p>
                    </section>

                    {/* Footer Action */}
                    <div className="pt-8 border-t border-white/10 flex justify-center">
                        <button
                            onClick={() => onNavigate(-1)}
                            className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-white/10"
                        >
                            I Accept & Continue
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

export default TermsOfService;
