import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { DiseaseService } from '../../services/DiseaseService';
import { DISEASE_CONFIG, getMetricStatus } from '../../data/diseaseMetrics';

const AddMetricModal = ({ onClose, userId, disease, onMetricAdded }) => {
    const config = DISEASE_CONFIG[disease.configId];
    // If no config (custom disease), we might need a generic metric type or just "Notes"
    const availableMetrics = config ? Object.values(config.metrics) : [];

    const [formData, setFormData] = useState({
        type: availableMetrics.length > 0 ? availableMetrics[0].id : 'generic',
        value: '',
        value2: '', // For BP (Diastolic) if we want to handle it together, but schema says separate. Sticking to single for now or handling compound UI.
        // Actually, for BP it's user friendly to enter 120/80. But let's keep it simple: 1 metric = 1 entry for now, or use a compound form.
        // Let's stick to 1 metric per entry for simplicity of graph, OR allow selecting "Blood Pressure" which adds 2 metrics.
        // For MVP, simple dropdown.
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warning, setWarning] = useState(null);

    const handleValueChange = (val) => {
        setFormData({ ...formData, value: val });

        // Immediate validation feedback
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
                <div className="flex justify-between items-center p-5 border-b border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-white">Add Log</h2>
                        <p className="text-xs text-slate-400">{disease.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {/* Metric Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Metric Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value, value: '' })} // Reset value on type change
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                        >
                            {availableMetrics.map(m => (
                                <option key={m.id} value={m.id}>{m.label} ({m.unit})</option>
                            ))}
                            {availableMetrics.length === 0 && <option value="generic">Note / Generic Value</option>}
                        </select>
                    </div>

                    {/* Value Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Value</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => handleValueChange(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 text-lg font-mono"
                                placeholder="0.00"
                                required
                            />
                            <span className="absolute right-4 top-4 text-slate-500 text-sm">
                                {availableMetrics.find(m => m.id === formData.type)?.unit}
                            </span>
                        </div>
                        {warning && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                <AlertTriangle size={12} /> {warning}
                            </motion.div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Notes (Optional)</label>
                        <textarea
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 text-sm"
                            placeholder="e.g. After lunch"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors flex justify-center items-center mt-4"
                    >
                        {isSubmitting ? <Activity className="animate-spin" /> : 'Log Entry'}
                    </button>

                </form>
            </motion.div>
        </div>
    );
};

export default AddMetricModal;
