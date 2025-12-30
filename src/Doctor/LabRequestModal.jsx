import React, { useState } from 'react';
import { X, Microscope, CheckCircle, AlertTriangle, Loader, User, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../App';

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

const LabRequestModal = ({ isOpen, onClose, patients = [] }) => {
    const db = getFirestore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [testCategory, setTestCategory] = useState('Blood Work');
    const [testName, setTestName] = useState('');
    const [urgency, setUrgency] = useState('routine');
    const [instructions, setInstructions] = useState('');

    const categories = ['Blood Work', 'Imaging', 'Cardinal', 'Biopsy'];
    const urgencyLevels = [
        { id: 'routine', label: 'Routine', color: 'text-emerald-400' },
        { id: 'urgent', label: 'Urgent', color: 'text-amber-400' },
        { id: 'stat', label: 'STAT', color: 'text-rose-500' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!patientId) throw new Error("Please select a patient.");
            if (!testName) throw new Error("Please enter test details.");

            const patientName = patients.find(p => p.id === patientId)?.name || 'Unknown Patient';

            await addDoc(collection(db, `users/${patientId}/medical_records`), {
                type: 'lab_report',
                title: `Lab Request: ${testName}`,
                testCategory,
                testName,
                urgency,
                instructions,
                date: new Date().toISOString().split('T')[0],
                doctorId: auth.currentUser?.uid,
                doctorName: auth.currentUser?.displayName || 'Dr. Curebird',
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
                                    <Microscope size={22} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Lab Request</h2>
                                    <p className="text-[11px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-1">Diagnostic Order</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                            <form id="lab-request-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Row 1: Patient & Urgency */}
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
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Urgency Level</label>
                                        <div className="flex gap-2">
                                            {urgencyLevels.map(u => (
                                                <ModalTabButton
                                                    key={u.id}
                                                    active={urgency === u.id}
                                                    onClick={() => setUrgency(u.id)}
                                                    colorClass={u.color}
                                                >
                                                    {u.label}
                                                </ModalTabButton>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Test Category & Specifics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Test Category</label>
                                        <div className="flex gap-1">
                                            {categories.map(c => (
                                                <ModalTabButton
                                                    key={c}
                                                    active={testCategory === c}
                                                    onClick={() => setTestCategory(c)}
                                                >
                                                    {c.split(' ')[0]}
                                                </ModalTabButton>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Specific Test / Panel</label>
                                        <div className="relative flex items-center bg-[#141211] border border-white/[0.05] focus-within:border-amber-500/30 rounded-xl h-[3.8rem] transition-all">
                                            <FileText className="absolute left-4 text-stone-600 focus-within:text-amber-500" size={20} />
                                            <input
                                                type="text"
                                                placeholder="e.g. CBC, MRI Brain, HbA1c"
                                                value={testName}
                                                onChange={(e) => setTestName(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none pl-12 pr-4 text-base text-white placeholder-stone-700 font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Instructions */}
                                <div className="space-y-4">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Preparation Instructions</label>
                                    <textarea
                                        rows={4}
                                        placeholder="e.g. Fast for 12 hours, Maintain hydration..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-2xl py-5 px-6 text-base text-white placeholder-stone-800 outline-none transition-all custom-scrollbar resize-none leading-relaxed font-medium"
                                    />
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
                                    <CheckCircle size={14} /> Request Logged
                                </div>
                            )}
                            {!error && !success && <div></div>}

                            <div className="flex items-center gap-6">
                                <button onClick={onClose} className="text-stone-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Cancel</button>
                                <motion.button
                                    form="lab-request-form"
                                    type="submit"
                                    disabled={loading || success}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader size={16} className="animate-spin" /> : <Microscope size={16} />}
                                    {loading ? 'Transmitting...' : 'Issue Lab Request'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LabRequestModal;
