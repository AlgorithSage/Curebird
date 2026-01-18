import React, { useState } from 'react';
import {  X, Siren, Loader, User, Zap, Activity  } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const EmergencyAlertModal = ({ isOpen, onClose, patients = [], user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [level, setLevel] = useState('rapid_response'); // rapid_response, code_blue
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!patientId) throw new Error("Please select a patient.");
            if (!status) throw new Error("Please enter emergency status.");

            const patientName = patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
            const alertTitle = level === 'rapid_response' ? 'RAPID RESPONSE TRIGGERED' : 'CODE BLUE ACTIVATED';

            // 1. Log to Patient Medical Record
            await addDoc(collection(db, `users/${patientId}/medical_records`), {
                type: 'emergency',
                title: alertTitle,
                level,
                status,
                date: new Date().toISOString().split('T')[0],
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. CureBird',
                patientId,
                patientName,
                priority: 'critical',
                createdAt: serverTimestamp()
            });

            // 2. Log to Global Emergency Alerts
            await addDoc(collection(db, 'emergency_alerts'), {
                level,
                status,
                patientId,
                patientName,
                triggeredBy: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. CureBird',
                timestamp: serverTimestamp(),
                resolved: false
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setPatientId('');
                setStatus('');
                setSuccess(false);
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    exit={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                    className="relative w-full max-w-2xl p-[3px] rounded-[2.5rem] overflow-hidden group shadow-[0_0_100px_rgba(225,29,72,0.2)]"
                >
                    {/* Rotating Rim (Border) - Sensitive to Level */}
                    <div className="absolute inset-0 z-0 bg-[#1c1605]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className={`absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,${level === 'rapid_response' ? 'rgba(251,191,36,0.6)' : 'rgba(225,29,72,0.6)'}_270deg,${level === 'rapid_response' ? '#fbbf24' : '#e11d48'}_360deg)] opacity-80`}
                        />
                    </div>

                    <div className="relative z-10 w-full h-full bg-[#1c1605] rounded-[2.4rem] overflow-hidden flex flex-col shadow-[inset_0_0_120px_rgba(245,158,11,0.08)]">
                        {/* Premium Vibrant Backdrop (Blends Amber with Emergency Level Color) */}
                        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(251,191,36,0.12),_transparent_60%),_radial-gradient(circle_at_75%_75%,_${level === 'rapid_response' ? 'rgba(217,119,6,0.08)' : 'rgba(225,29,72,0.08)'},_transparent_60%)] pointer-events-none`} />

                        {/* Soft Warm Diffusion Layer */}
                        <div className={`absolute inset-0 ${level === 'rapid_response' ? 'bg-amber-950/20' : 'bg-rose-950/20'} backdrop-blur-3xl pointer-events-none`} />

                        {/* Global Grain/Noise Texture */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                        {/* Emergency Header */}
                        <div className={`px-8 py-6 border-b-2 ${level === 'rapid_response' ? 'border-amber-500/30' : 'border-rose-500/30'} flex items-center justify-between relative z-10`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${level === 'rapid_response' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-rose-600 text-white animate-pulse shadow-[0_0_30px_rgba(225,29,72,0.5)]'}`}>
                                    <Siren size={24} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{level === 'rapid_response' ? 'Rapid Response' : 'Code Blue'}</h2>
                                    <p className="text-[12px] text-stone-400 font-black uppercase tracking-[0.4em] mt-1">Critical Escalation</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-stone-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 p-8 space-y-8 relative z-10">
                            <form id="emergency-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Urgent Patient Selection */}
                                <div className="space-y-4">
                                    <label className="text-[14px] font-black text-stone-500 uppercase tracking-widest ml-1">Identify Patient</label>
                                    <div className="relative flex items-center bg-black/40 border border-white/5 focus-within:border-amber-500/30 rounded-2xl h-[4.2rem] transition-all overflow-hidden group">
                                        <User className="absolute left-6 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={24} />
                                        <select
                                            value={patientId}
                                            onChange={(e) => setPatientId(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none pl-16 pr-8 text-lg text-white appearance-none cursor-pointer font-bold"
                                            required
                                        >
                                            <option value="" disabled className="bg-stone-900">Select Patient in Distress...</option>
                                            {patients.map(p => <option key={p.id} value={p.id} className="bg-stone-900">{p.name}</option>)}
                                        </select>
                                    </div>
                                    {error && <p className="text-rose-500 text-sm mt-1 font-bold">{error}</p>}
                                </div>

                                {/* Alert Level Toggle */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setLevel('rapid_response')}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${level === 'rapid_response' ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-stone-900/50 border-white/5 opacity-50'}`}
                                    >
                                        <Zap size={24} className={level === 'rapid_response' ? 'text-amber-400' : 'text-stone-600'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Rapid Response</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLevel('code_blue')}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${level === 'code_blue' ? 'bg-rose-600/20 border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.3)]' : 'bg-stone-900/50 border-white/5 opacity-50'}`}
                                    >
                                        <Activity size={24} className={level === 'code_blue' ? 'text-rose-500 animate-pulse' : 'text-stone-600'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Code Blue</span>
                                    </button>
                                </div>

                                {/* Status Input */}
                                <div className="space-y-4">
                                    <label className="text-[14px] font-black text-stone-500 uppercase tracking-widest ml-1">Condition Overview</label>
                                    <textarea
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        placeholder="e.g. Unconscious, Severe Respiratory Distress..."
                                        className="w-full bg-black/40 border border-white/5 focus:border-rose-500/30 rounded-2xl p-8 text-lg text-white placeholder-stone-800 outline-none transition-all resize-none h-40 font-medium leading-relaxed"
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-8 bg-black/60 border-t-2 border-white/5 relative z-10">
                            <motion.button
                                form="emergency-form"
                                type="submit"
                                disabled={loading || success}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-6 rounded-2xl flex items-center justify-center gap-6 text-base font-black uppercase tracking-[0.25em] transition-all shadow-2xl ${level === 'rapid_response' ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-rose-600 text-white shadow-rose-600/30'}`}
                            >
                                {loading ? <Loader className="animate-spin" size={24} /> : <Zap size={24} />}
                                {loading ? 'BROADCASTING...' : success ? 'ALERT TRANSMITTED' : `TRIGGER ${level === 'rapid_response' ? 'RAPID RESPONSE' : 'CODE BLUE'}`}
                            </motion.button>
                            <p className="text-[10px] text-center text-stone-600 mt-5 font-black uppercase tracking-widest">Immediate response team will be notified upon submission</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmergencyAlertModal;
