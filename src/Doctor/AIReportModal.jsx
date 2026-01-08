import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, X, FileText, CheckCircle2,
    TrendingUp, AlertTriangle, Lightbulb, Download, Share2, Sparkles,
    Loader2
} from 'lucide-react';

const AIReportModal = ({ isOpen, onClose }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(true);

    // Simulation of AI Analysis Steps
    useEffect(() => {
        if (isOpen) {
            setIsGenerating(true);
            setLoadingStep(0);

            const steps = [
                () => setLoadingStep(1), // "Analyzing Population Trends..."
                () => setLoadingStep(2), // "Correlating Risk Factors..."
                () => setLoadingStep(3), // "Synthesizing Clinical Insights..."
                () => {
                    setIsGenerating(false);
                    setLoadingStep(4);
                }
            ];

            // Execute sequence
            let delay = 0;
            steps.forEach((step, index) => {
                delay += 1200; // 1.2s per step
                setTimeout(step, delay);
            });
        }
    }, [isOpen]);

    // Loading State UI
    const loadingMessages = [
        "Initializing Analytic Engine...",
        "Analyzing 1,248 Patient Records...",
        "Correlating Multi-Variable Risk Factors...",
        "Finalizing Executive Summary..."
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0c0a09] w-full max-w-4xl max-h-[90vh] rounded-[2rem] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden pointer-events-auto relative">

                            {/* Decorative Top Glow */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                            {/* --- LOADING VIEW --- */}
                            {isGenerating ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                                        <div className="relative bg-black/40 p-6 rounded-full border border-amber-500/30 backdrop-blur-xl">
                                            <BrainCircuit size={64} className="text-amber-500 animate-pulse" />
                                        </div>
                                        {/* Spinning Ring */}
                                        <div className="absolute inset-0 border-t-2 border-r-2 border-amber-500/50 rounded-full animate-spin" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">AI Generation in Progress</h3>
                                    <p className="text-amber-500/80 font-mono text-sm uppercase tracking-widest mb-8">
                                        {loadingMessages[loadingStep] || "Processing..."}
                                    </p>

                                    {/* Progress Bar */}
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
                                /* --- REPORT VIEW --- */
                                <div className="flex flex-col h-full">
                                    {/* Header */}
                                    <div className="p-8 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-amber-500/5 to-transparent">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Sparkles size={12} /> Intelligence Report
                                                </span>
                                                <span className="text-stone-500 text-xs font-mono font-bold">{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <h2 className="text-3xl font-extrabold text-white tracking-tight">Executive Health Summary</h2>
                                            <p className="text-stone-400 text-sm mt-1">Automated analysis of 1,248 active patient records.</p>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

                                        {/* 1. Key Performance Indicators */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { label: "Overall Risk Score", value: "Low", color: "text-emerald-500", sub: "Improved by 12% MoM" },
                                                { label: "Operational Efficiency", value: "94%", color: "text-amber-500", sub: "Top 5% of Clinics" },
                                                { label: "Critical Care Gaps", value: "3", color: "text-rose-500", sub: "Immediate Review Needed" }
                                            ].map((stat, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{stat.label}</p>
                                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-[10px] text-stone-400 font-medium">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 2. Executive Insights Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Lightbulb size={18} className="text-yellow-400" /> Strategic Insights
                                            </h3>

                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none" />
                                                <h4 className="font-bold text-indigo-200 mb-2 flex items-center gap-2">
                                                    <TrendingUp size={16} /> Adherence Velocity
                                                </h4>
                                                <p className="text-sm text-indigo-100/80 leading-relaxed">
                                                    Patient adherence in the <strong className="text-white">Diabetes Type 2</strong> cohort has increased by <strong className="text-emerald-400">14%</strong> following the introduction of the new automated SMS reminder protocol. Recommend expanding this protocol to the Hypertensive group.
                                                </p>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[50px] pointer-events-none" />
                                                <h4 className="font-bold text-rose-200 mb-2 flex items-center gap-2">
                                                    <AlertTriangle size={16} /> Seasonal Risk Alert
                                                </h4>
                                                <p className="text-sm text-rose-100/80 leading-relaxed">
                                                    Predictive models indicate a high probability of <strong className="text-white">Respiratory distress cases</strong> spiking in the next 14 days due to local air quality drops. Suggested Action: Send preventative advisory blasts to patients with Asthma/COPD tags.
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3. Action Plan */}
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <CheckCircle2 size={18} className="text-emerald-500" /> Recommended Actions
                                            </h3>
                                            <div className="space-y-3">
                                                {[
                                                    "Review the 3 highlighted Critical Care Gap cases.",
                                                    "Approve the automated advisory blast for Respiratory patients.",
                                                    "Schedule a staff review for Tuesday afternoon efficiency gaps."
                                                ].map((action, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10 group">
                                                        <div className="w-5 h-5 rounded-full border-2 border-stone-600 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-all" />
                                                        <span className="text-sm text-stone-300 group-hover:text-white font-medium">{action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Footer Content */}
                                    <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center">
                                        <p className="text-[10px] text-stone-600 font-mono">
                                            Generated by CureAI Neural Engine v4.2 • HIPAA Compliant
                                        </p>
                                        <div className="flex gap-3">
                                            <button className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition-colors flex items-center gap-2">
                                                <Share2 size={14} /> Share
                                            </button>
                                            <button className="px-5 py-2 rounded-lg bg-amber-500 text-black text-xs font-black uppercase tracking-wide hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
                                                <Download size={14} /> Export PDF
                                            </button>
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
