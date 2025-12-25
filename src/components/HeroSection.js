import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { HeartPulse, Sparkles, Activity, ShieldPlus, FileText, Pill, Calendar, Bot, BarChart2, CheckCircle2 } from 'lucide-react';

const HeroSection = ({ onOverviewClick, onAddClick, onNavigate }) => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });

    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

    const handleMouseMove = (e) => {
        if (isMobile) return; // Disable tilt on mobile/tablets
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // SVG Path Animation variants
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: isMobile ? 5 : 3, // Slower/simpler on mobile
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.5
            }
        }
    };

    return (
        <div className="w-full flex justify-center py-4 px-2 sm:px-6 perspective-2000">
            <motion.div
                style={!isMobile ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full bg-gradient-to-br from-slate-900/80 to-slate-800/90 backdrop-blur-2xl border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 overflow-hidden shadow-2xl group"
            >
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px] opacity-30 z-0 pointer-events-none"></div>

                {/* Glossy sheen effect - Hidden on mobile to save performance */}
                <div className="hidden sm:block absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine z-10 pointer-events-none transition-all duration-1000"></div>

                <div className="relative z-20 flex flex-col gap-16 transform-gpu" style={{ transform: "translateZ(30px)" }}>

                    {/* Top Section: Split Layout (Left Content | Right Video) */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                        {/* Left Side: Text & Features */}
                        <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold tracking-wide uppercase"
                            >
                                AI-Powered Medical Intelligence
                            </motion.div>

                            <div className="space-y-6">
                                <h1 className="text-6xl sm:text-8xl lg:text-[11rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 via-yellow-300 via-amber-200 to-white animate-text-flow drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] pb-4">
                                    CureBird
                                </h1>
                                <h2 className="text-xl sm:text-3xl font-semibold tracking-wide text-slate-200 max-w-2xl">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Revolutionizing</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Digitizing</span> Healthcare with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Clinical Precision</span>
                                </h2>
                            </div>

                            {/* Feature Overview Glass Card */}
                            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-2xl transform-gpu hover:border-white/20 transition-all shadow-2xl">
                                <ul className="space-y-5">
                                    {[
                                        "Instant Clinical Report Analysis",
                                        "24/7 AI Health Consultation",
                                        "Real-time Epidemic Tracking",
                                        "Secure Digital Health Archives",
                                        "Predictive Wellness Analytics"
                                    ].map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.1) }}
                                            className="flex items-center gap-4 text-left"
                                        >
                                            <div className="p-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)] shrink-0">
                                                <CheckCircle2 size={20} className="text-emerald-400" />
                                            </div>
                                            <span className="text-slate-100 text-lg font-medium tracking-wide leading-snug drop-shadow-sm">
                                                {feature}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 pt-2 w-full max-w-2xl">
                                <motion.button
                                    onClick={onOverviewClick}
                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl font-bold text-black shadow-xl border-t border-white/20 hover:border-white/40 transition-all text-lg flex-1 text-center"
                                >
                                    Dashboard Overview
                                </motion.button>
                                <motion.button
                                    onClick={onAddClick}
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/5 backdrop-blur-md rounded-2xl font-bold text-white shadow-xl border border-white/10 hover:border-white/30 transition-all text-lg flex items-center justify-center gap-2 flex-1 text-center"
                                >
                                    <HeartPulse size={20} className="text-amber-400" />
                                    Add Clinical Record
                                </motion.button>
                            </div>
                        </div>

                        {/* Right Side: Video Placeholder with Enhanced Frame */}
                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                            <div className="p-3 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_-20px_rgba(0,0,0,0.6)] w-full">
                                <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-slate-900/80 group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 z-10 pointer-events-none"></div>
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-90 mix-blend-screen group-hover:opacity-100 transition-opacity duration-500"
                                    >
                                        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-human-heart-9964-large.mp4" type="video/mp4" />
                                    </video>
                                    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-xs font-medium text-white/80">LIVE DEMO</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Welcome Cards & Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="w-full border-t border-white/5 pt-12"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 tracking-tight leading-snug mb-4">
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Bird</span>.
                            </h2>
                            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                                Your command center for total health mastery is now active. Explore our core features to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 font-semibold">unlock advanced insights</span> from your health data <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 font-semibold">predict potential risks</span>, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 font-semibold">experience the future</span> of personalized healthcare:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div
                                onClick={() => onNavigate && onNavigate('Cure AI')}
                                className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group backdrop-blur-sm cursor-pointer text-center h-full"
                            >
                                <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]">
                                    <Bot size={28} className="text-amber-400" />
                                </div>
                                <h3 className="text-slate-200 font-bold text-xl leading-tight mb-2 group-hover:text-amber-400 transition-colors">Cure AI</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Your dedicated 24/7 health consultant. Ask anything, anytime, and get intelligent answers based on your medical history.
                                </p>
                            </div>

                            <div
                                onClick={() => onNavigate && onNavigate('Cure Analyzer')}
                                className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group backdrop-blur-sm cursor-pointer text-center h-full"
                            >
                                <div className="mb-4 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(14,165,233,0.2)]">
                                    <Activity size={28} className="text-sky-400" />
                                </div>
                                <h3 className="text-slate-200 font-bold text-xl leading-tight mb-2 group-hover:text-sky-400 transition-colors">Cure Analyzer</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Instantly decodes complex lab reports into clear, actionable insights, highlighting critical values and trends.
                                </p>
                            </div>

                            <div
                                onClick={() => onNavigate && onNavigate('Cure Stat')}
                                className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group backdrop-blur-sm cursor-pointer text-center h-full"
                            >
                                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                                    <BarChart2 size={28} className="text-emerald-400" />
                                </div>
                                <h3 className="text-slate-200 font-bold text-xl leading-tight mb-2 group-hover:text-emerald-400 transition-colors">Cure Stat</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Visualizes real-time disease trends and epidemic data globally, keeping you informed about public health risks.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <ShieldPlus size={12} className="text-emerald-500" /> Secure HIPAA Analytics
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <Activity size={12} className="text-sky-500" /> Real-time Synthesis
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <FileText size={12} className="text-amber-500" /> Multi-Format Support
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <Sparkles size={12} className="text-purple-500" /> Predictive Modeling
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
