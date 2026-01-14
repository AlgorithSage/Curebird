import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Map, MapPin, ChevronDown, Activity, UserPlus, Stethoscope, AlertCircle, Info, X, Search, ArrowRight  } from './Icons';
import { STATE_DATA } from '../data/state_disease_burden';

const StateHealthProfile = () => {
    const [selectedState, setSelectedState] = useState(null); // Initially null for "Search First" feel
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(null);

    const states = Object.keys(STATE_DATA).sort();
    const currentData = selectedState ? STATE_DATA[selectedState] : null;

    return (
        <div className="w-full">
            {/* --- HERO / SEARCH SECTION --- */}
            <div className="flex flex-col items-center justify-center text-center mb-12 space-y-6">
                <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                    <Map size={40} className="text-blue-400" />
                </div>

                <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                        State Health Profile
                        <div className="group relative">
                            <Info size={20} className="text-slate-500 cursor-help hover:text-blue-400 transition-colors" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 p-4 bg-slate-900/95 backdrop-blur-md text-xs text-slate-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-2xl z-50 text-left">
                                <p className="font-bold text-white mb-2 text-sm">Verified Source</p>
                                <p className="mb-2">India State-Level Disease Burden Initiative (ICMR, PHFI).</p>
                                <p className="text-slate-400">This tool helps you analyze local disease risks to take preventive action.</p>
                            </div>
                        </div>
                    </h2>
                    <p className="text-slate-400 text-lg">Select your region to uncover localized disease burdens, prevalent health risks, and specialized care recommendations.</p>
                </div>

                {/* DROPDOWN / SEARCH BAR */}
                <div className="relative z-30 w-full max-w-md">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center justify-between px-6 py-4 bg-slate-800/80 hover:bg-slate-800 border text-lg transition-all rounded-2xl shadow-xl backdrop-blur-sm ${isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-white/10 hover:border-blue-500/50'}`}
                    >
                        <span className={`flex items-center gap-3 ${selectedState ? 'text-white font-medium' : 'text-slate-400'}`}>
                            <MapPin size={20} className={selectedState ? "text-blue-400" : "text-slate-500"} />
                            {selectedState || "Select your State..."}
                        </span>
                        <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 4, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-40"
                            >
                                <div className="p-2 space-y-1">
                                    {states.map((state) => (
                                        <button
                                            key={state}
                                            onClick={() => { setSelectedState(state); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedState === state ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' : 'text-slate-300 hover:bg-white/5'}`}
                                        >
                                            <span className="font-medium">{state}</span>
                                            {selectedState === state && <ArrowRight size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- RESULTS SECTION (Only visible after selection) --- */}
            <AnimatePresence mode="wait">
                {currentData && (
                    <motion.div
                        key={selectedState}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Top Prevalent Diseases in {selectedState}</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentData.top_diseases.map((disease, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="glass-card p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => setSelectedDisease(disease)}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Activity size={60} />
                                    </div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="bg-slate-800/50 p-3 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                                            <Activity size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${disease.prevalence.includes('Very High') || disease.prevalence === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            disease.prevalence.includes('High') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {disease.prevalence}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors relative z-10">{disease.name}</h3>
                                    <p className="text-slate-400 text-xs mb-4 line-clamp-2 min-h-[2.5em] relative z-10">{disease.stats}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                                        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                            <span>Deep Dive Analysis</span>
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Deep Dive Modal */}
            <AnimatePresence>
                {selectedDisease && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDisease(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />

                            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-slate-800/30">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{selectedDisease.name}</h3>
                                    <p className="text-blue-400 text-sm font-medium flex items-center gap-2">
                                        <MapPin size={14} /> High Prevalence in {selectedState}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedDisease(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                            <AlertCircle size={16} className="text-red-400" />
                                            Common Symptoms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDisease.symptoms.map((sym, i) => (
                                                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5">
                                                    {sym}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                            <Activity size={16} className="text-orange-400" />
                                            Risk Factors
                                        </h4>
                                        <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                                            {selectedDisease.risk_factors.map((risk, i) => (
                                                <li key={i}>{risk}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                                        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                            <UserPlus size={16} />
                                            Most Affected Age Group
                                        </h4>
                                        <p className="text-2xl font-bold text-white">{selectedDisease.affected_age}</p>
                                    </div>

                                    <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                        <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                                            <Stethoscope size={16} />
                                            Doctor to Consult
                                        </h4>
                                        <p className="text-xl font-bold text-white">{selectedDisease.consult}</p>
                                        <button className="mt-3 w-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                                            <Search size={12} /> Find {selectedDisease.consult}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StateHealthProfile;
