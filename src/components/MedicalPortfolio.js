import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Hash, Pill, Calendar, ShieldCheck, UserPlus, FileText, Stethoscope, Hospital, HeartPulse, X, Sparkles, ChevronUp, Bell, Activity } from 'lucide-react';
import { AnalysisService } from '../services/AnalysisService';

import Header from './Header';
import StatCard from './StatCard';
import RecordsChart from './RecordsChart';
import RecordCard from './RecordCard';
import { RecordFormModal, ShareModal, DeleteConfirmModal } from './Modals';
import { SkeletonDashboard, SkeletonCard } from './SkeletonLoaders';
import DashboardOverview from './DashboardOverview';

import HeroSection from './HeroSection';
import EmergencySettingsModal from './emergency/EmergencySettingsModal';
import EmergencyMedicalCard from './emergency/EmergencyMedicalCard';
import SOSButton from './emergency/SOSButton';



const MedicalPortfolio = ({ user, db, storage, appId, formatDate, capitalize, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {

    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [activeTypeFilter, setActiveTypeFilter] = useState(null); // Default to null (collapsed)
    const [isEmergencySetupOpen, setIsEmergencySetupOpen] = useState(false);
    const [isSOSActive, setIsSOSActive] = useState(false);

    // Phase 8: Health Score & Alerts
    const [healthScore, setHealthScore] = useState({ score: 100, grade: 'A', deductions: [] });
    const [alerts, setAlerts] = useState([]);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const dashboardRef = useRef(null);
    const medicalHistoryRef = useRef(null); // Ref for scrolling to history

    const scrollToDashboard = () => {
        dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const userId = user ? user.uid : null;

    const recordsCollectionRef = useMemo(() => {
        if (userId) {
            return collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
        }
        return null;
    }, [userId, db, appId]);

    useEffect(() => {
        if (recordsCollectionRef) {
            const q = query(recordsCollectionRef, orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecords(recordsData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching records: ", error);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setRecords([]);
        }
    }, [recordsCollectionRef]);

    // Phase 8: Fetch Metrics & Run Analysis
    useEffect(() => {
        if (!userId) return;

        const runAnalysis = async () => {
            try {
                // 1. Fetch Diseases
                const diseasesRef = collection(db, 'users', userId, 'diseases');
                const dSnap = await getDocs(diseasesRef);
                const diseases = dSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // 2. Fetch Recent Metrics for each disease
                const allMetrics = [];
                for (const d of diseases) {
                    const mRef = collection(db, 'users', userId, 'diseases', d.id, 'metrics');
                    const q = query(mRef, orderBy('timestamp', 'desc'), limit(10));
                    const mSnap = await getDocs(q);
                    const metrics = mSnap.docs.map(m => ({ id: m.id, diseaseId: d.id, ...m.data() }));
                    allMetrics.push(...metrics);
                }

                // 3. Run Analysis
                const result = AnalysisService.calculateHealthScore(allMetrics, diseases);
                const newAlerts = AnalysisService.generateAlerts(allMetrics);

                setHealthScore(result);
                setAlerts(newAlerts);
            } catch (err) {
                console.error("Analysis Failed:", err);
            }
        };

        runAnalysis();
    }, [userId, db]);

    const handleDeleteRecord = async () => {
        if (!recordToDelete || !userId) return;
        try {
            const record = records.find(r => r.id === recordToDelete);
            if (record?.fileUrl) {
                const storageRef = ref(storage, record.fileUrl);
                await deleteObject(storageRef).catch(e => console.error("Error deleting storage object: ", e));
            }
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/medical_records`, recordToDelete));
        } catch (error) {
            console.error("Error deleting record: ", error);
        } finally {
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };

    const dashboardData = useMemo(() => {
        const counts = records.reduce((acc, record) => {
            const type = capitalize(record.type);
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [records, capitalize]);

    const lastVisit = records.length > 0 ? formatDate(records[0].date) : 'N/A';
    const totalPrescriptions = records.filter(r => r.type === 'prescription').length;

    // Filter records based on selection
    const displayedRecords = useMemo(() => {
        if (!activeTypeFilter) return []; // Return empty if neither is selected
        if (activeTypeFilter === 'All') return records;
        return records.filter(r => r.type === activeTypeFilter);
    }, [records, activeTypeFilter]);

    const handleCategoryClick = (id) => {
        if (activeTypeFilter === id) {
            setActiveTypeFilter(null); // Collapse if clicking same
        } else {
            setActiveTypeFilter(id);
            // Optional: Scroll to list slightly
            setTimeout(() => {
                medicalHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    };

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
                <Header onLoginClick={onLoginClick} user={null} />
                <div className="flex flex-col items-center justify-center h-4/5 text-center">
                    <UserPlus size={64} className="text-slate-500" />
                    <h1 className="text-3xl font-bold text-white mt-6">Welcome to Your Medical Portfolio</h1>
                    <p className="text-slate-400 mt-2 max-w-md">Please log in or create an account to securely access and manage your health records.</p>
                    <button onClick={onLoginClick} className="mt-8 bg-amber-500 text-slate-900 py-3 px-8 rounded-lg hover:bg-amber-400 font-semibold transition-colors">
                        Login / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    user={user}
                    onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                    onShareClick={() => setIsShareModalOpen(true)}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                    alerts={alerts}
                />
            </div>

            <main className="mt-8">
                {/* Content Removed - Moved to Cure Tracker */}
                <>
                    {/* Flashy Hero Section - Always visible */}
                    <div className="mb-10">
                        <HeroSection
                            onOverviewClick={scrollToDashboard}
                            onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                            onNavigate={onNavigate}
                            healthScore={healthScore}
                        />
                    </div>


                    {/* Dashboard Overview Banner */}
                    <div className="mb-12 px-2 sm:px-6">
                        <DashboardOverview user={user} />
                    </div>

                    {isLoading ? <SkeletonDashboard /> : (
                        <>
                            {/* Standard Stat Cards for Dashboard Overview */}
                            <div ref={dashboardRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-24 px-2 sm:px-6">
                                <StatCard icon={<FileText size={24} className="text-black" />} label="Total Records" value={records.length} color="bg-yellow-500" />
                                <StatCard icon={<ShieldCheck size={24} className="text-black" />} label="Identity Verified" value="Active" color="bg-amber-400" />
                                <StatCard icon={<Calendar size={24} className="text-black" />} label="Last Visit" value={lastVisit} color="bg-yellow-600" />
                            </div>
                            <div className="mt-8 px-2 sm:px-6">
                                <RecordsChart data={dashboardData} />
                            </div>

                        </>
                    )}

                    <div className="mt-12 mb-6 flex items-center justify-between px-2 sm:px-6" ref={medicalHistoryRef}>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Medical History Categories</h2>
                        {activeTypeFilter && (
                            <button
                                onClick={() => setActiveTypeFilter(null)}
                                className="text-sm px-4 py-2 rounded-full bg-slate-800/80 text-amber-400 border border-amber-500/30 hover:bg-slate-700 transition flex items-center gap-2"
                            >
                                <ChevronUp size={16} /> Close View
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            <SkeletonCard /><SkeletonCard />
                        </div>
                    ) : (
                        <>
                            {/* Opaque Amber & High Visibility Category Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 px-2 sm:px-6">
                                {[
                                    { id: 'prescription', label: 'Prescriptions', icon: <Pill size={32} />, count: records.filter(r => r.type === 'prescription').length },
                                    { id: 'test_report', label: 'Test Reports', icon: <FileText size={32} />, count: records.filter(r => r.type === 'test_report').length },
                                    { id: 'diagnosis', label: 'Diagnoses', icon: <Stethoscope size={32} />, count: records.filter(r => r.type === 'diagnosis').length },
                                    { id: 'admission', label: 'Admissions', icon: <Hospital size={32} />, count: records.filter(r => r.type === 'admission').length },
                                    { id: 'ecg', label: 'ECG Records', icon: <HeartPulse size={32} />, count: records.filter(r => r.type === 'ecg').length },
                                ].map((cat) => (
                                    <motion.div
                                        key={cat.id}
                                        whileHover={{ scale: 1.02, translateY: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        // Solid Amber/Orange Gradient Style to match reference
                                        className={`relative aspect-[4/5] sm:aspect-square flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer transition-all duration-300 group overflow-hidden ${activeTypeFilter === cat.id
                                            ? `bg-gradient-to-kb from-amber-500 to-amber-700 ring-4 ring-amber-400/50 scale-105 z-10 shadow-2xl`
                                            : `bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl hover:shadow-amber-500/40 border border-white/10`
                                            }`}
                                    >
                                        {/* Icon Container - Darkened Squircle */}
                                        <div className={`mb-6 p-4 rounded-2xl ${activeTypeFilter === cat.id
                                            ? 'bg-black/40 text-white'
                                            : 'bg-black/20 text-black/80 group-hover:bg-black/30 group-hover:text-black'
                                            } transition-all duration-300 backdrop-blur-sm border border-black/5 shadow-inner`}>
                                            {React.cloneElement(cat.icon, { strokeWidth: 2 })}
                                        </div>

                                        {/* Typography - Centered & Bold */}
                                        <div className="text-center z-10 flex flex-col items-center">
                                            <h3 className={`text-4xl sm:text-5xl font-black mb-2 leading-none tracking-tighter ${activeTypeFilter === cat.id
                                                ? 'text-white drop-shadow-md'
                                                : 'text-black/90 group-hover:text-black'
                                                } transition-colors`}>
                                                {cat.count}
                                            </h3>

                                            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] ${activeTypeFilter === cat.id
                                                ? 'text-white/90'
                                                : 'text-black/60 group-hover:text-black/80'
                                                } transition-colors`}>
                                                {cat.label}
                                            </p>
                                        </div>

                                        {/* Subtle sheen effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Collapsible Section - Only shows when filter is active */}
                            <AnimatePresence>
                                {activeTypeFilter && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="py-4">
                                            {displayedRecords.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between mb-2 px-2">
                                                        <h3 className="text-xl font-bold text-amber-400">
                                                            {activeTypeFilter === 'All' ? 'All Records' : capitalize(activeTypeFilter.replace('_', ' '))}
                                                        </h3>
                                                        <span className="text-sm text-slate-400">Showing {displayedRecords.length} records</span>
                                                    </div>
                                                    <AnimatePresence mode="popLayout">
                                                        {displayedRecords.map(record => (
                                                            <motion.div
                                                                key={record.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                layout
                                                            >
                                                                <RecordCard
                                                                    record={record}
                                                                    onEdit={() => { setEditingRecord(record); setIsFormModalOpen(true); }}
                                                                    onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <div className="glass-card text-center py-16 rounded-2xl border-dashed border-2 border-white/10 bg-slate-900/50">
                                                    <div className="bg-slate-800 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                                        <BarChart2 size={40} className="text-slate-500" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white">No {activeTypeFilter.replace('_', ' ')} records found.</h3>
                                                    <p className="text-slate-400 mt-2">There are no uploaded records for this category yet.</p>
                                                    <button
                                                        onClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                                                        className="mt-6 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-semibold transition-colors"
                                                    >
                                                        Add New Record
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Bottom Close Button for Convenience */}
                                        {displayedRecords.length > 3 && (
                                            <div className="flex justify-center mt-4 mb-8">
                                                <button
                                                    onClick={() => setActiveTypeFilter(null)}
                                                    className="text-sm px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-2 border border-slate-700"
                                                >
                                                    <ChevronUp size={16} /> Retract List
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>

                    )}
                </>
            </main>

            {/* SOS System */}
            <SOSButton onClick={() => setIsSOSActive(true)} />

            <AnimatePresence>
                {/* Emergency Lock Screen Mode */}
                {isSOSActive && (
                    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                        <div className="w-full max-w-md h-[90vh] relative">
                            <button
                                onClick={() => setIsSOSActive(false)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white"
                            >
                                <X size={32} />
                            </button>
                            <EmergencyMedicalCard user={user} />

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => { setIsSOSActive(false); setIsEmergencySetupOpen(true); }}
                                    className="text-white/40 text-xs hover:text-white underline underline-offset-4"
                                >
                                    Edit Emergency Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isEmergencySetupOpen && (
                    <EmergencySettingsModal
                        user={user}
                        db={db}
                        onClose={() => setIsEmergencySetupOpen(false)}
                        currentData={user?.emergencyProfile}
                    />
                )}

                {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={user?.uid} appId={appId} db={db} storage={storage} />}
                {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userId={userId} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
            </AnimatePresence>
        </div >
    );
};

export default MedicalPortfolio;
