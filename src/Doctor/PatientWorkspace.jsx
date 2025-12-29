import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Activity, Calendar, FileText, Pill, Microscope,
<<<<<<< HEAD
    AlertCircle, Clock, File, Download, Search, MessageSquare
=======
    AlertCircle, CheckCircle, Clock, File, Download, Search, X, MessageSquare, Loader
>>>>>>> 4c7bd2d1fe0ddafac78f7a9e9f65ba361f072227
} from 'lucide-react';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// --- Sub-Components ---

const ClinicalHeader = ({ patient, onBack, onOpenChat }) => (
    <div className="glass-card mb-8 relative group"> {/* Removed overflow-hidden to prevent clipping interaction */}
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {patient.name}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${patient.status === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {patient.status}
                        </span>
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1 font-mono">
                        <span>ID: {patient.id}</span>
                        <span>•</span>
                        <span>{patient.age} Yrs / {patient.gender}</span>
                        <span>•</span>
                        <span>Blood: O+</span>
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
                            onOpenChat();
                        } else {
                            console.error("onOpenChat prop is missing!");
                            alert("Error: Chat function not connected.");
                        }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-105 active:scale-95 cursor-pointer select-none relative z-50"
                    style={{ pointerEvents: 'auto' }}
                >
                    <MessageSquare size={18} /> Open Chat
                </button>

                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                <div className="hidden md:flex gap-3">
                    <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} />
                        Allergy: Penicillin
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-2">
                        <Activity size={16} />
                        Diabetic (Type 2)
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TimelineItem = ({ date, title, type, doctor, details, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="relative pl-8 pb-8 border-l border-slate-700/50 last:border-0 last:pb-0 group"
    >
        <div className={`absolute -left-[17px] top-0 w-9 h-9 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg bg-slate-800 text-slate-400 group-hover:scale-110 transition-transform ${type === 'Diagnosis' ? 'bg-purple-500/20 text-purple-400' :
            type === 'Prescription' ? 'bg-sky-500/20 text-sky-400' :
                type === 'Lab' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800'
            }`}>
            {type === 'Diagnosis' ? <Activity size={16} /> :
                type === 'Prescription' ? <Pill size={16} /> :
                    type === 'Lab' ? <Microscope size={16} /> : <FileText size={16} />}
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-slate-200">{title}</h4>
                    <p className="text-xs text-slate-500">Dr. {doctor} • {type}</p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">{date}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{details}</p>
            {/* Attachment Chip */}
            {type === 'Lab' && (
                <button className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 text-xs text-sky-400 hover:text-sky-300 hover:border-sky-500/30 transition-all">
                    <File size={14} /> Report_Full.pdf <Download size={12} className="ml-auto opacity-50" />
                </button>
            )}
        </div>
    </motion.div>
);

const DocumentGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="aspect-[3/4] rounded-xl bg-slate-800/40 border border-white/5 hover:border-emerald-500/30 flex flex-col items-center justify-center gap-3 group cursor-pointer transition-all"
            >
                <div className="w-16 h-20 bg-slate-700/50 rounded-lg flex items-center justify-center shadow-inner group-hover:bg-emerald-500/10 transition-colors">
                    <FileText size={32} className="text-slate-500 group-hover:text-emerald-400" />
                </div>
                <div className="text-center px-2">
                    <p className="text-xs font-bold text-slate-300 truncate w-full">Blood_Work_Oct.pdf</p>
                    <p className="text-[10px] text-slate-500 mt-1">12 Oct 2023 • 2.4 MB</p>
                </div>
            </motion.div>
        ))}
    </div>
);

const PatientWorkspace = ({ patient, onBack, onOpenChat }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const db = getFirestore();

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
    }, [patient?.id, db]);

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
                onOpenChat={() => {
                    if (onOpenChat) onOpenChat(patient?.id);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left: Quick Navigation (Vertical Tabs for Workspace) */}
                <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                    <div className="glass-card p-2 rounded-2xl bg-[#1c1917] backdrop-blur-xl border border-stone-800 flex lg:flex-col overflow-x-auto lg:overflow-visible custom-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${isActive
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'text-stone-400 hover:text-amber-500 hover:bg-amber-500/5'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Vitals Summary */}
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-[#1c1917] to-[#292524] border border-stone-800 shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] space-y-4">
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Current Vitals</h3>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-sm">BP</span>
                            <span className="text-xl font-bold text-white">120/80</span>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-sm">Heart Rate</span>
                            <span className="text-xl font-bold text-emerald-400">72 <span className="text-xs text-stone-500 ml-1">bpm</span></span>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b border-stone-800">
                            <span className="text-stone-400 text-sm">Temp</span>
                            <span className="text-xl font-bold text-white">98.6 <span className="text-xs text-stone-500 ml-1">°F</span></span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-stone-400 text-sm">SpO2</span>
                            <span className="text-xl font-bold text-sky-400">98%</span>
                        </div>
                        <p className="text-[10px] text-stone-500 text-right mt-2">Last updated: 20 mins ago</p>
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
                            className="bg-slate-900/50 min-h-[500px] rounded-3xl"
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Charts / Graphs Placeholder */}
                                    <div className="glass-card p-8 rounded-2xl bg-slate-800/30 border border-white/5 flex flex-col items-center justify-center text-center h-64">
                                        <Activity size={48} className="text-emerald-500/50 mb-4" />
                                        <h3 className="text-lg font-bold text-white">Vitals Trend Analysis</h3>
                                        <p className="text-slate-400 max-w-md">Interactive sparklines and trend graphs will be visualized here to track patient progress over time.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass-card p-6 rounded-2xl bg-slate-800/30 border border-white/5">
                                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                                <Pill size={16} className="text-sky-400" /> Active Medications
                                            </h3>
                                            <ul className="space-y-3">
                                                <li className="flex justify-between text-sm p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                                    <span className="text-white font-medium">Metformin</span>
                                                    <span className="text-slate-400">500mg • BID</span>
                                                </li>
                                                <li className="flex justify-between text-sm p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                                    <span className="text-white font-medium">Lisinopril</span>
                                                    <span className="text-slate-400">10mg • OD</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="glass-card p-6 rounded-2xl bg-slate-800/30 border border-white/5">
                                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                                <Calendar size={16} className="text-amber-400" /> Upcoming
                                            </h3>
                                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                                <p className="text-amber-200 font-bold text-sm">Follow-up Consult</p>
                                                <p className="text-amber-500/70 text-xs mt-1">Tomorrow, 10:00 AM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="p-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                            <Loader size={40} className="animate-spin mb-4" />
                                            <p>Loading clinical timeline...</p>
                                        </div>
                                    ) : records.length > 0 ? (
                                        records.map((rec, i) => (
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
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                            <FileText size={40} className="mb-4 opacity-20" />
                                            <p>No clinical records found for this patient.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="p-4">
                                    {/* Search Bar for Docs */}
                                    <div className="flex gap-4 mb-6">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input type="text" placeholder="Search medical records..." className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-slate-200" />
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                                            <UploadIcon /> Upload
                                        </button>
                                    </div>
                                    <DocumentGrid />
                                </div>
                            )}

                            {/* Fallbacks */}
                            {activeTab === 'medications' && (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <Pill size={48} className="mb-4 opacity-20" />
                                    <p>Detailed medication history view coming soon.</p>
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
    <span className="flex items-center gap-2"><FileText size={16} /> Add Record</span>
);

export default PatientWorkspace;
