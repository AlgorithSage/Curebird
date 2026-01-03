import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check, FileText, Bot, Cpu, History, ChevronRight, CheckCircle } from 'lucide-react';

const GenerateSummaryModal = ({ isOpen, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(true);
    const [step, setStep] = useState(0); // 0: Analyzing, 1: Complete

    useEffect(() => {
        if (isOpen) {
            setIsGenerating(true);
            setStep(0);
            // Simulate generation delay
            const timer = setTimeout(() => {
                setIsGenerating(false);
                setStep(1);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const soapNote = {
        subjective: "Patient reports feeling 'slightly better' than yesterday but complains of persistent fatigue. Mentions adherence to evening medication but missed morning dose once due to nausea.",
        objective: "Heart Rate avg: 78 bpm (stable). BP: 120/80. Latest blood work (imported): Hemoglobin 13.5 g/dL, WBC 14.2 (Elevated).",
        assessment: "Patient showing signs of post-viral fatigue syndrome. WBC count suggests resolving infection vs residual inflammation. Medication adherence is 90%, nausea may be a side effect of current antibiotic regimen.",
        plan: "1. Continue current antibiotic course to completion.\n2. Recommend taking medication with food to reduce nausea.\n3. Schedule follow-up blood work in 5 days to monitor WBC trend.\n4. Advise rest and hydration."
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                />

                {/* Slide-over Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="relative w-full max-w-2xl h-full bg-[#1c1200] border-l border-amber-500/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden"
                >
                    {/* Background Ambience */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Header */}
                    <div className="p-8 border-b border-amber-500/10 flex justify-between items-center bg-gradient-to-r from-[#2a1c05] to-[#1c1200] relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)] relative overflow-hidden group">
                                <Bot size={30} className="text-amber-400 relative z-10 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-500 tracking-tight">
                                    AI Consultation Summary
                                </h2>
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                    <Bot size={12} className="text-amber-500 animate-pulse" />
                                    Powered by Curebird Clinical Engine
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full hover:bg-white/5 text-stone-500 hover:text-white transition-colors"
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10">

                        {/* Loading State */}
                        {isGenerating ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-90">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu size={36} className="text-amber-500 animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-pulse" />
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl font-bold text-amber-200 tracking-tight">Analyzing Clinical Context...</h3>
                                    <p className="text-stone-500 font-medium">Processing recent messages, vitals logs, and lab reports.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                {/* Info Box */}
                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                                    <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-emerald-200 font-bold text-base tracking-wide">Context Analysis Complete</h4>
                                        <p className="text-emerald-300/60 text-sm mt-1.5 font-medium leading-relaxed">
                                            Processed 14 messages, 1 lab report (CBC), and 3 days of vitals history.
                                        </p>
                                    </div>
                                </div>

                                {/* SOAP Note Section */}
                                <div className="space-y-10">
                                    {Object.entries(soapNote).map(([key, value]) => (
                                        <div key={key} className="group">
                                            <div className="flex items-center gap-4 mb-3.5">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/50 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                                    <span className="text-amber-500 font-black text-sm uppercase">{key.charAt(0)}</span>
                                                </div>
                                                <h3 className="text-amber-600/60 font-black uppercase tracking-[0.2em] text-sm transition-colors group-hover:text-amber-500/80">{key}</h3>
                                            </div>
                                            <div className="pl-12">
                                                <div className="relative p-6 rounded-2xl bg-[#0f0a05] border border-stone-800/60 text-stone-300 leading-relaxed font-normal hover:border-amber-500/30 transition-all duration-300 overflow-hidden shadow-inner hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">

                                                    {/* Dynamic Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                    <div className="relative z-10 text-base">
                                                        {value.split('\n').map((line, i) => (
                                                            <p key={i} className={i > 0 ? 'mt-3 pl-4 border-l-2 border-stone-800' : ''}>{line}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-amber-500/10 bg-[#140c00] flex justify-between items-center relative z-20">
                        <button className="px-6 py-3.5 rounded-xl border border-amber-500/20 text-stone-400 hover:text-amber-200 hover:bg-amber-500/5 hover:border-amber-500/40 transition-all flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider group">
                            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                            Regenerate
                        </button>
                        <div className="flex items-center gap-3">
                            <button className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#1c1200] font-bold shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all flex items-center gap-3 transform active:scale-95 text-sm tracking-wide">
                                <Check size={20} strokeWidth={3} />
                                <span>Approve & Save Note</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GenerateSummaryModal;
