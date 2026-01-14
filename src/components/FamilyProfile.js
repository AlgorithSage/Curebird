import React from 'react';
import {  Users  } from './Icons';
import { motion } from 'framer-motion';

const FamilyProfile = ({ onNavigate }) => {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full text-center"
            >
                <div className="glass-card p-12 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="w-24 h-24 rounded-full bg-slate-900/50 border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative"
                        >
                            <Users size={40} className="text-indigo-400" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t border-indigo-500/50 rounded-full"
                            />
                        </motion.div>

                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                            Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Profile</span>
                        </h2>

                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Feature Coming Soon</span>
                        </div>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto mb-10">
                            We're building a comprehensive way to manage your entire family's health records in one secure place. Stay tuned for shared access, dependent profiles, and unified health tracking.
                        </p>

                        <button
                            onClick={() => onNavigate && onNavigate('Dashboard')}
                            className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-white/5 hover:border-white/10 shadow-lg"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FamilyProfile;
