import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Brain, Layers, ArrowRight, Activity, Users, FileText } from '../Icons';

export default function ResearchDashboard() {
    const navigate = useNavigate();

    const stats = [
        { label: "Active Studies", value: "12", icon: FileText, color: "text-blue-400" },
        { label: "Patient Cohort", value: "8,540", icon: Users, color: "text-emerald-400" },
        { label: "Models Deployed", value: "3", icon: Brain, color: "text-amber-400" },
    ];

    const modules = [
        {
            title: "Data Explorer",
            description: "Query, filter, and analyze anonymized patient datasets with real-time visualization.",
            icon: Database,
            color: "from-amber-500 to-orange-600",
            path: "/research/data",
            delay: 0.1
        },
        {
            title: "Model Playground",
            description: "Test AI inference models like Diabetes Risk Prediction interactions.",
            icon: Brain,
            color: "from-emerald-500 to-teal-600",
            path: "/research/playground",
            delay: 0.2
        },
        {
            title: "Model Repository",
            description: "Browse and download pre-trained weights for medical research models.",
            icon: Layers,
            color: "from-indigo-500 to-purple-600",
            path: "/research/models",
            delay: 0.3
        }
    ];

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
                    Research Overview
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Welcome to the CureBird Research Hub. Access secure patient data and advanced AI tools to accelerate your medical research.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
                            <stat.icon size={24} weight="duotone" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modules.map((mod, i) => (
                    <motion.div
                        key={mod.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mod.delay }}
                        onClick={() => navigate(mod.path)}
                        className="group relative bg-black/40 backdrop-blur-xl animated-border rounded-3xl p-8 cursor-pointer transition-all overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                        <div className="mb-6 inline-block p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <mod.icon size={32} className="text-white" weight="duotone" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">
                            {mod.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            {mod.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:gap-3 transition-all">
                            Access Module <ArrowRight />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
