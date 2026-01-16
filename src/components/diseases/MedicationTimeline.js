import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import {  Pill, Trash2  } from '../Icons';

const MedicationTimeline = ({ userId, db }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMeds = useCallback(async () => {
        if (!userId) return;
        try {
            const medsRef = collection(db, 'users', userId, 'medications');
            const q = query(medsRef, orderBy('startDate', 'desc'));
            const snap = await getDocs(q);

            const meds = snap.docs.map(doc => {
                const d = doc.data();
                const start = d.startDate?.toDate ? d.startDate.toDate() : new Date();
                const end = d.endDate?.toDate ? d.endDate.toDate() : new Date(); // Or today if active
                const duration = (end - start) / (1000 * 60 * 60 * 24); // Days

                return {
                    id: doc.id,
                    name: d.name,
                    dosage: d.dosage,
                    start: start,
                    end: end,
                    duration: Math.max(duration, 5), // Min width visual
                    isActive: d.status === 'active'
                };
            });
            setData(meds);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId, db]);

    useEffect(() => {
        fetchMeds();
    }, [fetchMeds]);

    const handleDelete = async (id) => {
        if (!userId) {
            alert("Error: User ID is missing. Cannot delete.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this medication?")) return;
        try {
            await deleteDoc(doc(db, 'users', userId, 'medications', id));
            fetchMeds();
        } catch (e) {
            console.error("Error deleting medication:", e);
            alert(`Failed to delete medication. Error: ${e.message}`);
        }
    };

    if (loading) return <div className="h-20 animate-pulse bg-slate-800 rounded-xl" />;

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Pill className="text-emerald-400" size={20} /> Medication Timeline
            </h3>

            <div className="space-y-4 relative">
                {/* Date Line (Simplified) */}
                <div className="absolute left-32 top-0 bottom-0 w-px bg-slate-700/50 hidden sm:block"></div>

                {data.map((med, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 group">
                        {/* Left Info */}
                        <div className="w-32 min-w-[128px] text-right">
                            <p className="font-bold text-white text-sm truncate">{med.name}</p>
                            <p className="text-emerald-500 text-xs">
                                {typeof med.dosage === 'object' ? (med.dosage.dosage || JSON.stringify(med.dosage)) : med.dosage}
                            </p>
                        </div>

                        {/* Bar */}
                        <div className="flex-grow bg-slate-900/50 h-10 rounded-lg relative overflow-hidden border border-slate-700/50 flex items-center pr-2">
                            <div
                                className={`absolute top-0 bottom-0 left-0 rounded-md flex items-center px-3 text-xs font-bold text-white/90 shadow-lg ${med.isActive ? 'bg-emerald-600' : 'bg-slate-600 opacity-60'}`}
                                style={{ width: med.isActive ? '100%' : '80%' /* simplified visual for demo */ }}
                            >
                                {med.start.toLocaleDateString()} — {med.isActive ? 'Present' : med.end.toLocaleDateString()}
                            </div>

                            {/* Delete Button - Absolute Right on top of the bar or flexed if possible. 
                                Since bar is absolute, let's put delete button outside or ensure z-index.
                            */}
                            <button
                                onClick={() => handleDelete(med.id)}
                                className="ml-auto z-10 p-1.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Medication"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-4">No medication history found.</div>
                )}
            </div>
        </div>
    );
};

export default MedicationTimeline;
