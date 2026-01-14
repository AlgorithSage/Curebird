import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  X, Calendar, Activity, AlertCircle  } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';
import { DISEASE_CONFIG } from '../../data/diseaseMetrics';

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
            const diseaseName = formData.name === 'other' ? formData.customName : predefinedDiseases.find(d => d.value === formData.name)?.label;

            const payload = {
                name: diseaseName,
                diagnosisDate: formData.diagnosisDate,
                status: formData.status,
                severity: formData.severity,
                primaryDoctor: formData.primaryDoctor,
                configId: formData.name !== 'other' ? formData.name : null // Store config ID for linking metrics later
            };

            await DiseaseService.addDisease(userId, payload);
            onDiseaseAdded();
            onClose();
        } catch (error) {
            console.error(error);
            // Handle error (toast?)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Add New Condition</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Disease Name Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Condition Name</label>
                        <select
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                            required
                        >
                            <option value="" disabled>Select a condition</option>
                            {predefinedDiseases.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Name Input if 'Other' selected */}
                    {formData.name === 'other' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Specify Condition Name</label>
                            <input
                                type="text"
                                value={formData.customName}
                                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                                placeholder="e.g. Asthma"
                                required
                            />
                        </motion.div>
                    )}

                    {/* Diagnosis Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Date of Diagnosis</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="date"
                                value={formData.diagnosisDate}
                                onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Status & Severity Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Current Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                                <option value="controlled">Controlled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Primary Doctor (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Treating Doctor (Optional)</label>
                        <input
                            type="text"
                            value={formData.primaryDoctor}
                            onChange={(e) => setFormData({ ...formData, primaryDoctor: e.target.value })}
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                            placeholder="Dr. Name"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors flex justify-center items-center"
                        >
                            {isSubmitting ? <Activity className="animate-spin" /> : 'Save Condition'}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default AddDiseaseModal;
