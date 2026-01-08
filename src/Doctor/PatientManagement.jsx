import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, FileText, Activity, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PatientWorkspace from './PatientWorkspace';

const PatientManagement = ({ onViewPatient }) => {
    // const [selectedPatient, setSelectedPatient] = useState(null); // Removed internal state
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Patients Live
    React.useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return; // Wait for auth

        const q = query(
            collection(db, "patients"),
            orderBy("createdAt", "desc")
            // where("doctorId", "==", currentUser.uid) // Showing all patients for demo parity
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPatients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPatients(fetchedPatients);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching patients:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Removed internal toggle
    // if (selectedPatient) {
    //    return <PatientWorkspace patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    // }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                {/* Search Header Remains */}
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Activity className="text-emerald-400" size={20} />
                        </div>
                        Patient Registry
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage assigned patients and view medical history.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600 backdrop-blur-xl"
                        />
                    </div>
                    <button className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors backdrop-blur-xl">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Patient Table */}
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/90 backdrop-blur-3xl overflow-hidden shadow-xl min-h-[400px] flex flex-col">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-black/40">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Patient Name</th>
                            <th className="px-6 py-4">Demographics</th>
                            <th className="px-6 py-4">Condition</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Visit</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader className="animate-spin text-emerald-500" size={32} />
                                        <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">Loading Registry...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center text-slate-500">
                                    <p className="font-bold text-lg mb-2">No patients assigned.</p>
                                    <p className="text-xs uppercase tracking-widest opacity-60">Add a patient to begin tracking.</p>
                                </td>
                            </tr>
                        ) : (
                            patients.map((p, i) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.005, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onViewPatient && onViewPatient(p)} // Drill down via Parent
                                    className="hover:bg-white/5 transition-colors group cursor-pointer border-b border-transparent hover:border-emerald-500/20"
                                >
                                    <td className="px-6 py-4 font-mono text-slate-500 hover:text-emerald-400 transition-colors">{p.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white group-hover:text-emerald-300 transition-colors">{p.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{p.age} yrs / {p.gender}</td>
                                    <td className="px-6 py-4 text-slate-300">{p.condition}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${p.status === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                                p.status === 'Stable' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{p.lastVisit}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t border-white/5 bg-black/20 text-center text-xs text-slate-500 mt-auto">
                    {loading ? 'Syncing...' : `Showing ${patients.length} assigned patients`}
                </div>
            </div>
        </motion.div>
    );
};

export default PatientManagement;
