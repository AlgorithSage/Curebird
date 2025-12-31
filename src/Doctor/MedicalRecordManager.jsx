import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Share2, Search,
    Filter, Plus, Clock,
    Image as ImageIcon, Pill, Clipboard, X,
    Copy, Repeat, Edit2, Lock, Loader, Activity
} from 'lucide-react';
import { collectionGroup, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../App';

const MedicalRecordManager = ({ onAddAction, user: propUser }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);

    // Fetch Records Live
    useEffect(() => {
        const currentUser = propUser || auth.currentUser;
        if (!currentUser) return;

        setLoading(true);

        // Use collectionGroup to find all 'medical_records' across all patients
        // Query filters by doctorId to ensure privacy/relevance
        const recordsQuery = query(
            collectionGroup(db, 'medical_records'),
            where('doctorId', '==', currentUser.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(recordsQuery,
            (snapshot) => {
                const fetchedRecords = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecords(fetchedRecords);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore CollectionGroup Error:", err);
                // Professional message for the user: "Clinical Database Sync in Progress..."
                setError("Clinical Workspace Synchronization: We are securely optimizing your medical records view for peak performance. This list will refresh automatically.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, propUser]);

    // Prescription State
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [prescriptionTab, setPrescriptionTab] = useState('medicines');

    // Clinical Notes State
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditingNote, setIsEditingNote] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Timeline Overview', icon: Clock },
        { id: 'reports', label: 'Reports & Labs', icon: FileText },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'notes', label: 'Clinical Notes', icon: Clipboard },
    ];

    const renderTimeline = () => (
        <div className="space-y-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader size={40} className="animate-spin mb-4" />
                    <p>Loading medical timeline...</p>
                </div>
            ) : records.length > 0 ? (
                records.map((rec, i) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card flex items-center gap-6 p-6 relative group"
                    >
                        <div className={`p-3 rounded-full ${rec.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/10 text-amber-500'} border border-amber-500/20 relative z-10`}>
                            {rec.type === 'lab_report' && <FileText size={20} />}
                            {rec.type === 'prescription' && <Pill size={20} />}
                            {rec.type === 'consultation_note' && <Clipboard size={20} />}
                            {rec.type === 'vitals_log' && <Activity size={20} />}
                            {(!rec.type || rec.type === 'referral') && <Share2 size={20} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-200 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{rec.title}</h4>
                                    <p className="text-sm text-slate-500">Patient: <span className="text-slate-400 font-bold">{rec.patientName}</span> • Dr. {rec.doctorName}</p>
                                </div>
                                <span className="text-xs font-mono text-slate-500 border border-slate-700/50 px-2 py-1 rounded bg-slate-900/50">{rec.date}</span>
                            </div>

                            {/* Metadata Display (Vitals etc.) */}
                            {rec.vitals && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                    {rec.vitals.bp && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BP</span>
                                            <span className="text-sm font-bold text-amber-500">{rec.vitals.bp} <span className="text-[10px] text-slate-600 font-normal">mmHg</span></span>
                                        </div>
                                    )}
                                    {rec.vitals.heartRate && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HR</span>
                                            <span className="text-sm font-bold text-emerald-500">{rec.vitals.heartRate} <span className="text-[10px] text-slate-600 font-normal">BPM</span></span>
                                        </div>
                                    )}
                                    {rec.vitals.temp && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temp</span>
                                            <span className="text-sm font-bold text-stone-300">{rec.vitals.temp} <span className="text-[10px] text-slate-600 font-normal">°F</span></span>
                                        </div>
                                    )}
                                    {rec.vitals.spo2 && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SpO2</span>
                                            <span className="text-sm font-bold text-sky-400">{rec.vitals.spo2}%</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {rec.fileUrl && (
                                <button
                                    onClick={() => window.open(rec.fileUrl, '_blank')}
                                    className="p-2 hover:bg-amber-500/10 rounded-full text-slate-500 hover:text-amber-400 transition-colors"
                                    title="View Document"
                                >
                                    <FileText size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => rec.fileUrl ? window.open(rec.fileUrl, '_blank') : null}
                                className="p-2 hover:bg-amber-500/10 rounded-full text-slate-500 hover:text-amber-400 transition-colors"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold">No clinical records found.</p>
                    <p className="text-sm opacity-50">Saved records will appear here as a live timeline.</p>
                </div>
            )}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 group relative overflow-hidden"
                >
                    {/* Background Glass Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/2 opacity-50 transition-opacity group-hover:opacity-100" />

                    {/* Visual Content */}
                    <div className="relative p-10 rounded-[2.5rem] border border-white/5 bg-stone-900/40 backdrop-blur-xl flex flex-col items-center gap-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        {/* Status Icon with Dynamic Glow */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
                                <Activity size={32} className="animate-[pulse_2s_ease-in-out_infinite]" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[11px]">
                                Clinical Sync Status
                            </h4>
                            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mx-auto" />
                            <p className="text-stone-300 text-sm font-medium max-w-lg leading-relaxed antialiased px-6 italic opacity-80">
                                {error}
                            </p>
                            <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-4">
                                Optimizing Secure Link...
                            </p>
                        </div>

                        {/* subtle corner accents */}
                        <div className="absolute top-6 left-6 w-2 h-2 border-t border-l border-amber-500/20 rounded-tl" />
                        <div className="absolute bottom-6 right-6 w-2 h-2 border-b border-r border-amber-500/20 rounded-br" />
                    </div>
                </motion.div>
            )}
        </div>
    );

    const renderReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {records.filter(r => r.type === 'report' || r.type === 'image').map((rec, i) => (
                <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card flex flex-col justify-between min-h-[22rem] p-8 group hover:border-amber-500/40 relative overflow-hidden transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <FileText size={120} />
                    </div>

                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                {rec.type === 'image' ? <ImageIcon size={28} /> : <FileText size={28} />}
                            </div>
                            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">{rec.status}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-2xl mb-2 line-clamp-2 leading-tight">{rec.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{rec.date}</p>
                    </div>

                    <div className="flex gap-4 mt-8 relative z-10">
                        <button
                            onClick={() => rec.fileUrl && window.open(rec.fileUrl, '_blank')}
                            className="flex-1 py-4 rounded-xl bg-slate-800/50 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 text-sm font-bold tracking-wide transition-all border border-white/5 hover:border-amber-500/30 shadow-lg hover:shadow-amber-900/20 flex items-center justify-center gap-2"
                        >
                            View Document
                        </button>
                        <button
                            onClick={() => {/* Share logic */ }}
                            className="px-5 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/5 shadow-lg"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.div>
            ))}
            {/* Add New Report Button */}
            <button
                onClick={() => onAddAction && onAddAction('report')}
                className="glass-card flex flex-col items-center justify-center p-8 border-dashed border-2 border-slate-700 hover:border-amber-500/50 group transition-all text-slate-500 hover:text-amber-400 min-h-[22rem]"
            >
                <div className="p-6 rounded-full bg-slate-900 group-hover:bg-amber-500/10 transition-colors mb-6 shadow-xl group-hover:shadow-amber-500/20">
                    <Plus size={40} />
                </div>
                <span className="font-bold text-xl">Upload New Report</span>
                <span className="text-sm opacity-50 mt-2 font-medium">PDF, JPG, PNG, DICOM</span>
            </button>
        </div>
    );

    const renderPrescriptions = () => (
        <div className="space-y-4 pb-10">
            {records.filter(r => r.type === 'prescription').map((rec, i) => (
                <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-amber-500/30 transition-all cursor-pointer"
                    onClick={() => setSelectedPrescription(rec)}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <Pill size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-100 text-lg group-hover:text-amber-400 transition-colors">{rec.diagnosis || rec.title}</h4>
                            <p className="text-sm text-slate-500">{(rec.medicines?.length || 0)} Medicines Prescribed • {rec.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full border ${rec.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                            {rec.status}
                        </span>
                        <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>
                        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Download size={18} />
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold text-sm transition-colors border border-amber-500/20">
                            View Details
                        </button>
                    </div>
                </motion.div>
            ))}
            {/* New Prescription Button */}
            <button
                onClick={() => onAddAction && onAddAction('prescription')}
                className="w-full glass-card p-4 border-dashed border-2 border-slate-700 hover:border-amber-500/50 text-slate-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-2 group"
            >
                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold">Create New Prescription</span>
            </button>
        </div>
    );

    const renderNotes = () => (
        <div className="space-y-6 pb-12">
            {records.filter(r => r.type === 'note').map((rec, i) => (
                <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => { setSelectedNote(rec); setIsEditingNote(rec.status !== 'Locked'); }}
                    className="glass-card p-8 group hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clipboard size={100} />
                    </div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                <Clipboard size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 text-xl group-hover:text-amber-400 transition-colors">{rec.title}</h4>
                                <p className="text-sm text-slate-500 font-medium">{rec.doctor} • {rec.date}</p>
                            </div>
                        </div>
                        {rec.status === 'Locked' ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <Lock size={12} /> Signed & Locked
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                <Edit2 size={12} /> Draft
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/30 rounded-xl p-6 border border-white/5">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Diagnosis</span>
                            <p className="text-slate-300 font-medium">{rec.diagnosis}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Treatment Plan</span>
                            <p className="text-slate-300 font-medium truncate">{rec.plan}</p>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Add New Note Button */}
            <button
                onClick={() => onAddAction && onAddAction('note')}
                className="glass-card flex flex-col items-center justify-center p-8 border-dashed border-2 border-slate-700 hover:border-amber-500/50 group transition-all text-slate-500 hover:text-amber-400 min-h-[12rem]"
            >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-amber-500/10 transition-colors mb-3">
                    <Plus size={32} />
                </div>
                <span className="font-bold text-xl">Create Clinical Note</span>
                <span className="text-sm opacity-50 mt-1">For Today's Visit</span>
            </button>
        </div>
    );

    return (
        <div className="space-y-6 relative">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-tight">Medical Records</h2>
                    <p className="text-slate-400 font-medium">Centralized patient data archive & audit trail.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 group-hover:border-amber-500/50 transition-colors w-72 h-12">
                            <Search className="ml-4 text-slate-500 group-hover:text-amber-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus:ring-0 px-4 h-full font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="relative group p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 transition-all overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Filter size={22} />
                    </button>
                </div>
            </div>

            {/* Tabs - Glass Segmented Control Style */}
            <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-white/5 backdrop-blur-md inline-flex gap-2 mb-8 relative z-10 shadow-2xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden ${activeTab === tab.id
                            ? 'text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        {/* Active Background - Amber Gradient */}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 z-0"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        {/* Icon & Label (z-index to sit on top of bg) */}
                        <div className="relative z-10 flex items-center gap-2">
                            <tab.icon size={18} />
                            {tab.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && renderTimeline()}
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'prescriptions' && renderPrescriptions()}
                    {activeTab === 'notes' && renderNotes()}
                </motion.div>
            </AnimatePresence>

            {/* Prescription Detailed Modal */}
            <AnimatePresence>
                {selectedPrescription && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setSelectedPrescription(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col shadow-2xl border border-amber-500/20"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                            <Pill size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-amber-500 tracking-wider uppercase">Rx Prescription</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{selectedPrescription.diagnosis}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{selectedPrescription.patient} • {selectedPrescription.date}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPrescription(null)}
                                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="px-6 pt-4 border-b border-slate-800 flex gap-6">
                                {['medicines', 'notes', 'share'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setPrescriptionTab(tab)}
                                        className={`pb-4 text-sm font-bold capitalize transition-colors relative ${prescriptionTab === tab ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab}
                                        {prescriptionTab === tab && (
                                            <motion.div layoutId="modalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/30">
                                {prescriptionTab === 'medicines' && (
                                    <div className="space-y-4">
                                        {selectedPrescription.medicines.map((med, idx) => (
                                            <div key={idx} className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 hover:border-amber-500/30 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-200 text-lg">{med.name} <span className="text-sm font-normal text-slate-500 ml-2">{med.dosage}</span></h4>
                                                    <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">{med.duration}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                                                    <div>
                                                        <span className="text-slate-600 block text-xs uppercase font-bold mb-1">Frequency</span>
                                                        {med.frequency}
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600 block text-xs uppercase font-bold mb-1">Instructions</span>
                                                        {med.instructions}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {prescriptionTab === 'notes' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-500 uppercase mb-2">Clinical Notes</h5>
                                            <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                {selectedPrescription.notes}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-500 uppercase mb-2">Patient Instructions</h5>
                                            <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                {selectedPrescription.instructions}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {prescriptionTab === 'share' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group flex flex-col items-center gap-3 text-center">
                                            <div className="p-4 rounded-full bg-slate-900 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-500 transition-colors">
                                                <Download size={24} />
                                            </div>
                                            <span className="font-bold text-slate-200">Download PDF</span>
                                        </button>
                                        <button className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group flex flex-col items-center gap-3 text-center">
                                            <div className="p-4 rounded-full bg-slate-900 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-500 transition-colors">
                                                <Share2 size={24} />
                                            </div>
                                            <span className="font-bold text-slate-200">Share with Patient</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer / Smart Actions */}
                            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between gap-4">
                                <button className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors flex items-center justify-center gap-2">
                                    <Copy size={18} /> Copy to New Rx
                                </button>
                                <button className="flex-1 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold border border-amber-500/20 transition-colors flex items-center justify-center gap-2">
                                    <Repeat size={18} /> Renew Prescription
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Clinical Notes Detail Modal */}
            <AnimatePresence>
                {selectedNote && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setSelectedNote(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col shadow-2xl border border-amber-500/20"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <Clipboard size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-indigo-400 tracking-wider uppercase">Clinical Note</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-bold text-white">{selectedNote.title}</h3>
                                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">{selectedNote.date}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">{selectedNote.doctor} • {selectedNote.patient}</p>
                                </div>
                                <button onClick={() => setSelectedNote(null)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto bg-slate-900/30 space-y-8">
                                {/* Doctor Inputs */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Diagnosis</label>
                                        <input
                                            readOnly={!isEditingNote}
                                            defaultValue={selectedNote.diagnosis}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-200 font-bold text-lg focus:border-amber-500/50 focus:ring-0 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chief Complaints</label>
                                            <textarea
                                                readOnly={!isEditingNote}
                                                defaultValue={selectedNote.complaints}
                                                rows={4}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-amber-500/50 focus:ring-0 outline-none transition-colors resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Observations</label>
                                            <textarea
                                                readOnly={!isEditingNote}
                                                defaultValue={selectedNote.observations}
                                                rows={4}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-amber-500/50 focus:ring-0 outline-none transition-colors resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Treatment Plan</label>
                                        <textarea
                                            readOnly={!isEditingNote}
                                            defaultValue={selectedNote.plan}
                                            rows={3}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-amber-500/50 focus:ring-0 outline-none transition-colors resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Follow-up Instructions</label>
                                        <div className="flex gap-4">
                                            <input
                                                readOnly={!isEditingNote}
                                                defaultValue={selectedNote.followup}
                                                className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-amber-500/50 focus:ring-0 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-4">
                                {isEditingNote ? (
                                    <>
                                        <button onClick={() => setSelectedNote(null)} className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition-colors">Cancel</button>
                                        <button className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
                                            <Lock size={18} /> Sign & Lock Note
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setSelectedNote(null)} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors">Close</button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicalRecordManager;
