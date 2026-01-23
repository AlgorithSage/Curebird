import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import { Lock, Database, Eye, Server } from './Icons';

const PrivacyPolicy = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    return (
        <div className="min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden">
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
                                className="text-slate-400 hover:text-white transition-colors font-medium border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 px-4 py-2 rounded-lg"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-500 to-emerald-700 mb-6 drop-shadow-sm text-glow">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Your privacy is our priority. We believe in transparency about how your health data is handled.
                    </p>
                </div>

                <div className="glass-card space-y-12 relative overflow-hidden animated-border animated-border-emerald">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

                    {/* Key Highlights */}
                    <section className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                            <Database className="text-amber-500 mb-4" size={32} />
                            <h4 className="text-lg font-bold text-white mb-2">Data Collection</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                We collect medical records (PDF/Images) and personal health stats strictly to provide our AI analysis and portfolio services.
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                            <Server className="text-emerald-500 mb-4" size={32} />
                            <h4 className="text-lg font-bold text-white mb-2">Secure Storage</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Messages and files are stored securely using Google Firebase, organized by User ID with strict access controls.
                            </p>
                        </div>
                    </section>

                    {/* 1. Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">01</span>
                            Information We Collect
                        </h2>
                        <ul className="space-y-4 text-slate-300">
                            <li className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                                <div>
                                    <strong className="block text-white">Identity & Contact Data</strong>
                                    Name, email address (via Google Auth or Email Sign-up), and date of birth.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                                <div>
                                    <strong className="block text-white">Medical Records & Files</strong>
                                    Prescriptions, lab reports, and imaging files you explicitly upload for analysis by Cure Analyzer.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                                <div>
                                    <strong className="block text-white">Usage Data</strong>
                                    Interaction metrics provided via Vercel Analytics to improve platform performance.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* 2. How We Process Data (AI) */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center text-sm">02</span>
                            AI & Data Processing
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            To provide our core services, primarily "Cure Analyzer" and "CureAI", we utilize third-party AI inference engines:
                        </p>
                        <div className="bg-sky-500/10 p-6 rounded-2xl border border-sky-500/20">
                            <h3 className="text-lg font-bold text-sky-400 mb-2">Groq API (Llama Models)</h3>
                            <p className="text-sky-100/80 text-sm leading-relaxed">
                                When you chat with CureAI or upload a document, text and image data are sent to Groq's high-performance inference API to run Llama 3 models. These inputs are processed to generate responses or summaries and are subject to Groq's privacy standards.
                            </p>
                        </div>
                    </section>

                    {/* 3. Data Sharing & Infrastructure */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm">03</span>
                            Infrastructure & Sharing
                        </h2>
                        <p className="text-slate-300 mb-4">We do <strong>not</strong> sell your personal health data. Your data is only shared with the underlying infrastructure providers required to operate the service:</p>
                        <ul className="grid gap-3 md:grid-cols-2">
                            <li className="bg-white/5 px-4 py-3 rounded-lg text-sm text-slate-300 border border-white/5">
                                <strong>Google Cloud Run:</strong> Hosting backend services.
                            </li>
                            <li className="bg-white/5 px-4 py-3 rounded-lg text-sm text-slate-300 border border-white/5">
                                <strong>Firebase Auth/Firestore:</strong> Identity & Database.
                            </li>
                            <li className="bg-white/5 px-4 py-3 rounded-lg text-sm text-slate-300 border border-white/5">
                                <strong>Vercel:</strong> Frontend hosting & analytics.
                            </li>
                            <li className="bg-white/5 px-4 py-3 rounded-lg text-sm text-slate-300 border border-white/5">
                                <strong>Groq Inc:</strong> AI Inference processing.
                            </li>
                        </ul>
                    </section>


                    {/* 4. Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center text-sm">04</span>
                            Your Rights
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            You retain full ownership of your medical data. You can at any time:
                        </p>
                        <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-300 marker:text-fuchsia-500">
                            <li><strong>Access</strong> your stored records via the Medical Portfolio.</li>
                            <li><strong>Delete</strong> specific records or your entire account via Settings.</li>
                            <li><strong>Export</strong> your data summaries provided by the platform.</li>
                        </ul>
                    </section>

                    {/* Footer Action */}
                    <div className="pt-8 border-t border-white/10 flex justify-center">
                        <button
                            onClick={() => onNavigate(-1)}
                            className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-white/10"
                        >
                            Return to App
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

export default PrivacyPolicy;
