import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  X, Flag, AlertCircle, Bookmark, BellRing, ChevronRight  } from '../../../components/Icons';

const FlagObservationModal = ({ isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [note, setNote] = useState('');
    const [priority, setPriority] = useState(false);

    if (!isOpen) return null;

    const categories = [
        { id: 'symptom', label: 'Symptom Worsening', color: 'rose' },
        { id: 'adherence', label: 'Non-Adherence', color: 'orange' },
        { id: 'side_effect', label: 'Side Effect Claim', color: 'yellow' },
        { id: 'critical', label: 'Critical Value (Lab)', color: 'red' },
        { id: 'behavioral', label: 'Behavioral Concern', color: 'amber' }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-[#1c1200] border border-rose-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden group/modal"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-rose-500/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/20 via-[#1c1200] to-[#1c1200] flex justify-between items-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-500/10 to-amber-500/5 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] group-hover/modal:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-shadow duration-500">
                                <Flag size={24} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-amber-200 to-rose-400 tracking-tight">
                                    Flag Observation
                                </h2>
                                <p className="text-rose-500/80 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    Clinical Event Log
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-500/10 text-stone-500 hover:text-rose-200 transition-colors z-10">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 bg-[linear-gradient(to_bottom,rgba(28,18,0,0.4),rgba(28,18,0,0.9))]">

                        {/* Categories */}
                        <div className="space-y-4">
                            <label className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 block drop-shadow-sm">Context of Observation</label>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-300 relative overflow-hidden group ${selectedCategory === cat.id
                                            ? 'bg-rose-500/15 border-rose-500/60 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                                            : 'bg-[#0f0a05] border-white/5 text-stone-400 hover:border-amber-500/30 hover:text-amber-200'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                        <span className="relative z-10 tracking-wide">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Annotation */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 drop-shadow-sm">Clinical Documentation</label>
                                <span className="text-[11px] text-stone-500 font-bold font-mono flex items-center gap-1.5 opacity-80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    Encrypted & Private
                                </span>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100"></div>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Describe the clinical observation details..."
                                    className="relative w-full h-36 bg-[#0a0806] border border-stone-800 rounded-xl p-5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-500/50 focus:bg-[#0f0a09] transition-all resize-none font-medium leading-relaxed text-base shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Priority Toggle */}
                        <div
                            onClick={() => setPriority(!priority)}
                            className={`p-1 rounded-2xl transition-all duration-500 cursor-pointer ${priority ? 'bg-gradient-to-r from-rose-900/40 to-transparent' : 'bg-transparent'}`}
                        >
                            <div className={`p-5 rounded-xl border flex items-center justify-between group relative overflow-hidden transition-all duration-300 ${priority
                                ? 'bg-rose-950/10 border-rose-500/40'
                                : 'bg-[#0f0a05] border-stone-800 hover:border-rose-500/30'
                                }`}>

                                <div className={`absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`p-3.5 rounded-full transition-colors duration-300 ${priority ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-stone-900 text-stone-600 group-hover:bg-stone-800 group-hover:text-rose-500/70'}`}>
                                        <BellRing size={22} className={priority ? 'animate-pulse' : ''} />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-base uppercase tracking-wider transition-colors ${priority ? 'text-rose-200' : 'text-stone-300 group-hover:text-rose-200'}`}>Priority Follow-up</div>
                                        <div className="text-xs text-stone-500 font-bold mt-1 group-hover:text-stone-400 transition-colors">Triggers "Critical Watchlist" inclusion</div>
                                    </div>
                                </div>

                                <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 border relative z-10 ${priority ? 'bg-rose-600 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-stone-900 border-stone-700'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${priority ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 bg-[#140c00] flex justify-end gap-3 z-10">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-stone-500 hover:text-stone-300 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_25px_rgba(244,63,94,0.5)] transition-all flex items-center gap-3 transform active:scale-95 group text-sm tracking-wide"
                        >
                            <span>Save Observation</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FlagObservationModal;
