import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenBird from "../curebird_loading_logo.png";

const loadingMessages = [
    "Connecting to CureBird AI...",
    "Analyzing Health Patterns...",
    "Securing Patient Data...",
    "Calibrating Medical AI...",
    "Retrieving Latest Research...",
    "Optimizing Your Care Path...",
    "Synthesizing Digital Records...",
    "Harmonizing Vital Statistics..."
];

const breathPhrases = ["Breathe in", "Breathe out"];

const LoadingScreen = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [breathIndex, setBreathIndex] = useState(0);
    const [dots, setDots] = useState("");

    /* System messages */
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((p) => (p + 1) % loadingMessages.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    /* Breathing + dots */
    useEffect(() => {
        const breathInterval = setInterval(() => {
            setBreathIndex((p) => (p + 1) % breathPhrases.length);
            setDots("");
        }, 1400);

        const dotsInterval = setInterval(() => {
            setDots((p) => (p.length < 2 ? p + "." : ""));
        }, 450);

        return () => {
            clearInterval(breathInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden text-white">

            {/* GLASSMORPHIC BACKGROUND */}
            <div className="absolute inset-0 bg-black" />
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 30% 20%, rgba(251,191,36,0.18), transparent 55%),
            radial-gradient(circle at 70% 80%, rgba(245,158,11,0.15), transparent 60%)
          `
                }}
            />
            <div className="absolute inset-0 backdrop-blur-[60px] bg-amber-400/6" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />

            {/* CENTER */}
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">

                {/* 🔶 CANONICAL RING SHELL */}
                <div
                    className="relative w-64 h-64 flex items-center justify-center"
                    style={{ boxSizing: "border-box" }}
                >
                    {/* BREATHING ENERGY (INSET + OUTSET = BLENDED) */}
                    <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{
                            boxShadow:
                                breathIndex === 0
                                    ? `
                    inset 0 0 0 1px rgba(251,191,36,0.35),
                    0 0 28px 6px rgba(251,191,36,0.45),
                    0 0 60px 20px rgba(251,191,36,0.35)
                  `
                                    : `
                    inset 0 0 0 1px rgba(251,191,36,0.2),
                    0 0 14px 4px rgba(251,191,36,0.25),
                    0 0 32px 12px rgba(251,191,36,0.2)
                  `
                        }}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                    />

                    {/* MAIN RING — PHYSICAL OBJECT */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-[4px] border-amber-400 pointer-events-none"
                        style={{
                            boxSizing: "border-box",
                            filter: "drop-shadow(0 0 4px rgba(251,191,36,0.55))"
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />

                    {/* LOGO */}
                    <motion.img
                        src={GoldenBird}
                        alt="CureBird"
                        className="w-50 h-50 object-contain"
                        animate={{
                            scale: breathIndex === 0 ? 1.08 : 0.96,
                            filter: breathIndex === 0
                                ? "drop-shadow(0 0 24px rgba(251,191,36,0.8))"
                                : "drop-shadow(0 0 10px rgba(251,191,36,0.4))"
                        }}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                    />
                </div>

                {/* BREATH TEXT */}
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={breathIndex}
                        className="mt-5 text-2xl tracking-widest font-bold text-amber-200 font-sans"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                    >
                        {breathPhrases[breathIndex]}
                        <span className="inline-block w-6 text-left">{dots}</span>
                    </motion.h2>
                </AnimatePresence>

                {/* SYSTEM STATUS */}
                <div className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            className="mt-4 text-sm text-slate-300 font-sans"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.4 }}
                        >
                            {loadingMessages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>

                    {/* SLOW NETWORK INDICATOR */}
                    {(() => {
                        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                        if (conn && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
                            return (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 text-[10px] uppercase tracking-tighter text-amber-500/60 font-medium"
                                >
                                    Optimizing for slow connection...
                                </motion.p>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* LOADING BAR */}
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
