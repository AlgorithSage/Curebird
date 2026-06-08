import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Save } from '../Icons';
import { Button } from '../ui/button';

const ReviewExtractionModal = ({ isOpen, onClose, onSave, extractedData, availableMetrics }) => {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (extractedData) {
            if (extractedData.date) {
                setDate(extractedData.date); // Presume 'YYYY-MM-DD' from backend
            }

            // Map initial data to editable state with auto-mapping
            if (extractedData.test_results) {
                const mappedItems = extractedData.test_results.map((item, index) => {
                    // Try to auto-match
                    const extractedName = item.test_name.toLowerCase().trim();
                    const bestMatch = availableMetrics.find(m => {
                        // 1. Check Exclusions (Fail fast)
                        if (m.excludes && m.excludes.some(ex => extractedName.includes(ex.toLowerCase()))) {
                            return false;
                        }

                        const metricLabel = m.label.toLowerCase();
                        const metricId = m.id.toLowerCase();

                        // 2. Check explicit keywords (Strong Match)
                        if (m.keywords && Array.isArray(m.keywords)) {
                            // Match if ANY keyword is contained
                            if (m.keywords.some(k => extractedName.includes(k.toLowerCase()))) {
                                return true;
                            }
                        }

                        // 3. Fallback: Label/ID match 
                        // We add boundary checks or explicit structural checks here if needed
                        // But exclusion + keyword system is usually robust enough.

                        return extractedName.includes(metricLabel) ||
                            metricLabel.includes(extractedName) ||
                            (extractedName.includes('cholesterol') && metricId.includes('total_cholesterol') && extractedName.includes('total')) ||
                            (extractedName.includes('hdl') && metricId.includes('hdl')) ||
                            (extractedName.includes('ldl') && metricId.includes('ldl')) ||
                            (extractedName.includes('triglyceride') && metricId.includes('triglyceride'));
                    });

                    return {
                        id: index,
                        originalName: item.test_name,
                        value: item.result_value,
                        unit: item.unit,
                        // If match found, use its ID, otherwise keep blank/default
                        metricType: bestMatch ? bestMatch.id : '',
                        selected: !!bestMatch // Only select by default if we found a confident match
                    };
                });
                setItems(mappedItems);
            }
        }
    }, [extractedData, availableMetrics]);

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSave = () => {
        const selectedItems = items.filter(i => i.selected && i.metricType);
        if (selectedItems.length === 0) {
            alert("Please select at least one valid metric to save.");
            return;
        }

        const payload = selectedItems.map(item => ({
            type: item.metricType,
            value: item.value,
            unit: item.unit,
            label: item.originalName,
            timestamp: new Date(date)
        }));

        onSave(payload);
        onClose();
    };

    if (!isOpen) return null;
 
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0b1220]/95 border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]"
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/30">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <Check className="text-emerald-400" size={18} /> Verify Extracted Data
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Please review the values before saving to your log.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
 
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Date Selector */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Report Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 w-full sm:w-auto [color-scheme:dark]"
                        />
                    </div>
 
                    {/* Items Table */}
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all duration-300 ${item.selected ? 'bg-slate-900/60 border-amber-500/30 shadow-inner' : 'bg-slate-900/10 border-white/5 opacity-50'}`}>
 
                                {/* Checkbox & Name */}
                                <div className="flex items-center gap-4 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={(e) => handleItemChange(item.id, 'selected', e.target.checked)}
                                        className="w-4.5 h-4.5 rounded border-white/10 bg-slate-950 text-amber-500 focus:ring-offset-0 focus:ring-0 focus:ring-amber-500/20"
                                    />
                                    <div className="flex-1">
                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Test Name from Report</div>
                                        <input
                                            type="text"
                                            value={item.originalName}
                                            onChange={(e) => handleItemChange(item.id, 'originalName', e.target.value)}
                                            className="w-full bg-transparent text-sm text-white font-bold border-none p-0 focus:ring-0 placeholder:text-slate-600"
                                            placeholder="Test Name"
                                        />
                                    </div>
                                </div>
 
                                {/* Mapping Dropdown */}
                                <div className="flex-1">
                                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Map to Metric</div>
                                    <select
                                        value={item.metricType}
                                        onChange={(e) => handleItemChange(item.id, 'metricType', e.target.value)}
                                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="" className="bg-slate-900">-- Ignore --</option>
                                        {availableMetrics.map(m => (
                                            <option key={m.id} value={m.id} className="bg-slate-900">{m.label}</option>
                                        ))}
                                    </select>
                                </div>
 
                                {/* Value & Unit */}
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="w-24">
                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Value</div>
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
                                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 text-center font-mono font-bold"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Unit</div>
                                        <input
                                            type="text"
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 text-center font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
 
                        {items.length === 0 && (
                            <div className="text-center text-slate-500 py-8 text-sm">
                                No data extracted. Please enter manually.
                            </div>
                        )}
                    </div>
                </div>
 
                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-slate-900/30 rounded-b-2xl">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="primary"
                        icon={Save}
                        className="h-10 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                        Confirm & Save
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default ReviewExtractionModal;
