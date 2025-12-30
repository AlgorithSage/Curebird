import React, { useState } from 'react';
import { X, Upload, FileText, User, Calendar, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../App'; // Import auth from main App
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TabButton = ({ children, active, onClick, colorClass = "text-amber-400" }) => {
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
            className={`relative flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden group border ${active
                ? 'bg-amber-500/10 border-amber-500 ' + colorClass
                : 'bg-stone-900 border-white/5 text-stone-500 hover:text-stone-300'
                }`}
        >
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(100px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.15), transparent 80%)`
                    ),
                }}
            />
            <span className="relative z-10">{children}</span>
        </button>
    );
};

const AddClinicalRecordModal = ({ isOpen, onClose, patients = [], doctorId, doctorName }) => {
    // Firebase instances
    const storage = getStorage();
    const db = getFirestore();

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        patientId: '',
        title: '',
        type: 'consultation_note',
        description: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'routine',
        file: null
    });

    const recordTypes = [
        { id: 'consultation_note', label: 'Consultation Note' },
        { id: 'prescription', label: 'Prescription' },
        { id: 'lab_report', label: 'Lab Report' },
        { id: 'vitals_log', label: 'Vitals Log' },
        { id: 'referral', label: 'Referral' }
    ];

    const priorities = [
        { id: 'routine', label: 'Routine', color: 'text-emerald-400' },
        { id: 'urgent', label: 'Urgent', color: 'text-amber-400' },
        { id: 'critical', label: 'Critical', color: 'text-rose-400' }
    ];

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!formData.patientId) throw new Error("Please select a patient.");
            if (!formData.title) throw new Error("Please enter a record title.");

            let fileUrl = '';
            let fileName = '';

            if (formData.file) {
                fileName = formData.file.name;
                const storageRef = ref(storage, `records/${formData.patientId}/${Date.now()}-${fileName}`);
                const uploadTask = uploadBytesResumable(storageRef, formData.file);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            const patientRecordRef = collection(db, `users/${formData.patientId}/medical_records`);

            await addDoc(patientRecordRef, {
                type: formData.type,
                title: formData.title,
                description: formData.description,
                date: formData.date,
                doctorId: doctorId || auth.currentUser?.uid,
                doctorName: doctorName || auth.currentUser?.displayName || 'Dr. Curebird',
                patientId: formData.patientId,
                patientName: patients.find(p => p.id === formData.patientId)?.name || 'Unknown Patient',
                priority: formData.priority,
                fileUrl,
                fileName,
                createdAt: serverTimestamp(),
                status: 'finalized'
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setFormData({
                    patientId: '',
                    title: '',
                    type: 'consultation_note',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    priority: 'routine',
                    file: null
                });
                setSuccess(false);
            }, 1500);

        } catch (err) {
            console.error("Error adding record:", err);
            setError(err.message || "Failed to add record.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Main Card with Rotating Border Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="relative w-full h-full max-w-4xl bg-[#1c1605] rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_120px_rgba(245,158,11,0.08)] border border-amber-500/20"
                >
                    {/* Premium Vibrant Amber Backdrop */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(251,191,36,0.12),_transparent_60%),_radial-gradient(circle_at_75%_75%,_rgba(217,119,6,0.08),_transparent_60%)] pointer-events-none" />

                    {/* Soft Warm Diffusion Layer */}
                    <div className="absolute inset-0 bg-amber-950/20 backdrop-blur-3xl pointer-events-none" />

                    {/* Global Grain/Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {/* Header */}
                    <div className="px-8 py-6 border-b-2 border-amber-500/20 flex items-center justify-between relative bg-gradient-to-r from-amber-500/[0.07] via-transparent to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Add Clinical Record
                                </h2>
                                <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-0.5">New Entry</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        <form id="add-record-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Row 1: Patient & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Patient</label>
                                    <div className="relative group">
                                        <div className="relative flex items-center bg-[#141211] border border-white/[0.05] group-focus-within:border-amber-500/30 rounded-xl transition-all h-[3.5rem]">
                                            <User className="absolute left-4 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                                            <select
                                                value={formData.patientId}
                                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 text-sm text-white appearance-none cursor-pointer font-medium"
                                                required
                                            >
                                                <option value="" disabled className="bg-stone-900">Select Patient...</option>
                                                {patients.map(p => (
                                                    <option key={p.id} value={p.id} className="bg-stone-900">{p.name} (ID: {p.id.slice(0, 6)})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Date</label>
                                    <div className="relative group">
                                        <div className="relative flex items-center bg-[#141211] border border-white/[0.05] group-focus-within:border-amber-500/30 rounded-xl transition-all h-[3.5rem]">
                                            <Calendar className="absolute left-4 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 text-sm text-white [color-scheme:dark] transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Record Type</label>
                                    <div className="grid grid-cols-2 gap-2 relative">
                                        {recordTypes.slice(0, 2).map(type => (
                                            <TabButton
                                                key={type.id}
                                                active={formData.type === type.id}
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                            >
                                                {type.label}
                                            </TabButton>
                                        ))}
                                    </div>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-[#141211] border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-400 focus:outline-none focus:border-amber-500/30 appearance-none cursor-pointer"
                                    >
                                        {recordTypes.map(t => <option key={t.id} value={t.id} className="bg-stone-900">{t.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Priority</label>
                                    <div className="flex gap-2 relative">
                                        {priorities.map(p => (
                                            <TabButton
                                                key={p.id}
                                                active={formData.priority === p.id}
                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                colorClass={p.color}
                                            >
                                                {p.label}
                                            </TabButton>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Title */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Title / Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Annual Physical Results"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl py-4 px-5 text-[15px] text-white placeholder-stone-700 outline-none transition-all font-medium"
                                    required
                                />
                            </div>

                            {/* Row 4: Description */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Clinical Notes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter detailed clinical findings, diagnosis, or instructions..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-2xl py-4 px-5 text-[15px] text-white placeholder-stone-800 outline-none transition-all custom-scrollbar resize-none font-medium leading-relaxed"
                                />
                            </div>

                            {/* Row 5: File Upload */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Attachment (Optional)</label>
                                <div className="relative border-2 border-dashed border-white/[0.05] group-hover:border-amber-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-slate-950/20 cursor-pointer relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="p-3 bg-stone-900 rounded-full text-stone-500 group-hover:text-amber-500 transition-all mb-3">
                                        <Upload size={22} />
                                    </div>
                                    <p className="text-sm text-stone-400 font-bold tracking-tight">
                                        {formData.file ? formData.file.name : 'Click to Upload or Drag & Drop'}
                                    </p>
                                    <p className="text-[10px] text-stone-700 uppercase tracking-widest mt-1 font-black">PDF, JPG, PNG up to 10MB</p>
                                </div>
                                {loading && uploadProgress > 0 && (
                                    <div className="w-full h-1 bg-stone-950/50 rounded-full overflow-hidden mt-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-amber-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t-2 border-amber-500/20 bg-black/40 flex items-center justify-between font-sans">
                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
                                <AlertTriangle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        {!error && !success && <div></div>}

                        {success && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                <CheckCircle size={14} />
                                <span>Entry Secured</span>
                            </div>
                        )}

                        <div className="flex items-center gap-6">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-500 hover:text-white transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <motion.button
                                type="submit"
                                form="add-record-form"
                                disabled={loading || success}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-10 py-3.5 rounded-xl text-[14px] font-black text-black bg-gradient-to-r from-amber-400 to-amber-600 disabled:opacity-30 transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl shadow-amber-900/20"
                            >
                                {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                {loading ? 'Saving...' : 'Save Record'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddClinicalRecordModal;
