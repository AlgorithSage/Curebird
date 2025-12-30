import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { DiseaseService } from '../../services/DiseaseService';
import AddDiseaseModal from './AddDiseaseModal';

const DiseaseList = ({ userId, onSelectDisease }) => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchDiseases = async () => {
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
    };

    useEffect(() => {
        fetchDiseases();
    }, [userId]);

    const getStatusColor = (status, severity) => {
        if (status === 'resolved') return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (severity === 'critical') return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (severity === 'high') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    if (loading) return <div className="h-40 animate-pulse bg-slate-800/50 rounded-2xl" />;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-amber-500" size={24} />
                    Your Active Conditions
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add New
                </button>
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
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{disease.name}</h3>
                                <p className="text-xs text-slate-400 mb-3">Diagnosed: {new Date(disease.diagnosisDate).toLocaleDateString()}</p>

                                <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(disease.status, disease.severity)}`}>
                                    {disease.status === 'active' ? disease.severity.toUpperCase() + ' SEVERITY' : disease.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="bg-slate-800/50 p-2 rounded-full text-slate-500 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                                <ChevronRight size={20} />
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
