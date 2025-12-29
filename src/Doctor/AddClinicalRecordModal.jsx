import React, { useState } from 'react';
import { X, Upload, FileText, User, Calendar, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../App'; // Import auth from main App
import { motion, AnimatePresence } from 'framer-motion';

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

            // Handle File Upload
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

            // Create Record in Firestore
            // Storing in subcollection of the patient
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
                // Reset form
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0c0a09] border border-amber-500/20 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Add Clinical Record</h2>
                                <p className="text-xs text-amber-500/60 uppercase tracking-widest font-semibold">New Entry</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <form id="add-record-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Row 1: Patient & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Patient</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                                        <select
                                            value={formData.patientId}
                                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                            className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Select Patient...</option>
                                            {patients.length > 0 ? (
                                                patients.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id.slice(0, 6)})</option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No patients found</option>
                                            )}
                                            {/* Fallback for testing/manual entry if needed */}
                                            {/* <option value="manual_entry">-- Manual Entry --</option> */}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Record Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {recordTypes.slice(0, 2).map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${formData.type === type.id
                                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full mt-2 bg-stone-900/50 border border-stone-800 rounded-xl py-2 px-3 text-sm text-stone-300 focus:outline-none focus:border-amber-500/50"
                                    >
                                        {recordTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Priority</label>
                                    <div className="flex gap-2">
                                        {priorities.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${formData.priority === p.id
                                                    ? `bg-stone-800 border-stone-600 ${p.color} ring-1 ring-white/10`
                                                    : 'bg-stone-900 border-stone-800 text-stone-500 hover:bg-stone-800'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Title / Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Annual Physical Results"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 px-4 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                                    required
                                />
                            </div>

                            {/* Row 4: Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Clinical Notes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter detailed clinical findings, diagnosis, or instructions..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 px-4 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all custom-scrollbar resize-none"
                                />
                            </div>

                            {/* Row 5: File Upload */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Attachment (Optional)</label>
                                <div className="border-2 border-dashed border-stone-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="p-3 bg-stone-900 rounded-full text-stone-500 group-hover:text-amber-500 transition-colors mb-2">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-sm text-stone-400 font-medium">{formData.file ? formData.file.name : 'Click to Upload or Drag & Drop'}</p>
                                    <p className="text-xs text-stone-600 mt-1">PDF, JPG, PNG up to 10MB</p>
                                </div>
                                {loading && uploadProgress > 0 && (
                                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between">
                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold animate-pulse">
                                <AlertTriangle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        {!error && !success && <div></div>} {/* Spacer */}

                        {success && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <CheckCircle size={14} />
                                <span>Record Added Successfully!</span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-record-form"
                                disabled={loading || success}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-600 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                                {loading ? 'Saving...' : 'Save Record'}
                            </button>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddClinicalRecordModal;
