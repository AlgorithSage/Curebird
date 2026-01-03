import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Monitor,
    MoreVertical, FileText, Pill, Activity, ChevronRight,
    Wifi, Users, Clock, Shield, Zap, AlertCircle, PhoneIncoming, Check, X, Save, Loader
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../App';

const TelehealthSession = ({ user }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [activeSideTab, setActiveSideTab] = useState('notes');
    const [duration, setDuration] = useState(0);

    // Note State
    const [noteContent, setNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'

    // Call Timer Simulation
    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock Data for Waiting Room / Queue
    const [waitingQueue, setWaitingQueue] = useState([
        { id: 1, name: "Suresh Raina", reason: "Chest Pain & Breathing Difficulty", urgency: "Critical", time: "2m ago" },
        { id: 2, name: "Priya Sharma", reason: "High Fever (104°F)", urgency: "Urgent", time: "10m ago" },
        { id: 3, name: "Rahul Verma", reason: "Follow-up: Diabetes", urgency: "Routine", time: "15m ago" },
        { id: 4, name: "Anjali Gupta", reason: "Mild Skin Rash", urgency: "Routine", time: "25m ago" }
    ]);

    const handleAccept = (id) => {
        alert(`Connecting to patient #${id}...`);
        setWaitingQueue(prev => prev.filter(p => p.id !== id));
    };

    const handleDecline = (id) => {
        setWaitingQueue(prev => prev.filter(p => p.id !== id));
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return;
        setIsSaving(true);
        setSaveStatus(null);

        try {
            await addDoc(collection(db, 'medical_records'), {
                type: 'consultation_note',
                title: 'Telehealth Session Note',
                description: noteContent,
                date: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                patientName: "Sarah Connor", // Simulated active patient
                patientId: "simulated_sarah_id",
                doctorId: user?.uid || 'unknown_doctor',
                doctorName: user?.displayName || 'Dr. User',
                isTelehealth: true
            });

            setSaveStatus('success');
            setNoteContent('');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error saving note:", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const getUrgencyColor = (u) => {
        switch (u) {
            case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'Urgent': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="h-[80vh] flex gap-6 overflow-hidden">
            {/* --- Main Video Stage (70%) --- */}
            <div className="flex-1 relative bg-black rounded-[2.5rem] border border-amber-500/20 shadow-2xl overflow-hidden group">
                {/* Simulated Video Feed Background */}
                <div className="absolute inset-0 bg-stone-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                    {/* Placeholder Avatar if Video Off */}
                    {isVideoOff && (
                        <div className="z-10 flex flex-col items-center gap-4 text-stone-500">
                            <div className="p-8 rounded-full bg-stone-800 border border-white/5">
                                <Users size={64} />
                            </div>
                            <p className="font-bold uppercase tracking-widest text-sm">Video Paused</p>
                        </div>
                    )}
                </div>

                {/* HUD: Top Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                Sarah Connor
                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-black uppercase tracking-widest animate-pulse">
                                    LIVE
                                </span>
                            </h2>
                            <p className="text-xs text-amber-500/70 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Wifi size={12} /> HD Connection • Encrypted
                            </p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-lg font-mono font-bold text-amber-400">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Vitals Overlay (Float) */}
                <div className="absolute top-24 left-6 z-20 space-y-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md w-32">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Heart Rate</p>
                        <div className="flex items-end gap-2 text-emerald-400">
                            <Activity size={18} className="animate-pulse" />
                            <span className="text-xl font-bold leading-none">72</span>
                            <span className="text-[10px]">BPM</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md w-32">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">SpO2</p>
                        <div className="flex items-end gap-2 text-amber-400">
                            <Zap size={18} />
                            <span className="text-xl font-bold leading-none">98</span>
                            <span className="text-[10px]">%</span>
                        </div>
                    </div>
                </div>

                {/* Call Controls (Bottom Center) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 p-4 rounded-[2rem] bg-stone-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    <button className="p-4 rounded-full bg-stone-800 text-stone-300 hover:bg-amber-500 hover:text-black transition-all">
                        <Monitor size={20} />
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <button className="px-8 py-4 rounded-full bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                        <PhoneOff size={18} /> End Call
                    </button>
                </div>
            </div>

            {/* --- Clinical Cockpit & Side Queue (30%) --- */}
            <div className="w-96 flex flex-col gap-6">
                {/* Cockpit Tabs */}
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
                    {[
                        { id: 'queue', icon: PhoneIncoming, label: 'Queue', count: waitingQueue.length },
                        { id: 'notes', icon: FileText, label: 'Notes' },
                        { id: 'rx', icon: Pill, label: 'Meds' },
                        { id: 'history', icon: Clock, label: 'Hist' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSideTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative ${activeSideTab === tab.id
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} className="mb-1" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Cockpit Content */}
                <div className="flex-1 glass-card p-6 rounded-[2rem] border border-amber-500/10 bg-black/40 backdrop-blur-xl relative overflow-hidden flex flex-col">

                    {/* --- QUEUE TAB --- */}
                    {activeSideTab === 'queue' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Users size={14} /> Waiting Room ({waitingQueue.length})
                                </h3>
                                <button className="text-[10px] text-stone-500 hover:text-white uppercase font-bold">Sort by Urgency</button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                {waitingQueue.length === 0 && (
                                    <div className="text-center py-10 text-stone-600 italic text-xs">
                                        No pending requests.
                                    </div>
                                )}
                                {waitingQueue.map(patient => (
                                    <div key={patient.id} className="p-4 rounded-xl bg-stone-900/40 border border-white/5 hover:bg-stone-900/60 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-sm">{patient.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getUrgencyColor(patient.urgency)}`}>
                                                {patient.urgency}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-400 mb-1">{patient.reason}</p>
                                        <p className="text-[10px] text-stone-600 font-mono mb-3">{patient.time}</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(patient.id)}
                                                className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-1">
                                                <Check size={12} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(patient.id)}
                                                className="px-3 py-1.5 rounded-lg bg-stone-800 border border-white/5 text-stone-400 text-[10px] font-bold hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* --- NOTES TAB --- */}
                    {activeSideTab === 'notes' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-full"
                        >
                            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <FileText size={14} /> Quick Clinical Note
                            </h3>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="flex-1 w-full bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-500/50 resize-none font-medium leading-relaxed custom-scrollbar"
                                placeholder="Type observations, symptoms, or instructions..."
                                autoFocus
                            ></textarea>

                            {saveStatus === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-center text-emerald-500 text-xs font-bold uppercase flex items-center justify-center gap-2">
                                    <Check size={14} /> Saved to Medical Records!
                                </motion.div>
                            )}

                            <button
                                onClick={handleSaveNote}
                                disabled={isSaving || !noteContent.trim()}
                                className={`mt-4 w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-stone-800 text-stone-500 cursor-wait' :
                                        !noteContent.trim() ? 'bg-stone-900 text-stone-600 cursor-not-allowed' :
                                            'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black shadow-lg hover:shadow-amber-500/20'
                                    }`}
                            >
                                {isSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                                {isSaving ? 'Saving...' : 'Save Entry'}
                            </button>
                        </motion.div>
                    )}

                    {/* --- RX TAB --- */}
                    {activeSideTab === 'rx' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-full"
                        >
                            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <Pill size={14} /> Quick Prescribe
                            </h3>
                            <div className="space-y-3 flex-1">
                                <input type="text" placeholder="Medication Name" className="w-full bg-amber-900/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-amber-500/30 focus:outline-none focus:border-amber-500/50" />
                                <input type="text" placeholder="Dosage (e.g. 500mg)" className="w-full bg-amber-900/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-amber-500/30 focus:outline-none focus:border-amber-500/50" />
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2 rounded-lg bg-stone-800 text-stone-400 text-[10px] font-bold uppercase border border-white/5 hover:border-amber-500/50 hover:text-amber-500">QD</button>
                                    <button className="py-2 rounded-lg bg-stone-800 text-stone-400 text-[10px] font-bold uppercase border border-white/5 hover:border-amber-500/50 hover:text-amber-500">BID</button>
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 mt-4">
                                Authorize Rx
                            </button>
                        </motion.div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeSideTab === 'history' && (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500">
                            <Clock size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-wider">Loading History...</p>
                        </div>
                    )}
                </div>

                {/* Security Badge */}
                <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/10 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                        <Shield size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">HIPAA Compliant</p>
                        <p className="text-[9px] text-emerald-500/50 font-medium">Session ID: #8292-XJ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelehealthSession;
