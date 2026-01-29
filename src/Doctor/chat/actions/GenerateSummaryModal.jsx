import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  X, RefreshCw, Check, FileText, Bot, Cpu, History, ChevronRight, CheckCircle  } from '../../../components/Icons';

const GenerateSummaryModal = ({ isOpen, onClose, generatedData, onApprove, onRegenerate }) => {
    const [isGenerating, setIsGenerating] = useState(true);
    const [step, setStep] = useState(0); 

    useEffect(() => {
        if (isOpen) {
            setIsGenerating(true);
            setStep(0);
            const timer = setTimeout(() => {
                setIsGenerating(false);
                setStep(1);
            }, 2000); // Slightly faster for real feel
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Construct SOAP from the heuristic data or fallback
    const soapNote = generatedData ? {
        subjective: generatedData.description.split('**OBJECTIVE:**')[0].replace('**SUBJECTIVE:**', '').trim(),
        objective: (generatedData.description.split('**OBJECTIVE:**')[1] || '').split('**ASSESSMENT:**')[0].trim(),
        assessment: (generatedData.description.split('**ASSESSMENT:**')[1] || '').split('**PLAN:**')[0].trim(),
        plan: (generatedData.description.split('**PLAN:**')[1] || '').trim()
    } : {
        subjective: "No sufficient chat context found.",
        objective: "Vitals: --",
        assessment: "Unable to generate.",
        plan: "Please add more details to the conversation."
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 font-sans">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Main Card - Ultra Thin Glass Effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-3xl flex flex-col max-h-[85vh] !p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative rounded-3xl border border-white/10 backdrop-blur-2xl"
                    style={{ 
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(245, 158, 11, 0.05) 100%)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Subtle Amber Glow Top Right */}
                    <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none opacity-60" />

                    {/* Header - Fully Transparent */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden group">
                                <Bot size={30} className="text-amber-400 relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white/90 tracking-tight drop-shadow-sm">
                                    AI Consultation Summary
                                </h2>
                                <p className="text-amber-500/80 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                    <Bot size={12} className="animate-pulse" />
                                    Powered by CureBird Clinical Engine
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
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
                                    <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu size={36} className="text-amber-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl font-bold text-white/80 tracking-tight">Analyzing Clinical Context...</h3>
                                    <p className="text-white/40 font-medium">Processing recent messages, vitals logs, and lab reports.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                {/* Info Box */}
                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-5">
                                    <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-emerald-200 font-bold text-base tracking-wide">Context Analysis Complete</h4>
                                        <p className="text-emerald-300/60 text-sm mt-1.5 font-medium leading-relaxed">
                                            Processed {generatedData?.stats?.messageCount || 0} messages, {generatedData?.stats?.vitalsCount || 0} vitals points, and identified {generatedData?.stats?.symptomCount || 0} symptoms.
                                        </p>
                                    </div>
                                </div>

                                {/* SOAP Note Section */}
                                <div className="space-y-8">
                                    {Object.entries(soapNote).map(([key, value]) => (
                                        <div key={key} className="group">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                    <span className="text-amber-500 font-black text-xs uppercase">{key.charAt(0)}</span>
                                                </div>
                                                <h3 className="text-white/50 font-bold uppercase tracking-[0.2em] text-xs transition-colors group-hover:text-amber-400">{key}</h3>
                                            </div>
                                            <div className="pl-12">
                                                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 text-stone-200 leading-relaxed font-normal hover:bg-white/10 transition-all duration-300 shadow-sm">
                                                    {/* Side Accent Line */}
                                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-amber-500/30 rounded-r-full" />
                                                    
                                                    <div className="relative z-10 text-sm">
                                                        {value.split('\n').map((line, i) => (
                                                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
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

                    {/* Footer - Fully Transparent */}
                    <div className="p-8 border-t border-white/5 flex justify-between items-center relative z-20">
                        <button 
                            onClick={onRegenerate}
                            className="px-6 py-3.5 rounded-xl border border-amber-500/20 text-stone-400 hover:text-amber-200 hover:bg-amber-500/5 hover:border-amber-500/40 transition-all flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider group"
                        >
                            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                            Regenerate
                        </button>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={onApprove}
                                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#1c1200] font-bold shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all flex items-center gap-3 transform active:scale-95 text-sm tracking-wide">
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
