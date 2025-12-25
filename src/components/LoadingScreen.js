import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenBird from "../curebird_loading_logo.png";

const loadingMessages = [
    "Connecting to Curebird AI...",
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
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden text-white">

            {/* 🧊 STATIC AMBER / GOLD TINTED GLASS BACKGROUND */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at top, rgba(251,191,36,0.18), transparent 60%),
            radial-gradient(circle at bottom, rgba(245,158,11,0.12), transparent 65%),
            linear-gradient(180deg, rgba(2,6,23,0.95), rgba(0,0,0,0.98))
          `
                }}
            />

            {/* Soft glass darkening */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[50px]" />

            {/* 🌟 CENTER CONTAINER */}
            <div className="relative z-110 flex h-full w-full flex-col items-center justify-center">

                {/* 🟡 RING + LOGO */}
                <div className="relative w-64 h-64 flex items-center justify-center">

                    {/* Subtle rotating ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-[4px] border-amber-400"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />

                    {/* 🕊️ LOGO (scale-only breathing) */}
                    <motion.img
                        src={GoldenBird}
                        alt="Curebird"
                        className="w-50 h-50 object-contain"
                        animate={{
                            scale: [0.96, 1.2, 0.96],
                            filter: [
                                "drop-shadow(0 0 8px rgba(251,191,36,0.35))",
                                "drop-shadow(0 0 22px rgba(251,191,36,0.7))",
                                "drop-shadow(0 0 8px rgba(251,191,36,0.35))"
                            ]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* 🌬️ TEXT */}
                <motion.h2
                    className="mt-5 text-2xl tracking-widest font-bold text-amber-200 "
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 7, repeat: Infinity }}
                >
                    Breathe in, breathe out...
                </motion.h2>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        className="mt-4 text-sm text-slate-300"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4 }}
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>

                {/* ⏳ LOADING BAR */}
                <div className="mt-5 w-72 h-6 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
