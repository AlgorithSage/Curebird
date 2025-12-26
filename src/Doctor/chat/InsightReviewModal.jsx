import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, FileText, ChevronRight, Activity, Pill, Stethoscope, Edit2 } from 'lucide-react';

const InsightReviewModal = ({ isOpen, onClose, insight, onApprove, onReject }) => {
    const [editedData, setEditedData] = useState({});

    // Reset/Load data when modal opens or insight changes
    React.useEffect(() => {
        if (insight && insight.extractedData) {
            setEditedData(JSON.parse(JSON.stringify(insight.extractedData))); // Deep copy
        } else {
            setEditedData({ diagnosis: [], vitals: [], medications: [] });
        }
    }, [insight, isOpen]);

    if (!isOpen || !insight) return null;

    // --- Edit Handlers ---
    const handleAdd = (section, template) => {
        setEditedData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), template]
        }));
    };

    const handleRemove = (section, index) => {
        setEditedData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleChange = (section, index, field, value) => {
        setEditedData(prev => {
            const list = [...(prev[section] || [])];
            if (field === null) {
                // Direct string array (e.g., diagnosis)
                list[index] = value;
            } else {
                // Object array (vitals, meds)
                list[index] = { ...list[index], [field]: value };
            }
            return { ...prev, [section]: list };
        });
    };

    // Helper for Section Headers
    const SectionHeader = ({ icon: Icon, title, count, color, onAdd }) => (
        <div className={`flex items-center justify-between p-4 rounded-xl border border-${color}-500/20 bg-${color}-500/5 mb-4`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                    <Icon size={18} />
                </div>
                <h4 className="font-bold text-white tracking-wide">{title}</h4>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                    {count} Found
                </span>
                <button
                    onClick={onAdd}
                    className={`p-1.5 rounded-lg bg-${color}-500/10 hover:bg-${color}-500/20 text-${color}-400 transition-colors pointer-events-auto`}
                    title="Add Item"
                >
                    <div className="w-4 h-4 flex items-center justify-center font-bold">+</div>
                </button>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-6xl h-[85vh] bg-[#0c0a09] border border-amber-500/20 rounded-[2rem] shadow-[0_0_50px_rgba(245,158,11,0.15)] flex overflow-hidden animated-border"
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center px-8 z-10 pointer-events-none">
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-white">Clinical Insight Validation</h3>
                                <p className="text-xs text-stone-400 font-mono">ID: {insight.id} • Conf: {(insight.confidenceScore * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="pointer-events-auto p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Left: Source Document (Mock PDF View) */}
                    <div className="w-1/2 border-r border-white/5 bg-stone-950/50 p-8 pt-20 flex flex-col relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-stone-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <FileText size={16} /> Source Document
                            </h4>
                            <span className="text-xs text-amber-500/60 font-mono">lab_report_024.pdf</span>
                        </div>

                        {/* Mock Document Preview */}
                        <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden relative group">
                            {/* Overlay to simulate scan texture */}
                            <div className="absolute inset-0 bg-amber-100/10 mix-blend-multiply pointer-events-none"></div>

                            {/* Content Simulation */}
                            <div className="p-12 text-stone-800 font-serif space-y-6 opacity-80 select-none blur-[0.5px] hover:blur-0 transition-all duration-300">
                                <div className="flex justify-between border-b border-stone-300 pb-4">
                                    <h1 className="text-2xl font-bold">LabCorp Diagnostic</h1>
                                    <div className="text-right text-xs">REF: #88392<br />DATE: 12 OCT 2025</div>
                                </div>
                                <div className="space-y-4 text-xs leading-loose">
                                    <p><strong>PATIENT:</strong> {insight.patientName}</p>
                                    <div className="bg-yellow-200/30 p-1 -mx-1 rounded">
                                        <strong>CBC PANEL:</strong><br />
                                        WBC: 14.2 (High) <br />
                                        RBC: 4.8 <br />
                                        Hemoglobin: 13.5
                                    </div>
                                    <div className="bg-green-200/30 p-1 -mx-1 rounded">
                                        <strong>Notes:</strong> Patient shows signs of acute infection. Recommend antibiotic course.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Extracted Data Form */}
                    <div className="w-1/2 bg-[#0c0a09] p-8 pt-20 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-white">Extracted Data</h2>
                            <span className="ml-auto text-xs text-stone-500 italic">Review and edit before approving</span>
                        </div>

                        {/* 1. Diagnoses */}
                        <SectionHeader
                            icon={Stethoscope}
                            title="Diagnoses"
                            count={editedData.diagnosis?.length || 0}
                            color="rose"
                            onAdd={() => handleAdd('diagnosis', '')}
                        />
                        <div className="space-y-3 mb-8">
                            {editedData.diagnosis?.map((item, i) => (
                                <div key={i} className="group p-3 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleChange('diagnosis', i, null, e.target.value)}
                                        placeholder="Enter diagnosis..."
                                        className="bg-transparent text-stone-300 font-medium w-full focus:outline-none focus:text-amber-400 placeholder:text-stone-700"
                                    />
                                    <button onClick={() => handleRemove('diagnosis', i)} className="text-stone-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {(!editedData.diagnosis || editedData.diagnosis.length === 0) && (
                                <div className="text-center p-4 border border-dashed border-stone-800 rounded-lg text-stone-600 text-xs">
                                    No diagnoses found. Click '+' to add manually.
                                </div>
                            )}
                        </div>

                        {/* 2. Vitals / Labs */}
                        <SectionHeader
                            icon={Activity}
                            title="Abnormal Vitals"
                            count={editedData.vitals?.length || 0}
                            color="amber"
                            onAdd={() => handleAdd('vitals', { type: '', value: '', unit: '' })}
                        />
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {editedData.vitals?.map((v, i) => (
                                <div key={i} className="relative group p-3 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/30 transition-all flex flex-col gap-1">
                                    <button
                                        onClick={() => handleRemove('vitals', i)}
                                        className="absolute top-2 right-2 text-stone-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X size={12} />
                                    </button>
                                    <input
                                        className="bg-transparent text-[10px] text-stone-500 uppercase font-bold focus:outline-none focus:text-amber-500 w-full"
                                        value={v.type}
                                        onChange={(e) => handleChange('vitals', i, 'type', e.target.value)}
                                        placeholder="TYPE"
                                    />
                                    <div className="flex items-end gap-2">
                                        <input
                                            className="bg-transparent text-lg font-bold text-white focus:outline-none focus:text-amber-400 w-2/3"
                                            value={v.value}
                                            onChange={(e) => handleChange('vitals', i, 'value', e.target.value)}
                                            placeholder="VAL"
                                        />
                                        <input
                                            className="bg-transparent text-xs text-stone-400 mb-1 focus:outline-none focus:text-stone-200 w-1/3 text-right"
                                            value={v.unit}
                                            onChange={(e) => handleChange('vitals', i, 'unit', e.target.value)}
                                            placeholder="UNIT"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Medications */}
                        <SectionHeader
                            icon={Pill}
                            title="Medications"
                            count={editedData.medications?.length || 0}
                            color="emerald"
                            onAdd={() => handleAdd('medications', { name: '', dosage: '', freq: '' })}
                        />
                        <div className="space-y-3 mb-8">
                            {editedData.medications?.map((med, i) => (
                                <div key={i} className="group flex items-center gap-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/30 transition-all relative">
                                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                                        <Pill size={16} />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <input
                                            className="bg-transparent font-bold text-emerald-100 focus:outline-none focus:text-white w-full"
                                            value={med.name}
                                            onChange={(e) => handleChange('medications', i, 'name', e.target.value)}
                                            placeholder="Medication Name"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="bg-transparent text-xs text-emerald-500/60 focus:outline-none focus:text-emerald-400 w-1/2"
                                                value={med.dosage}
                                                onChange={(e) => handleChange('medications', i, 'dosage', e.target.value)}
                                                placeholder="Dosage"
                                            />
                                            <input
                                                className="bg-transparent text-xs text-emerald-500/60 focus:outline-none focus:text-emerald-400 w-1/2"
                                                value={med.freq}
                                                onChange={(e) => handleChange('medications', i, 'freq', e.target.value)}
                                                placeholder="Frequency"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemove('medications', i)} className="text-emerald-800 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-6 border-t border-white/5 flex gap-4">
                            <button onClick={onReject} className="flex-1 py-4 rounded-xl border border-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/10 transition-colors uppercase tracking-wider text-sm">
                                Reject
                            </button>
                            <button onClick={() => onApprove(editedData)} className="flex-[2] py-4 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                <Check size={18} /> Approve & Save Record
                            </button>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InsightReviewModal;
