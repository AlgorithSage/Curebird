import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Activity, Calendar, FileText, Pill, Microscope,
    AlertCircle, Clock, File, Download, Search, MessageSquare, Loader, Droplets
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// --- Sub-Components ---

const ClinicalHeader = ({ patient, onBack, onOpenChat }) => (
    <div className="glass-card mb-8 relative group"> {/* Removed overflow-hidden to prevent clipping interaction */}
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-stone-900 border border-white/5 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {patient.name}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${patient.status === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {patient.status || 'Stable'}
                        </span>
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-stone-400 mt-1 font-mono font-bold uppercase tracking-wider">
                        <span>ID: {patient.id?.slice(0, 8) || 'N/A'}</span>
                        <span>•</span>
                        <span>{patient.age || '--'} Yrs / {patient.gender || '--'}</span>
                        <span>•</span>
                        <span>Blood: {patient.bloodType || '--'}</span>
                    </div>
                </div>
            </div>

            {/* Actions & Alerts */}
            <div className="flex gap-3 items-center relative z-20">
                {/* Open Chat Button - Explicitly styled for interaction */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // alert("DEBUG: Open Chat Clicked " + patient.id); // Uncomment for hard debug
                        console.log("Attempting to open chat for:", patient.id);
                        if (onOpenChat) {
                            onOpenChat(patient); // Pass full object
                        } else {
                            console.error("onOpenChat prop is missing!");
                        }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-50 transition-all"
                    style={{ pointerEvents: 'auto' }}
                >
                    <MessageSquare size={18} /> Open Chat
                </button>

                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                <div className="hidden md:flex gap-3">
                    {patient.allergies && (
                        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle size={16} />
                            Allergy: {patient.allergies}
                        </div>
                    )}
                    {patient.condition && (
                        <div className="px-4 py-2 rounded-xl bg-stone-900 border border-white/5 text-stone-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} />
                            {patient.condition}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const TimelineItem = ({ date, title, type, doctor, details, delay, data }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="relative pl-8 pb-8 border-l border-stone-800 last:border-0 last:pb-0 group"
    >
        <div className={`absolute -left-[17px] top-0 w-9 h-9 rounded-full border-4 border-[#0c0a05] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${type === 'Diagnosis' ? 'bg-amber-500/20 text-amber-500' :
            type === 'Prescription' ? 'bg-amber-500/20 text-amber-400' :
                type === 'Lab' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
            }`}>
            {type === 'Diagnosis' ? <Activity size={16} /> :
                type === 'Prescription' ? <Pill size={16} /> :
                    type === 'Lab' ? <Microscope size={16} /> : <FileText size={16} />}
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-stone-900/40 hover:bg-stone-900/60 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-white tracking-tight">{title}</h4>
                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1">Dr. {doctor} • {type}</p>
                </div>
                <span className="text-[10px] font-black text-amber-500/50 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10 uppercase tracking-widest">{date}</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed font-medium">{details}</p>

            {/* Metadata (Vitals) */}
            {data?.vitals && (
                <div className="mt-4 flex flex-wrap gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    {data.vitals.bp && <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">BP: {data.vitals.bp}</div>}
                    {data.vitals.heartRate && <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">HR: {data.vitals.heartRate}</div>}
                    {data.vitals.spo2 && <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-300/10 px-2 py-1 rounded-md border border-amber-300/20">SpO2: {data.vitals.spo2}%</div>}
                </div>
            )}

            {/* Attachment Chip */}
            {data?.fileUrl && (
                <button
                    onClick={() => window.open(data.fileUrl, '_blank')}
                    className="mt-4 flex items-center gap-3 px-4 py-2 rounded-xl bg-stone-950 border border-white/5 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-white hover:border-amber-500/30 transition-all group/btn"
                >
                    <File size={14} /> {data.fileName || 'View Attachment'} <Download size={12} className="ml-auto opacity-30 group-hover/btn:opacity-100 transition-opacity" />
                </button>
            )}
        </div>
    </motion.div>
);

const DocumentGrid = ({ records }) => {
    // Filter only records with file URLs
    const docs = records.filter(r => r.fileUrl);

    if (docs.length === 0) return (
        <div className="text-center py-20 text-stone-600">
            <p className="text-xs uppercase tracking-widest">No documents found</p>
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {docs.map((doc, i) => (
                <motion.div
                    key={doc.id}
                    whileHover={{ y: -8 }}
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="aspect-[3/4] rounded-2xl bg-stone-900 border border-white/5 hover:border-amber-500/30 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all p-4"
                >
                    <div className="w-16 h-20 bg-stone-800 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-amber-500/10 transition-colors">
                        <FileText size={32} className="text-stone-600 group-hover:text-amber-500" />
                    </div>
                    <div className="text-center w-full">
                        <p className="text-[11px] font-bold text-white truncate w-full group-hover:text-amber-400 transition-colors">{doc.fileName || 'Document'}</p>
                        <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mt-1">{doc.date}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const PatientWorkspace = ({ patient, onBack, onOpenChat, onAddAction }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patient?.id) return;
        setLoading(true);

        const recordsRef = collection(db, `users/${patient.id}/medical_records`);
        const q = query(recordsRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecords(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching patient records:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [patient?.id]);

    // Derived Data
    const latestVitalsRecord = records.find(r => r.vitals);
    const latestVitals = latestVitalsRecord?.vitals || {};

    // Find all unique medications mentioned in records
    // This is a naive extraction. In a real app, meds would be a separate collection or strictly structured.
    // Here we'll look for records of type 'prescription' or records with 'medications' array.
    const medicationRecords = records
        .filter(r => r.medications && Array.isArray(r.medications))
        .flatMap(r => r.medications);

    // Deduplicate meds by name
    const activeMeds = Array.from(new Map(medicationRecords.map(m => [m.name, m])).values());


    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'timeline', label: 'Clinical Timeline', icon: Clock },
        { id: 'medications', label: 'Active Meds', icon: Pill },
        { id: 'reports', label: 'Lab Reports', icon: Microscope },
    ];

    return (
        <div className="min-h-full pb-12 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <ClinicalHeader
                patient={patient}
                onBack={onBack}
                onOpenChat={onOpenChat}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left: Quick Navigation (Vertical Tabs for Workspace) */}
                <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                    <div className="glass-card p-2 rounded-3xl bg-[#0c0a05] border border-stone-800 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all whitespace-nowrap relative ${isActive
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 animated-border z-10'
                                        : 'text-stone-500 hover:text-amber-500 hover:bg-amber-500/5'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-black' : 'text-stone-400 group-hover:text-amber-500'} />
                                    <span className={`font-black text-[11px] uppercase tracking-[0.2em] ${isActive ? 'text-black' : 'text-stone-500'}`}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Vitals Summary (Dynamic) */}
                    <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-[#1c1917] to-[#0c0a05] border border-stone-800 shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] space-y-5 animated-border">
                        <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-widest mb-4">Current Vitals</h3>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-xs font-bold font-mono tracking-tighter">BP</span>
                            <span className="text-xl font-bold text-white">{latestVitals.bp || '--/--'}</span>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-xs font-bold font-mono tracking-tighter">Heart Rate</span>
                            <span className="text-xl font-bold text-amber-500">{latestVitals.heartRate || '--'} <span className="text-[10px] text-stone-600 ml-1">bpm</span></span>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-xs font-bold font-mono tracking-tighter">Temp</span>
                            <span className="text-xl font-bold text-white">{latestVitals.temperature || '--'} <span className="text-[10px] text-stone-600 ml-1">°F</span></span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-stone-400 text-xs font-bold font-mono tracking-tighter">SpO2</span>
                            <span className="text-xl font-bold text-amber-400 font-mono">{latestVitals.spo2 || '--'}%</span>
                        </div>
                        <p className="text-[9px] font-black text-stone-600 text-right mt-2 uppercase tracking-widest grayscale opacity-50">
                            {latestVitalsRecord ? `Updated: ${latestVitalsRecord.date}` : 'No recent data'}
                        </p>
                    </div>
                </div>

                {/* Right: Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-black/20 min-h-[500px] rounded-3xl"
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* Charts / Graphs Placeholder */}
                                    <div className="glass-card p-12 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center justify-center text-center h-[350px] animated-border">
                                        <div className="p-6 rounded-3xl bg-amber-500/10 text-amber-500 mb-6 border border-amber-500/20 shadow-2xl animate-pulse">
                                            <Activity size={64} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Vitals Trend Analysis</h3>
                                        <p className="text-stone-500 max-w-md mt-2 text-sm font-medium">Interactive sparklines and trend graphs will be visualized here to track patient progress over time.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="glass-card p-8 rounded-3xl bg-stone-900 border border-white/5">
                                            <h3 className="text-[10px] font-black text-stone-500 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <Pill size={16} className="text-amber-500" /> Active Medications
                                            </h3>
                                            <ul className="space-y-4">
                                                {activeMeds.length > 0 ? activeMeds.map((med, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-amber-500/20 transition-all cursor-default">
                                                        <span className="text-white font-bold">{med.name}</span>
                                                        <span className="text-stone-400 font-medium">
                                                            {typeof med.dosage === 'object' ? (med.dosage.dosage || JSON.stringify(med.dosage)) : med.dosage} • {med.freq}
                                                        </span>
                                                    </li>
                                                )) : (
                                                    <li className="text-stone-500 text-xs italic">No active medications recorded.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="glass-card p-8 rounded-3xl bg-stone-900 border border-white/5">
                                            <h3 className="text-[10px] font-black text-stone-500 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <Calendar size={16} className="text-amber-400" /> Upcoming
                                            </h3>
                                            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                                <p className="text-amber-400 font-extrabold text-base uppercase tracking-tight">Follow-up Consult</p>
                                                <p className="text-amber-500/50 text-[10px] font-black mt-1 uppercase tracking-widest">Tomorrow, 10:00 AM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="p-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-stone-600">
                                            <Loader size={48} className="animate-spin mb-6 opacity-30" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Loading clinical timeline...</p>
                                        </div>
                                    ) : records.length > 0 ? (
                                        <div className="max-w-4xl mx-auto space-y-2">
                                            {records.map((rec, i) => (
                                                <TimelineItem
                                                    key={rec.id}
                                                    delay={i * 0.1}
                                                    date={rec.date}
                                                    title={rec.title}
                                                    type={rec.type === 'consultation_note' ? 'Diagnosis' :
                                                        rec.type === 'prescription' ? 'Prescription' :
                                                            rec.type === 'lab_report' ? 'Lab' : 'General'}
                                                    doctor={rec.doctorName || 'Doctor'}
                                                    details={rec.description}
                                                    data={rec}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 text-stone-700">
                                            <FileText size={48} className="mb-6 opacity-10" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No clinical records found.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="p-6">
                                    {/* Search Bar for Docs */}
                                    <div className="flex gap-4 mb-8">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                                            <input type="text" placeholder="SEARCH MEDICAL RECORDS..." className="w-full bg-stone-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-stone-700" />
                                        </div>
                                        <button
                                            onClick={() => onAddAction && onAddAction('report')}
                                            className="px-8 py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95"
                                        >
                                            <UploadIcon />
                                        </button>
                                    </div>
                                    <DocumentGrid records={records} />
                                </div>
                            )}

                            {/* Fallbacks */}
                            {activeTab === 'medications' && (
                                <div className="flex flex-col items-center justify-center h-[500px] text-stone-700">
                                    <div className="p-8 rounded-full bg-stone-900 border border-white/5 mb-8">
                                        <Pill size={64} className="opacity-10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Medication history expansion pending.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};


// Helper for 'Upload' icon since lucide might not have 'UploadIcon' directly named that way in my mental map, using generic
const UploadIcon = () => (
    <span className="flex items-center gap-3"><FileText size={18} /> Add Record</span>
);

export default PatientWorkspace;
