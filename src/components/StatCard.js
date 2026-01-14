import React from 'react';
import { motion } from 'framer-motion';
import {  ArrowUpRight  } from './Icons';

const StatCard = ({ icon, label, value, color, change, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card flex flex-col items-center justify-center text-center group h-full relative overflow-hidden py-8"
        whileHover={{ translateY: -5 }}
    >
        {/* Glow Effect - Stronger & Centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-yellow-400/20 transition-colors duration-500"></div>

        <div className="relative z-10 flex flex-col items-center gap-6 w-full">

            {/* Header: Icon & Ask AI */}
            <div className="relative w-full flex justify-center">


                {/* Centered Icon Box */}
                <div className="p-5 rounded-3xl bg-yellow-400 text-black shadow-xl shadow-yellow-400/25 group-hover:scale-110 group-hover:shadow-yellow-400/50 transition-all duration-300 border-[3px] border-yellow-300 ring-4 ring-yellow-400/20">
                    {React.cloneElement(icon, { size: 32, strokeWidth: 2 })}
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-2">
                <p className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{value}</p>
                <p className="text-base font-black text-yellow-100 uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">{label}</p>
            </div>

            {/* Footer: Details & Change */}
            <div className="flex flex-col items-center gap-3 w-full mt-2">
                {change ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                        <ArrowUpRight size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">{change}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase">vs last month</span>
                    </div>
                ) : <div className="h-7" />}

                <button
                    onClick={onClick}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-900 border border-white/5 hover:border-amber-400 text-xs font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 group/btn shadow-xl hover:shadow-amber-500/20"
                >
                    View Full Details
                    <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    </motion.div>
);

export default StatCard;
