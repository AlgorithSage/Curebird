import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Hash, Pill, Calendar, ShieldCheck, UserPlus, FileText, Stethoscope, Hospital, HeartPulse, X, Sparkles, ChevronUp } from 'lucide-react';

import Header from './Header';
import StatCard from './StatCard';
import RecordsChart from './RecordsChart';
import RecordCard from './RecordCard';
import { RecordFormModal, ShareModal, DeleteConfirmModal } from './Modals';
import { SkeletonDashboard, SkeletonCard } from './SkeletonLoaders';
import DashboardOverview from './DashboardOverview';

import HeroSection from './HeroSection';

const MedicalPortfolio = ({ user, db, storage, appId, formatDate, capitalize, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {

    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [activeTypeFilter, setActiveTypeFilter] = useState(null); // Default to null (collapsed)
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
            <Header
                user={user}
                onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                onShareClick={() => setIsShareModalOpen(true)}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
                onNavigate={onNavigate}
            />

            <main className="mt-8">
                {/* Flashy Hero Section - Always visible */}
                <div className="mb-10">
                    <HeroSection
                        onOverviewClick={scrollToDashboard}
                        onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Dashboard Overview Banner */}
                <div className="mb-12">
                    <DashboardOverview user={user} />
                </div>

                {isLoading ? <SkeletonDashboard /> : (
                    <>
                        {/* Standard Stat Cards for Dashboard Overview */}
                        <div ref={dashboardRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-24">
                            <StatCard icon={<Hash size={24} className="text-black" />} label="Total Records" value={records.length} color="bg-yellow-500" />
                            <StatCard icon={<ShieldCheck size={24} className="text-black" />} label="Identity Verified" value="Active" color="bg-amber-400" />
                            <StatCard icon={<Calendar size={24} className="text-black" />} label="Last Visit" value={lastVisit} color="bg-yellow-600" />
                        </div>
                        <div className="mt-8">
                            <RecordsChart data={dashboardData} />
                        </div>
                    </>
                )}

                <div className="mt-12 mb-6 flex items-center justify-between" ref={medicalHistoryRef}>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                            {[
                                { id: 'prescription', label: 'Prescriptions', icon: <Pill size={40} />, count: records.filter(r => r.type === 'prescription').length },
                                { id: 'test_report', label: 'Test Reports', icon: <FileText size={40} />, count: records.filter(r => r.type === 'test_report').length },
                                { id: 'diagnosis', label: 'Diagnoses', icon: <Stethoscope size={40} />, count: records.filter(r => r.type === 'diagnosis').length },
                                { id: 'admission', label: 'Admissions', icon: <Hospital size={40} />, count: records.filter(r => r.type === 'admission').length },
                                { id: 'ecg', label: 'ECG Records', icon: <HeartPulse size={40} />, count: records.filter(r => r.type === 'ecg').length },
                            ].map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    // REVISED STYLES: 
                                    // Gradient Amber + Vignette Blur (Shadow)
                                    // Blending with UI via shadow and slight opacity
                                    className={`relative aspect-square flex flex-col items-center justify-center p-4 rounded-3xl cursor-pointer transition-all duration-300 border-2 group ${activeTypeFilter === cat.id
                                        ? `bg-gradient-to-br from-amber-400 to-amber-600 border-white/50 shadow-[0_0_60px_-10px_rgba(251,191,36,0.5)] scale-105 z-10`
                                        : `bg-gradient-to-br from-amber-500 to-amber-600/90 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)] border-amber-500/30 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.4)] hover:scale-[1.02]`
                                        }`}
                                >

                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className={`mb-4 p-4 rounded-2xl ${activeTypeFilter === cat.id
                                            ? 'bg-white/20 text-white backdrop-blur-sm shadow-inner'
                                            : 'bg-black/20 text-black/80 group-hover:bg-black/30 border border-black/5'
                                            } transition-all duration-300`}
                                    >
                                        {React.cloneElement(cat.icon, { className: "stroke-[2.5]" })}
                                    </motion.div>

                                    <div className="text-center z-10 flex flex-col items-center">
                                        <h3 className={`text-5xl font-black mb-1 leading-none ${activeTypeFilter === cat.id
                                            ? 'text-white drop-shadow-md'
                                            : 'text-black/90 group-hover:text-black'
                                            } transition-colors`}>
                                            {cat.count}
                                        </h3>

                                        <p className={`text-xs font-bold uppercase tracking-wider ${activeTypeFilter === cat.id
                                            ? 'text-white/90 drop-shadow-sm'
                                            : 'text-black/70 group-hover:text-black/90'
                                            } transition-colors`}>
                                            {cat.label}
                                        </p>
                                    </div>

                                    {/* Vignette / Edge Blur Effect Overlay */}
                                    <div className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 ${activeTypeFilter === cat.id ? 'opacity-0' : 'opacity-100 bg-gradient-to-b from-transparent via-transparent to-black/10'}`} />

                                    {activeTypeFilter === cat.id && (
                                        <div className="absolute top-3 right-3 text-white animate-pulse">
                                            <Sparkles size={20} fill="currentColor" />
                                        </div>
                                    )}
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
            </main>

            <AnimatePresence>
                {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={user?.uid} appId={appId} db={db} storage={storage} />}
                {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userId={userId} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
            </AnimatePresence>
        </div >
    );
};

export default MedicalPortfolio;
