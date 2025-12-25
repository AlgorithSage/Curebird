import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UploadCloud, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

const DashboardOverview = ({ user }) => {
    // Get first name safely
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : (user?.phoneNumber ? 'User' : 'User');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full overflow-hidden rounded-[2rem] bg-[#0B1121] border border-white/5 shadow-2xl isolate"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">

                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-widest uppercase mb-6">
                    Overview
                </div>

                {/* Main Title - Personalized */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                    Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Dashboard</span>
                </h2>

                {/* Description Text */}
                <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                    Your central command center for health data.
                    <span className="text-slate-200 font-medium"> Upload reports</span>, track
                    <span className="text-amber-400 font-medium"> AI insights</span>, and monitor
                    <span className="text-emerald-400 font-medium"> vital trends</span> in one secure, real-time dashboard.
                </p>
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
