import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { HeartPulse, Sparkles, Activity, ShieldPlus, FileText, Pill, Calendar } from 'lucide-react';

const HeroSection = ({ onOverviewClick, onAddClick }) => {
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

                <div className="relative z-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-10 transform-gpu" style={{ transform: "translateZ(30px)" }}>

                    {/* Left Side: Text Content */}
                    <div className="text-center lg:text-left space-y-6 max-w-3xl flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold tracking-wide uppercase"
                        >
                            <Sparkles size={14} /> AI-Powered Medical Intelligence
                        </motion.div>

                        <h1 className="text-3xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] sm:leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-200 drop-shadow-2xl py-2">
                            CureBird
                        </h1>

                        <p className="text-slate-400 text-base sm:text-2xl leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                            The future of personal healthcare. Analyze trends, predict outcomes, and visualize your health journey with <span className="text-amber-400 font-medium">Precision AI</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                            <motion.button
                                onClick={onOverviewClick}
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl font-bold text-black shadow-xl border-t border-white/20 hover:border-white/40 transition-all text-lg"
                            >
                                Dashboard Overview
                            </motion.button>
                            <motion.button
                                onClick={onAddClick}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/5 backdrop-blur-md rounded-2xl font-bold text-white shadow-xl border border-white/10 hover:border-white/30 transition-all text-lg flex items-center justify-center gap-2"
                            >
                                <HeartPulse size={20} className="text-amber-400" />
                                Add Clinical Record
                            </motion.button>
                        </div>

                        {/* Professional Feature Guide Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-10 border-t border-white/5 space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-snug">
                                    Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Bird</span>.
                                </h2>
                                <p className="text-slate-400 text-sm sm:text-lg font-medium">
                                    Your Personalized Clinical Intelligence Dashboard is ready.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                                <div className="flex flex-col items-center lg:items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="p-2 bg-sky-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                                        <FileText size={20} className="text-sky-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm sm:text-base mb-1">Medical Portfolio</h4>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-tight text-center lg:text-left">
                                        Centrally manage diagnostics & clinical records.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center lg:items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="p-2 bg-amber-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                                        <Pill size={20} className="text-amber-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm sm:text-base mb-1">Therapeutic Tracking</h4>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-tight text-center lg:text-left">
                                        Monitor prescriptions & therapeutic protocols.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center lg:items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                                        <Calendar size={20} className="text-emerald-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm sm:text-base mb-1">Care Coordination</h4>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-tight text-center lg:text-left">
                                        Precisely schedule & sync clinical consultations.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <ShieldPlus size={12} className="text-emerald-500" /> Secure HIPAA Analytics
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <Activity size={12} className="text-sky-500" /> Real-time Synthesis
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Enhanced 3D Animated Symbol */}
                    <div className="relative w-full max-w-md aspect-square flex items-center justify-center transform-gpu flex-1" style={{ transform: "translateZ(60px)" }}>
                        {/* Glowing orb background */}
                        <div className="absolute inset-0 bg-gradient-radial from-amber-500/20 via-yellow-500/5 to-transparent rounded-full blur-[80px] animate-pulse-slow"></div>

                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                            {/* Rotating Outer Ring */}
                            <motion.circle
                                cx="100" cy="100" r="70"
                                fill="none"
                                stroke="url(#amber-gradient)"
                                strokeWidth="0.5"
                                strokeDasharray="10 5"
                                opacity="0.5"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Abstract Bird Wing / Medical Cross Fusion */}
                            <motion.path
                                d="M40,100 C40,60 80,40 100,40 C120,40 160,60 160,100 C160,140 120,160 100,160 C80,160 40,140 40,100 Z"
                                fill="none"
                                stroke="url(#amber-gradient)"
                                strokeWidth="2"
                                variants={pathVariants}
                                initial="hidden"
                                animate="visible"
                            />

                            {/* Central Pulse Line - Enhanced */}
                            <motion.path
                                d="M60,100 L85,100 L95,70 L105,130 L115,100 L140,100"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: 1,
                                    opacity: 1,
                                    transition: {
                                        duration: 2,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                        repeatDelay: 0.2
                                    }
                                }}
                            />

                            <defs>
                                <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [-20, 20, -20], x: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-0 text-amber-400 bg-slate-900/60 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <HeartPulse size={32} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [20, -20, 20], x: [0, -5, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 left-0 text-amber-400 bg-slate-900/60 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <Activity size={28} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 -left-8 text-emerald-400 opacity-70"
                        >
                            <ShieldPlus size={24} />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
