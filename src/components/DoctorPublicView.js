import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Removed where import as it is unused
import { Activity, FileText, Calendar, User, ShieldCheck, AlertTriangle, Loader, Lock } from 'lucide-react';
import CurebirdLogo from '../curebird_logo.png';

const DoctorPublicView = ({ db, appId, shareToken, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchSharedData = async () => {
            try {
                // 1. Verify Token
                const linkRef = doc(db, 'share_links', shareToken);
                const linkSnap = await getDoc(linkRef);

                if (!linkSnap.exists()) {
                    throw new Error("Invalid access link.");
                }

                const linkData = linkSnap.data();
                const now = new Date();
                if (linkData.expiresAt.toDate() < now) {
                    throw new Error("This access link has expired.");
                }

                const userId = linkData.userId;

                // 2. Fetch User Profile
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    throw new Error("Patient profile not found.");
                }

                setPatientData({ id: userSnap.id, ...userSnap.data() });

                // 3. Fetch Recent Medical Records (Summary)
                // Path: artifacts/{appId}/users/{userId}/medical_records
                const recordsRef = collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
                const q = query(recordsRef, orderBy("date", "desc"), limit(10));
                const recordsSnap = await getDocs(q);

                const recordsList = recordsSnap.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                    date: d.data().date?.toDate ? d.data().date.toDate() : new Date()
                }));

                setRecords(recordsList);

            } catch (err) {
                console.error("Access Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (shareToken) {
            fetchSharedData();
        }
    }, [db, appId, shareToken]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <Loader className="animate-spin text-amber-500 mb-4" size={40} />
            <p className="text-slate-400 font-mono text-sm tracking-widest">VERIFYING SECURE TOKEN...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <Lock size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 max-w-md mb-8">{error}</p>
            <button onClick={onBack} className="text-amber-500 hover:text-amber-400 text-sm font-bold uppercase tracking-wide">
                Return to Home
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-y-auto">

            {/* Professional Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={CurebirdLogo} alt="Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">Curebird <span className="text-amber-600">Clinician View</span></h1>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                <ShieldCheck size={10} /> SECURE SESSION ACTIVE
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Access Expires In</p>
                        <p className="text-sm font-mono font-bold text-slate-700">59:20</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* Patient Header Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        {patientData.photoURL ? (
                            <img src={patientData.photoURL} alt="Patient" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-slate-900">
                                {patientData.firstName} {patientData.lastName}
                            </h2>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                Patient
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-slate-500 mt-3">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">DOB:</span> {patientData.dob || 'Not Listed'}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">Blood Type:</span> {patientData.bloodType || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">Gender:</span> {patientData.gender || 'Not Listed'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Summary Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Allergies */}
                    <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertTriangle size={16} /> Allergies
                        </h3>
                        {patientData.allergies && patientData.allergies.length > 0 ? (
                            <ul className="space-y-2">
                                {patientData.allergies.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No known allergies.</p>
                        )}
                    </div>

                    {/* Vitals Snapshot */}
                    <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={16} /> Latest Vitals
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Heart Rate</span>
                                <span className="font-mono font-bold text-slate-900">72 <span className="text-[10px] text-slate-400 font-sans">bpm</span></span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Blood Pressure</span>
                                <span className="font-mono font-bold text-slate-900">120/80 <span className="text-[10px] text-slate-400 font-sans">mmHg</span></span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-slate-500">SpO2</span>
                                <span className="font-mono font-bold text-slate-900">98 <span className="text-[10px] text-slate-400 font-sans">%</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} /> Emergency Contact
                        </h3>
                        {patientData.emergencyContact ? (
                            <div>
                                <p className="font-bold text-slate-900">{patientData.emergencyContact.name}</p>
                                <p className="text-sm text-slate-600 mb-1">{patientData.emergencyContact.relationship}</p>
                                <p className="text-sm font-mono text-slate-500">{patientData.emergencyContact.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No emergency contact listed.</p>
                        )}
                    </div>
                </div>

                {/* Recent Documents Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="text-slate-400" size={20} /> Recent Medical Records
                        </h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full">
                            Last 10 Items
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Doctor / Source</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.length > 0 ? records.map((record) => (
                                    <tr key={record.id} className="hover:bg-amber-50/30 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-medium text-slate-900">
                                            {record.date.toLocaleDateString()}
                                            <span className="block text-xs text-slate-400 font-normal mt-0.5">{record.date.toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                                ${record.type === 'prescription' ? 'bg-emerald-100 text-emerald-800' :
                                                    record.type === 'lab_report' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-600'}`}>
                                                {record.type?.replace('_', ' ') || 'Record'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600">
                                            {record.doctorName || record.hospitalName || 'Uploaded Document'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <a
                                                href={record.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-600 hover:text-amber-700 text-sm font-bold hover:underline"
                                            >
                                                View File
                                            </a>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic">
                                            No recent records found for this patient.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-slate-400 leading-relaxed">
                    <p>
                        This is a secure, read-only view generated by the Curebird Platform at the patient's request.
                        CONFIDENTIALITY NOTICE: The information contained in this view is intended for the use of the individual or entity to whom it is addressed.
                    </p>
                </div>

            </main>
        </div>
    );
};

export default DoctorPublicView;
