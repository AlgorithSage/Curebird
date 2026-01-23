import React, { useState } from 'react';
import {  X, Microscope, CheckCircle, AlertTriangle, Loader, User, FileText, Upload, Sparkles  } from '../components/Icons';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

const ModalTabButton = ({ children, active, onClick, colorClass = "text-amber-400" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`relative flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group border ${active
                ? 'bg-amber-500/10 border-amber-500 ' + colorClass
                : 'bg-stone-900 border-white/5 text-stone-500 hover:text-stone-300'
                }`}
        >
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(80px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.15), transparent 80%)`
                    ),
                }}
            />
            <span className="relative z-10">{children}</span>
        </button>
    );
};

const LabRequestModal = ({ isOpen, onClose, patients = [], user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [testCategory, setTestCategory] = useState('Blood Work');
    const [testName, setTestName] = useState('');
    const [urgency, setUrgency] = useState('routine');
    const [instructions, setInstructions] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const categories = ['Blood Work', 'Imaging', 'Cardinal', 'Biopsy'];
    const urgencyLevels = [
        { id: 'routine', label: 'Routine', color: 'text-emerald-400' },
        { id: 'urgent', label: 'Urgent', color: 'text-amber-400' },
        { id: 'stat', label: 'STAT', color: 'text-rose-500' }
    ];

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setAnalyzing(true);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5001/api/analyze-report', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to analyze document');

            const data = await response.json();

            // Autofill Logic
            // 1. Patient Match
            if (data.patient_name) {
                const normalizedSearch = data.patient_name.toLowerCase();
                const match = patients.find(p => p.name.toLowerCase().includes(normalizedSearch) || normalizedSearch.includes(p.name.toLowerCase()));
                if (match) setPatientId(match.id);
            }

            // 2. Test Name (Use Key Findings or Summary)
            if (data.key_findings && data.key_findings.length > 0) {
                setTestName(data.key_findings[0]);
            } else if (data.summary) {
                setTestName(data.summary.substring(0, 50));
            }

            // 3. Instructions (Use Recommendations)
            if (data.recommendations && data.recommendations.length > 0) {
                setInstructions(data.recommendations.join('\n'));
            }

        } catch (err) {
            console.error("Autofill Error:", err);
            // Don't block the user, just log it. They can still fill manually.
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!patientId) throw new Error("Please select a patient.");
            if (!testName) throw new Error("Please enter test details.");

            const patientName = patients.find(p => p.id === patientId)?.name || 'Unknown Patient';

            let fileUrl = '';
            let fileName = '';

            if (file) {
                setUploading(true);
                const storageRef = ref(storage, `lab_reports/${patientId}/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        () => { },
                        (error) => reject(error),
                        async () => {
                            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            fileName = file.name;
                            resolve();
                        }
                    );
                });
                setUploading(false);
            }

            await addDoc(collection(db, `users/${patientId}/medical_records`), {
                type: 'lab_report',
                title: `Lab Request: ${testName}`,
                testCategory,
                testName,
                urgency,
                instructions,
                fileUrl,
                fileName,
                date: new Date().toISOString().split('T')[0],
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. CureBird',
                patientId,
                patientName,
                priority: urgency === 'stat' ? 'critical' : urgency === 'urgent' ? 'urgent' : 'routine',
                status: 'Ordered',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setPatientId('');
                setTestName('');
                setInstructions('');
                setSuccess(false);
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="glass-card w-full max-w-4xl !p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                >

                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-amber-500/10 bg-black/20 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-white">Lab Request</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                            <form id="lab-request-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Row 1: Patient & Urgency */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Select Patient</label>
                                        <div className="relative">
                                            <select
                                                value={patientId}
                                                onChange={(e) => setPatientId(e.target.value)}
                                                className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="" disabled className="bg-stone-900">Choose Patient...</option>
                                                {patients.map(p => <option key={p.id} value={p.id} className="bg-stone-900">{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Urgency Level</label>
                                        <div className="relative">
                                            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                                            <select
                                                value={urgency}
                                                onChange={(e) => setUrgency(e.target.value)}
                                                className="w-full p-3 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {urgencyLevels.map(u => <option key={u.id} value={u.id} className="bg-stone-900">{u.label}</option>)}
                                            </select>
                                        </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Test Category & Specifics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Test Category</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                                            <select
                                                value={testCategory}
                                                onChange={(e) => setTestCategory(e.target.value)}
                                                className="w-full p-3 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {categories.map(c => <option key={c} value={c} className="bg-stone-900">{c}</option>)}
                                            </select>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Specific Test / Panel</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CBC, MRI Brain, HbA1c"
                                            value={testName}
                                            onChange={(e) => setTestName(e.target.value)}
                                            className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Instructions */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Preparation Instructions</label>
                                    <textarea
                                        rows={4}
                                        placeholder="e.g. Fast for 12 hours, Maintain hydration..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500 custom-scrollbar resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Row 4: File Upload (Ultra-Subtle Amber Theme) */}
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Attach External Report (Optional)</label>
                                    <div className="relative border-2 border-dashed border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 cursor-pointer relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />

                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl" />

                                        <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-full transition-all duration-500 mb-3 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] relative z-10">
                                            {uploading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
                                        </div>
                                        <p className="text-sm font-bold text-amber-500/90 group-hover:text-amber-500 transition-colors tracking-wide leading-none relative z-10">
                                            {file ? file.name : 'Click to Upload Report'}
                                        </p>
                                        <p className="text-[11px] text-amber-500/50 group-hover:text-amber-500/70 transition-colors mt-1 font-medium relative z-10">PDF, JPG, PNG up to 10MB</p>

                                        {/* Autofill Overlay */}
                                        {analyzing && (
                                            <div className="absolute inset-0 bg-stone-900/90 rounded-2xl flex flex-col items-center justify-center z-30 transition-all backdrop-blur-sm border border-amber-500/20">
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                                    <Sparkles size={20} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                                </div>
                                                <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-3 animate-pulse">AI Extracting Data...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end p-5 border-t border-amber-500/10 gap-3 bg-black/20 flex-shrink-0">
                            {error && (
                                <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest mr-auto">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-amber-500/10 text-slate-300 hover:bg-amber-500/5 transition-colors font-bold">Cancel</button>
                            <button 
                                form="lab-request-form"
                                type="submit" 
                                disabled={loading || success}
                                className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none flex items-center gap-2"
                            >
                                {loading ? <Loader size={16} className="animate-spin" /> : <Microscope size={16} />}
                                {loading ? 'Transmitting...' : 'Issue Lab Request'}
                            </button>
                        </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LabRequestModal;
