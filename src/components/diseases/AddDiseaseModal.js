import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';
import { DISEASE_CONFIG } from '../../data/diseaseMetrics';
import { Button } from '../ui/button';

const AddDiseaseModal = ({ onClose, userId, onDiseaseAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        customName: '',
        diagnosisDate: new Date().toISOString().split('T')[0],
        status: 'active',
        severity: 'moderate',
        primaryDoctor: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const predefinedDiseases = Object.values(DISEASE_CONFIG).map(d => ({ value: d.id, label: d.label }));
    predefinedDiseases.push({ value: 'other', label: 'Other / Custom' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const diseaseName =
                formData.name === 'other'
                    ? formData.customName
                    : predefinedDiseases.find(d => d.value === formData.name)?.label;

            const payload = {
                name: diseaseName,
                diagnosisDate: formData.diagnosisDate,
                status: formData.status,
                severity: formData.severity,
                primaryDoctor: formData.primaryDoctor,
                configId: formData.name !== 'other' ? formData.name : null
            };

            await DiseaseService.addDisease(userId, payload);
            onDiseaseAdded();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md !p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center p-6 border-b border-amber-500/10 bg-black/20">
                    <h2 className="text-lg font-black text-white tracking-tight">Add New Condition</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Disease Name Selection */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Condition Name</label>
                        <select
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                            required
                        >
                            <option value="" disabled className="bg-slate-900">Select a condition</option>
                            {predefinedDiseases.map(d => (
                                <option key={d.value} value={d.value} className="bg-slate-900">{d.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Name Input if 'Other' selected */}
                    {formData.name === 'other' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Specify Condition Name</label>
                            <input
                                type="text"
                                value={formData.customName}
                                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                                placeholder="e.g. Asthma"
                                required
                            />
                        </motion.div>
                    )}

                    {/* Diagnosis Date */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date of Diagnosis</label>
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                            <input
                                type="date"
                                value={formData.diagnosisDate}
                                onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200 [color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>

                    {/* Status & Severity Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                            >
                                <option value="active" className="bg-slate-900">Active</option>
                                <option value="resolved" className="bg-slate-900">Resolved</option>
                                <option value="controlled" className="bg-slate-900">Controlled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                            >
                                <option value="low" className="bg-slate-900">Low</option>
                                <option value="moderate" className="bg-slate-900">Moderate</option>
                                <option value="high" className="bg-slate-900">High</option>
                                <option value="critical" className="bg-slate-900">Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Primary Doctor (Optional) */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Treating Doctor (Optional)</label>
                        <input
                            type="text"
                            value={formData.primaryDoctor}
                            onChange={(e) => setFormData({ ...formData, primaryDoctor: e.target.value })}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                            placeholder="Dr. Name"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1 h-10 rounded-xl font-bold"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            variant="primary"
                            className="flex-1 h-10 rounded-xl font-bold"
                        >
                            Save Condition
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddDiseaseModal;
