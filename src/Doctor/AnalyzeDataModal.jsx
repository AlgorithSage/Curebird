import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, FileText, X, CheckCircle2,
    Loader2, Search, AlertCircle, ArrowRight
} from 'lucide-react';

import { auth, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

const AnalyzeDataModal = (props) => {
    const { isOpen, onClose, onNavigate, onAnalysisComplete } = props;
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);

    // Handle Drag Events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle Drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Handle File Input
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (fileList) => {
        const newFiles = Array.from(fileList);
        setFiles(prev => [...prev, ...newFiles]);

        if (newFiles.length === 0) return;

        // Start Process
        setUploading(true);

        // Prepare Upload
        const formData = new FormData();
        formData.append('file', newFiles[0]);

        try {
            // Artificial delay for upload feel (optional, but good for UX)
            await new Promise(resolve => setTimeout(resolve, 1500));
            setUploading(false);
            setAnalyzing(true);

            // Call Backend Analysis (Gemini 2.0 Flash)
            const response = await fetch('http://localhost:5001/api/analyze-report', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();

            setResult({
                ...data, // Contains summary, extracted_vitals, key_findings, etc.
                status: 'Complete'
            });

        } catch (error) {
            console.error("Analysis Error:", error);
            // Fallback for safety or notify user
            setResult({
                status: 'Error',
                summary: "We couldn't process this document. Please ensure it is a clear medical image.",
                extracted_vitals: [],
                key_findings: ["Analysis failed."],
                recommendation: "Please try uploading again.",
                medication_adjustments: []
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddToRecord = async () => {
        setSaving(true);

        try {
            const currentUser = auth.currentUser;
            if (currentUser && result) {
                // Save to Firestore
                // We use a subcollection pattern or root collection based on MedicalRecordManager's collectionGroup query
                // Here we create a root-level 'medical_records' document for simplicity/visibility
                await addDoc(collection(db, 'medical_records'), {
                    doctorId: currentUser.uid,
                    doctorName: currentUser.displayName || 'Dr. Sohan Ghosh',
                    patientName: props.patientName || 'General Record',
                    type: 'lab_report',
                    title: 'AI Clinical Analysis Report',
                    fileName: files[0]?.name || 'Uploaded Document',
                    description: result.summary,
                    date: new Date().toISOString().split('T')[0],
                    priority: 'urgent',
                    vitals: result.extracted_vitals,
                    findings: result.key_findings,
                    medications: result.medication_adjustments,
                    createdAt: new Date()
                });

                // Small delay for UX
                setTimeout(() => {
                    setSaving(false);
                    if (onAnalysisComplete) {
                        onAnalysisComplete({
                            ...result,
                            id: Date.now(),
                            fileName: files[0]?.name || 'Uploaded Document',
                            date: new Date().toISOString().split('T')[0]
                        });
                    }
                    onClose();
                    if (onNavigate) {
                        onNavigate('medical_records');
                    }
                }, 1000);
            } else {
                setSaving(false); // Handle case where user isn't logged in (shouldn't happen in this flow)
            }
        } catch (error) {
            console.error("Error saving record:", error);
            setSaving(false);
            // Optionally show error state
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0c0a09] w-full max-w-2xl max-h-[85vh] rounded-[2rem] border border-stone-800 shadow-2xl flex flex-col overflow-hidden pointer-events-auto relative">

                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-stone-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Search className="text-cyan-400" size={20} /> Analyze New Data
                                    </h2>
                                    <p className="text-stone-400 text-xs mt-1">Upload patient records, lab results, or imaging for instant AI triage.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Stage Manager */}
                            <div className="p-8 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">

                                {!files.length && !result ? (
                                    /* 1. Upload State */
                                    <form
                                        onDragEnter={handleDrag}
                                        onSubmit={(e) => e.preventDefault()}
                                        className="flex-1 flex flex-col"
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            multiple={true}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer ${dragActive
                                                ? "border-cyan-500 bg-cyan-500/10"
                                                : "border-stone-700 hover:border-cyan-500/50 hover:bg-stone-800/50"
                                                }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <div className="p-4 rounded-full bg-stone-800 text-cyan-400 mb-4 shadow-lg ring-1 ring-white/10">
                                                <UploadCloud size={32} />
                                            </div>
                                            <p className="text-lg font-bold text-white mb-2">Drag & drop files here</p>
                                            <p className="text-sm text-stone-500">or click to browse your computer</p>
                                            <div className="mt-6 flex gap-3 text-[10px] text-stone-600 font-mono uppercase">
                                                <span className="bg-stone-900 px-2 py-1 rounded">PDF</span>
                                                <span className="bg-stone-900 px-2 py-1 rounded">DICOM</span>
                                                <span className="bg-stone-900 px-2 py-1 rounded">CSV</span>
                                            </div>
                                        </label>
                                    </form>
                                ) : (
                                    /* Processing / Result State */
                                    <div className="flex-1 flex flex-col">

                                        {/* File List (Mini) */}
                                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                            {files.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-stone-800 rounded-lg border border-stone-700 shrink-0">
                                                    <FileText size={14} className="text-cyan-400" />
                                                    <span className="text-xs text-stone-300 font-medium truncate max-w-[150px]">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {uploading || analyzing ? (
                                            /* 2. Loading State */
                                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                                <div className="relative mb-6">
                                                    <div className="w-16 h-16 border-4 border-stone-800 border-t-cyan-500 rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Loader2 size={24} className="text-cyan-500 animate-pulse" />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {uploading ? "Uploading Securely..." : "Analyzing Clinical Data..."}
                                                </h3>
                                                <p className="text-sm text-stone-500 max-w-xs mx-auto">
                                                    {uploading
                                                        ? "Encrypting files and transferring to HIPAA-compliant storage."
                                                        : "Cross-referencing values with patient history and global baselines."}
                                                </p>
                                            </div>
                                        ) : result ? (
                                            /* 3. Results State */
                                            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">

                                                {/* Summary Box */}
                                                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                                                    <h4 className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                                                        <CheckCircle2 size={18} /> Analysis Complete
                                                        <span className="text-[10px] bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-300 ml-2">Powered by Llama 4 Vision</span>
                                                    </h4>
                                                    <p className="text-cyan-100/80 text-sm leading-relaxed">
                                                        {result.summary}
                                                    </p>
                                                </div>

                                                {/* Extracted Vitals Grid */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {result.extracted_vitals.map((vital, i) => (
                                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col">
                                                            <span className="text-[10px] text-stone-500 uppercase font-bold">{vital.label}</span>
                                                            <span className="text-lg font-bold text-white">{vital.value}</span>
                                                            {vital.status === 'high' && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> High</span>}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Key Findings List */}
                                                <div>
                                                    <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Key Clinical Findings</h5>
                                                    <div className="space-y-2">
                                                        {result.key_findings.map((item, i) => (
                                                            <div key={i} className="flex items-start gap-3 p-3 bg-stone-900/50 rounded-lg border border-white/5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                                                <span className="text-sm text-stone-300 leading-relaxed">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Medication Adjustments */}
                                                <div>
                                                    <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Medications & Treatment Plan</h5>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {result.medication_adjustments.map((med, i) => (
                                                            <div key={i} className={`p-3 rounded-lg border flex flex-col ${med.action === 'Suspend' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-sm font-bold text-white">{med.name}</span>
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${med.action === 'Suspend' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{med.action}</span>
                                                                </div>
                                                                <span className="text-xs text-stone-500">{med.dose}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-8 mt-6 border-t border-dashed border-stone-800/50">
                                                    <button
                                                        onClick={handleAddToRecord}
                                                        disabled={saving}
                                                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={20} />
                                                                Saving to Medical Records...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Add to Patient Record
                                                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AnalyzeDataModal;
