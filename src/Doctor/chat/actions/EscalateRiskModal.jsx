import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight, Phone, Bell, ShieldAlert, Lock, Siren, ChevronRight } from 'lucide-react';

const EscalateRiskModal = ({ isOpen, onClose }) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [isConfirmed, setIsConfirmed] = useState(false);

    if (!isOpen) return null;

    const handleSlide = (e) => {
        setSliderValue(parseInt(e.target.value));
        if (parseInt(e.target.value) === 100) {
            setIsConfirmed(true);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-[#0f0505] border border-red-500/30 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.2)] flex flex-col overflow-hidden group/modal"
                >
                    {/* Header */}
                    <div className="p-7 border-b border-red-500/20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-[#0f0505] to-[#0f0505] flex justify-between items-start relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
                                <div className="p-3.5 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] relative z-10 border border-red-400/50">
                                    <Siren size={28} className="drop-shadow-md" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-amber-200 to-red-400 tracking-tight">
                                    Escalate Risk Level
                                </h2>
                                <p className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                    Critical Action Required
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-red-500/50 hover:text-red-400 transition-colors z-10">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-10 bg-[linear-gradient(180deg,rgba(15,5,5,0.8)_0%,rgba(20,10,0,0.4)_100%)]">

                        {/* Risk Transition */}
                        <div className="flex items-center justify-between p-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-red-900/40 border border-red-900/40 relative overflow-hidden">
                            <div className="absolute inset-x-0 h-px top-1/2 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

                            <div className="text-center w-1/3 py-5 relative z-10">
                                <div className="text-xs text-amber-500/60 uppercase tracking-[0.2em] font-bold">Current</div>
                                <div className="text-amber-400 font-bold mt-1 text-xl drop-shadow-sm">Moderate</div>
                            </div>

                            <div className="relative z-10 bg-[#0f0505] p-2.5 rounded-full border border-red-900/50 shadow-xl">
                                <ArrowRight size={24} className="text-red-500/60" />
                            </div>

                            <div className="text-center w-1/3 py-5 relative z-10">
                                <div className="text-xs text-red-500/60 uppercase tracking-[0.2em] font-bold">New Status</div>
                                <div className="text-red-500 font-black text-2xl mt-0.5 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] tracking-wide">CRITICAL</div>
                            </div>
                        </div>

                        {/* Cascade Effects */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-black text-amber-500/60 uppercase tracking-[0.2em] pl-1 drop-shadow-sm">Automated Protocol Actions</h3>
                            <div className="space-y-3.5">
                                {[
                                    { icon: Phone, text: "SMS Triggered to Emergency Contact", sub: "+1 (555) 012-3456" },
                                    { icon: ShieldAlert, text: "Chief Medical Officer Notified", sub: "Dr. Sarah Chen via Pager" },
                                    { icon: Bell, text: "Added to 'Critical Watchlist'", sub: "High Priority Dashboard" }
                                ].map((step, i) => (
                                    <div key={i} className="group flex items-center gap-6 p-4.5 rounded-xl bg-gradient-to-r from-red-950/40 to-transparent border border-red-900/30 text-red-100 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(220,38,38,0.1)] group-hover:scale-105 transition-transform relative z-10">
                                            <step.icon size={20} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="font-bold text-base tracking-wide group-hover:text-red-50 transition-colors">{step.text}</div>
                                            <div className="text-xs text-red-400/50 font-medium mt-0.5 group-hover:text-red-400/70">{step.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Slider Action */}
                        <div className="pt-2">
                            {!isConfirmed ? (
                                <div className="relative h-18 bg-[#1c0a0a] rounded-full border border-red-900/50 overflow-hidden group shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                    {/* Track Progress */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-900/50 to-red-600/30 transition-all pointer-events-none"
                                        style={{ width: `${sliderValue}%` }}
                                    />

                                    {/* Tick Marks (Visual only) */}
                                    <div className="absolute inset-0 flex justify-between px-6 items-center opacity-20 pointer-events-none">
                                        {[...Array(10)].map((_, i) => <div key={i} className="w-0.5 h-2 bg-red-500" />)}
                                    </div>

                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={sliderValue}
                                        onChange={handleSlide}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center text-red-500/60 font-black uppercase tracking-[0.2em] text-sm pointer-events-none transition-opacity duration-300" style={{ opacity: 1 - sliderValue / 100 }}>
                                        Slide to Confirm Escalation
                                    </div>

                                    <div
                                        className="absolute top-1.5 bottom-1.5 w-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-400/50 flex items-center justify-center z-10 transition-all pointer-events-none group-hover:scale-105"
                                        style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.58}px + 6px)` }}
                                    >
                                        <ArrowRight size={24} className="text-white drop-shadow-md" />
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="h-18 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center gap-3 text-white shadow-[0_0_50px_rgba(220,38,38,0.8)] border border-red-400"
                                >
                                    <AlertTriangle size={28} className="animate-pulse" />
                                    <span className="font-black text-xl tracking-widest drop-shadow-md">ESCALATION TRIGGERED</span>
                                </motion.div>
                            )}
                            <p className="text-center text-[10px] text-stone-600 mt-5 font-mono flex justify-center items-center gap-1.5">
                                <Lock size={12} className="text-stone-500" />
                                <span className="opacity-70">This action is logged on the blockchain and cannot be undone.</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EscalateRiskModal;
