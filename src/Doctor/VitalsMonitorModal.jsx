import React, { useState } from 'react';
import { X, Activity, CheckCircle, AlertTriangle, Loader, User, Droplets, Thermometer, Wind, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const VitalsMonitorModal = ({ isOpen, onClose, patients = [], user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [patientId, setPatientId] = useState('');
    const [vitals, setVitals] = useState({
        temperature: '',
        systolic: '',
        diastolic: '',
        heartRate: '',
        respiratoryRate: '',
        spO2: '',
        weight: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!patientId) throw new Error("Please select a patient.");

            const patientName = patients.find(p => p.id === patientId)?.name || 'Unknown Patient';

            await addDoc(collection(db, `users/${patientId}/medical_records`), {
                type: 'vitals_log',
                title: `Vitals Log: ${new Date().toLocaleTimeString()}`,
                metadata: {
                    vitals: {
                        bp: vitals.systolic && vitals.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : '',
                        heartRate: vitals.heartRate,
                        temp: vitals.temperature,
                        spO2: vitals.spO2,
                        respRate: vitals.respiratoryRate,
                        weight: vitals.weight
                    }
                },
                date: new Date().toISOString().split('T')[0],
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. Curebird',
                patientId,
                patientName,
                priority: 'routine',
                status: 'finalized',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setPatientId('');
                setVitals({ temperature: '', systolic: '', diastolic: '', heartRate: '', respiratoryRate: '', spO2: '', weight: '' });
                setSuccess(false);
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const VitalInput = ({ icon: Icon, label, value, onChange, placeholder, unit }) => (
        <div className="space-y-3">
            <label className="text-[12px] font-black text-amber-500/70 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative flex items-center bg-[#141211] border border-white/[0.05] focus-within:border-amber-500/30 rounded-xl h-[3.8rem] transition-all">
                <Icon className="absolute left-4 text-stone-600 focus-within:text-amber-500" size={20} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none outline-none pl-12 pr-14 text-base text-white placeholder-stone-700 font-medium"
                />
                <span className="absolute right-4 text-[11px] font-black text-stone-600 uppercase">{unit}</span>
            </div>
        </div>
    );

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
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Vitals Monitor</h2>
                                    <p className="text-[11px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-1">Physiological Entry</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                            <form id="vitals-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-widest ml-1">Select Patient</label>
                                        <div className="relative flex items-center bg-[#141211] border border-white/[0.05] focus-within:border-amber-500/30 rounded-xl h-[3.8rem] transition-all font-sans">
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
                                    <VitalInput icon={Thermometer} label="Body Temperature" value={vitals.temperature} onChange={(v) => setVitals({ ...vitals, temperature: v })} placeholder="36.5" unit="°C" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <VitalInput icon={Droplets} label="Systolic BP" value={vitals.systolic} onChange={(v) => setVitals({ ...vitals, systolic: v })} placeholder="120" unit="mmHg" />
                                    <VitalInput icon={Droplets} label="Diastolic BP" value={vitals.diastolic} onChange={(v) => setVitals({ ...vitals, diastolic: v })} placeholder="80" unit="mmHg" />
                                    <VitalInput icon={Activity} label="Heart Rate" value={vitals.heartRate} onChange={(v) => setVitals({ ...vitals, heartRate: v })} placeholder="72" unit="BPM" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <VitalInput icon={Wind} label="Resp. Rate" value={vitals.respiratoryRate} onChange={(v) => setVitals({ ...vitals, respiratoryRate: v })} placeholder="16" unit="BPM" />
                                    <VitalInput icon={Monitor} label="SpO2 Level" value={vitals.spO2} onChange={(v) => setVitals({ ...vitals, spO2: v })} placeholder="98" unit="%" />
                                    <VitalInput icon={Activity} label="Body Weight" value={vitals.weight} onChange={(v) => setVitals({ ...vitals, weight: v })} placeholder="70" unit="KG" />
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
                                    <CheckCircle size={14} /> Vitals Recorded
                                </div>
                            )}
                            {!error && !success && <div></div>}

                            <div className="flex items-center gap-6">
                                <button onClick={onClose} className="text-stone-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Cancel</button>
                                <motion.button
                                    form="vitals-form"
                                    type="submit"
                                    disabled={loading || success}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    {loading ? 'Logging...' : 'Secure Vitals Log'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VitalsMonitorModal;
