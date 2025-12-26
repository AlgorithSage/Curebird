import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const StatCard = ({ icon, label, value, color, change }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card flex flex-col justify-between group h-full relative overflow-hidden"
    >
        {/* Glow Effect - Stronger */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/15 blur-[60px] rounded-full pointer-events-none group-hover:bg-yellow-400/25 transition-colors duration-500"></div>

        <div className="flex justify-between items-start relative z-10">
            {/* Icon Box - Explicit Yellow Style */}
            <div className="p-4 rounded-2xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/30 group-hover:scale-110 group-hover:shadow-yellow-400/50 transition-all duration-300 border-2 border-yellow-300">
                {React.cloneElement(icon, { size: 26, strokeWidth: 2.5 })}
            </div>

            <button className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-yellow-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                Ask AI
            </button>
        </div>

        <div className="mt-8 relative z-10">
            <p className="text-5xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-lg">{value}</p>
            <p className="text-sm font-bold text-yellow-100/80 group-hover:text-yellow-300 transition-colors uppercase tracking-wide">{label}</p>
        </div>

        <div className="mt-6 flex justify-between items-end relative z-10">
            {change ? (
                <div className="text-xs font-bold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                    <span className="text-emerald-400">{change}</span> vs last month
                </div>
            ) : (
                <div className="h-4"></div>
            )}

            <a href="#" className="text-xs font-black text-yellow-400 hover:text-yellow-200 transition-colors flex items-center gap-1 group/link bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20 hover:bg-yellow-400/20">
                View Details
                <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>
        </div>
    </motion.div>
);

export default StatCard;
