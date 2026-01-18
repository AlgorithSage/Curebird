import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, Monitor,
    MoreVertical, FileText, Pill, Activity, ChevronRight,
    Wifi, Users, Clock, Shield, Zap, AlertCircle, PhoneIncoming, Check, X, Save, Loader, Copy
 } from '../components/Icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const TelehealthSession = ({ user, patients = [] }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [activeSideTab, setActiveSideTab] = useState('notes');
    const [duration, setDuration] = useState(0);
    const [meetLink, setMeetLink] = useState(null);
    const [isCreatingMeet, setIsCreatingMeet] = useState(false);

    // Note State
    const [noteContent, setNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    const localVideoRef = React.useRef(null);
    const [stream, setStream] = useState(null);
    const [pc, setPc] = useState(null);
    const [callId, setCallId] = useState(null);

    // Initialize Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize Google Meet (Mock)
    const createCall = async () => {
        setIsCreatingMeet(true);
        // Simulate API delay
        setTimeout(() => {
            const mockMeetId = "abc-defg-hij";
            setCallId(mockMeetId);
            setMeetLink(`meet.google.com/${mockMeetId}`);
            setIsCreatingMeet(false);
        }, 1500);
    };

    // Toggle Handlers
    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!stream.getVideoTracks()[0].enabled);
        }
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const endCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (pc) {
            pc.close();
        }
        setStream(null);
        setPc(null);
        setCallId(null);
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        setIsVideoOff(false);
        setIsMuted(false);
    };

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




    // Waiting Room / Queue (Live Data)
    const [waitingQueue, setWaitingQueue] = useState([]);

    useEffect(() => {
        if (patients.length > 0) {
            // Map live patients to waiting queue format
            // Simulate urgency and time for demo purposes
            const queue = patients.slice(0, 4).map((p, i) => ({
                id: p.id,
                name: p.name,
                reason: p.condition || "General Consultation",
                urgency: i === 0 ? "Critical" : (i === 1 ? "Urgent" : "Routine"),
                time: `${(i + 1) * 5}m ago`
            }));
            setWaitingQueue(queue);
        }
    }, [patients]);

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
                {/* Live Video Feed */}
                <div className="absolute inset-0 bg-stone-900 flex items-center justify-center overflow-hidden">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                    {/* Placeholder Avatar if Video Off */}
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-4 text-stone-500 bg-stone-900/90 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <div className="p-6 rounded-full bg-stone-800 border border-white/5 shadow-inner">
                                    <Users size={48} />
                                </div>
                                <p className="font-bold uppercase tracking-widest text-xs">Video Paused</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* HUD: Top Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                {meetLink ? "Google Meet Session Active" : "Start Google Meet"}
                                {meetLink && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-black font-black uppercase tracking-widest animate-pulse">SECURED</span>}
                            </h2>
                            
                            {meetLink ? (
                                <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-stone-800/80 border border-white/10 backdrop-blur-md">
                                    <div className="flex items-center gap-2 px-2">
                                        <Video size={14} className="text-emerald-400" weight="fill" />
                                        <span className="text-xs font-mono text-emerald-100 tracking-wide">{meetLink}</span>
                                    </div>
                                    <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-stone-400 hover:text-white">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={12} className="text-amber-500" /> End-to-End Encrypted
                                    </p>
                                    <button 
                                        onClick={createCall}
                                        disabled={isCreatingMeet}
                                        className="mt-3 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        <Video size={16} weight="fill" />
                                        {isCreatingMeet ? "Creating Room..." : "Create Google Meet Room"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-lg font-mono font-bold text-amber-400">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Vitals Overlay (Float) */}
                <div className="absolute top-40 left-6 z-20 flex flex-col gap-6">
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md w-32 shadow-lg hover:bg-black/80 transition-all cursor-default">
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Activity size={10} className="text-emerald-500" /> Heart Rate
                        </p>
                        <div className="flex items-end gap-1 text-emerald-400">
                            <span className="text-xl font-black leading-none">72</span>
                            <span className="text-[9px] font-bold opacity-60 mb-0.5">BPM</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md w-32 shadow-lg hover:bg-black/80 transition-all cursor-default">
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Zap size={10} className="text-amber-500" /> SpO2
                        </p>
                        <div className="flex items-end gap-1 text-amber-400">
                            <span className="text-xl font-black leading-none">98</span>
                            <span className="text-[9px] font-bold opacity-60 mb-0.5">%</span>
                        </div>
                    </div>
                </div>

                {/* Call Controls (Bottom Center) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 p-4 rounded-[2rem] bg-stone-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    <button className="p-4 rounded-full bg-stone-800 text-stone-300 hover:bg-amber-500 hover:text-black transition-all">
                        <Monitor size={20} />
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <button
                        onClick={endCall}
                        className="px-8 py-4 rounded-full bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                    >
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
                                    <div key={patient.id} className="p-4 rounded-xl bg-[#0c0a05] border border-stone-800 hover:border-amber-500/30 transition-all group shadow-sm">
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
                                className="flex-1 w-full bg-[#0c0a05] border border-amber-500/30 rounded-xl p-4 text-sm text-amber-100 placeholder-amber-500/70 focus:outline-none focus:border-amber-500/60 resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
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
                                <input type="text" placeholder="Medication Name" className="w-full bg-[#0c0a05] border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-amber-500/70 focus:outline-none focus:border-amber-500/60 shadow-inner" />
                                <input type="text" placeholder="Dosage (e.g. 500mg)" className="w-full bg-[#0c0a05] border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-amber-500/70 focus:outline-none focus:border-amber-500/60 shadow-inner" />
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
                        <div className="flex flex-col h-full bg-transparent">
                            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <Clock size={14} /> Recent Clinical Activity
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                {patients.length === 0 && (
                                    <p className="text-xs text-stone-500 italic">No patient history found.</p>
                                )}
                                {patients.slice(0, 5).map((patient, idx) => {
                                    // Deterministic "Mock" History based on patient index for demo
                                    const types = ['note', 'rx', 'lab', 'emergency'];
                                    const type = types[idx % 4];
                                    let title = 'General Checkup';
                                    let desc = 'Patient stable. Vitals within normal limits.';

                                    if (type === 'rx') { title = 'Prescription: Ibuprofen'; desc = '400mg - TID for pain management.'; }
                                    else if (type === 'lab') { title = 'Blood Panel Results'; desc = 'WBC count slightly elevated. Monitor.'; }
                                    else if (type === 'emergency') { title = 'Emergency Admission'; desc = 'Admitted for acute respiratory distress.'; }

                                    return (
                                        <div key={patient.id} className="p-4 rounded-xl bg-[#0c0a05] border border-stone-800 hover:border-amber-500/30 transition-all group shadow-sm flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/70 border border-amber-500/10 px-1.5 py-0.5 rounded">{type}</span>
                                                <span className="text-[10px] font-bold text-stone-500">Today</span>
                                            </div>
                                            <div className="flex justify-between items-baseline mt-1">
                                                <h4 className="font-bold text-stone-200 text-xs truncate max-w-[70%]">{title}</h4>
                                                <span className="text-[9px] text-stone-600 font-bold uppercase truncate max-w-[25%]">{patient.name}</span>
                                            </div>
                                            <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">{desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
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
