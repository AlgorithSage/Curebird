import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const StatCard = ({ icon, label, value, color, change }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:-translate-y-1"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${color} shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                <div className="relative text-white">
                    {icon}
                </div>
            </div>
            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition-colors bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/20">
                Ask AI
            </button>
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-sm text-slate-400 font-medium mt-1">{label}</p>
        </div>
        <div className="mt-4 flex justify-between items-center text-xs">
            {change && (
                <span className="flex items-center font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <ArrowUpRight size={14} className="mr-1" />
                    {change}
                </span>
            )}
            <a href="#" className="text-sky-400 hover:text-sky-300 font-medium hover:underline underline-offset-4 decoration-sky-500/30">View Details</a>
        </div>
    </motion.div>
);

export default StatCard;
