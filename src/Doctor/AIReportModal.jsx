import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, X, FileText, CheckCircle2,
    TrendingUp, Lightbulb, Download, Share2, Sparkles,
    CheckCircle, Pill, AlertCircle, Activity
} from 'lucide-react';

const AIReportModal = ({ isOpen, onClose, report }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(true);

    // Simulation of AI Analysis Steps
    useEffect(() => {
        if (isOpen) {
            // If report is already fully "analyzed" (has findings), we can skip generation or make it fast
            setIsGenerating(true);
            setLoadingStep(0);

            const steps = [
                () => setLoadingStep(1),
                () => setLoadingStep(2),
                () => setLoadingStep(3),
                () => {
                    setIsGenerating(false);
                    setLoadingStep(4);
                }
            ];

            // Execute sequence
            let delay = 0;
            steps.forEach((step, index) => {
                delay += 800; // Faster generation for viewing existing
                setTimeout(step, delay);
            });
        }
    }, [isOpen]);

    // Loading State UI
    const loadingMessages = [
        "Retrieving Clinical Data...",
        "Validating AI Insights...",
        "Correlating Medical History...",
        "Preparing Intelligence Report..."
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0c0a09] w-full max-w-4xl max-h-[90vh] rounded-[2rem] border border-stone-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto relative">

                            {/* --- LOADING VIEW --- */}
                            {isGenerating ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[500px] relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                                        <div className="relative bg-black/40 p-6 rounded-full border border-amber-500/30 backdrop-blur-xl">
                                            <BrainCircuit size={64} className="text-amber-500 animate-pulse" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Retrieving Analysis</h3>
                                    <p className="text-amber-500/80 font-mono text-sm uppercase tracking-widest mb-8">
                                        {loadingMessages[loadingStep] || "Processing..."}
                                    </p>

                                    <div className="w-64 h-1 bg-stone-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-amber-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${(loadingStep + 1) * 25}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* --- REPORT VIEW (Matching AnalyzeDataModal) --- */
                                <div className="flex flex-col h-full min-h-0">
                                    {/* Header */}
                                    <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className="text-stone-400" />
                                            <h2 className="text-lg font-bold text-white tracking-tight">{report?.fileName || 'Clinical Report'}</h2>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Content Scroll */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[#0c0a09]">

                                        {/* 1. Analysis Complete Badge & Summary */}
                                        <div className="p-6 rounded-2xl bg-[#091011] border border-[#112a28] relative overflow-hidden">
                                            {/* Glow */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#14b8a6]/5 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

                                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                                <CheckCircle size={20} className="text-[#2dd4bf]" />
                                                <h3 className="text-lg font-bold text-[#2dd4bf] tracking-tight">Analysis Complete</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-[#1d283a] border border-[#303f57] text-[#60a5fa] text-[10px] font-black uppercase tracking-wider">
                                                    Powered by Llama 4 Vision
                                                </span>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed max-w-3xl relative z-10 text-[15px]">
                                                {report?.summary || "Analysis complete. Review findings below."}
                                            </p>
                                        </div>

                                        {/* 2. Key Clinical Findings */}
                                        <div>
                                            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-4">Key Clinical Findings</h3>
                                            <div className="space-y-3">
                                                {report?.key_findings && report.key_findings.length > 0 ? (
                                                    report.key_findings.map((finding, idx) => (
                                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-stone-900/50 border border-white/5 hover:border-amber-500/20 transition-colors group">
                                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] group-hover:scale-125 transition-transform" />
                                                            <p className="text-slate-200 text-sm leading-relaxed">{finding}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 italic text-sm">No specific findings extracted.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Medications & Adjustments */}
                                        <div>
                                            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-4">Medications & Treatment Plan</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {report?.medication_adjustments && report.medication_adjustments.length > 0 ? (
                                                    report.medication_adjustments.map((med, idx) => (
                                                        <div key={idx} className="p-5 rounded-xl bg-[#0b1812] border border-[#133626] relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                                <Pill size={48} className="text-emerald-500" />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-bold text-white text-base">{med.name}</h4>
                                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${med.action === 'Stop' ? 'bg-rose-500/20 text-rose-400' :
                                                                            med.action === 'Increase' ? 'bg-amber-500/20 text-amber-400' :
                                                                                'bg-emerald-500/20 text-emerald-400'
                                                                        }`}>
                                                                        {med.action || 'Prescribed'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-stone-400 text-xs mb-3 font-mono">{med.dosage} • {med.frequency}</p>
                                                                <p className="text-emerald-400/80 text-xs leading-relaxed border-t border-emerald-500/10 pt-3">
                                                                    {med.reason}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full p-6 rounded-xl bg-stone-900 border border-stone-800 text-center">
                                                        <div className="inline-flex p-3 rounded-full bg-stone-800 text-stone-600 mb-3">
                                                            <Pill size={20} />
                                                        </div>
                                                        <p className="text-stone-500 text-sm">No specific medication adjustments found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 4. Extracted Vitals (Optional) */}
                                        {report?.extracted_vitals && report.extracted_vitals.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-4">Extracted Vitals</h3>
                                                <div className="flex flex-wrap gap-4">
                                                    {report.extracted_vitals.map((vital, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 pr-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                                <Activity size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{vital.vital}</p>
                                                                <p className="text-white font-mono font-bold">{vital.value} <span className="text-stone-500 text-xs font-normal">{vital.unit}</span></p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer / Actions */}
                                        <div className="flex justify-end gap-3 pt-8 border-t border-stone-800">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(report?.summary || "")}
                                                    className="px-4 py-2 rounded-xl bg-stone-900 border border-white/5 text-stone-400 hover:text-white hover:border-white/10 transition-all text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                                                >
                                                    <Share2 size={16} /> Copy Summary
                                                </button>
                                                <button
                                                    className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wide hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
                                                >
                                                    <Download size={16} /> Export PDF
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIReportModal;
