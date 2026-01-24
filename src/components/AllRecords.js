import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query } from 'firebase/firestore';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { FileText, Search } from './Icons';

import Header from './Header';
import RecordCard from './RecordCard';
import { RecordFormModal, DeleteConfirmModal } from './Modals';
import { SkeletonCard } from './SkeletonLoaders';

const AllRecords = ({ user, db, storage, appId, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    // Premium Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.4
            }
        }
    };

    const fadeSlideUp = {
        hidden: { opacity: 0, y: 100, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const staggerScale = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100
            }
        }
    };

    const blurReveal = {
        hidden: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration: 1, ease: "easeOut" }
        }
    };
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All'); // New state for dropdown filter
    const [isSearchActive, setIsSearchActive] = useState(false);

    const userId = user ? user.uid : null;

    const recordsCollectionRef = useMemo(() => {
        if (userId) return collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
        return null;
    }, [userId, db, appId]);

    // ... (useEffect remains the same) ...

    useEffect(() => {
        if (recordsCollectionRef) {
            const q = query(recordsCollectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                recordsData.sort((a, b) => {
                    const timeA = a.createdAt?.seconds ? a.createdAt.seconds : (a.date?.seconds || 0);
                    const timeB = b.createdAt?.seconds ? b.createdAt.seconds : (b.date?.seconds || 0);
                    return timeB - timeA;
                });
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
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/medical_records`, recordToDelete));
        } catch (error) {
            console.error("Error deleting record: ", error);
        } finally {
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'All' || record.type === typeFilter.toLowerCase().replace(' ', '_');

        return matchesSearch && matchesType;
    });

    if (!user) {
        // This view is shown if the user is logged out
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <Header
                    title="All Records"
                    description="Log in to view your records."
                    user={null}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
                <div className="text-center py-20">
                    <p className="text-slate-400">Please log in to view your medical records.</p>
                </div>
            </div>
        )
    }

    const handleRetractSearch = () => {
        setIsSearchActive(false);
        setSearchTerm('');
        setTypeFilter('All');
    };

    return (
        <LayoutGroup>
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                    <Header
                        title="All Records"
                        description="View and manage all your historical medical records."
                        user={user}
                        onLogout={onLogout}
                        onLoginClick={onLoginClick}
                        onToggleSidebar={onToggleSidebar}
                        onNavigate={onNavigate}
                    />
                </div>

                <main className={`flex-1 flex flex-col transition-all duration-500 ${!isSearchActive ? 'justify-center items-center' : 'justify-start'}`}>
                    {/* Centered Initial Search State */}
                    {!isSearchActive && (
                        <motion.div
                            layoutId="search-container"
                            className="w-full max-w-3xl px-6 flex flex-col items-center z-10 -mt-20"
                            initial="hidden"
                            animate="visible"
                            variants={blurReveal}
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm">
                                    Find Your Medical History
                                </h2>
                                <p className="text-white font-bold text-lg">Search across reports, prescriptions, and doctor notes instantly.</p>
                            </div>

                            <div className="relative w-full group">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <Search size={28} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors z-20" />
                                <input
                                    type="text"
                                    placeholder="Search by doctor, hospital, or type..."
                                    className="relative z-10 w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl pl-16 pr-6 py-6 text-xl shadow-2xl shadow-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder:text-white font-bold transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchActive(true)}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                {['Prescriptions', 'Blood Tests', 'Cardiology', 'Dr. Smith'].map((tag) => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-slate-800/50 border border-white/5 text-xs text-slate-400 hover:text-amber-200 hover:border-amber-500/30 transition-colors cursor-pointer">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Active Top Search State */}
                    {isSearchActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <motion.div
                                    layoutId="search-container"
                                    className="relative flex-grow group"
                                >
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search by doctor, hospital, or type..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white shadow-lg"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </motion.div>
                                <motion.select
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-w-[150px] shadow-lg"
                                >
                                    <option value="All">All Records</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="test_report">Test Report</option>
                                    <option value="diagnosis">Diagnosis</option>
                                    <option value="admission">Hospital Admission</option>
                                    <option value="ecg">ECG</option>
                                </motion.select>
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={handleRetractSearch}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                >
                                    Retract
                                </motion.button>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                                </div>
                            ) : (
                                filteredRecords.length > 0 ? (
                                    <>
                                        <AnimatePresence mode="popLayout">
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                variants={containerVariants}
                                                className="space-y-4"
                                            >
                                                {filteredRecords.map(record => (
                                                    <motion.div
                                                        key={record.id}
                                                        variants={fadeSlideUp}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        layout
                                                    >
                                                        <RecordCard
                                                            record={record}
                                                            storage={storage}
                                                            onEdit={() => { setEditingRecord(record); setIsFormModalOpen(true); }}
                                                            onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Bottom Retract Button for easy access */}
                                        <div className="flex justify-center mt-8">
                                            <button
                                                onClick={handleRetractSearch}
                                                className="flex items-center gap-2 px-6 py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-500 rounded-full text-sm font-bold border border-amber-500/20 transition-all hover:scale-105"
                                            >
                                                Retract View
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-sm"
                                    >
                                        <div className="bg-slate-800 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                            <FileText size={40} className="text-slate-500" />
                                        </div>
                                        <h3 className="mt-4 text-xl font-bold text-slate-200">No Records Found</h3>
                                        <p className="text-slate-500 mt-2">No matches for "<span className="text-amber-500">{searchTerm}</span>"</p>
                                        <button
                                            onClick={handleRetractSearch}
                                            className="mt-6 text-sm text-slate-400 hover:text-white underline underline-offset-4"
                                        >
                                            Clear Search & Retract
                                        </button>
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    )}
                </main>

                <AnimatePresence>
                    {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={userId} appId={appId} db={db} storage={storage} />}
                    {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
                </AnimatePresence>
            </div>
        </LayoutGroup >
    );
};

export default AllRecords;