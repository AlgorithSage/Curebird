import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { BarChart2, Hash, Pill, Calendar, ShieldCheck, UserPlus } from 'lucide-react';

import Header from './Header';
import StatCard from './StatCard';
import RecordsChart from './RecordsChart';
import RecordCard from './RecordCard';
import { RecordFormModal, ShareModal, DeleteConfirmModal } from './Modals';
import { SkeletonDashboard, SkeletonCard } from './SkeletonLoaders';

const MedicalPortfolio = ({ user, db, appId, formatDate, capitalize, onLogout, onLoginClick, onToggleSidebar }) => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);

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
                user={user} // --- THIS LINE WAS ADDED ---
                onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                onShareClick={() => setIsShareModalOpen(true)}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
            />

            <main className="mt-8">
                {isLoading ? <SkeletonDashboard /> : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<Hash size={24} className="text-white" />} label="Total Records" value={records.length} color="bg-sky-500" />
                            <StatCard icon={<Pill size={24} className="text-white" />} label="Prescriptions" value={totalPrescriptions} color="bg-rose-500" />
                            <StatCard icon={<Calendar size={24} className="text-white" />} label="Last Visit" value={lastVisit} color="bg-amber-500" />
                            <StatCard icon={<ShieldCheck size={24} className="text-white" />} label="Status" value="Verified" color="bg-emerald-500" />
                        </div>
                        <div className="mt-8">
                            <RecordsChart data={dashboardData} />
                        </div>
                    </>
                )}

                <h2 className="text-2xl font-bold mt-12 mb-6 text-white">Medical History</h2>
                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonCard /><SkeletonCard />
                    </div>
                ) : (
                    records.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {records.map(record => (
                                    <RecordCard
                                        key={record.id}
                                        record={record}
                                        onEdit={() => { setEditingRecord(record); setIsFormModalOpen(true); }}
                                        onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
                            <BarChart2 size={48} className="mx-auto text-slate-400" />
                            <h3 className="mt-4 text-xl text-slate-300">No medical records found.</h3>
                            <p className="text-slate-500 mt-2">Click "Add Record" to get started.</p>
                        </div>
                    )
                )}
            </main>

            <AnimatePresence>
                {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={userId} appId={appId} db={db} />}
                {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userId={userId} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
            </AnimatePresence>
        </div>
    );
};

export default MedicalPortfolio;

