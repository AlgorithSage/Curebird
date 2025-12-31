import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, Filter, ShieldAlert, ArrowRight, Star } from 'lucide-react';

const PatientRosterModal = ({ isOpen, onClose, patients = [], onViewPatient }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        className="relative w-full max-w-6xl h-[85vh] bg-[#05060c] border border-amber-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Background Atmosphere */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Patient Roster</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Clinical Population Management & Oversight</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-8 bg-white/[0.02] border-b border-white/5 flex gap-4 items-center relative z-10">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-hover:text-amber-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Execute query: Patient Name, ID, or Condition..."
                                    className="w-full bg-slate-900 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-4 bg-slate-900 text-stone-400 hover:text-amber-400 rounded-xl border border-white/5 transition-all">
                                    <Filter size={20} />
                                </button>
                                <button className="px-6 py-4 bg-amber-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
                                    Add Patient
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                            {filteredPatients.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredPatients.map((patient, i) => (
                                        <motion.div
                                            key={patient.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group glass-card-amber p-8 hover:bg-amber-500/10 hover:border-amber-400/40 transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-2xl font-black shadow-[0_10px_30px_rgba(251,191,36,0.2)] group-hover:scale-110 transition-transform duration-500 border-2 border-yellow-200/50">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight uppercase">{patient.name}</h4>
                                                        <p className="text-[10px] text-amber-200/30 font-bold uppercase tracking-[0.2em]">{patient.id}</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-emerald-500/10">
                                                    Stable
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-8">
                                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:bg-black/60 transition-colors">
                                                    <p className="text-[10px] text-amber-200/20 font-black uppercase tracking-wider mb-1">Age / Sex</p>
                                                    <p className="text-lg text-white font-black tracking-tight">45 / M</p>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:bg-black/60 transition-colors">
                                                    <p className="text-[10px] text-amber-200/20 font-black uppercase tracking-wider mb-1">Last Visit</p>
                                                    <p className="text-lg text-white font-black tracking-tight leading-none pt-1">2 days ago</p>
                                                </div>
                                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:bg-black/60 transition-colors">
                                                    <p className="text-[10px] text-amber-200/20 font-black uppercase tracking-wider mb-1">Records</p>
                                                    <p className="text-lg text-white font-black tracking-tight">12 Total</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onViewPatient(patient)}
                                                className="w-full py-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-amber-400 hover:text-black transition-all flex items-center justify-center gap-3 group/btn shadow-xl hover:shadow-amber-500/40"
                                            >
                                                Open Full Workspace
                                                <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-6">
                                    <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 animate-pulse">
                                        <Users size={80} className="opacity-10" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-stone-700 uppercase tracking-tighter">No Clincal Matches</p>
                                        <p className="text-sm text-stone-800 font-bold uppercase tracking-widest mt-2">Check spelling or try a different patient ID</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PatientRosterModal;
