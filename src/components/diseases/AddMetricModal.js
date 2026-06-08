import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';
import { DISEASE_CONFIG, getMetricStatus } from '../../data/diseaseMetrics';
import { Button } from '../ui/button';

const AddMetricModal = ({ onClose, userId, disease, onMetricAdded }) => {
    const config = DISEASE_CONFIG[disease.configId];
    const availableMetrics = config ? Object.values(config.metrics) : [];

    const [formData, setFormData] = useState({
        type: availableMetrics.length > 0 ? availableMetrics[0].id : 'generic',
        value: '',
        value2: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warning, setWarning] = useState(null);

    const handleValueChange = (val) => {
        setFormData({ ...formData, value: val });

        if (config) {
            const status = getMetricStatus(disease.configId, formData.type, Number(val));
            if (status === 'critical') setWarning("This value is in the critical range!");
            else if (status === 'warning') setWarning("This value exceeds normal limits.");
            else setWarning(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const selectedMetric = availableMetrics.find(m => m.id === formData.type);
            const timestamp = new Date(`${formData.date}T${formData.time}`);

            const payload = {
                type: formData.type,
                label: selectedMetric ? selectedMetric.label : 'Health Metric',
                value: Number(formData.value),
                unit: selectedMetric ? selectedMetric.unit : '',
                timestamp: timestamp,
                notes: formData.notes,
                source: 'manual'
            };

            await DiseaseService.addMetric(userId, disease.id, payload);
            onMetricAdded();
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
                className="glass-card w-full max-w-sm !p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center p-5 border-b border-amber-500/10 bg-black/20">
                    <div>
                        <h2 className="text-base font-black text-white tracking-tight">Add Log</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{disease.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Metric Type */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Metric Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value, value: '' })
                            }
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                        >
                            {availableMetrics.map(m => (
                                <option key={m.id} value={m.id} className="bg-slate-900">
                                    {m.label} ({m.unit})
                                </option>
                            ))}
                            {availableMetrics.length === 0 && (
                                <option value="generic" className="bg-slate-900">Note / Generic Value</option>
                            )}
                        </select>
                    </div>

                    {/* Value Input */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Value</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => handleValueChange(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-3.5 pr-12 py-2.5 text-base font-bold font-mono text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
                                placeholder="0.00"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">
                                {availableMetrics.find(m => m.id === formData.type)?.unit}
                            </span>
                        </div>

                        {warning && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-2 mt-2.5 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs leading-normal"
                            >
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{warning}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notes (Optional)</label>
                        <textarea
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200 resize-none"
                            placeholder="e.g. After lunch"
                        />
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-white/5">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            variant="primary"
                            className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                            Log Entry
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddMetricModal;
