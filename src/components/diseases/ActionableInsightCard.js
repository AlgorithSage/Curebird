
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {  AlertCircle, FileText, CheckCircle, Bot, Activity  } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';

const ActionableInsightCard = ({ disease, metrics, userId, onInsightLoaded }) => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'doctor'

    useEffect(() => {
        const fetchInsight = async () => {
            // Don't fetch if no metrics or just created
            if (!metrics || metrics.length < 2) return;

            setLoading(true);
            try {
                const data = await DiseaseService.getDiseaseInsight(disease, metrics);
                setInsight(data);
                if (onInsightLoaded) onInsightLoaded(data);
            } catch (error) {
                console.error("Failed to fetch insight:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [disease?.id, metrics?.length]); // Re-fetch on big changes

    if (!metrics || metrics.length < 2) {
        return (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl border border-indigo-500/30">
                <h3 className="text-indigo-300 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Insight (Beta)
                </h3>
                <p className="text-sm text-indigo-100/80">
                    Log at least 2 readings to unlock Personalized AI Insights.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <Bot size={18} className="text-amber-400" />
                    <div className="h-4 w-32 bg-slate-700 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-700/50 rounded" />
                    <div className="h-2 w-3/4 bg-slate-700/50 rounded" />
                </div>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <div
            className="glass-card overflow-hidden !p-0"
            style={{
                '--glass-radius': '16px',
                boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.8)' // Removed the inset white shadow
            }}
        >
            {/* Header Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Bot size={18} />
                    <span className="tracking-wide text-xs uppercase opacity-80">AI Insight</span>
                </div>

                {/* Segmented Control */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab('patient')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'patient' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Patient
                    </button>
                    <button
                        onClick={() => setActiveTab('doctor')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'doctor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Clinical
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 min-h-[160px]">
                {activeTab === 'patient' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4 className="font-bold text-lg text-white mb-2">{insight.patientView.title}</h4>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            {insight.patientView.explanation}
                        </p>

                        {insight.patientView.action && (
                            <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl flex gap-3 mt-4">
                                <Activity className="shrink-0 text-indigo-400 mt-1" size={16} />
                                <div>
                                    <h5 className="text-xs font-bold text-indigo-300 uppercase mb-1">Recommended Action</h5>
                                    <p className="text-xs text-indigo-100">{insight.patientView.action}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'doctor' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="font-mono text-xs text-emerald-400/80 mb-2">[CLINICAL_SUMMARY_Mode: ON]</div>
                        <ul className="space-y-3">
                            {insight.doctorView.points.map((pt, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-300">
                                    <CheckCircle size={14} className="shrink-0 text-emerald-500 mt-0.5" />
                                    <span>{pt}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-slate-500 mt-4 italic border-t border-slate-700/50 pt-2">
                            Generated based on {metrics.length} data points. AI-assisted observation, not a diagnosis.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ActionableInsightCard;
