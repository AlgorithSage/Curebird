import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileText, Activity, Pill, Stethoscope, Edit2, Unlock, Lock } from 'lucide-react';

const InsightReviewModal = ({ isOpen, onClose, insight, onApprove, onReject }) => {
    const [editedData, setEditedData] = useState({});
    const [isEditing, setIsEditing] = useState(false); // Default to View Mode

    React.useEffect(() => {
        if (insight && insight.extractedData) {
            setEditedData(JSON.parse(JSON.stringify(insight.extractedData)));
        } else {
            setEditedData({ diagnosis: [], vitals: [], medications: [] });
        }
        setIsEditing(false); // Reset to view mode on open
    }, [insight, isOpen]);

    if (!isOpen || !insight) return null;

    // --- Edit Handlers ---
    const handleAdd = (section, template) => {
        setEditedData(prev => ({ ...prev, [section]: [...(prev[section] || []), template] }));
    };

    const handleRemove = (section, index) => {
        setEditedData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    };

    const handleChange = (section, index, field, value) => {
        setEditedData(prev => {
            const list = [...(prev[section] || [])];
            if (field === null) list[index] = value;
            else list[index] = { ...list[index], [field]: value };
            return { ...prev, [section]: list };
        });
    };

    // Helper for Section Headers
    const SectionHeader = ({ icon: Icon, title, count, onAdd }) => (
        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-transparent mb-5 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] relative overflow-hidden group">
            {/* Golden Glow Line - Only active in Edit Mode or always? Let's keep it consistent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-opacity ${isEditing ? 'opacity-100' : 'opacity-50'}`}></div>

            <div className="flex items-center gap-4 pl-2">
                <div className="p-2.5 rounded-lg bg-[#2a1c05] border border-amber-500/30 text-amber-500 shadow-lg">
                    <Icon size={18} />
                </div>
                <h4 className="font-bold text-amber-100 tracking-wide text-sm uppercase drop-shadow-sm">{title}</h4>
            </div>

            <div className="flex items-center gap-6 pr-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    {count} Found
                </span>
                {/* Add Button - Only visible in Edit Mode */}
                {isEditing && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={onAdd}
                        className="h-8 w-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.1)] pointer-events-auto"
                        title="Add Item"
                    >
                        <div className="text-xl font-light leading-none relative -top-0.5">+</div>
                    </motion.button>
                )}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0a00]/80 backdrop-blur-md p-4"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-6xl h-[85vh] bg-gradient-to-br from-[#1c1200] via-[#140f05] to-black border border-amber-500/30 rounded-[2rem] shadow-[0_0_100px_rgba(245,158,11,0.15)] flex overflow-hidden ring-1 ring-amber-500/10"
                >
                    {/* Background Ambience */}
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#1c1200] via-[#1c1200]/95 to-transparent flex justify-between items-start pt-8 px-8 z-20 pointer-events-none">
                        <div className="flex items-start gap-6 pointer-events-auto">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-amber-400/50 mt-1">
                                <Activity size={24} className="text-black" strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-500 tracking-tight drop-shadow-sm">Clinical Insight Validation</h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-sm font-mono text-amber-500/60 uppercase tracking-widest border-r border-amber-900/50 pr-4">ID: {insight.id}</span>
                                    {isEditing ? (
                                        <span className="text-sm font-bold px-3 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                            <Edit2 size={12} /> Editing Mode
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                            {(insight.confidenceScore * 100).toFixed(0)}% Confidence
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="pointer-events-auto p-3 rounded-full bg-[#1c1200] hover:bg-amber-950 text-amber-500/60 hover:text-amber-200 transition-colors border border-amber-500/20 hover:border-amber-500/40 shadow-lg z-50">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Left Panel (Unchanged) */}
                    <div className="w-[45%] border-r border-amber-900/20 bg-[#161208]/80 p-8 pt-32 flex flex-col relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-[0.05] pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 pl-1">
                            <h4 className="text-amber-600/80 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Source Document
                            </h4>
                            <span className="text-[10px] text-amber-700/60 font-mono border border-amber-900/20 px-2 py-1 rounded bg-amber-950/10">lab_report_024.pdf</span>
                        </div>
                        <div className="flex-1 bg-[#fffbf2] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group border border-stone-800">
                            <div className="absolute inset-0 bg-orange-100/10 mix-blend-multiply pointer-events-none"></div>
                            <div className="p-10 text-stone-800 font-serif space-y-6 opacity-95 select-none transition-all duration-300 transform scale-[0.98] origin-top h-full overflow-hidden">
                                <div className="flex justify-between border-b-2 border-stone-800 pb-4 mb-4">
                                    <h1 className="text-3xl font-bold tracking-tighter text-black">LabCorp<span className="text-amber-600">.</span></h1>
                                    <div className="text-right text-[10px] uppercase font-sans font-bold text-stone-500 leading-tight">REF: #88392<br />DATE: 12 OCT 2025</div>
                                </div>
                                <div className="space-y-6 text-xs leading-loose font-mono text-stone-900">
                                    <p><strong className="uppercase text-stone-500 text-[10px]">Patient:</strong><br /><span className="text-sm font-bold border-b border-stone-300">{insight.patientName}</span></p>
                                    <div className="pl-4 border-l-2 border-amber-400/30">
                                        <div className="text-[10px] uppercase text-stone-500 font-sans font-bold mb-1">Results</div>
                                        <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-stone-800 font-medium">
                                            WBC: <span className="font-bold text-red-600 bg-red-50 px-1 rounded">14.2 (High)</span> <br />
                                            Hemoglobin: 13.5
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Extracted Data */}
                    <div className="w-[55%] bg-transparent p-8 pt-32 flex flex-col overflow-y-auto custom-scrollbar relative">

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
                            <h2 className="text-2xl font-bold text-amber-50 drop-shadow-md">{isEditing ? 'Editing Records' : 'Review Extracted Data'}</h2>
                        </div>

                        {/* 1. Diagnoses */}
                        <SectionHeader icon={Stethoscope} title="Diagnoses" count={editedData.diagnosis?.length || 0} onAdd={() => handleAdd('diagnosis', '')} />
                        <div className="space-y-3 mb-8">
                            {editedData.diagnosis?.map((item, i) => (
                                <div key={i} className={`group p-2 pr-4 rounded-xl border transition-all flex items-center gap-3 ${isEditing ? 'bg-[#2a1c05]/40 border-amber-500/10' : 'bg-transparent border-transparent px-0'}`}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleChange('diagnosis', i, null, e.target.value)}
                                            placeholder="Enter diagnosis..."
                                            className="bg-transparent text-amber-100 font-bold text-lg w-full focus:outline-none focus:text-white placeholder:text-amber-500/30 py-2 px-3"
                                        />
                                    ) : (
                                        <div className="bg-[#2a1c05]/40 border border-amber-500/15 px-4 py-3 rounded-xl w-full text-amber-100 font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] tracking-wide ring-1 ring-amber-500/5 backdrop-blur-sm relative overflow-hidden transition-all duration-500 group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:bg-[#2a1c05]/80">
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            {item}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <button onClick={() => handleRemove('diagnosis', i)} className="text-amber-700/50 hover:text-rose-400 transition-colors p-1"><X size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 2. Vitals */}
                        <SectionHeader icon={Activity} title="Abnormal Vitals" count={editedData.vitals?.length || 0} onAdd={() => handleAdd('vitals', { type: '', value: '', unit: '' })} />
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {editedData.vitals?.map((v, i) => (
                                <div key={i} className={`relative group rounded-xl border transition-all duration-500 overflow-hidden ${isEditing ? 'p-4 bg-gradient-to-br from-[#2a1c05]/60 to-transparent border-amber-500/20' : 'p-4 bg-[#2a1c05]/40 border-amber-500/15 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ring-1 ring-amber-500/5 hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:bg-[#2a1c05]/80'}`}>
                                    {isEditing && <button onClick={() => handleRemove('vitals', i)} className="absolute top-2 right-2 text-amber-800 hover:text-rose-500 transition-colors z-10"><X size={14} /></button>}

                                    {isEditing ? (
                                        <>
                                            <input className="bg-transparent text-xs text-amber-500 uppercase font-extrabold focus:outline-none focus:text-amber-400 w-full tracking-widest mb-1" value={v.type} onChange={(e) => handleChange('vitals', i, 'type', e.target.value)} placeholder="TYPE" />
                                            <div className="flex items-end gap-2">
                                                <input className="bg-transparent text-3xl font-black text-white focus:outline-none focus:text-amber-200 w-2/3 border-b border-transparent focus:border-amber-500/30" value={v.value} onChange={(e) => handleChange('vitals', i, 'value', e.target.value)} placeholder="VAL" />
                                                <input className="bg-transparent text-sm text-amber-200/70 mb-1.5 focus:outline-none focus:text-amber-200 w-1/3 text-right font-bold" value={v.unit} onChange={(e) => handleChange('vitals', i, 'unit', e.target.value)} placeholder="UNIT" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-xs text-amber-500 uppercase font-extrabold tracking-widest mb-1">{v.type}</div>
                                            <div className="flex items-end gap-2">
                                                <div className="text-3xl font-black text-white">{v.value}</div>
                                                <div className="text-sm text-amber-200/70 mb-1.5 font-bold">{v.unit}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 3. Meds */}
                        <SectionHeader icon={Pill} title="Medications" count={editedData.medications?.length || 0} onAdd={() => handleAdd('medications', { name: '', dosage: '', freq: '' })} />
                        <div className="space-y-3 mb-8">
                            {editedData.medications?.map((med, i) => (
                                <div key={i} className={`flex items-center gap-4 rounded-xl border transition-all duration-500 relative overflow-hidden group ${isEditing ? 'p-4 bg-[#2a1c05]/40 border-amber-500/20' : 'p-4 bg-[#2a1c05]/40 border-amber-500/15 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ring-1 ring-amber-500/5 hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:bg-[#2a1c05]/80'}`}>
                                    <div className={`p-2 rounded-lg border transition-colors ${isEditing ? 'bg-emerald-900/20 text-emerald-500 border-emerald-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'}`}>
                                        <Pill size={20} />
                                    </div>
                                    <div className="flex-1 gap-1 flex flex-col relative z-10">
                                        {isEditing ? (
                                            <>
                                                <input className="bg-transparent text-lg font-bold text-emerald-100 focus:outline-none focus:text-white" value={med.name} onChange={(e) => handleChange('medications', i, 'name', e.target.value)} placeholder="Medication Name" />
                                                <div className="flex gap-4 text-sm font-semibold text-emerald-500">
                                                    <input className="bg-transparent focus:outline-none focus:text-emerald-400 w-24" value={med.dosage} onChange={(e) => handleChange('medications', i, 'dosage', e.target.value)} placeholder="Dosage" />
                                                    <input className="bg-transparent focus:outline-none focus:text-emerald-400 w-24" value={med.freq} onChange={(e) => handleChange('medications', i, 'freq', e.target.value)} placeholder="Freq" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-lg font-bold text-emerald-100">{med.name}</div>
                                                <div className="flex gap-4 text-sm font-semibold text-emerald-500">
                                                    <span>{med.dosage}</span>
                                                    <span>{med.freq}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {!isEditing && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                                    {isEditing && <button onClick={() => handleRemove('medications', i)} className="text-amber-800 hover:text-rose-500 p-2"><X size={16} /></button>}
                                </div>
                            ))}
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-8 pt-6 border-t border-amber-500/10 flex gap-4 pl-1 pb-8">

                            {/* Reject */}
                            <button onClick={onReject} className="flex-1 py-4 rounded-xl border border-rose-500/20 text-rose-500 font-bold hover:bg-rose-950/30 transition-colors uppercase tracking-wider text-xs bg-black/40">
                                Reject
                            </button>

                            {/* Edit / View Toggle */}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex-[1.2] py-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all flex items-center justify-center gap-2 ${isEditing
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20'
                                    : 'bg-[#2a1c05] text-stone-400 border-amber-900/40 hover:text-white hover:border-amber-500/40'
                                    }`}
                            >
                                {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                                {isEditing ? 'Done Editing' : 'Edit Records'}
                            </button>

                            {/* Approve */}
                            <button onClick={() => onApprove(editedData)} className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold hover:to-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] uppercase tracking-wider text-xs flex items-center justify-center gap-2 transform active:scale-95 border border-amber-400">
                                <Check size={18} strokeWidth={3} /> Approve Record
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InsightReviewModal;
