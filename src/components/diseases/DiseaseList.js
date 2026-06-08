import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, ChevronRight, Trash2 } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';
import AddDiseaseModal from './AddDiseaseModal';
import { Button } from '../ui/button';
import LiquidButton from '../ui/LiquidButton';

const DiseaseList = ({ userId, user, onSelectDisease }) => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchDiseases = useCallback(async () => {
        try {
            if (userId) {
                const data = await DiseaseService.getDiseases(userId);
                setDiseases(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleDeleteDisease = async (e, diseaseId) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this condition? This action cannot be undone.")) return;

        try {
            await DiseaseService.deleteDisease(userId, diseaseId);
            fetchDiseases();
        } catch (error) {
            console.error("Failed to delete disease:", error);
            alert("Failed to delete condition.");
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, [fetchDiseases]);



    if (loading) return <div className="h-40 animate-pulse bg-slate-800/50 rounded-2xl" />;

    return (
        <div className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-6 sm:p-8 mb-8 text-center mt-6">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 -translate-x-1/4 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Pill Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-sm font-bold mb-4 sm:mb-6 md:animate-pulse">
                        <Activity size={14} className="sm:w-4 sm:h-4" /> LIVE TRACKER
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight drop-shadow-lg">
                        Live Health{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            Tracker
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
                        Your central command center for health data.{' '}
                        <span className="text-white font-semibold">Track conditions</span>, monitor{' '}
                        <span className="text-amber-400 font-semibold">vital trends</span>, and manage your{' '}
                        <span className="text-emerald-400 font-semibold">daily insights</span> in one dashboard.
                    </p>

                    {/* Action Button */}
                    <LiquidButton
                        onClick={() => {
                            const tier = user?.subscriptionTier || 'Free';
                            if (tier === 'Free' && diseases.length >= 2) {
                                alert("Free Tier Limit Reached (2 Diseases). Upgrade to Premium to track more conditions.");
                                return;
                            }
                            setIsAddModalOpen(true);
                        }}
                        className={`px-8 py-4 text-base rounded-2xl flex items-center gap-2.5 font-black text-black ${user?.subscriptionTier === 'Free' && diseases.length >= 2 ? 'opacity-80 grayscale' : ''}`}
                    >
                        <span className="p-1.5 bg-black/10 text-black rounded-lg flex items-center justify-center">
                            {(user?.subscriptionTier === 'Free' && diseases.length >= 2) ? <span className="text-xs">🔒</span> : <Plus size={18} strokeWidth={3} className="text-black" />}
                        </span>
                        <span>Add New Condition</span>
                    </LiquidButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {diseases.map((disease) => (
                        <motion.div
                            key={disease.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onSelectDisease && onSelectDisease(disease)}
                            className="glass-card cursor-pointer flex justify-between items-start group hover:scale-[1.02] active:scale-95"
                        >
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-amber-400 transition-colors">{disease.name}</h3>
                                <p className="text-xs text-slate-400 mb-3">
                                    Diagnosed: {new Date(disease.diagnosisDate).toLocaleDateString()}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider uppercase ${
                                        disease.status === 'active' ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' :
                                        disease.status === 'resolved' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' :
                                        'border-sky-500/30 bg-sky-500/5 text-sky-400'
                                    }`}>
                                        {disease.status}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider uppercase ${
                                        disease.severity === 'critical' ? 'border-red-500/30 bg-red-500/5 text-red-400' :
                                        disease.severity === 'high' ? 'border-orange-500/30 bg-orange-500/5 text-orange-400' :
                                        disease.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' :
                                        'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                                    }`}>
                                        {disease.severity}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                                <button
                                    onClick={(e) => handleDeleteDisease(e, disease.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                    title="Delete Condition"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="bg-slate-800/50 p-2 rounded-full text-slate-500 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-all duration-300">
                                    <ChevronRight size={20} className="transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State / Add Prompt */}
                {diseases.length === 0 && (
                    <motion.div
                        onClick={() => setIsAddModalOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-full min-h-[120px]"
                    >
                        <Plus size={32} className="text-slate-600 mb-2" />
                        <p className="text-slate-400 font-medium">Add your first condition</p>
                        <p className="text-xs text-slate-600">Track diabetes, BP, etc.</p>
                    </motion.div>
                )}
            </div>

            {isAddModalOpen && (
                <AddDiseaseModal
                    userId={userId}
                    onClose={() => setIsAddModalOpen(false)}
                    onDiseaseAdded={fetchDiseases}
                />
            )}
        </div>
    );
};

export default DiseaseList;
