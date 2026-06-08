import React, { useState } from 'react';
import { getAuth, updateProfile, updateEmail, updatePassword, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Save, Camera, AlertTriangle, BadgeCheck, FileText, ArrowRight, Settings as SettingsIcon, Crown, HelpCircle } from './Icons';

import Header from './Header';
import { DeleteAccountModal } from './Modals';
import MedicalDisclaimerModal from './legal/MedicalDisclaimerModal';
import { Button } from './ui/button';

const Settings = ({ user, db, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

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



    const handleDeleteAccount = async () => {
        try {
            const user = getAuth().currentUser;
            if (user) {
                // Delete user data from Firestore (Optional: Use Cloud Functions for full cleanup)
                // For MVP, just delete the auth user
                await deleteUser(user);
                onLogout();
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("For security, you may need to re-login before deleting your account.");
        }
    };

    const handlePasswordReset = async () => {
        if (!user || !user.email) return;
        setIsSaving(true);
        try {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, user.email);
            alert(`Password reset email has been sent to ${user.email}`);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            alert("Failed to send password reset email. Please try again later.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (window.confirm("Are you sure you want to cancel your Premium subscription? You will lose access to AI features immediately.")) {
            try {
                const { doc, updateDoc } = await import('firebase/firestore');
                const userRef = doc(db, 'users', user.uid);

                // Downgrade to Free
                await updateDoc(userRef, {
                    subscriptionStatus: 'cancelled', // or 'active' but relying on Tier
                    subscriptionTier: 'Free',
                    cancelledAt: new Date().toISOString()
                });

                alert("Subscription cancelled. You have been downgraded to the Free plan.");
                // Optionally trigger a reload or context update if not reactive
                window.location.reload();
            } catch (error) {
                console.error("Error cancelling subscription:", error);
                alert("Failed to cancel subscription. Please try again or contact support.");
            }
        }
    };

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white selection:bg-amber-500/30">
                <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                    <Header
                        title="Settings"
                        description="Log in to manage your account."
                        user={null}
                        onLoginClick={onLoginClick}
                        onToggleSidebar={onToggleSidebar}
                        onNavigate={onNavigate}
                    />
                </div>
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
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white selection:bg-amber-500/30">

            <div className="relative z-10">
                <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                    <Header
                        title="Account Settings"
                        description="Manage your profile and security preferences."
                        user={user}
                        onLogout={onLogout}
                        onToggleSidebar={onToggleSidebar}
                        onNavigate={onNavigate}
                    />
                </div>

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
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            loading={isSaving}
                                            variant="primary"
                                            icon={Save}
                                            iconPosition="right"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* Subscription Management Section */}
                    {user?.subscriptionTier !== 'Free' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="glass-card relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <Crown className="text-amber-500/20 w-32 h-32 -mr-10 -mt-10" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Crown className="text-amber-500" size={24} weight="fill" />
                                    Subscription Management
                                </h2>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Current Plan</p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl font-black text-white">{user.subscriptionTier || 'Free'}</span>
                                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            You currently have access to all Premium features including Cure Analyzer, AI Health Coach, and Family Profiles.
                                        </p>
                                    </div>

                                    <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <HelpCircle className="text-slate-400" size={18} />
                                                <h4 className="font-bold text-slate-200">Cancellation Policy</h4>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-4">
                                                You can cancel anytime. Your access will be downgraded to the Free tier immediately.
                                                <br /><br />
                                                <span className="text-amber-500 font-bold">Note:</span> If you have an active auto-pay mandate (UPI/Card), please ensure you also cancel it in your banking app to prevent future charges.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleCancelSubscription}
                                            variant="danger"
                                            size="full"
                                        >
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Security & Danger Zone Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Security Card — uses global glass-card-indigo */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card-indigo relative overflow-hidden group"
                        >
                            {/* Decorative watermark */}
                            <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none">
                                <Shield className="text-indigo-500/20 w-28 h-28 -mr-8 -mt-8" strokeWidth={1} />
                            </div>
                             <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <Shield size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Security</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Manage password, 2FA, and connected devices.</p>
                                <Button
                                    onClick={handlePasswordReset}
                                    variant="secondary"
                                    size="full"
                                    icon={Mail}
                                    iconPosition="left"
                                >
                                    Change Password via Email
                                </Button>
                            </div>
                        </motion.div>

                        {/* Danger Zone Card — uses global glass-card-rose */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card-rose relative overflow-hidden group"
                        >
                            {/* Decorative watermark */}
                            <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none">
                                <AlertTriangle className="text-rose-500/20 w-28 h-28 -mr-8 -mt-8" strokeWidth={1} />
                            </div>                             <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-rose-400">Danger Zone</h3>
                                </div>
                                <p className="text-rose-300/60 text-sm mb-6 leading-relaxed">Irreversible actions. Tread carefully.</p>
                                <Button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    variant="danger"
                                    size="full"
                                    icon={AlertTriangle}
                                    iconPosition="left"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                    {/* Legal & Trust */}
                    <section className="glass-card relative overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                            <Shield size={16} className="text-amber-500" /> Legal & Compliance
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <button
                                onClick={() => setIsDisclaimerOpen(true)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-200 group-hover:text-white transition-colors">Medical Disclaimer</div>
                                        <div className="text-xs text-slate-400">Read our liability and safety terms</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                            </button>
                        </div>
                    </section>

                </main>
                <AnimatePresence>
                    {isDeleteModalOpen && (
                        <DeleteAccountModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={handleDeleteAccount}
                        />
                    )}
                    {isDisclaimerOpen && (
                        <MedicalDisclaimerModal
                            isOpen={isDisclaimerOpen}
                            onClose={() => setIsDisclaimerOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Settings;
