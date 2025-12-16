import React, { useState } from 'react';
import { updateProfile } from "firebase/auth";
import { AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, User, Mail, Shield, AlertTriangle, Save } from 'lucide-react';

import Header from './Header';
import { DeleteAccountModal } from './Modals'; // We will add this modal next

const Settings = ({ user, onLogout, onLoginClick, onToggleSidebar }) => {
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
            await updateProfile(user, { displayName: displayName });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3s
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <Header
                    title="Settings"
                    description="Log in to manage your account."
                    user={null}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                />
                <div className="text-center py-20">
                    <p className="text-slate-400">Please log in to view your settings.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <Header
                title="Settings"
                description="Manage your account details and preferences."
                user={user}
                onLogout={onLogout}
                onToggleSidebar={onToggleSidebar}
            />

            <main className="mt-8 max-w-4xl mx-auto space-y-12">
                {/* Profile Information Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="flex items-center">
                            <label htmlFor="displayName" className="w-1/4 text-slate-400">Display Name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="flex-grow p-2 border bg-transparent border-slate-600 rounded-md text-white"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="w-1/4 text-slate-400">Email Address</label>
                            <p className="flex-grow text-slate-300">{user.email}</p>
                        </div>
                        <div className="flex items-center">
                            <label className="w-1/4 text-slate-400">User ID</label>
                            <p className="flex-grow text-slate-500 text-xs font-mono">{user.uid}</p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-400 font-semibold transition-colors disabled:bg-slate-600">
                                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                        {saveSuccess && <p className="text-emerald-400 text-right text-sm">Profile updated successfully!</p>}
                    </form>
                </div>

                {/* Account Deletion Section */}
                <div className="bg-rose-900/50 border border-rose-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-rose-300 mb-4">Danger Zone</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">Delete this account</p>
                            <p className="text-slate-400 text-sm mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                        </div>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 font-semibold transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </main>
            <AnimatePresence>
                {isDeleteModalOpen && <DeleteAccountModal user={user} onClose={() => setIsDeleteModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default Settings;

