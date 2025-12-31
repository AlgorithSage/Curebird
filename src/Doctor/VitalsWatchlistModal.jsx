import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Heart, Droplets, Thermometer } from 'lucide-react';

const VitalsWatchlistModal = ({ isOpen, onClose, onAssess }) => {
    const patients = [
        {
            id: '1',
            name: 'SARAH CONNOR',
            bpm: '112',
            spo2: '94',
            bp: '145/95',
            status: 'AT RISK',
            trend: 'RISING',
            statusColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            trendColor: 'text-amber-500'
        },
        {
            id: '2',
            name: 'JOHN SMITH',
            bpm: '98',
            spo2: '91',
            bp: '110/70',
            status: 'CRITICAL',
            trend: 'FALLING',
            statusColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            trendColor: 'text-rose-500'
        },
        {
            id: '3',
            name: 'ELLEN RIPLEY',
            bpm: '72',
            spo2: '99',
            bp: '120/80',
            status: 'ELEVATED',
            trend: 'STABLE',
            statusColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
            trendColor: 'text-emerald-500'
        },
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
                        className="relative w-full max-w-5xl h-[85vh] bg-[#08080c] border border-indigo-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Atmosphere Layers */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] animate-pulse pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                                    <Activity size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Vitals Watchlist</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time Triage & Physiological Monitoring</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto h-full">
                                {patients.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group bg-[#0d0d14] border border-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col hover:border-indigo-500/30 transition-all duration-500 animated-border animated-border-indigo"
                                    >
                                        <div className="flex items-start justify-between mb-10">
                                            <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight w-24">{p.name}</h4>
                                            <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.statusColor}`}>
                                                {p.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-[#0f0f1a] rounded-3xl p-5 border border-white/10 flex flex-col items-center justify-center shadow-inner group/metric transition-all hover:bg-rose-500/[0.02]">
                                                <Heart size={18} className="text-rose-500 mb-2 group-hover/metric:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-white tracking-tighter">{p.bpm}</span>
                                                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1">BPM</span>
                                            </div>
                                            <div className="bg-[#0f0f1a] rounded-3xl p-5 border border-white/10 flex flex-col items-center justify-center shadow-inner group/metric transition-all hover:bg-blue-500/[0.02]">
                                                <Droplets size={18} className="text-blue-500 mb-2 group-hover/metric:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-white tracking-tighter">{p.spo2}%</span>
                                                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1">PULSE-OX</span>
                                            </div>
                                        </div>

                                        <div className="bg-[#0f0f1a] rounded-2xl p-5 border border-white/10 flex items-center justify-between mb-10 shadow-inner group/bp transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                    <Thermometer size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Blood Pressure</span>
                                                    <span className="text-sm font-black text-white tracking-tight">{p.bp}</span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-black/40 border border-white/5 ${p.trendColor}`}>
                                                {p.trend}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onAssess?.(p)}
                                            className="mt-auto w-full py-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-black hover:border-indigo-500 transition-all shadow-xl"
                                        >
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
