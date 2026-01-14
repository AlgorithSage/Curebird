import React, { useState } from 'react';
import {  X, User, Activity, Calendar, HeartPulse, CheckCircle, Loader, AlertTriangle, Phone, Mail, MapPin, Shield, FileText, Droplet, UserPlus  } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AddPatientModal = ({ isOpen, onClose, onAddPatient }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        bloodType: 'A+',
        phone: '',
        email: '',
        address: '',
        condition: '',
        allergies: '',
        insuranceProvider: '',
        insurancePolicy: '',
        status: 'Stable'
    });

    // Auto-generate ID for display
    const tempId = "PAT-" + Math.floor(100000 + Math.random() * 900000);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Add to Firestore
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setError("You must be logged in to add a patient.");
                setLoading(false);
                return;
            }

            const docRef = await addDoc(collection(db, "patients"), {
                name: `${formData.firstName} ${formData.lastName}`,
                age: Number(new Date().getFullYear() - new Date(formData.dob).getFullYear()),
                gender: formData.gender,
                dob: formData.dob,
                bloodType: formData.bloodType,
                condition: formData.condition,
                status: formData.status,
                allergies: formData.allergies,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                lastVisit: 'Just now',
                createdAt: serverTimestamp(),
                doctorId: currentUser.uid // Link patient to this doctor
            });

            const newPatient = {
                id: docRef.id,
                ...formData,
                name: `${formData.firstName} ${formData.lastName}`,
                age: Number(new Date().getFullYear() - new Date(formData.dob).getFullYear())
            };

            onAddPatient(newPatient);
            setSuccess(true);

            setTimeout(() => {
                onClose();
                setFormData({
                    firstName: '', lastName: '', dob: '', gender: 'Male', bloodType: 'A+',
                    phone: '', email: '', address: '', condition: '', allergies: '',
                    insuranceProvider: '', insurancePolicy: '', status: 'Stable'
                });
                setSuccess(false);
            }, 1000);

        } catch (err) {
            setError("Failed to register patient. Please verify network connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="relative w-full max-w-5xl bg-[#0f0b05] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_80px_rgba(0,0,0,0.6),inset_0_0_120px_rgba(245,158,11,0.05)] border border-amber-500/20 animated-border"
                >
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-900/5 blur-[100px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

                    {/* Header */}
                    <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between relative bg-gradient-to-r from-amber-500/[0.03] to-transparent">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-[0_10px_30px_rgba(245,158,11,0.2)]">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">New Patient Enrollment</h2>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">ID: {tempId}</p>
                                    </div>
                                    <p className="text-xs text-stone-500 font-medium">Digital Intake Form</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-4 bg-stone-900/50 hover:bg-stone-800 text-stone-500 hover:text-white rounded-2xl transition-all border border-white/5 group">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <form id="add-patient-form" onSubmit={handleSubmit} className="p-10 space-y-10">

                            {/* Section 1: Demographics */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <User size={18} className="text-amber-500" />
                                    <h3 className="text-sm font-black text-stone-300 uppercase tracking-[0.25em]">Personal Demographics</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">First & Last Name</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required type="text" placeholder="First Name" value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl px-5 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                            <input
                                                required type="text" placeholder="Last Name" value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl px-5 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                                            <input
                                                required type="date" value={formData.dob}
                                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none transition-all [color-scheme:dark] font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Biological Gender</label>
                                        <select
                                            value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl px-4 text-white outline-none cursor-pointer font-medium appearance-none"
                                        >
                                            <option>Male</option> <option>Female</option> <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/5" />

                            {/* Section 2: Clinical Profile */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity size={18} className="text-amber-500" />
                                    <h3 className="text-sm font-black text-stone-300 uppercase tracking-[0.25em]">Clinical Profile</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Primary Diagnosis</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                                            <input
                                                required type="text" placeholder="e.g. Hypertension" value={formData.condition}
                                                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Blood Type</label>
                                        <div className="relative">
                                            <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50" size={18} />
                                            <select
                                                value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none cursor-pointer font-medium appearance-none"
                                            >
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Triage Status</label>
                                        <select
                                            value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl px-4 text-white outline-none cursor-pointer font-medium appearance-none"
                                        >
                                            <option>Stable</option> <option>Critical</option> <option>At Risk</option> <option>Recovering</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Known Allergies</label>
                                        <input
                                            type="text" placeholder="Separate with commas (e.g. Penicillin, Peanuts)" value={formData.allergies}
                                            onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                            className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl px-5 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/5" />

                            {/* Section 3: Contact & Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Phone size={18} className="text-amber-500" />
                                    <h3 className="text-sm font-black text-stone-300 uppercase tracking-[0.25em]">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                                            <input
                                                type="tel" placeholder="(555) 000-0000" value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                                            <input
                                                type="email" placeholder="patient@example.com" value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-stone-300 ml-1 uppercase tracking-wider">Residential Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                                            <input
                                                type="text" placeholder="Full Street Address, City, Zip Code" value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full h-14 bg-stone-900/50 border border-white/5 focus:border-amber-500/40 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-stone-600 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-10 py-6 border-t border-white/5 bg-[#0a0805] flex items-center justify-between">
                        {error ? (
                            <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
                                <AlertTriangle size={14} /> <span>{error}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
                                <Shield size={12} />
                                <span>HIPAA Compliant Form</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="px-6 py-4 rounded-xl text-stone-500 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
                                Cancel
                            </button>
                            <motion.button
                                form="add-patient-form"
                                type="submit"
                                disabled={loading || success}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-900/20 flex items-center gap-3 disabled:opacity-50 hover:shadow-amber-500/20 transition-shadow"
                            >
                                {loading ? <Loader size={16} className="animate-spin" /> : success ? <CheckCircle size={16} /> : <UserPlus size={16} />}
                                {loading ? 'Processing...' : success ? 'Patient Enrolled' : 'Complete Enrollment'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddPatientModal;
