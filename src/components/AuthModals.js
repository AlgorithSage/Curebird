// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Phone, CheckCircle, Loader2, ArrowRight, User, Camera, Mail, Upload, Stethoscope } from 'lucide-react';
import CurebirdLogo from '../curebird_logo.png';

// --- Initialize Providers ---
const googleProvider = new GoogleAuthProvider();

const ModalWrapper = ({ onClose, children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md relative group"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Animated Gradient Border Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>

            <div className="relative w-full bg-[#0F172A] rounded-2xl p-1 overflow-hidden">
                {/* Internal Glassy Texture */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"></div>
                <div className="relative bg-[#0F172A]/80 rounded-xl overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    {children}
                </div>
            </div>
        </motion.div>
    </motion.div>
);

const AuthModals = ({ onClose, db, storage, auth }) => {
    // Auth State
    const [authStep, setAuthStep] = useState('selection'); // 'selection' | 'login' | 'profile'
    const [currentUser, setCurrentUser] = useState(null);

    // Login Form State
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Profile Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    // UI State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    // Initialize Recaptcha
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            // SAFEGUARD: Ensure container is empty before creating new instance
            const container = document.getElementById('recaptcha-container');
            if (container) container.innerHTML = '';

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setError("Recaptcha expired. Please try again.");
                }
            });
        }
    }

    // Cleanup Recaptcha
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    // ignore
                }
                window.recaptchaVerifier = null;
            }
        }
    }, []);

    // Helper: Check if Profile Exists
    const checkAndRedirect = async (user) => {
        setCurrentUser(user);
        setError('');
        setLoading(true);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                console.log("User Profile Found:", userDoc.data());
                setLoading(false);
                onClose(); // Profile exists, login complete
            } else {
                console.log("No Profile Found, redirecting to Onboarding...");
                // Pre-fill data from Google if available
                if (user.displayName) {
                    const names = user.displayName.split(' ');
                    setFirstName(names[0] || '');
                    setLastName(names.length > 1 ? names.slice(1).join(' ') : '');
                }
                if (user.email) setEmail(user.email);
                if (user.photoURL) setProfilePreview(user.photoURL);

                setAuthStep('profile');
                setLoading(false);
            }
        } catch (err) {
            console.error("Error checking profile:", err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        }
    };

    // --- Login Handlers ---

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const formattedNumber = phoneNumber.trim();
        if (formattedNumber.length < 12) {
            setError("Please enter a valid 10-digit number.");
            return;
        }

        setLoading(true);
        onCaptchVerify();

        const appVerifier = window.recaptchaVerifier;

        try {
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            setLoading(false);
        } catch (error) {
            console.error("OTP Error:", error);
            setError(error.message);
            setLoading(false);
            // DO NOT clear verifier here; allows retry with same instance
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!otp || otp.length < 6) {
            setError("Please enter valid OTP.");
            setLoading(false);
            return;
        }

        try {
            const result = await confirmationResult.confirm(otp);
            checkAndRedirect(result.user);
        } catch (error) {
            console.error("OTP Verify Error:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setError('');
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                checkAndRedirect(result.user);
            }).catch((err) => {
                setError(err.message);
            });
    }

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('+91')) {
            val = '+91 ' + val.replace(/^\+91\s?/, '');
        }
        setPhoneNumber(val);
    };

    // --- Profile Handlers ---

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim()) {
            setError("First Name and Last Name are required.");
            return;
        }

        setLoading(true);

        try {
            let photoURL = profilePreview || ''; // Default to preview (could be Google URL)

            // Upload Image if new one selected
            if (profileImage) {
                const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
                await uploadBytes(storageRef, profileImage);
                photoURL = await getDownloadURL(storageRef);
            } else if (!photoURL) {
                // No photo set, check if Google photo exists, else default is empty (handled by UI)
                photoURL = currentUser.photoURL || '';
            }

            // Save to Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: photoURL,
                createdAt: new Date(),
                isProfileComplete: true
            });

            console.log("Profile Saved Successfully!");

            // Force reload of user state in parent or just close
            // Since we updated Firestore, App.js listener might catch it if we triggered a user update,
            // but for now, just closing is enough as the user is already logged in.
            // A page refresh might be needed to show the new name immediately if the listener doesn't fire on doc change.
            // But usually, modifying the doc won't trigger auth state change.
            // We can rely on a reload or just let the user in.
            window.location.reload();

        } catch (err) {
            console.error("Profile Save Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-8 relative z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full hover:bg-white/10"
                >
                    <X size={20} />
                </button>

                {/* Header with Logo Area - Enhanced */}
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-slate-900 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4 p-3 relative group">
                        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <img
                            src={CurebirdLogo}
                            alt="Curebird Logo"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {authStep === 'selection' ? (
                            <>Are you a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Patient</span> or <span className="text-slate-200">Doctor</span>?</>
                        ) : authStep === 'login' ? (
                            <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Curebird</span></>
                        ) : 'Complete Profile'}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        {authStep === 'selection' ? 'Select your role to continue.' : authStep === 'login' ? 'Your advanced AI health companion.' : 'Let us personalize your experience.'}
                    </p>
                </div>

                {authStep === 'selection' ? (
                    // --- STEP 0: SELECTION ---
                    <div className="grid gap-4 py-2">
                        {/* Patient Card */}
                        <button
                            onClick={() => setAuthStep('login')}
                            className="group relative flex items-center p-4 rounded-2xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/60 transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-700/80 group-hover:border-amber-500/30 flex items-center justify-center mr-5 relative z-10 shadow-lg group-hover:shadow-amber-500/20 transition-all">
                                <User className="text-slate-400 group-hover:text-amber-400 transition-colors" size={24} />
                            </div>

                            <div className="text-left flex-1 relative z-10">
                                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">Patient Portal</h3>
                                <p className="text-xs font-medium text-slate-500 group-hover:text-amber-500/80 transition-colors">Personal Health Companion</p>
                            </div>

                            <div className="h-10 w-10 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all border border-transparent group-hover:border-amber-500/20">
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>

                        {/* Doctor Card */}
                        <button
                            onClick={() => window.location.href = '/doctor/login'}
                            className="group relative flex items-center p-4 rounded-2xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/60 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-700/80 group-hover:border-blue-500/30 flex items-center justify-center mr-5 relative z-10 shadow-lg group-hover:shadow-blue-500/20 transition-all">
                                <Stethoscope className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
                            </div>

                            <div className="text-left flex-1 relative z-10">
                                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">Doctor Portal</h3>
                                <p className="text-xs font-medium text-slate-500 group-hover:text-blue-500/80 transition-colors">Clinical Professional Access</p>
                            </div>

                            <div className="h-10 w-10 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all border border-transparent group-hover:border-blue-500/20">
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>
                    </div>
                ) : authStep === 'login' ? (
                    // --- STEP 1: LOGIN ---
                    <>
                        <div className="space-y-6">
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-white/5 border border-slate-200"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0f172a] px-3 text-slate-500 font-semibold tracking-wider">Or Login using Phone</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div id="recaptcha-container"></div>

                                {!isOtpSent ? (
                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <div className="group relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={handlePhoneChange}
                                                placeholder="+91 99999 99999"
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-amber-500 border border-slate-600/50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 hover:shadow-lg shadow-black/20"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                                <>Get Verification Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <div className="text-center mb-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                            <p className="text-slate-300 text-sm">Code sent to <span className="text-amber-400 font-mono font-bold">{phoneNumber}</span></p>
                                            <button type="button" onClick={() => setIsOtpSent(false)} className="text-xs text-slate-500 hover:text-white mt-1 underline decoration-dashed">Change Number</button>
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono font-bold"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Login"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // --- STEP 2: COMPLETE PROFILE ---
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        {/* Avatar Uploader - Premium Look */}
                        <div className="flex justify-center -mt-2">
                            <div
                                className="relative w-28 h-28 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer group hover:border-amber-500 transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <User size={32} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-amber-500/80">Upload</span>
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-900 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                                    <Camera size={14} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Email (Optional)</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete & Enter"}
                        </button>
                    </form>
                )}

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm overflow-hidden"
                        >
                            <ShieldAlert size={18} className="shrink-0 text-rose-500" />
                            <span className="font-medium">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalWrapper>
    );
};

export default AuthModals;
