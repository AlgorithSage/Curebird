import React from 'react';
import { motion } from 'framer-motion';
import {  UploadCloud, BarChart3, FileText, CheckCircle2  } from './Icons';

const DashboardOverview = ({ user, onNavigateToHistory }) => {
    // Get first name safely
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : (user?.phoneNumber ? 'User' : 'User');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500/20 via-slate-900/60 to-slate-900/80 backdrop-blur-xl border border-amber-500/10 shadow-2xl isolate"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-yellow-400/10 blur-[120px] rounded-full pointer-events-none opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none opacity-30"></div>

            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">

                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/40 text-sky-400 text-xs font-bold tracking-widest uppercase mb-6">
                    Overview
                </div>

                {/* Main Title - Personalized */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                    Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500">Dashboard</span>
                </h2>

                {/* Description Text */}
                <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
                    Your central command center for health data.
                    <span className="text-slate-200 font-medium"> Upload reports</span>, track
                    <span className="text-sky-400 font-medium"> AI insights</span>, and monitor
                    <span className="text-emerald-400 font-medium"> vital trends</span> in one secure, real-time dashboard.
                </p>

                <button
                    onClick={onNavigateToHistory}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-sky-900/20 hover:scale-105 transition-transform inline-flex items-center gap-2"
                >
                    <FileText size={20} />
                    <span>View Medical History Categories</span>
                </button>
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
