import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { FileText, Search } from 'lucide-react';

import Header from './Header';
import RecordCard from './RecordCard';
import { RecordFormModal, DeleteConfirmModal } from './Modals';
import { SkeletonCard } from './SkeletonLoaders';

const AllRecords = ({ user, db, storage, appId, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const userId = user ? user.uid : null;

    const recordsCollectionRef = useMemo(() => {
        if (userId) return collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
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

    const filteredRecords = records.filter(record =>
        record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <Header
                title="All Records"
                description="View and manage all your historical medical records."
                user={user}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
                onNavigate={onNavigate}
                onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
            />
            <main className="mt-8">
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by doctor, hospital, or type..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </div>
                ) : (
                    filteredRecords.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filteredRecords.map(record => (
                                    <RecordCard
                                        key={record.id}
                                        record={record}
                                        storage={storage}
                                        onEdit={() => { setEditingRecord(record); setIsFormModalOpen(true); }}
                                        onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
                            <FileText size={48} className="mx-auto text-slate-400" />
                            <h3 className="mt-4 text-xl text-slate-300">No Records Found</h3>
                            <p className="text-slate-500 mt-2">Your search did not match any records, or you haven't added any yet.</p>
                        </div>
                    )
                )}
            </main>

            <AnimatePresence>
                {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={userId} appId={appId} db={db} storage={storage} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
            </AnimatePresence>
        </div>
    );
};

export default AllRecords;