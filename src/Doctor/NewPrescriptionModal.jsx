import React, { useState } from 'react';
import { X, Pill, Plus, Trash2, CheckCircle, AlertTriangle, Loader, User } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

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

const NewPrescriptionModal = ({ isOpen, onClose, patients = [], user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medications, setMedications] = useState([
        { name: '', dosage: '', frequency: 'QD', route: 'Oral', duration: '7 Days', instructions: '' }
    ]);

    const frequencies = ['QD', 'BID', 'TID', 'QID', 'PRN'];
    const routes = ['Oral', 'IV', 'IM', 'Topical', 'Inhalation'];

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: 'QD', route: 'Oral', duration: '7 Days', instructions: '' }]);
    };

    const removeMedication = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const updateMedication = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!patientId) throw new Error("Please select a patient.");
            if (medications.some(m => !m.name || !m.dosage)) throw new Error("Please complete all medication details.");

            const patientName = patients.find(p => p.id === patientId)?.name || 'Unknown Patient';

            await addDoc(collection(db, `users/${patientId}/medical_records`), {
                type: 'prescription',
                title: `Prescription: ${diagnosis || 'Clinical Rx'}`,
                diagnosis,
                medicines: medications,
                date: new Date().toISOString().split('T')[0],
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. Curebird',
                patientId,
                patientName,
                priority: 'routine',
                status: 'Active',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setPatientId('');
                setDiagnosis('');
                setMedications([{ name: '', dosage: '', frequency: 'QD', route: 'Oral', duration: '7 Days', instructions: '' }]);
                setSuccess(false);
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- SMART AUTOFILL LOGIC ---
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5001/api/analyze-report', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to analyze document');

            const data = await response.json();

            // Autofill Logic
            if (data.medications && data.medications.length > 0) {
                const mappedMeds = data.medications.map(m => ({
                    name: m.name,
                    dosage: m.dosage || 'As prescribed',
                    frequency: mapFrequency(m.frequency),
                    route: 'Oral',
                    duration: m.duration || '7 Days',
                    instructions: ''
                }));
                setMedications(mappedMeds);
            }

            if (data.key_findings && data.key_findings.length > 0) {
                // Heuristic: Use first finding or join top 2
                setDiagnosis(data.key_findings.slice(0, 2).join(", ") || data.summary || '');
            }

            // Attempt Patient Match
            if (data.patient_name) {
                const normalizedSearch = data.patient_name.toLowerCase();
                const match = patients.find(p => p.name.toLowerCase().includes(normalizedSearch) || normalizedSearch.includes(p.name.toLowerCase()));
                if (match) setPatientId(match.id);
            }

            setSuccess(true); // reusing success state for visual feedback of "Autofill Complete"
            setTimeout(() => setSuccess(false), 2000);

        } catch (err) {
            console.error("Autofill Error:", err);
            setError("Could not autofill from document. Please enter manually.");
        } finally {
            setUploading(false);
        }
    };

    const mapFrequency = (freqRaw) => {
        if (!freqRaw) return 'QD';
        const f = freqRaw.toLowerCase();
        if (f.includes('twice') || f.includes('bid') || f.includes('1-0-1')) return 'BID';
        if (f.includes('thrice') || f.includes('tid') || f.includes('1-1-1')) return 'TID';
        if (f.includes('four') || f.includes('qid')) return 'QID';
        if (f.includes('needed') || f.includes('prn')) return 'PRN';
        return 'QD';
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
                    className="relative w-full max-w-4xl p-[3px] rounded-[2.1rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    {/* Rotating Rim (Border) */}
                    <div className="absolute inset-0 z-0 bg-[#1c1605]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,rgba(251,191,36,0.5)_270deg,#fbbf24_360deg)] opacity-70"
                        />
                    </div>

                    <div className="relative z-10 w-full h-full bg-[#1c1605] rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[inset_0_0_120px_rgba(245,158,11,0.08)]">
                        {/* Premium Vibrant Amber Backdrop */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(251,191,36,0.12),_transparent_60%),_radial-gradient(circle_at_75%_75%,_rgba(217,119,6,0.08),_transparent_60%)] pointer-events-none" />

                        {/* Soft Warm Diffusion Layer */}
                        <div className="absolute inset-0 bg-amber-950/20 backdrop-blur-3xl pointer-events-none" />

                        {/* Global Grain/Noise Texture */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                        {/* Header */}
                        <div className="px-8 py-6 border-b-2 border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-500/[0.07] via-transparent to-transparent relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <Pill size={22} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">New Prescription</h2>
                                    <p className="text-[11px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-1">Clinical Order</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                            <form id="prescription-form" onSubmit={handleSubmit} className="space-y-8">

                                {/* SMART UPLOAD BANNER */}
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                                    />
                                    <div className={`p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-4 ${uploading ? 'border-amber-500/50 bg-amber-500/10' : 'border-stone-800 bg-stone-900/40 hover:border-amber-500/30 hover:bg-stone-900/60'}`}>
                                        <div className={`p-3 rounded-full ${uploading ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-stone-800 text-stone-400 group-hover/upload:text-amber-500 group-hover/upload:bg-amber-500/10'} transition-colors`}>
                                            {uploading ? <Loader size={24} className="animate-spin" /> : <Plus size={24} />}
                                        </div>
                                        <div className="text-left">
                                            {uploading ? (
                                                <>
                                                    <p className="text-sm font-bold text-amber-400">Analyzing Document...</p>
                                                    <p className="text-xs text-amber-500/60">Extracting Patient & Meds</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-bold text-stone-300 group-hover/upload:text-white transition-colors">Smart Autofill from Image</p>
                                                    <p className="text-xs text-stone-500 group-hover/upload:text-stone-400 transition-colors">Upload a physical Rx to auto-populate fields</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Select Patient</label>
                                        <div className="relative flex items-center bg-[#141211] border border-white/[0.05] focus-within:border-amber-500/30 rounded-xl h-[3.8rem] transition-all overflow-hidden font-sans">
                                            <User className="absolute left-4 text-stone-600 focus-within:text-amber-500" size={20} />
                                            <select
                                                value={patientId}
                                                onChange={(e) => setPatientId(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 text-base text-white appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="" disabled className="bg-stone-900">Choose Patient...</option>
                                                {patients.map(p => <option key={p.id} value={p.id} className="bg-stone-900">{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Primary Diagnosis</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Type 2 Diabetes"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl h-[3.8rem] px-6 text-base text-white outline-none transition-all placeholder-stone-700 font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Medications Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Medications</label>
                                        <button
                                            type="button"
                                            onClick={addMedication}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                        >
                                            <Plus size={16} /> Add Medicine
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {medications.map((med, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-6 rounded-2xl bg-[#141211]/50 border border-white/[0.05] relative group/med"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedication(idx)}
                                                    className="absolute top-4 right-4 text-stone-600 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Medicine Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Metformin, Lisinopril..."
                                                            value={med.name}
                                                            onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                                            className="w-full bg-stone-900/50 border border-white/5 focus:border-amber-500/30 rounded-xl py-3.5 px-5 text-base text-white outline-none font-medium"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Dosage</label>
                                                        <input
                                                            type="text"
                                                            placeholder="500mg, 10ml..."
                                                            value={med.dosage}
                                                            onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                                            className="w-full bg-stone-900/50 border border-white/5 focus:border-amber-500/30 rounded-xl py-3.5 px-5 text-base text-white outline-none font-medium"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Frequency</label>
                                                        <div className="flex gap-1">
                                                            {frequencies.map(f => (
                                                                <ModalTabButton
                                                                    key={f}
                                                                    active={med.frequency === f}
                                                                    onClick={() => updateMedication(idx, 'frequency', f)}
                                                                >
                                                                    {f}
                                                                </ModalTabButton>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Route</label>
                                                        <select
                                                            value={med.route}
                                                            onChange={(e) => updateMedication(idx, 'route', e.target.value)}
                                                            className="w-full bg-stone-900/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-stone-300 outline-none cursor-pointer"
                                                        >
                                                            {routes.map(r => <option key={r} value={r} className="bg-stone-900">{r}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Duration</label>
                                                        <input
                                                            type="text"
                                                            placeholder="7 Days, 1 Month"
                                                            value={med.duration}
                                                            onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                                                            className="w-full bg-stone-900/50 border border-white/5 focus:border-amber-500/30 rounded-xl py-2 px-4 text-xs text-white outline-none font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t-2 border-amber-500/20 bg-black/40 flex items-center justify-between relative z-10">
                            {error && (
                                <div className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={14} /> Rx Authorized
                                </div>
                            )}
                            {!error && !success && <div></div>}

                            <div className="flex items-center gap-6">
                                <button onClick={onClose} className="text-stone-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Cancel</button>
                                <motion.button
                                    form="prescription-form"
                                    type="submit"
                                    disabled={loading || success}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    {loading ? 'Validating...' : 'Authorize Prescription'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewPrescriptionModal;
