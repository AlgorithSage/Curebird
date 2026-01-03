import React from 'react';
import { HeartPulse, LogIn, Dna, Pill, Stethoscope, Syringe, Activity, Globe, Shield, ShieldCheck, Zap, CheckCircle, ArrowRight, Play, Pause, Linkedin, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from './SEO';

import CurebirdLogo from '../curebird_logo.png';

// --- Video Background Component (Mobile Optimized) ---
const VideoBackground = ({ isMobile }) => (
    <div className="absolute inset-0 overflow-hidden z-0">
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

const LandingPage = ({ onLoginClick, onTermsClick, onPrivacyClick, onContactClick }) => {
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

            {/* Hero Section */}
            <header className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <VideoBackground isMobile={isMobile} />

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
                    className="relative z-10 flex flex-col items-center glass px-6 py-12 sm:p-20 rounded-[2.5rem] shadow-[0_0_80px_rgba(56,189,248,0.15)] w-full max-w-4xl border border-white/10"
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

                    <motion.div custom={3} variants={textVariants}>
                        <button
                            onClick={onLoginClick}
                            className="mt-10 flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-full shadow-xl hover:bg-amber-400 transition-all font-bold text-lg"
                        >
                            <LogIn size={24} />
                            Get Started
                        </button>
                    </motion.div>
                </motion.div>
            </header>

            {/* Content Sections (SEO Optimized) */}
            <main className="relative z-10 bg-slate-950">

                {/* Features Section */}
                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Why Choose CureBird?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            We bridge the gap between fragmented medical records and actionable health intelligence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <ShieldCheck size={40} className="text-emerald-400" />, title: "Bank-Grade Security", desc: "Your health data is encrypted with military-grade protocols. We prioritize privacy and HIPAA compliance." },
                            { icon: <Zap size={40} className="text-amber-400" />, title: "AI Diagnostics", desc: "Our advanced algorithms analyze your reports to flag potential risks and summarize complex medical jargon." },
                            { icon: <Globe size={40} className="text-blue-400" />, title: "Universal Access", desc: "Access your entire medical history from anywhere in the world. Never carry physical files again." }
                        ].map((feature, idx) => (
                            <article key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
                                <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-block">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/30">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Streamlined Health Management</h2>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-12">
                                {[
                                    { step: "01", title: "Create Your Profile", desc: "Sign up in seconds. Build your secure digital identity and link your family members." },
                                    { step: "02", title: "Upload Records", desc: "Take photos or upload PDFs of prescriptions, lab reports, and X-rays. Our OCR extracts data instantly." },
                                    { step: "03", title: "Get Insights", desc: "View trend graphs for vitals like Blood Pressure and Glucose. Receive personalized alerts." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="text-4xl font-black text-amber-500/20">{item.step}</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                            <p className="text-slate-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[400px] rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-slate-800/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                <Activity size={120} className="text-amber-500/20 animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="text-sm font-mono text-amber-500 mb-2">LIVE MONITORING</div>
                                    <div className="text-2xl font-bold">Real-time Vitals Tracking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & SEO Text (The "Meat") */}
                <section className="py-20 px-6 max-w-5xl mx-auto text-slate-300 leading-Relaxed space-y-8">
                    <article>
                        <h2 className="text-2xl font-bold text-white mb-4">The Future of Personal Health Records (PHR)</h2>
                        <p>
                            In an era of fragmented healthcare, <strong>CureBird</strong> emerges as the cohesive solution for patients and doctors alike.
                            Gone are the days of carrying bulky files to every appointment. By digitizing your health records, you not only
                            ensure their safety but also enable <a href="#" className="text-amber-400 hover:underline">predictive analytics</a> that can save lives.
                        </p>
                        <p className="mt-4">
                            Our platform supports a wide range of medical data types, including <em>DICOM imaging, PDF lab reports, and handwritten prescriptions</em>.
                            Using state-of-the-art Natural Language Processing (NLP), CureBird structures unstructured data, making it searchable
                            and graphable. Whether you are managing chronic conditions like <strong>Diabetes</strong> or <strong>Hypertension</strong>,
                            or simply maintaining wellness, our dashboard adapts to your needs.
                        </p>
                    </article>

                    <article>
                        <h3 className="text-xl font-bold text-white mb-3">Privacy First, Always</h3>
                        <p>
                            We understand that medical data is sensitive. That's why CureBird employs end-to-end encryption for data at rest and in transit.
                            You have granular control over who sees your data. Share temporary access links with specialists or keep your profile entirely private.
                            Your health, your data, your control.
                        </p>
                    </article>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-black/40 text-center">
                <div className="flex justify-center gap-6 mb-8">
                    {[
                        { Icon: Twitter, label: "Twitter" },
                        { Icon: Linkedin, label: "LinkedIn" },
                        { Icon: Instagram, label: "Instagram" },
                        { Icon: Youtube, label: "YouTube" },
                        { Icon: Facebook, label: "Facebook" }
                    ].map(({ Icon, label }) => (
                        <div key={label} className="group relative">
                            <button className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                                <Icon size={20} />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wide rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Coming Soon
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-8 mb-8 text-sm text-slate-400">
                    <button onClick={onTermsClick} className="hover:text-amber-400 transition-colors">Terms of Service</button>
                    <button onClick={onPrivacyClick} className="hover:text-amber-400 transition-colors">Privacy Policy</button>
                    <button onClick={onContactClick} className="hover:text-amber-400 transition-colors">Contact Us</button>
                </div>
                <p className="text-slate-600 text-xs">© {new Date().getFullYear()} CureBird. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
