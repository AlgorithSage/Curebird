import React, { useState } from 'react';
import { HeartPulse, LogIn, Dna, Pill, Activity, Globe, ShieldCheck, Zap, ArrowRight, Linkedin, Twitter, Instagram, Youtube, Facebook, Bot, MessageSquare, Microscope, Crown, X, Stethoscope, FileText, Lock, Star, Users } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from './SEO';
import { Button } from './ui/button';
import LiquidButton from './ui/LiquidButton';

import CureBirdLogo from '../curebird_logo.png';

// --- Video Background Component (Mobile Optimized) ---
const VideoBackground = () => (
    <div className="fixed inset-0 overflow-hidden z-0">
        {/* Desktop Video - Hidden on mobile, visible on md+ */}
        <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 hidden md:block"
        >
            <source src="/medical-bg.mp4" type="video/mp4" />
        </video>

        {/* Mobile Gradient - Visible on mobile, hidden on md+ */}
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 opacity-80 block md:hidden" />

        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
    </div>
);

// --- Floating Icon Component ---
const FloatingIcon = ({ icon, className, duration, delay }) => (
    <motion.div
        className={`absolute text-amber-400/15 ${className} pointer-events-none`}
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

// ── TRUST SECTION ────────────────────────────────────────────────

const CountUp = ({ end, start = 1, decimals = 0, suffix = "", duration = 3500 }) => {
    const [display, setDisplay] = React.useState(start);
    const ref = React.useRef(null);
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            const startTime = Date.now();
            const tick = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplay(parseFloat((start + eased * (end - start)).toFixed(decimals)));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, start, decimals, duration]);
    return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>;
};

