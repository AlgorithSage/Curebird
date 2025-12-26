import React, { useState, useEffect, useRef } from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, Loader2, ArrowRight, User, Camera, Mail, ArrowLeft } from 'lucide-react';

// Use the central Firebase exports
import { auth, db, storage } from '../App';
import CurebirdLogo from '../curebird_loading_logo.png'; // Using the loading logo or main logo

const googleProvider = new GoogleAuthProvider();

export default function DoctorAuth() {
    // Auth State
    const [authStep, setAuthStep] = useState('login'); // 'login' | 'profile'
    const [currentUser, setCurrentUser] = useState(null);

    // Login Form State
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Profile Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(''); // Secondary email or main contact
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    // UI State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    // --- RECAPTCHA SETUP ---
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            // Ensure container is empty
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
    };

    useEffect(() => {
        // cleanup
        return () => {
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
        }
    }, []);


    // --- LOGIC: CHECK IF DOCTOR EXISTS ---
    const checkAndRedirect = async (user) => {
        setCurrentUser(user);
        setError('');
        setLoading(true);

        try {
            const docRef = doc(db, 'doctors', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.role === 'doctor') {
                    // Success! Main.js will detect the auth state change and role.
                    // We don't strictly need to do anything else here, 
                    // but we can reload to ensure clean state or just wait.
                    // Usually the parent listener reacts.
                    console.log("Doctor Logged In");
                } else {
                    await auth.signOut();
                    setError("Access Denied: This account is not a Doctor.");
                }
            } else {
                // New User -> Profile Setup
                // Pre-fill
                if (user.displayName) {
                    const names = user.displayName.split(' ');
                    setFirstName(names[0] || '');
                    setLastName(names.length > 1 ? names.slice(1).join(' ') : '');
                }
                if (user.email) setEmail(user.email);
                if (user.photoURL) setProfilePreview(user.photoURL);

                setAuthStep('profile');
            }
            setLoading(false);
        } catch (err) {
            console.error("Check Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            checkAndRedirect(result.user);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.trim().length < 12) {
            setError("Please enter a valid 10-digit number.");
            return;
        }

        setLoading(true);
        onCaptchVerify();
        const appVerifier = window.recaptchaVerifier;

        try {
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!otp || otp.length < 6) return;

        try {
            const result = await confirmationResult.confirm(otp);
            checkAndRedirect(result.user);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePreview(reader.result);
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
            let photoURL = profilePreview || '';

            if (profileImage) {
                const storageRef = ref(storage, `doctor_profiles/${currentUser.uid}`);
                await uploadBytes(storageRef, profileImage);
                photoURL = await getDownloadURL(storageRef);
            } else if (!photoURL) {
                photoURL = currentUser.photoURL || '';
            }

            // Create Doctor Profile
            await setDoc(doc(db, 'doctors', currentUser.uid), {
                uid: currentUser.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                name: `${firstName} ${lastName}`,
                email: email.trim(),
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: photoURL,
                role: 'doctor',
                createdAt: serverTimestamp(),
                joinedVia: currentUser.phoneNumber ? 'phone' : 'google',
                isProfileComplete: true
            });

            // Reload to trigger Main.js context checks
            window.location.reload();

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md relative group"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl opacity-75 blur transition duration-1000 animate-pulse-slow"></div>

                <div className="relative w-full bg-[#0F172A] rounded-2xl p-1 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"></div>
                    <div className="relative bg-[#0F172A]/80 rounded-xl p-8 overflow-hidden">

                        {/* Back Button */}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors group z-20"
                            title="Back to Patient Login"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        {/* Logo & Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-slate-900 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4 p-3 relative group">
                                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                                <img src={CurebirdLogo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {authStep === 'login' ? 'Doctor Portal' : 'Doctor Profile'}
                            </h1>
                            <p className="text-slate-400 text-sm font-medium">
                                {authStep === 'login' ? 'Secure access to clinical records.' : 'Set up your professional identity.'}
                            </p>
                        </div>

                        {/* --- STEP 1: LOGIN --- */}
                        {authStep === 'login' && (
                            <div className="space-y-6">
                                <button
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-white/5 border border-slate-200"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                                    <span>Continue with Google</span>
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-3 text-slate-500 font-semibold tracking-wider">Or Login using Phone</span></div>
                                </div>

                                <div className="space-y-4">
                                    <div id="recaptcha-container"></div>
                                    {!isOtpSent ? (
                                        <form onSubmit={handleSendOtp} className="space-y-4">
                                            <div className="group relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors"><Phone size={18} /></div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (!val.startsWith('+91')) val = '+91 ' + val.replace(/^\+91\s?/, '');
                                                        setPhoneNumber(val);
                                                    }}
                                                    placeholder="+91 99999 99999"
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                                />
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-amber-500 border border-slate-600/50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                                                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Get Verification Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                                            <div className="text-center mb-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                                <p className="text-slate-300 text-sm">Code sent to <span className="text-amber-400 font-mono font-bold">{phoneNumber}</span></p>
                                                <button type="button" onClick={() => setIsOtpSent(false)} className="text-xs text-slate-500 hover:text-white mt-1 underline decoration-dashed">Change Number</button>
                                            </div>
                                            <input
                                                type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 font-mono font-bold"
                                            />
                                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
                                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Login"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- STEP 2: PROFILE --- */}
                        {authStep === 'profile' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex justify-center -mt-2">
                                    <div className="relative w-28 h-28 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer group hover:border-amber-500 transition-all" onClick={() => fileInputRef.current?.click()}>
                                        {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="flex flex-col items-center gap-1"><User size={32} className="text-slate-500 group-hover:text-amber-500" /><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Upload</span></div>}
                                        <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-900 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={14} /></div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="John" /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="Doe" /></div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secondary Email (Optional)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="contact@clinic.com" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2">
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete & Enter"}
                                </button>
                            </form>
                        )}

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm overflow-hidden">
                                    <ShieldAlert size={18} className="shrink-0 text-rose-500" /><span className="font-medium">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
