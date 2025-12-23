import React from 'react';
import { HeartPulse, LogIn, Dna, Pill, Stethoscope, Syringe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

import CurebirdLogo from '../curebird_logo.png';

// --- Video Background Component ---
const VideoBackground = () => (
    <div className="absolute inset-0 overflow-hidden z-0">
        <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
        >
            <source src="/medical-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
    </div>
);

// --- Floating Icon Component ---
const FloatingIcon = ({ icon, className, duration, delay }) => (
    <motion.div
        className={`absolute text-amber-400/15 ${className}`}
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
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden font-sans">
            {/* Background Video */}
            <VideoBackground />

            {/* Decorative Floating Icons - Reduced on mobile */}
            {!isMobile && (
                <>
                    <FloatingIcon icon={<Dna size={120} />} className="top-16 left-16" duration={12} delay={0} />
                    <FloatingIcon icon={<HeartPulse size={100} />} className="bottom-20 right-24" duration={10} delay={1} />
                    <FloatingIcon icon={<Pill size={80} />} className="top-1/3 right-1/4" duration={14} delay={0.5} />
                    <FloatingIcon icon={<Stethoscope size={100} />} className="bottom-1/3 left-1/5" duration={16} delay={1.5} />
                    <FloatingIcon icon={<Syringe size={70} />} className="top-1/4 left-2/3" duration={18} delay={0.7} />
                    <FloatingIcon icon={<Activity size={90} />} className="top-1/2 left-1/3" duration={20} delay={1.2} />
                </>
            )}

            {/* Minimal icons for mobile to keep the vibe without the lag */}
            {isMobile && (
                <>
                    <FloatingIcon icon={<Dna size={80} />} className="top-10 left-10" duration={15} delay={0} />
                    <FloatingIcon icon={<HeartPulse size={70} />} className="bottom-10 right-10" duration={12} delay={1} />
                </>
            )}

            {/* Main Glass Box */}
            <motion.div
                initial="hidden"
                animate="visible"
                className="text-center z-10 flex flex-col items-center glass px-6 py-12 sm:p-20 rounded-[2.5rem] shadow-[0_0_80px_rgba(56,189,248,0.15)] w-[95%] sm:w-full sm:max-w-4xl border border-white/10"
            >
                {/* Logo & Title */}
                <motion.div custom={0} variants={textVariants} className="flex justify-center items-center gap-8 sm:gap-14 mb-10 text-center sm:text-left">
                    <div className="relative w-20 h-20 sm:w-48 sm:h-48 flex items-center justify-center group shrink-0">

                        {/* 1. Massive Outer Orbital (Heavy Mechanical Ring) */}
                        <div className="absolute inset-[-15px] rounded-full border-[5px] border-slate-800 border-t-amber-500 border-r-amber-500/50 animate-[spin_3s_linear_infinite]"></div>
                        <div className="absolute inset-[-15px] rounded-full border-[5px] border-transparent border-l-slate-700 animate-[spin_3s_linear_infinite] mix-blend-overlay"></div>

                        {/* 2. The Kinetic Accelerator (Counter-Rotating Heavy Dashes) */}
                        <div className="absolute inset-[-4px] rounded-full border-4 border-dashed border-amber-400/80 animate-[spin_8s_linear_infinite_reverse] shadow-[0_0_20px_rgba(245,158,11,0.2)]"></div>

                        {/* 3. High-Velocity Sharp Trails (Solid Matter, No Blur) */}
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#b45309_180deg,#fbbf24_360deg)] animate-[spin_1s_linear_infinite] opacity-30"></div>
                        <div className="absolute inset-[3px] rounded-full bg-slate-900 z-0"></div> {/* Mask for trail ring */}

                        {/* 4. Inner Reactor Housing (Structural Core) */}
                        <div className="absolute inset-2 rounded-full border-2 border-amber-500/30"></div>

                        {/* Logo Container (The Protected Core) */}
                        <div className="relative w-full h-full rounded-full bg-slate-950 p-3 sm:p-6 flex items-center justify-center border-4 sm:border-6 border-amber-500/20 z-10 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] group-hover:scale-95 transition-transform duration-300">
                            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] animate-pulse"></div>
                            <img
                                src={CurebirdLogo}
                                alt="Curebird Logo"
                                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] relative z-20"
                            />
                        </div>
                    </div>
                    <h1 className="text-5xl sm:text-9xl font-extrabold tracking-tight">
                        Cure<span className="text-amber-400">bird</span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p custom={1} variants={textVariants} className="text-xl sm:text-4xl text-slate-200 font-medium mt-2">
                    Your Personal, Intelligent Medical Portfolio
                </motion.p>

                {/* Subtext */}
                <motion.p custom={2} variants={textVariants} className="text-lg sm:text-xl text-slate-400 mt-4 max-w-2xl">
                    Securely store your records, track appointments, and gain insights with
                    <span className="text-amber-400 font-semibold"> AI-powered analysis</span>.
                </motion.p>

                {/* Button */}
                <motion.div custom={3} variants={textVariants}>
                    <motion.button
                        whileHover={{ scale: 1.07, boxShadow: "0 0 30px rgba(245,158,11,0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLoginClick}
                        className="mt-10 flex items-center gap-3 bg-amber-500 text-black px-10 py-5 rounded-full shadow-xl hover:bg-amber-400 transition-all duration-300 text-xl font-bold"
                    >
                        <LogIn size={24} />
                        Login / Sign Up
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-6 z-20 flex gap-8 text-sm text-slate-400/80">
                <button onClick={onTermsClick} className="hover:text-white transition-colors">Terms of Service</button>
                <button onClick={onPrivacyClick} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={onContactClick} className="hover:text-white transition-colors">Contact Us</button>
            </div>
        </div>
    );
};

export default LandingPage;

