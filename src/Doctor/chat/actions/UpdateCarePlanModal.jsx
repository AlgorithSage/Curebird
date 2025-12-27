import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, Plus, Search, TrendingUp, Calendar, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const UpdateCarePlanModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [duration, setDuration] = useState(7);
    const [frequency, setFrequency] = useState(2);

    if (!isOpen) return null;

    const activeMeds = [
        { name: 'Amoxicillin', dose: '500mg', freq: 'Every 8 hours', status: 'Active', adherence: 92 },
        { name: 'Ibuprofen', dose: '400mg', freq: 'As needed', status: 'Active', adherence: 85 }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Main Modal Interface */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="relative w-full max-w-4xl h-[85vh] bg-[#1c1200] border border-emerald-500/20 rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 py-7 border-b border-emerald-500/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#1c1200] to-[#1c1200] flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-amber-100 to-emerald-400 tracking-tight drop-shadow-sm">
                                Update Care Plan
                            </h2>
                            <p className="text-emerald-500/80 text-sm font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" />
                                Regimen Management System
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-emerald-500/10 text-stone-500 hover:text-emerald-200 transition-colors relative z-10">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[linear-gradient(to_bottom,rgba(28,18,0,0.3),rgba(28,18,0,0.8))]">
                        <div className="p-10 space-y-12">

                            {/* Section 1: Active Medications */}
                            <div>
                                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-5 pl-1 flex items-center gap-3 drop-shadow-sm">
                                    Current Active Regimen
                                    <span className="flex-1 h-px bg-gradient-to-r from-emerald-900/50 to-transparent"></span>
                                </h3>
                                <div className="grid grid-cols-2 gap-5">
                                    {activeMeds.map((med, i) => (
                                        <div key={i} className="group relative p-6 rounded-2xl bg-[#0f0a05] border border-stone-800/50 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden cursor-pointer shadow-md hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                                            {/* Dynamic Hover Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />

                                            <div className="flex gap-6 relative z-10">
                                                <div className="p-4 rounded-xl bg-[#140f0a] border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300">
                                                    <Pill size={26} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-black text-xl text-emerald-100 group-hover:text-white transition-colors tracking-tight">{med.name}</div>
                                                        <div className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors uppercase tracking-wider">ACTIVE</div>
                                                    </div>
                                                    <div className="text-sm text-stone-400 mt-1.5 font-medium group-hover:text-emerald-400/80 transition-colors">{med.dose} • {med.freq}</div>

                                                    <div className="mt-5 flex items-center gap-3">
                                                        <div className="h-2 flex-1 bg-stone-900 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${med.adherence}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-emerald-500">{med.adherence}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add New Placeholder */}
                                    <div className="p-6 rounded-2xl border border-dashed border-stone-800 flex items-center justify-center gap-4 text-stone-500 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer group">
                                        <div className="p-3.5 rounded-full bg-stone-900 group-hover:bg-amber-500/20 transition-colors duration-300">
                                            <Plus size={22} />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Discontinue / Archive</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: New Prescription */}
                            <div className="grid grid-cols-3 gap-10">
                                <div className="col-span-2 space-y-9">
                                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 flex items-center gap-3 drop-shadow-sm">
                                        Prescribe New Treatment
                                        <span className="flex-1 h-px bg-gradient-to-r from-emerald-900/50 to-transparent"></span>
                                    </h3>

                                    {/* Search */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-emerald-400 transition-colors z-10" />
                                        <input
                                            type="text"
                                            placeholder="Search pharmacopeia database..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="relative z-10 w-full bg-[#0c0a09] border border-stone-800 rounded-xl py-5 pl-14 pr-5 text-stone-200 font-medium text-base focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-stone-600 shadow-inner group-hover:border-stone-700"
                                        />
                                    </div>

                                    {/* Sliders */}
                                    <div className="grid grid-cols-2 gap-8 bg-[#0c0a09]/80 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50 pointer-events-none" />

                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-end">
                                                <span className="text-stone-400 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest"><Clock size={16} className="text-emerald-500/70" /> Frequency</span>
                                                <span className="text-emerald-300 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{frequency}x Daily</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="4" step="1"
                                                value={frequency}
                                                onChange={(e) => setFrequency(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                                            />
                                            <div className="flex justify-between text-[11px] text-stone-500 font-mono font-bold uppercase">
                                                <span>QD</span><span>BID</span><span>TID</span><span>QID</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-end">
                                                <span className="text-stone-400 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest"><Calendar size={16} className="text-emerald-500/70" /> Duration</span>
                                                <span className="text-emerald-300 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{duration} Days</span>
                                            </div>
                                            <input
                                                type="range" min="3" max="30" step="1"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                                            />
                                            <div className="flex justify-between text-[11px] text-stone-500 font-mono font-bold uppercase">
                                                <span>3d</span><span>10d</span><span>20d</span><span>30d</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="space-y-5">
                                        <label className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 block drop-shadow-sm">Patient Instructions</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['Take with food', 'Avoid Alcohol', 'Complete full course', 'May cause drowsiness'].map((tag) => (
                                                <button key={tag} className="px-5 py-2.5 rounded-lg border border-stone-800/80 text-stone-400 text-xs font-bold hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer transition-all bg-[#0f0a05] hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] tracking-wide">
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Impact Preview (Right Column) */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 drop-shadow-sm">Impact Analysis</h3>
                                    <div className="bg-[#0c0a09] border border-stone-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                        {/* Background Glow */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

                                        <div className="relative z-10 p-6 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] transition-all duration-500">
                                            <TrendingUp size={42} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        </div>

                                        <div className="relative z-10 w-full">
                                            <div className="text-5xl font-black text-white tracking-tighter drop-shadow-md group-hover:text-emerald-100 transition-colors">High</div>
                                            <div className="text-xs text-emerald-500 font-black uppercase tracking-[0.3em] mt-3 opacity-90">Predicted Adherence</div>
                                        </div>

                                        <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden relative z-10">
                                            <div className="h-full w-[85%] bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                        </div>

                                        <p className="text-xs text-stone-400 leading-relaxed font-semibold relative z-10 group-hover:text-stone-300 transition-colors px-2">
                                            History suggests <span className="text-emerald-400 font-bold">BID dosing</span> yields 85% success rate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-white/5 bg-[#140c00] flex justify-between items-center z-10">
                        <div className="text-xs text-stone-500 flex items-center gap-2 font-bold uppercase tracking-wider opacity-60">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Auto-syncs with Pharmacy API
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="px-6 py-3.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-colors">
                                Discard
                            </button>
                            <button onClick={onClose} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all transform active:scale-95 flex items-center gap-3 text-sm tracking-wide">
                                <span>Sign & Prescribe</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpdateCarePlanModal;
