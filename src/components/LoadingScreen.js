import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoldenBird from '../golden_bird.png';

const loadingMessages = [
    "Connecting to Curebird Neural Net...",
    "Analyzing Health Patterns...",
    "Securing Patient Data...",
    "Calibrating Medical AI...",
    "Retrieving Latest Research...",
    "Optimizing Your Care Path...",
    "Synthesizing Digital Records...",
    "Harmonizing Vital Statistics..."
];

const LoadingScreen = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Cycle through secondary messages after the initial "Breathe" sequence
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans text-white">
            {/* Dynamic Living Gradient Background - Deep Slate & Rich Amber/Gold */}
            <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black"
                animate={{
                    background: [
                        "radial-gradient(circle at 30% 30%, #1e1b4b 0%, #020617 100%)", // Deep Indigo/Slate
                        "radial-gradient(circle at 70% 70%, #451a03 0%, #020617 100%)", // Deep Amber/Slate
                        "radial-gradient(circle at 30% 30%, #1e1b4b 0%, #020617 100%)"
                    ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                {/* Golden Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 via-transparent to-amber-500/5 mix-blend-overlay" />
            </motion.div>

            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">

                {/* Visual Container */}
                <div className="relative w-full max-w-lg h-96 flex items-center justify-center">

                    {/* The Golden Bird Animation */}
                    <motion.div
                        className="absolute w-32 h-32 sm:w-48 sm:h-48"
                        initial={{ x: -100, y: 50, scale: 0.8, opacity: 0 }}
                        animate={{
                            x: [0, 50, 0, -50, 0],
                            y: [0, -40, 0, 20, 0],
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0, -5, 0],
                            filter: [
                                "brightness(1) drop-shadow(0 0 0px rgba(245,158,11,0))",
                                "brightness(1.3) drop-shadow(0 0 35px rgba(251,191,36,0.6))",
                                "brightness(1) drop-shadow(0 0 0px rgba(245,158,11,0))"
                            ]
                        }}
                        transition={{
                            duration: 8,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror"
                        }}
                    >
                        <img
                            src={GoldenBird}
                            alt="Curebird Loading"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>

                    {/* Orbiting Particles (Subtle magic) */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 blur-[1px]"
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                x: Math.cos(i * 2) * 100, // Just creating spread
                                y: Math.sin(i * 2) * 100,
                            }}
                            transition={{
                                duration: 3 + i,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Text Container */}
                <div className="h-24 flex flex-col items-center justify-between mt-8">
                    {/* Static Breathe Instruction */}
                    <motion.h2
                        className="text-2xl sm:text-3xl font-light tracking-widest text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Breathe in, breathe out...
                    </motion.h2>

                    {/* Dynamic System Status */}
                    <AnimatePresence mode='wait'>
                        <motion.p
                            key={messageIndex}
                            className="text-sm sm:text-base text-slate-300 font-mono mt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                        >
                            {loadingMessages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Loading Bar */}
                <div className="w-64 h-1 bg-slate-800/50 rounded-full mt-8 overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
