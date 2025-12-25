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

const breathPhrases = ["Breathe in", "Breathe out"];

const LoadingScreen = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [breathIndex, setBreathIndex] = useState(0);
    const [dots, setDots] = useState("");

    /* Rotate system messages (calm, readable) */
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2800); // matches full breathing loop

        return () => clearInterval(interval);
    }, []);

    /* Breathing text + dots (1.4s per phase) */
    useEffect(() => {
        // Switch text every 1.4 seconds
        const breathInterval = setInterval(() => {
            setBreathIndex((prev) => (prev + 1) % breathPhrases.length);
            setDots(""); // reset dots on phrase change
        }, 1400);

        // Animate dots inside the 1.4s window
        const dotsInterval = setInterval(() => {
            setDots((prev) => (prev.length < 2 ? prev + "." : ""));
        }, 450);

        return () => {
            clearInterval(breathInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden text-white">

            {/* 🧊 STATIC AMBER / GOLD GLASS BACKGROUND */}
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

            {/* Glass darkening */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[50px]" />

            {/* 🌟 CENTER CONTAINER */}
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">

                {/* 🟡 RING + LOGO */}
                <div className="relative w-64 h-64 flex items-center justify-center">

                    {/* Rotating ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-[4px] border-amber-400"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />

                    {/* 🕊️ LOGO (scale-only breathing, no X/Y movement) */}
                    <motion.img
                        src={GoldenBird}
                        alt="Curebird"
                        className="w-50 h-50 object-contain"
                        animate={{
                            scale: [0.96, 1.08, 0.96],
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

                {/* 🌬️ BREATHING TEXT */}
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={breathIndex}
                        className="mt-5 text-2xl tracking-widest font-bold text-amber-200 font-['Inter']"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                    >
                        {breathPhrases[breathIndex]}
                        <span className="inline-block w-6 text-left">{dots}</span>
                    </motion.h2>
                </AnimatePresence>

                {/* 🔧 SYSTEM STATUS */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        className="mt-4 text-sm text-slate-300 font-['Inter']"
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