const trustStats = [
    { numericEnd: 500, start: 1, suffix: "+", label: "Trusted by Users", icon: <Users size={22} />, iconColor: "#fbbf24" },
    { text: "Top 106", label: "Google Solution Challenge 2026", icon: <img src="/assets/Badge.png" alt="Google Badge" style={{ width: 48, height: 48, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(251,191,36,0.8))" }} />, iconColor: "#facc15" },
    { numericEnd: 4.8, start: 4.0, decimals: 1, label: "Avg. User Rating", icon: <Star size={22} />, iconColor: "#fde68a" },
];

const trustTestimonials = [
    {
        name: "Priya Sharma",
        role: "Patient · Mumbai",
        quote: "CureBird helped me organize 3 years of scattered reports in minutes. The AI even flagged my rising HbA1c before my doctor mentioned it — that alone changed everything.",
        initials: "PS",
        gradient: "from-amber-500 to-orange-600",
        rating: 5.0,
    },
    {
        name: "Dr. Arjun Mehta",
        role: "Cardiologist · AIIMS Delhi",
        quote: "The secure clinical link feature is a game-changer. Patients walk in fully prepared — I spend my time treating them, not deciphering stacks of unorganized old files.",
        initials: "AM",
        gradient: "from-blue-500 to-cyan-600",
        rating: 4.8,
    },
    {
        name: "Aditya Roy",
        role: "Software Engineer · Bengaluru",
        quote: "I travel constantly and need my records everywhere. CureBird's encryption with instant mobile access gives me complete peace of mind no matter where I am.",
        initials: "AR",
        gradient: "from-emerald-500 to-teal-600",
        rating: 4.7,
    },
];

// ─────────────────────────────────────────────────────────────────

const LandingPage = ({ onLoginClick, onTermsClick, onPrivacyClick, onContactClick, onSubscribeClick, onRefundClick }) => {
    const [isMobile, setIsMobile] = React.useState(false);
    const [isHeroOpen, setIsHeroOpen] = useState(false);
    const headerRef = React.useRef(null);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    React.useEffect(() => {
        if (isHeroOpen && headerRef.current) {
            headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isHeroOpen]);

    const sectionVariants = {
        hidden: { opacity: 0, y: isMobile ? 50 : 150, filter: isMobile ? "blur(0px)" : "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: isMobile ? 0.8 : 1.2, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.1 : 0.3,
                delayChildren: isMobile ? 0.2 : 0.4
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: isMobile ? 40 : 120, scale: isMobile ? 0.95 : 0.8, filter: isMobile ? "blur(0px)" : "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: isMobile ? 0.5 : 0.8
            }
        }
    };

    return (
        <div className="relative w-full text-white font-sans bg-slate-950 overflow-x-hidden">
            <SEO
                title="CureBird | AI-Powered Personal Medical Portfolio"
                description="Securely manage your medical records, track vitals, and get AI-powered health insights with CureBird. The comprehensive digital health dashboard for modern patient care."
            />
            <VideoBackground />

            {/* ── HERO ─────────────────────────────────────── */}
            <header ref={headerRef} className="relative flex flex-col items-center justify-start px-6 pt-24 pb-4 sm:px-10 sm:pt-28">

                {/* Floating decorative icons */}
                {!isMobile && (
                    <>
                        <FloatingIcon icon={<Dna size={120} />} className="top-16 left-10" duration={12} delay={0} />
                        <FloatingIcon icon={<HeartPulse size={100} />} className="bottom-20 right-16" duration={10} delay={1} />
                        <FloatingIcon icon={<Pill size={80} />} className="top-1/3 right-1/4" duration={14} delay={0.5} />
                        <FloatingIcon icon={<Stethoscope size={75} />} className="bottom-1/3 left-1/5" duration={11} delay={1.5} />
                    </>
                )}

                {/* ── PRE-MODAL: two-column hero ── */}
                <AnimatePresence mode="wait">
                    {!isHeroOpen && (
                        <motion.div
                            key="pre-hero"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.5 } }}
                            exit={{ opacity: 0, y: -30, filter: "blur(8px)", transition: { duration: 0.35 } }}
                            className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-10"
                        >
                            {/* Logo + badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                                className="flex flex-col items-center gap-5"
                            >
                                <img src={CureBirdLogo} alt="CureBird" width="120" height="120"
                                    fetchPriority="high"
                                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_28px_rgba(245,158,11,0.9)]" />
                                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-amber-300"
                                    style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)" }}>
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    India's AI Health Platform
                                </span>
                            </motion.div>

                            {/* CureBird title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="text-7xl sm:text-8xl xl:text-9xl 2xl:text-[10rem] font-extrabold tracking-tight leading-none"
                            >
                                Cure<span className="text-amber-400">Bird</span>
                            </motion.h1>

                            {/* Tagline — smaller than CureBird */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.38, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] text-slate-100"
                            >
                                Your Health,{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                                    Intelligently
                                </span>{" "}
                                Managed.
                            </motion.h2>

                            {/* Subheading */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.7 }}
                                className="text-lg sm:text-xl xl:text-2xl text-slate-300/90 max-w-2xl leading-relaxed"
                            >
                                CureBird unifies prescriptions, lab reports & doctor visits into one
                                <span className="text-amber-400 font-semibold"> AI-powered medical timeline</span> —
                                private, encrypted, and always accessible.
                            </motion.p>

                            {/* Feature pills */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.52, duration: 0.6 }}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                {[
                                    { icon: <Lock size={15} />, label: "AES-256 Encrypted" },
                                    { icon: <FileText size={15} />, label: "20+ Record Types" },
                                    { icon: <Bot size={15} />, label: "Clinical AI Engine" },
                                    { icon: <Stethoscope size={15} />, label: "Doctor Sharing" },
                                ].map(({ icon, label }) => (
                                    <span key={label}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-300"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                                        <span className="text-amber-400">{icon}</span>
                                        {label}
                                    </span>
                                ))}
                            </motion.div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center gap-4 w-full"
                            >
                                <LiquidButton
                                    onClick={() => setIsHeroOpen(true)}
                                    className="w-full sm:w-auto text-xl font-black py-5 px-16 rounded-full shadow-2xl"
                                >
                                    Cure Yourself
                                    <ArrowRight size={24} />
                                </LiquidButton>
                                <button onClick={onLoginClick}
                                    className="text-base text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                                    Already have an account?
                                    <span className="text-amber-400 font-semibold">Sign In</span>
                                </button>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MODAL: revealed when "Cure Yourself" is clicked ── */}
                <AnimatePresence>
                    {isHeroOpen && (
                        <motion.div
                            key="hero-modal"
                            className="relative z-10 w-full max-w-5xl"
                            initial={{ y: 80, opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ y: 60, opacity: 0, scale: 0.95, filter: "blur(8px)" }}
                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                        >
                            <div className="glass-card relative flex flex-col items-center px-8 py-12 sm:p-16 gap-8 sm:gap-10 overflow-hidden">
                                {/* Amber inner glow */}
                                <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />

                                {/* Close */}
                                <button onClick={() => setIsHeroOpen(false)}
                                    className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all z-20">
                                    <X size={20} />
                                </button>

                                {/* Logo & Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                                >
                                    <div className="w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                                        <img src={CureBirdLogo} alt="CureBird Logo" width="192" height="192"
                                            fetchPriority="high"
                                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
                                    </div>
                                    <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold tracking-tight text-center sm:text-left">
                                        Cure<span className="text-amber-400">Bird</span>
                                    </h1>
                                </motion.div>

                                <div className="flex flex-col items-center gap-5 text-center max-w-3xl">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="text-2xl sm:text-4xl text-slate-100 font-semibold leading-tight"
                                    >
                                        Your Personal, Intelligent Medical Portfolio
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="text-lg sm:text-xl text-slate-300 leading-relaxed"
                                    >
                                        CureBird elevates your healthcare experience. Seamlessly unify your medical records, manage appointments, and unlock
                                        <span className="text-amber-400 font-semibold"> Predictive AI Insights</span> to transition from reactive care to proactive wellness.
                                    </motion.p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 w-full"
                                >
                                    <LiquidButton onClick={onLoginClick}
                                        className="w-full sm:w-auto text-xl font-bold py-4 px-10 rounded-full shadow-2xl">
                                        <LogIn size={24} />
                                        Get Started
                                    </LiquidButton>
                                    <Button variant="primary" onClick={onSubscribeClick}
                                        className="w-full sm:w-auto text-xl font-bold px-10 py-4 !rounded-full">
                                        <Crown size={24} className="text-amber-500" />
                                        <span>View Plans</span>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content Area: Authority & Depth */}
            <main className="relative z-10 w-full overflow-hidden">

                {/* ── TRUST & SOCIAL PROOF ── */}
                <section className="pt-6 pb-8">

                    {/* Centered content block */}
                    <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center gap-8">

                        {/* Compliance strip — right above the badge */}
                        <motion.div
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                            viewport={{ once: true }} transition={{ duration: 0.6 }}
                            className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                            {["ABDM", "HIPAA", "DPDPA", "DISHA"].map((badge, i) => (
                                <React.Fragment key={badge}>
                                    {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-600" />}
                                    <span className="text-slate-400">{badge}</span>
                                </React.Fragment>
                            ))}
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span className="ml-1 text-emerald-500 normal-case">✓ Standards Aligned</span>
                        </motion.div>

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                            style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)" }}
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Trusted Worldwide</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
                        >
                            Healthcare You Can<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                Trust &amp; Rely On
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-lg text-slate-400 leading-relaxed"
                        >
                            Recognized by Google, trusted by 500+ patients and healthcare professionals across India building healthier lives.
                        </motion.p>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-4 w-full">
                            {trustStats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="rounded-2xl p-4 flex flex-col items-center text-center gap-2 relative overflow-hidden"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(251,191,36,0.92) 0%, rgba(245,158,11,0.88) 50%, rgba(180,83,9,0.85) 100%)",
                                        border: "1px solid rgba(251,191,36,0.60)",
                                        backdropFilter: "blur(16px)",
                                        boxShadow: "0 0 32px rgba(245,158,11,0.35), 0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.15)",
                                    }}
                                >
                                    {/* Dark overlay at bottom for depth */}
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none rounded-b-2xl"
                                        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.18) 0%, transparent 70%)" }} />
                                    <span className="relative z-10" style={{ color: "rgba(0,0,0,0.65)" }}>{stat.icon}</span>
                                    <p className="relative z-10 text-2xl sm:text-3xl font-extrabold text-black leading-none drop-shadow-none">
                                        {stat.numericEnd !== undefined
                                            ? <CountUp end={stat.numericEnd} start={stat.start || 1} decimals={stat.decimals || 0} suffix={stat.suffix || ""} />
                                            : <span>{stat.text}</span>
                                        }
                                    </p>
                                    <p className="relative z-10 text-xs text-black/70 font-semibold leading-tight">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: 0.55, duration: 0.5 }}
                        >
                            <LiquidButton onClick={onLoginClick} className="text-base font-bold py-3 px-10 rounded-full">
                                <LogIn size={18} />
                                Get Started Free
                            </LiquidButton>
                        </motion.div>
                    </div>

                    {/* Horizontal scrolling testimonials ticker */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }}
                        className="mt-14 relative overflow-hidden"
                    >
                        {/* Left fade */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                            style={{ background: "linear-gradient(90deg, rgba(2,4,16,0.95) 0%, transparent 100%)" }} />
                        {/* Right fade */}
                        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                            style={{ background: "linear-gradient(-90deg, rgba(2,4,16,0.95) 0%, transparent 100%)" }} />

                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                            className="flex gap-5 w-max px-6"
                        >
                            {[...trustTestimonials, ...trustTestimonials, ...trustTestimonials, ...trustTestimonials, ...trustTestimonials, ...trustTestimonials].map((t, i) => (
                                <div
                                    key={i}
                                    className="w-[320px] shrink-0 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                                    style={{
                                        background: "linear-gradient(145deg, #1e1208 0%, #140d05 55%, #0e0802 100%)",
                                        border: "1px solid rgba(217,119,6,0.40)",
                                        backdropFilter: "blur(18px)",
                                        boxShadow: "0 0 24px rgba(180,83,9,0.18), 0 6px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,200,60,0.07)",
                                    }}
                                >
                                    {/* Amber bottom glow */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none rounded-b-2xl"
                                        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(180,83,9,0.30) 0%, transparent 70%)" }} />
                                    {/* Top-edge amber shimmer */}
                                    <div className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none rounded-full"
                                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.30) 50%, transparent 100%)" }} />

                                    {/* Author */}
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center font-extrabold text-base text-white shadow-md shrink-0`}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.name}</p>
                                            <p className="text-xs text-amber-400/70 font-medium">{t.role}</p>
                                        </div>
                                    </div>
                                    {/* Stars + rating */}
                                    <div className="relative z-10 flex items-center gap-2">
                                        <span className="text-amber-400 font-bold text-xs">{t.rating.toFixed(1)}</span>
                                        <span style={{ color: "#fbbf24", fontSize: "13px", letterSpacing: "1px" }}>
                                            {'★'.repeat(Math.floor(t.rating))}
                                            <span style={{ color: "#3d2005" }}>{'★'.repeat(5 - Math.floor(t.rating))}</span>
                                        </span>
                                    </div>
                                    {/* Quote */}
                                    <p className="relative z-10 text-slate-300 text-sm leading-relaxed italic line-clamp-3">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                </section>

                {/* 1. KEY VALUE PROPOSITION (H2) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="pt-8 pb-16 px-6 max-w-7xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                            Why Digitalize Your Medical History?
                        </h2>
                        <p className="text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed">
                            Healthcare is fragmented. CureBird is the cohesive force that brings your scattered prescriptions, lab reports, and imaging into one secure, AI-powered timeline. We don't just store data; we transform it into <span className="text-amber-400 font-semibold">life-saving intelligence</span>.
                        </p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-10"
                    >
                        {[
                            {
                                icon: <ShieldCheck size={48} className="text-emerald-400" />,
                                title: "Enterprise-Grade Data Security",
                                desc: "Your health privacy is paramount. We employ AES-256 end-to-end encryption, with system architecture designed in alignment with Indian Digital Health (ABDM) and HIPAA standards. You retain absolute sovereignty over your data."
                            },
                            {
                                icon: <Zap size={48} className="text-amber-400" />,
                                title: "Predictive Health Intelligence",
                                desc: "Move beyond storage. Our Clinical LLMs analyze trends in your pathology reports to identify risk markers for chronic conditions like hypertension or diabetes significantly earlier than traditional methods."
                            },
                            {
                                icon: <Globe size={48} className="text-blue-400" />,
                                title: "Interoperable Health Standards",
                                desc: "CureBird bridges the gap between fragmented providers. Whether it's a handwritten prescription or a DICOM scan, we standardize your history into a globally readable FHIR-compliant format."
                            }
                        ].map((feature, idx) => (
                            <motion.article
                                key={idx}
                                variants={cardVariants}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                className="glass-card transform transition-all duration-300"
                            >
                                <div className="mb-8 p-5 rounded-2xl bg-slate-900 inline-block shadow-lg shadow-black/50">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">{feature.desc}</p>
                            </motion.article>
                        ))}
                    </motion.div>
                </motion.section>

                {/* 2. HOW IT WORKS (H2) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="py-16 px-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.h2
                            variants={sectionVariants}
                            className="text-3xl sm:text-4xl font-bold text-center mb-10 text-slate-100"
                        >
                            The CureBird Ecosystem
                        </motion.h2>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div variants={staggerContainer} className="space-y-12">
                                <motion.article variants={cardVariants} className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">01</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Establish Your Clinical Profile</h3>
                                        <p className="text-slate-400 text-lg">
                                            Create a comprehensive medical baseline. Input family history, allergies, and surgical records to allow our algorithms to tailor health recommendations specific to your genetic and environmental context.
                                        </p>
                                    </div>
                                </motion.article>

                                <motion.article variants={cardVariants} className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">02</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Smart Record Digitization</h3>
                                        <p className="text-slate-400 text-lg">
                                            Eliminate manual data entry. Our proprietary <span className="text-white font-semibold">OCR & Clinical NLP Engine</span> instantly extracts vital metrics (e.g., HbA1c, Lipid Profile) from images or PDFs and plots them on interactive, medical-grade charts.
                                        </p>
                                    </div>
                                </motion.article>

                                <motion.article variants={cardVariants} className="flex gap-6 group">
                                    <div className="text-5xl font-black text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">03</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Digital Doctor Collaboration</h3>
                                        <p className="text-slate-400 text-lg">
                                            Streamline your consultations. Generate secure, time-bound "Clinical View" links for specialists. Doctors gain instant, read-only access to your structured history without requiring software installation.
                                        </p>
                                    </div>
                                </motion.article>
                            </motion.div>

                            {/* Visual Representation */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: 50 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
                                }}
                                className="relative h-[420px] w-full bg-slate-800 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-slate-900 to-black" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <Activity size={180} className="text-amber-500/80 mb-8 animate-pulse drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]" />
                                    <h4 className="text-3xl font-bold text-white mb-4">Live Vitals Dashboard</h4>
                                    <p className="text-slate-400 max-w-sm">
                                        Tracking <span className="text-emerald-400">Health Metrics</span>, <span className="text-blue-400">Disease Risks</span>, and <span className="text-purple-400">Vital Trends</span> via <span className="text-slate-200 font-semibold">AI-powered medical profiling</span>.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* 3. CORE INTELLIGENCE MODULES (New Promotional Section) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="py-16 px-6 max-w-7xl mx-auto relative"
                >
                    <div className="absolute inset-0 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="text-center mb-12 relative z-10">
                        <motion.h2
                            variants={sectionVariants}
                            className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        >
                            Power Under the Hood
                        </motion.h2>
                        <motion.p
                            variants={sectionVariants}
                            className="text-slate-400 text-xl max-w-2xl mx-auto"
                        >
                            CureBird isn't just an app; it's a <span className="text-white font-bold">Quad-Core AI Feature System</span> designed to act as your primary health defense system.
                        </motion.p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 gap-8 relative z-10"
                    >
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
                            <motion.div
                                key={idx}
                                variants={cardVariants}
                                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                                className="group relative"
                            >
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
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                {/* 3. DEEP DIVE CONTENT (H2 -> H3) - For SEO Authority */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-6 max-w-4xl mx-auto text-slate-300 space-y-8"
                >
                    <div className="prose prose-invert prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6">Redefining Personal Health Records (PHR) in India</h2>
                        <p className="text-lg leading-8 text-slate-400">
                            The traditional healthcare model is reactive: you get sick, you visit a doctor, and you receive treatment. CureBird shifts this paradigm to <span className="text-white font-bold">proactive wellness</span>. By maintaining a clean, digitized, and analyzed longitudinal record of your health history, we empower you to detect silent health risks—like cardiac anomalies or metabolic disorders—at their inception.
                        </p>

                        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Why Manual Records Fail</h3>
                        <p className="text-lg leading-8 text-slate-400">
                            Paper records degrade, get lost, and most critically, remain <span className="text-white font-bold">siloed data points</span>. A cardiologist in Mumbai typically lacks visibility into what a dermatologist in Delhi prescribed last month. This fragmentation leads to adverse drug interactions and redundant diagnostics. CureBird resolves this by establishing a <span className="text-white font-bold">single source of truth</span> for your entire medical existence.
                        </p>

                        <h3 className="text-2xl font-bold text-white mt-12 mb-4">AI: The New Clinical Assistant</h3>
                        <p className="text-lg leading-8 text-slate-400">
                            We don't replace clinicians; we augment their capabilities. Our AI engine scans thousands of data points from your longitudinal history to generate a comprehensive "Clinician's Summary" before you even enter the consultation room. This optimization ensures your doctor focuses on <em className="text-amber-400 font-semibold not-italic">treating you</em>, not deciphering unorganized files.
                        </p>
                    </div>
                </motion.section>

                {/* 4. FAQ SECTION (Schema-Ready) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="py-14 px-6"
                >
                    <div className="max-w-4xl mx-auto">
                        <motion.h2
                            variants={sectionVariants}
                            className="text-3xl font-bold text-center text-white mb-16"
                        >
                            Frequently Asked Questions
                        </motion.h2>
                        <motion.div variants={staggerContainer} className="space-y-6">
                            {[
                                { q: "Is my medical data sold to third parties?", a: "Absolutely not. CureBird is a privacy-first platform. Your data is encrypted and you are the sole owner. We do not sell, rent, or monetize your personal health information." },
                                { q: "Can doctors access my files without the app?", a: "Yes. We use a secure, web-based viewer technology. You can send a time-limited link via WhatsApp or Email, and doctors can view your records on any browser securely." },
                                { q: "What file formats do you support?", a: "We support PDF, JPG, PNG for standard reports. For radiology, we have a built-in DICOM viewer that works directly in the browser—no heavy software required." },
                                { q: "Is CureBird free for patients?", a: "Our core 'Personal Portfolio' is free forever for individual patients. We offer premium tiers for families and advanced AI analytics." }
                            ].map((faq, i) => (
                                <motion.details
                                    key={i}
                                    variants={cardVariants}
                                    className="group bg-slate-950 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 open:border-amber-500/30"
                                >
                                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none text-lg font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                                        {faq.q}
                                        <span className="text-amber-500 transform group-open:rotate-180 transition-transform duration-300">▼</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                                        {faq.a}
                                    </div>
                                </motion.details>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

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
                <div className="flex justify-center flex-wrap gap-x-8 gap-y-4 mb-8 text-sm text-slate-300">
                    <button onClick={onTermsClick} className="hover:text-amber-400 transition-colors">Terms of Service</button>
                    <button onClick={onPrivacyClick} className="hover:text-amber-400 transition-colors">Privacy Policy</button>
                    <button onClick={onRefundClick} className="hover:text-amber-400 transition-colors">Refund Policy</button>
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
