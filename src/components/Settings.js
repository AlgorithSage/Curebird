import React, { useState } from 'react';
import { updateProfile, getAuth } from "firebase/auth";
import { AnimatePresence, motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Mail, Shield, AlertTriangle, Save, Camera, BadgeCheck } from 'lucide-react';

import Header from './Header';
import { DeleteAccountModal } from './Modals';

const Settings = ({ user, db, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setSaveSuccess(false);
        try {
            // 1. Update Firebase Auth Profile
            const auth = getAuth();
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: displayName });
            }

            // 2. Update Firestore User Document
            // Split name into First/Last for consistency
            const nameParts = displayName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            const { doc, updateDoc } = await import('firebase/firestore');
            const userRef = doc(db, 'users', user.uid);

            await updateDoc(userRef, {
                displayName: displayName,
                name: displayName,
                firstName: firstName,
                lastName: lastName
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto bg-slate-900 text-white selection:bg-amber-500/30">
                <Header
                    title="Settings"
                    description="Log in to manage your account."
                    user={null}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="p-6 rounded-full bg-slate-800/50 mb-6 animate-pulse-slow">
                        <SettingsIcon size={48} className="text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                    <p className="text-slate-400 max-w-md">Please log in to view and manage your account settings.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto bg-slate-900 text-white selection:bg-amber-500/30">
            {/* Background Effects */}
            <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10">
                <Header
                    title="Account Settings"
                    description="Manage your profile and security preferences."
                    user={user}
                    onLogout={onLogout}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />

                <main className="mt-8 max-w-5xl mx-auto space-y-8 pb-12">
                    {/* Identity Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <BadgeCheck className="text-slate-700 w-32 h-32 -mr-10 -mt-10" strokeWidth={1} />
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            {/* Avatar Column */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden relative">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <User size={64} className="text-slate-600" />
                                            </div>
                                        )}
                                        {/* Overlay for upload hint (Visual only for now) */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-900 p-1.5 rounded-full border-4 border-slate-900 shadow-lg">
                                        <div className="w-3 h-3 bg-current rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Patient Account</p>
                                    <p className="text-slate-500 text-xs font-mono">ID: {user.uid.slice(0, 8)}...</p>
                                </div>
                            </div>

                            {/* Form Column */}
                            <div className="flex-1 w-full">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="text-amber-500" size={24} />
                                    Profile Information
                                </h2>

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Display Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-slate-400 cursor-not-allowed font-medium"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                        <p className="text-sm text-slate-400">
                                            {saveSuccess ? (
                                                <span className="text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                    <BadgeCheck size={18} /> Changes saved successfully!
                                                </span>
                                            ) : (
                                                "Update your personal details here."
                                            )}
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</span>
                                            ) : (
                                                <>Save Changes <Save size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security & Danger Zone Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Security Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-3xl bg-slate-800/20 border border-slate-700/50 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Security</h3>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">Manage password, 2FA, and connected devices.</p>
                            <button className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors text-sm">
                                Change Password via Email
                            </button>
                        </motion.div>

                        {/* Danger Zone */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 backdrop-blur-sm hover:bg-rose-950/20 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-rose-400">Danger Zone</h3>
                            </div>
                            <p className="text-rose-300/60 text-sm mb-6">Irreversible actions. Tread carefully.</p>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Delete Account
                            </button>
                        </motion.div>
                    </div>

                </main>
                <AnimatePresence>
                    {isDeleteModalOpen && <DeleteAccountModal user={user} onClose={() => setIsDeleteModalOpen(false)} />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Settings;
