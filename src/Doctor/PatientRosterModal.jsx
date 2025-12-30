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
                        className="relative w-full max-w-5xl h-[85vh] bg-[#0c0a05] border border-amber-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Patient Roster</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.3em] mt-1">Comprehensive Clinical Explorer</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="p-6 bg-black/20 border-b border-white/5 flex gap-4 relative z-10">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={22} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, ID, or clinical condition..."
                                    className="w-full bg-black/40 border border-white/5 focus:border-amber-500/30 rounded-2xl py-5 pl-16 pr-6 text-lg text-white outline-none placeholder-stone-700 transition-all font-medium"
                                />
                            </div>
                            <button className="px-8 rounded-2xl bg-stone-900 border border-white/5 text-stone-400 hover:text-white flex items-center gap-3 font-black uppercase tracking-widest text-[11px] transition-all">
                                <Filter size={20} />
                                Filters
                            </button>
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
                                            className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/5 flex items-center justify-center text-xl font-black text-amber-500 shadow-xl group-hover:scale-110 transition-transform">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{patient.name}</h4>
                                                        <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{patient.id}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                    Stable
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <p className="text-[9px] text-stone-500 font-bold uppercase mb-1">Age / Sex</p>
                                                    <p className="text-sm text-white font-bold">45 / M</p>
                                                </div>
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <p className="text-[9px] text-stone-500 font-bold uppercase mb-1">Last Visit</p>
                                                    <p className="text-sm text-white font-bold">2 days ago</p>
                                                </div>
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <p className="text-[9px] text-stone-500 font-bold uppercase mb-1">Records</p>
                                                    <p className="text-sm text-white font-bold">12 Total</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onViewPatient(patient)}
                                                className="w-full py-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                Open Full Workspace
                                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
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
