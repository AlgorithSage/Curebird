import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Share2, Search,
    Plus, Clock,
    Pill, Clipboard, X,
    Loader, ChevronRight,
    CheckCircle2, AlertCircle
 } from '../components/Icons';
import { collection, collectionGroup, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MedicalRecordManager = ({ onAddAction, user: propUser }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);

    // View State
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Fetch Records Live
    useEffect(() => {
        const currentUser = propUser || auth.currentUser;

        setLoading(true);

        const getMockRecords = () => [
            {
                id: 'mock_note_1',
                type: 'consultation_note',
                title: 'Telehealth Session Note',
                description: 'Patient presented with mild chest discomfort. BP 120/80. Recommended rest and hydration. Scheduled follow-up in 2 days.',
                date: new Date().toISOString().split('T')[0],
                patientName: 'Demo Patient',
                doctorName: propUser?.displayName || 'Sohan Ghosh',
                priority: 'urgent',
                vitals: { bp: '120/80', heartRate: '72', spo2: '98' }
            },
            {
                id: 'mock_rx_1',
                type: 'prescription',
                title: 'Amoxicillin 500mg',
                description: 'Take one capsule three times a day for 7 days.',
                date: '2023-10-26',
                patientName: 'Demo Patient',
                doctorName: propUser?.displayName || 'Sohan Ghosh',
                priority: 'routine'
            },
            {
                id: 'mock_lab_1',
                type: 'lab_report',
                title: 'Complete Blood Count (CBC)',
                description: 'Hemoglobin: 14.5 g/dL, WBC: 6.5, Platelets: 250k. All values within normal range.',
                date: '2023-10-25',
                patientName: 'Demo Patient',
                doctorName: propUser?.displayName || 'Sohan Ghosh',
                priority: 'routine'
            }
        ];

        let unsubscribe = () => { };

        if (currentUser) {
            // Simplify query to avoid compilation index requirements for the demo
            // We'll sort client-side
            const recordsQuery = query(
                collection(db, 'medical_records'),
                where('doctorId', '==', currentUser.uid)
            );

            unsubscribe = onSnapshot(recordsQuery,
                (snapshot) => {
                    const fetchedRecords = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Client-side sort by date (descending)
                    fetchedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

                    // FILTER OUT LEGACY HARDCODED RECORDS (Aggressive by Title)
                    // We renamed new ones to 'Smart Clinical Analysis', so we can safely hide this old title.
                    const cleanRecords = fetchedRecords.filter(r => r.title !== 'AI Clinical Analysis Report');

                    if (cleanRecords.length > 0) {
                        setRecords(cleanRecords);
                    } else {
                        // Keep mocks if truly empty, or maybe we should show empty state?
                        // For now, let's append mocks if empty so the UI isn't blank, 
                        // OR just setRecords(fetchedRecords) if we want to trust the DB.
                        // Let's mix them or just prefer DB. 
                        // Since user wants to see their NEW record, if we show mocks when fetch is empty, that's fine.
                        // But if fetch has 1 record (the new one), we show that.
                        setRecords(cleanRecords);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error("Firestore Error:", err);
                    setRecords(getMockRecords()); // Fallback only on error
                    setLoading(false);
                }
            );
        } else {
            setRecords(getMockRecords());
            setLoading(false);
        }

        return () => unsubscribe();
    }, [propUser]);

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
    };

    const tabs = [
        { id: 'overview', label: 'Timeline Overview', icon: Clock },
        { id: 'reports', label: 'Reports & Labs', icon: FileText },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'notes', label: 'Clinical Notes', icon: Clipboard },
    ];

    return (
        <div className="space-y-6 relative">

            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <h2 className="text-3xl font-bold text-amber-500">Medical Records</h2>
                <p className="text-stone-500">Centralized patient data archive & audit trail.</p>
            </div>

            {/* --- RECORD DETAIL MODAL --- */}
            <AnimatePresence>
                {selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-stone-900 border border-amber-500/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 bg-stone-900/50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${selectedRecord.type === 'consultation_note' ? 'bg-amber-500/10 text-amber-500' : 'bg-stone-800 text-stone-400'}`}>
                                            {selectedRecord.type === 'consultation_note' ? <Clipboard size={20} /> : <FileText size={20} />}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                                            {selectedRecord.type === 'consultation_note' ? 'Clinical Note' : 'Medical Record'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{selectedRecord.title}</h3>
                                    <p className="text-sm text-stone-400 mt-1">Patient: <span className="text-white font-medium">{selectedRecord.patientName}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="p-2 hover:bg-white/10 rounded-full text-stone-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#0c0a05]">
                                <div className="prose prose-invert max-w-none">
                                    {selectedRecord.type === 'consultation_note' ? (
                                        <div className="whitespace-pre-wrap text-stone-300 font-sans text-base leading-relaxed">
                                            {selectedRecord.description}
                                        </div>
                                    ) : (
                                        <>
                                            {selectedRecord.vitals && selectedRecord.findings ? (
                                                <div className="space-y-6">
                                                    {/* Summary Box */}
                                                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                                                        <h4 className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                                                            <CheckCircle2 size={18} /> Analysis Summary
                                                        </h4>
                                                        <p className="text-cyan-100/80 text-sm leading-relaxed">
                                                            {selectedRecord.description}
                                                        </p>
                                                    </div>

                                                    {/* Vitals Grid */}
                                                    <div>
                                                        <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Extracted Vitals</h5>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {selectedRecord.vitals.map((vital, i) => (
                                                                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col">
                                                                    <span className="text-[10px] text-stone-500 uppercase font-bold">{vital.label}</span>
                                                                    <span className="text-lg font-bold text-white">{vital.value}</span>
                                                                    {vital.status === 'high' && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> High</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Findings List */}
                                                    <div>
                                                        <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Key Clinical Findings</h5>
                                                        <div className="space-y-2">
                                                            {selectedRecord.findings.map((item, i) => (
                                                                <div key={i} className="flex items-start gap-3 p-3 bg-stone-900/50 rounded-lg border border-white/5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                                                    <span className="text-sm text-stone-300 leading-relaxed">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Medications (Optional) */}
                                                    {selectedRecord.medications && (
                                                        <div>
                                                            <h5 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Suggested Adjustments</h5>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {selectedRecord.medications.map((med, i) => (
                                                                    <div key={i} className={`p-3 rounded-lg border flex flex-col ${med.action === 'Suspend' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="text-sm font-bold text-white">{med.name}</span>
                                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${med.action === 'Suspend' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{med.action}</span>
                                                                        </div>
                                                                        <span className="text-xs text-stone-500">{med.dose}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 gap-4 text-stone-500">
                                                    <FileText size={48} className="opacity-20" />
                                                    <p>{selectedRecord.description || "No preview available."}</p>
                                                    {selectedRecord.fileUrl && (
                                                        <a href={selectedRecord.fileUrl} target="_blank" rel="noreferrer" className="text-amber-500 font-bold hover:underline">Download / View File</a>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-white/5 bg-stone-900/50 flex justify-between items-center text-xs text-stone-500 font-mono">
                                <span>ID: {selectedRecord.id}</span>
                                <span>{selectedRecord.date}</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Tabs & Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md sticky top-0 z-40">
                {/* Tabs */}
                <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                    {/* Only show generic plus if not in a specific tab that handles it */}
                    {activeTab === 'overview' && (
                        <button onClick={() => onAddAction && onAddAction(null)} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
                            <Plus size={20} />
                        </button>
                    )}
                </div>
            </div>


            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader size={40} className="animate-spin mb-4 text-amber-500" />
                        <p className="font-mono text-sm uppercase tracking-wider">Loading Clinical Workspace...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.length === 0 && (
                            <div className="glass-card p-12 rounded-[2rem] flex flex-col items-center justify-center text-center border border-dashed border-stone-800">
                                <div className="p-6 rounded-3xl bg-amber-500/10 mb-6 animate-pulse">
                                    <Clipboard size={48} className="text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-amber-400 mb-2">Timeline is currently vacant</h3>
                                <p className="text-stone-500 max-w-md">
                                    Systems are synchronized and <span className="text-amber-500 font-bold">awaiting data</span>.
                                    Initiate a clinical encounter to begin the patient history.
                                </p>
                            </div>
                        )}

                        {records
                            .filter(rec => {
                                const matchesTab = activeTab === 'overview' ||
                                    (activeTab === 'notes' && rec.type === 'consultation_note') ||
                                    (activeTab === 'prescriptions' && rec.type === 'prescription') ||
                                    (activeTab === 'reports' && rec.type === 'lab_report');

                                const searchLower = searchTerm.toLowerCase();
                                const matchesSearch = !searchTerm ||
                                    rec.title?.toLowerCase().includes(searchLower) ||
                                    rec.patientName?.toLowerCase().includes(searchLower) ||
                                    rec.id?.toLowerCase().includes(searchLower) ||
                                    rec.description?.toLowerCase().includes(searchLower);

                                return matchesTab && matchesSearch;
                            })
                            .map((rec, i) => (
                                <motion.div
                                    key={rec.id}
                                    layoutId={rec.id}
                                    onClick={() => handleRecordClick(rec)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card flex items-center gap-6 p-6 relative group cursor-pointer hover:bg-white/5 transition-all active:scale-[0.99] border-l-4 border-l-transparent hover:border-l-amber-500"
                                >
                                    <div className={`p-4 rounded-2xl ${rec.type === 'consultation_note' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'} border border-white/5 relative z-10`}>
                                        {rec.type === 'lab_report' && <FileText size={24} />}
                                        {rec.type === 'prescription' && <Pill size={24} />}
                                        {rec.type === 'consultation_note' && <Clipboard size={24} />}
                                        {(!rec.type || rec.type === 'referral') && <Share2 size={24} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-lg font-bold text-slate-200 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{rec.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-500 border border-slate-700/50 px-2 py-1 rounded bg-slate-900/50">{rec.date}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500">Patient: <span className="text-slate-300 font-bold">{rec.patientName}</span> <span className="text-slate-600">•</span> Dr. {rec.doctorName}</p>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={20} className="text-amber-500" />
                                    </div>
                                </motion.div>
                            ))}

                        {/* TAB SPECIFIC ACTIONS (Moved to Bottom) */}
                        {activeTab === 'prescriptions' && (
                            <button
                                onClick={() => onAddAction && onAddAction('prescription')}
                                className="w-full h-20 rounded-[1.5rem] animated-border bg-stone-900/40 hover:bg-stone-900/60 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <Plus size={16} className="text-stone-500 group-hover:text-stone-400 transition-colors" />
                                <span className="text-sm font-bold text-stone-500 group-hover:text-stone-400 transition-colors uppercase tracking-widest">Create New Prescription</span>
                            </button>
                        )}

                        {activeTab === 'notes' && (
                            <button
                                onClick={() => onAddAction && onAddAction('note')}
                                className="w-full h-20 rounded-[1.5rem] animated-border bg-stone-900/40 hover:bg-stone-900/60 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <Plus size={16} className="text-stone-500 group-hover:text-stone-400 transition-colors" />
                                <span className="text-sm font-bold text-stone-500 group-hover:text-stone-400 transition-colors uppercase tracking-widest">Write Clinical Note</span>
                            </button>
                        )}

                        {activeTab === 'reports' && (
                            <button
                                onClick={() => onAddAction && onAddAction('lab')}
                                className="w-full h-20 rounded-[1.5rem] animated-border bg-stone-900/40 hover:bg-stone-900/60 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <Plus size={16} className="text-stone-500 group-hover:text-stone-400 transition-colors" />
                                <span className="text-sm font-bold text-stone-500 group-hover:text-stone-400 transition-colors uppercase tracking-widest">Upload Lab Report</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalRecordManager;
