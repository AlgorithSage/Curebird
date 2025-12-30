import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Pill } from 'lucide-react';

const MedicationTimeline = ({ userId, db }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeds = async () => {
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
                        name: d.name,
                        dosage: d.dosage,
                        start: start,
                        end: end,
                        duration: Math.max(duration, 5), // Min width visual
                        // For Gantt in Recharts, we often use stacked bars or custom ranges. 
                        // A simpler approach for MVP: List view with visual bars or a custom simple SVG.
                        // Recharts bar chart isn't great for Gantt out of box without tricks.
                        // Let's use a custom HTML/Tailwind Timeline for better control.
                        isActive: d.status === 'active'
                    };
                });
                setData(meds);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchMeds();
    }, [userId, db]);

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
                            <p className="text-emerald-500 text-xs">{med.dosage}</p>
                        </div>

                        {/* Bar */}
                        <div className="flex-grow bg-slate-900/50 h-10 rounded-lg relative overflow-hidden border border-slate-700/50">
                            <div
                                className={`absolute top-0 bottom-0 left-0 rounded-md flex items-center px-3 text-xs font-bold text-white/90 shadow-lg ${med.isActive ? 'bg-emerald-600' : 'bg-slate-600 opacity-60'}`}
                                style={{ width: med.isActive ? '100%' : '80%' /* simplified visual for demo */ }}
                            >
                                {med.start.toLocaleDateString()} — {med.isActive ? 'Present' : med.end.toLocaleDateString()}
                            </div>
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
