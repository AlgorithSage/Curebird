import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Heart, Thermometer, Droplets, LineChart } from 'lucide-react';

const VitalsWatchlistModal = ({ isOpen, onClose }) => {
    const watchlist = [
        { id: '1', name: 'Sarah Connor', heartRate: 112, spO2: 94, bp: '145/95', status: 'At Risk', trend: 'rising' },
        { id: '2', name: 'John Smith', heartRate: 98, spO2: 91, bp: '110/70', status: 'Critical', trend: 'falling' },
        { id: '3', name: 'Ellen Ripley', heartRate: 72, spO2: 99, bp: '120/80', status: 'Elevated', trend: 'stable' },
        { id: '4', name: 'James Wilson', heartRate: 125, spO2: 92, bp: '155/100', status: 'Critical', trend: 'rising' },
        { id: '5', name: 'Robert Ford', heartRate: 85, spO2: 97, bp: '125/82', status: 'Stable', trend: 'stable' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl h-[85vh] bg-[#05060c] border border-indigo-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                                    <Activity size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Vitals Watchlist</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.3em] mt-1">Real-time Triage & Physiological Monitoring</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Watchlist Content */}
                        <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {watchlist.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{p.name}</h4>
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.status === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
                                                    p.status === 'At Risk' ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-indigo-500/20 text-indigo-400'
                                                }`}>
                                                {p.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Heart size={14} className="text-rose-500" />
                                                    <span className="text-[9px] font-black text-stone-500 uppercase">HR</span>
                                                </div>
                                                <p className="text-2xl font-black text-white">{p.heartRate}</p>
                                                <span className="text-[10px] text-stone-600 font-bold">bpm</span>
                                            </div>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Droplets size={14} className="text-blue-400" />
                                                    <span className="text-[9px] font-black text-stone-500 uppercase">SpO2</span>
                                                </div>
                                                <p className="text-2xl font-black text-white">{p.spO2}%</p>
                                                <span className="text-[10px] text-stone-600 font-bold">pulse-ox</span>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center justify-between px-4 py-3 bg-black/20 rounded-xl border border-white/5 mb-6">
                                            <div className="flex items-center gap-3">
                                                <Thermometer size={16} className="text-indigo-500" />
                                                <span className="text-xs font-bold text-white uppercase">{p.bp}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LineChart size={16} className="text-stone-600" />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${p.trend === 'rising' ? 'text-amber-500' :
                                                        p.trend === 'falling' ? 'text-rose-400' : 'text-emerald-500'
                                                    }`}>{p.trend}</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-black transition-all">
                                            Assess Physiological Data
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VitalsWatchlistModal;
