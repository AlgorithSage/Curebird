import React from 'react';
import { HeartPulse, LogIn, Dna, Pill, Stethoscope, Syringe, Activity, Globe, Shield, ShieldCheck, Zap, CheckCircle, ArrowRight, Play, Pause, Linkedin, Twitter, Instagram, Youtube, Facebook, Bot, ScanEye, Database, MessageSquare, Microscope, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from './SEO';

import CurebirdLogo from '../curebird_logo.png';

// --- Video Background Component (Mobile Optimized) ---
const VideoBackground = ({ isMobile }) => (
    <div className="fixed inset-0 overflow-hidden z-0">
        {!isMobile ? (
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-60"
            >
                <source src="/medical-bg.mp4" type="video/mp4" />
            </video>
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
    </div>
);

// --- Floating Icon Component ---
const FloatingIcon = ({ icon, className, duration, delay }) => (
    <motion.div
        className={`absolute text - amber - 400 / 15 ${className} pointer - events - none`}
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 15, opacity: 1 }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }}
    >
        {icon}
    </motion.div>
);

const LandingPage = ({ onLoginClick, onTermsClick, onPrivacyClick, onContactClick, onSubscribeClick }) => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.3, duration: 0.8, ease: "easeOut" }
        })
    };

    return (
        <div className="relative w-full text-white font-sans bg-slate-950 overflow-x-hidden">
            <SEO
                title="CureBird | AI-Powered Personal Medical Portfolio"
                description="Securely manage your medical records, track vitals, and get AI-powered health insights with CureBird. The comprehensive digital health dashboard for modern patient care."
            />
            <VideoBackground isMobile={isMobile} />

            {/* Hero Section */}
            <header className="relative min-h-screen flex flex-col items-center justify-center p-4">

                {/* Decorative Icons */}
                {!isMobile && (
                    <>
                        <FloatingIcon icon={<Dna size={120} />} className="top-16 left-16" duration={12} delay={0} />
                        <FloatingIcon icon={<HeartPulse size={100} />} className="bottom-20 right-24" duration={10} delay={1} />
                        <FloatingIcon icon={<Pill size={80} />} className="top-1/3 right-1/4" duration={14} delay={0.5} />
                    </>
                )}

                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="glass-card relative z-10 flex flex-col items-center px-6 py-12 sm:p-20 w-full max-w-4xl"
                >
                    {/* Logo & Title */}
                    <motion.div custom={0} variants={textVariants} className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                            <img src={CurebirdLogo} alt="Curebird Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                        </div>
                        <h1 className="text-5xl sm:text-8xl font-extrabold tracking-tight text-center sm:text-left">
                            Cure<span className="text-amber-400">bird</span>
                        </h1>
                    </motion.div>

                    <motion.h2 custom={1} variants={textVariants} className="text-xl sm:text-3xl text-slate-200 font-medium text-center">
                        Your Personal, Intelligent Medical Portfolio
                    </motion.h2>

                    <motion.p custom={2} variants={textVariants} className="text-base sm:text-lg text-slate-400 mt-4 max-w-2xl text-center leading-relaxed">
                        CureBird revolutionizes how you manage healthcare. Consolidate records, track appointments, and unlock
                        <span className="text-amber-400 font-semibold"> AI-driven insights</span> for a healthier future.
                    </motion.p>

                    <motion.div custom={3} variants={textVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <button
                            onClick={onLoginClick}
                            className="flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-full shadow-xl hover:bg-amber-400 transition-all font-bold text-lg"
                        >
                            <LogIn size={24} />
                            Get Started
                        </button>
                        <button
                            onClick={onSubscribeClick}
                            className="flex items-center gap-2 text-white border border-amber-500/50 px-8 py-4 rounded-full hover:bg-amber-500/10 transition-all font-bold text-lg backdrop-blur-sm"
                        >
                            <Crown size={24} className="text-amber-500" />
                            View Plans
                        </button>
                    </motion.div>
                </motion.div>
            </header>

            {/* Main Content Area: Authority & Depth */}
            <main className="relative z-10">

                {/* 1. KEY VALUE PROPOSITION (H2) */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                            Why Digitalize Your Medical History?
                        </h2>
                        <p className="text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed">
                            Healthcare is fragmented. CureBird is the cohesive force that brings your scattered prescriptions, lab reports, and imaging into one secure, AI-powered timeline. We don't just store data; we transform it into <span className="text-amber-400 font-semibold">life-saving intelligence</span>.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <ShieldCheck size={48} className="text-emerald-400" />,
                                title: "Bank-Grade HIPAA Security (epHI)",
                                desc: "Your health data is your property. We secure it with AES-256 encryption and strict access controls. You decide who sees your records—whether it's for 5 minutes or 5 years."
                            },
                            {
                                icon: <Zap size={48} className="text-amber-400" />,
                                title: "AI-Powered Diagnostics",
                                desc: "Stop guessing. Our advanced LLMs analyze your blood reports to flag anomalies like pre-diabetes or hypertension trends long before they become critical issues."
                            },
                            {
                                icon: <Globe size={48} className="text-blue-400" />,
                                title: "Universal Interoperability",
                                desc: "Whether it's a handwritten note from a local clinic or a DICOM file from a major hospital, CureBird creates a unified, graphable patient history accessible globally."
                            }
                        ].map((feature, idx) => (
                            <article key={idx} className="glass-card">
                                <div className="mb-8 p-5 rounded-2xl bg-slate-900 inline-block shadow-lg shadow-black/50">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">{feature.desc}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* 2. HOW IT WORKS (H2) */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-slate-100">
                            The CureBird Ecosystem
                        </h2>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-12">
                                <article className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">01</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Create Your Digital Twin</h3>
                                        <p className="text-slate-400 text-lg">
                                            Sign up in seconds. Build a comprehensive medical profile that includes your allergies, surgeries, and family history. This baseline data helps our AI tailor its monitoring specifically to your genetic predispositions.
                                        </p>
                                    </div>
                                </article>

                                <article className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">02</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Zero-Entry Digitization</h3>
                                        <p className="text-slate-400 text-lg">
                                            Nobody likes typing. Just snap a photo of your prescription or upload a PDF lab report. Our **OCR & NLP engine** instantly extracts values (like HbA1c, Lipid Profile) and plots them on interactive charts.
                                        </p>
                                    </div>
                                </article>

                                <article className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">03</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Doctor Collaboration</h3>
                                        <p className="text-slate-400 text-lg">
                                            Visiting a specialist? Generate a temporary "Share Link" or QR code. The doctor gets instant, read-only access to your relevant history without needing to install any app.
                                        </p>
                                    </div>
                                </article>
                            </div>

                            {/* Visual Representation */}
                            <div className="relative h-[600px] w-full bg-slate-800 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-slate-900 to-black" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <Activity size={180} className="text-amber-500/80 mb-8 animate-pulse drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]" />
                                    <h4 className="text-3xl font-bold text-white mb-4">Live Vitals Dashboard</h4>
                                    <p className="text-slate-400 max-w-sm">
                                        Tracking <span className="text-emerald-400">Health Metrics</span>, <span className="text-blue-400">Disease Risks</span>, and <span className="text-purple-400">Vital Trends</span> via <span className="text-slate-200 font-semibold">AI-powered medical profiling</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. CORE INTELLIGENCE MODULES (New Promotional Section) */}
                <section className="py-24 px-6 max-w-7xl mx-auto relative">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="text-center mb-20 relative z-10">
                        <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            Power Under the Hood
                        </h2>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                            CureBird isn't just an app; it's a <span className="text-white font-bold">Quad-Core AI Feature System</span> designed to act as your primary health defense system.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        {[
                            {
                                title: "CureAnalyzer™",
                                subtitle: "Triple-Core Extraction",
                                desc: "Upload any messy prescription. Our 3-stage AI pipeline extracts, validates, and auto-corrects every medication name against global medical databases.",
                                icon: <Bot size={40} className="text-sky-400" />,
                                color: "border-sky-500/30",
                                bg: "bg-sky-500/10"
                            },
                            {
                                title: "CureStat™",
                                subtitle: "Vitals & Environment",
                                desc: "A live dashboard correlating your real-time heart rate and SpO2 with local AQI and pollen data to predict respiratory risks before they happen.",
                                icon: <Activity size={40} className="text-emerald-400" />,
                                color: "border-emerald-500/30",
                                bg: "bg-emerald-500/10"
                            },
                            {
                                title: "Cure AI Coach",
                                subtitle: "24/7 Senior Consultant",
                                desc: "Not just a chatbot. Context-aware intelligence that knows your specific allergies and history, offering personalized pharmacological advice.",
                                icon: <MessageSquare size={40} className="text-amber-400" />,
                                color: "border-amber-500/30",
                                bg: "bg-amber-500/10"
                            },
                            {
                                title: "Cure Tracker",
                                subtitle: "Pathology Analysis",
                                desc: "Track disease progression over time. Upload reports to visualize trends in your blood work and biomarkers with clinical precision.",
                                icon: <Microscope size={40} className="text-purple-400" />,
                                color: "border-purple-500/30",
                                bg: "bg-purple-500/10"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                                <div className={`glass-card h-full p-8 flex flex-col items-start gap-6 hover:border-opacity-100 transition-all duration-300 ${item.color}`}>
                                    <div className={`p-4 rounded-2xl ${item.bg} border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold tracking-widest text-slate-500 mb-2 uppercase">{item.subtitle}</div>
                                        <h3 className="text-3xl font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                                        <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                                        LEARN MORE <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. DEEP DIVE CONTENT (H2 -> H3) - For SEO Authority */}
                <section className="py-24 px-6 max-w-4xl mx-auto text-slate-300 space-y-12">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6">Redefining Personal Health Records (PHR) in India</h2>
                        <p className="text-lg leading-8 text-slate-400">
                            The traditional healthcare model is reactive: you get sick, you visit a doctor, you get treated. CureBird shifts this paradigm to **proactive wellness**. By maintaining a clean, digitized, and analyzed longitudinal record of your health, we empower you to catch silent killers like cardiac issues or metabolic disorders early.
                        </p>

                        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Why Manual Records Fail</h3>
                        <p className="text-lg leading-8 text-slate-400">
                            Paper records degrade. They get lost. Most importantly, they are **siloed**. A cardiologist in Mumbai doesn't know what your dermatologist in Delhi prescribed last month. This lack of interoperability leads to dangerous drug interactions and redundant testing. CureBird solves this by being the **single source of truth** for your medical existence.
                        </p>

                        <h3 className="text-2xl font-bold text-white mt-12 mb-4">AI: The New Stethoscope</h3>
                        <p className="text-lg leading-8 text-slate-400">
                            We don't replace doctors; we give them superpowers. Our AI engine scans thousands of data points from your upload history to generate a "Clinician's Summary" before you even walk into the consultation room. This saves valuable time and ensures your doctor focuses on *treating you*, not reading files.
                        </p>
                    </div>
                </section>

                {/* 4. FAQ SECTION (Schema-Ready) */}
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {[
                                { q: "Is my medical data sold to third parties?", a: "Absolutely not. CureBird is a privacy-first platform. Your data is encrypted and you are the sole owner. We do not sell, rent, or monetize your personal health information." },
                                { q: "Can doctors access my files without the app?", a: "Yes. We use a secure, web-based viewer technology. You can send a time-limited link via WhatsApp or Email, and doctors can view your records on any browser securely." },
                                { q: "What file formats do you support?", a: "We support PDF, JPG, PNG for standard reports. For radiology, we have a built-in DICOM viewer that works directly in the browser—no heavy software required." },
                                { q: "Is CureBird free for patients?", a: "Our core 'Personal Portfolio' is free forever for individual patients. We offer premium tiers for families and advanced AI analytics." }
                            ].map((faq, i) => (
                                <details key={i} className="group bg-slate-950 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 open:border-amber-500/30">
                                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none text-lg font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                                        {faq.q}
                                        <span className="text-amber-500 transform group-open:rotate-180 transition-transform duration-300">▼</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 text-center bg-black/20 backdrop-blur-sm">
                <div className="flex justify-center gap-6 mb-8">
                    {[
                        { Icon: Twitter, label: "Twitter" },
                        { Icon: Linkedin, label: "LinkedIn" },
                        { Icon: Instagram, label: "Instagram" },
                        { Icon: Youtube, label: "YouTube" },
                        { Icon: Facebook, label: "Facebook" }
                    ].map(({ Icon, label }) => (
                        <div key={label} className="group relative">
                            <button className="p-3 bg-white/5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                                <Icon size={20} />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wide rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Coming Soon
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-8 mb-8 text-sm text-slate-300">
                    <button onClick={onTermsClick} className="hover:text-amber-400 transition-colors">Terms of Service</button>
                    <button onClick={onPrivacyClick} className="hover:text-amber-400 transition-colors">Privacy Policy</button>
                    <button onClick={onContactClick} className="hover:text-amber-400 transition-colors">Contact Us</button>
                </div>
                <div className="mb-4 text-slate-400 text-sm">
                    Developed by <span className="text-amber-500 font-semibold">AlgoZeniths</span> - Archisman Chakraborty, Sohan Ghosh, Snehil Das, Soumyartho Banerjee
                </div>
                <p className="text-slate-500 text-xs">© {new Date().getFullYear()} CureBird. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
