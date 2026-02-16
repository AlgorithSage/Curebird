import React, { useState, useEffect, useRef } from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {  ShieldAlert, Phone, Loader2, ArrowRight, User, Camera, Mail, ArrowLeft, Lock  } from '../components/Icons';

// Use the central Firebase exports
import { auth, db, storage } from '../firebase';

const googleProvider = new GoogleAuthProvider();

// --- Video Background Component (Same as Researcher/Landing) ---
const VideoBackground = () => (
    <div className="fixed inset-0 overflow-hidden z-0">
        <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 hidden md:block"
        >
            <source src="/medical-bg.mp4" type="video/mp4" />
        </video>
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 opacity-80 block md:hidden" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
    </div>
);

export default function DoctorAuth({ initialUser }) {
    // Auth State
    const [authStep, setAuthStep] = useState('login'); // 'login' | 'profile'
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
    const [currentUser, setCurrentUser] = useState(null);

    // Effect: Handle Initial User (Redirected from Main.js)
    useEffect(() => {
        if (initialUser) {
            checkAndRedirect(initialUser);
        }
    }, [initialUser]);

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Profile Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [degree, setDegree] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [email, setEmail] = useState(''); // Secondary email or main contact
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const [licenseImage, setLicenseImage] = useState(null);
    const [licensePreview, setLicensePreview] = useState(null);

    // UI State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const licenseInputRef = useRef(null);

    // --- RECAPTCHA SETUP ---
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            // Ensure container is empty
            const container = document.getElementById('doctor-recaptcha-container');
            if (container) container.innerHTML = '';

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'doctor-recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                    console.log("Doctor reCAPTCHA Solved");
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
    
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            checkAndRedirect(userCredential.user);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

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
        // FIX: Ensure container is ready before verify
        // In render, 'recaptcha-container' is only shown if !isOtpSent.
        // But we call this BEFORE we set isOtpSent=true, so it SHOULD be there.
        onCaptchVerify();
        const appVerifier = window.recaptchaVerifier;

        const formattedNumber = phoneNumber.replace(/\s/g, '');
        console.log("Doctor Auth: Requesting SMS to", formattedNumber);

        try {
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            console.log("Doctor Auth: SMS Sent Successfully");
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            setLoading(false);
        } catch (error) {
            console.error("Doctor Auth OTP Error:", error);
            if (error.code === 'auth/too-many-requests') {
                setError("Too many OTP attempts. Please wait 15 minutes or use a Test Phone Number in Firebase Console.");
            } else {
                setError(error.message);
            }
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

    const handleImageSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') {
                    setProfileImage(file);
                    setProfilePreview(reader.result);
                } else {
                    setLicenseImage(file);
                    setLicensePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim() || !degree.trim() || !specialization.trim()) {
            setError("All fields (Name, Degree, Specialization) are required.");
            return;
        }

        setLoading(true);

        try {
            let photoURL = profilePreview || '';
            let licenseURL = '';

            // Upload Profile Image
            if (profileImage) {
                const storageRef = ref(storage, `doctor_profiles/${currentUser.uid}`);
                await uploadBytes(storageRef, profileImage);
                photoURL = await getDownloadURL(storageRef);
            } else if (!photoURL) {
                photoURL = currentUser.photoURL || '';
            }

            // Upload License Image (Required if new)
            if (licenseImage) {
                const licenseRef = ref(storage, `doctor_licenses/${currentUser.uid}`);
                await uploadBytes(licenseRef, licenseImage);
                licenseURL = await getDownloadURL(licenseRef);
            }

            // Create Doctor Profile
            await setDoc(doc(db, 'doctors', currentUser.uid), {
                uid: currentUser.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                name: `${firstName} ${lastName}`,
                degree: degree.trim(),
                specialization: specialization.trim(),
                email: email.trim(),
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: photoURL,
                licenseURL: licenseURL,
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            <VideoBackground />


            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-[480px] relative group z-10"
            >
                {/* 1. DEEP AMBER HALO (The large diffuse glow) */}
                <div className="absolute -inset-4 bg-amber-600/40 rounded-[3rem] blur-3xl opacity-100 transition duration-1000 group-hover:bg-amber-600/50"></div>

                {/* 2. RIM GLOW (Defining the edges) */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-400 via-orange-500 to-amber-900 rounded-3xl opacity-100 blur-sm"></div>

                {/* 3. GLASS CARD CONTAINER */}
                <div className="relative bg-[#050505]/80 backdrop-blur-xl border border-amber-500/40 p-8 rounded-3xl shadow-2xl overflow-hidden">
                    
                    {/* Top Ambient Light (Orange tint from top) */}
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-600/20 to-transparent pointer-events-none"></div>

                    {/* Back Button */}
                    <button
                        onClick={() => window.location.href = '/'}
                        className="absolute top-5 left-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors group z-20"
                        title="Back to Patient Login"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                        {/* Logo & Header */}
                        <div className="text-center mb-5">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-900 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4 p-3 relative group">
                                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                                <img src="/assets/curebird_logo_gold.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>
                            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                                {authStep === 'login' ? 'Doctor Portal' : 'Doctor Profile'}
                            </h1>
                            <p className="text-slate-400 text-sm font-medium">
                                {authStep === 'login' ? 'Secure access to clinical records.' : 'Set up your professional identity.'}
                            </p>
                        </div>

                        {/* --- STEP 1: LOGIN --- */}
                        {authStep === 'login' && (
                            <div className="space-y-4">
                                
                                {/* TAB SWITCHER */}
                                <div className="flex bg-black/40 p-1 rounded-xl mb-3 border border-white/10">
                                    <button
                                        onClick={() => setLoginMethod('email')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMethod === 'email' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Email ID
                                    </button>
                                    <button
                                        onClick={() => setLoginMethod('phone')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMethod === 'phone' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Phone OTP
                                    </button>
                                </div>

                                {loginMethod === 'email' && (
                                    <form onSubmit={handleEmailLogin} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Access ID</label>
                                            <input
                                                type="email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                placeholder="doctor@hospital.org"
                                                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold text-base"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                            <input
                                                type="password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold text-base"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border border-white/10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-amber-500/20 text-base"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Authenticate <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                        </button>
                                    </form>
                                )}

                                {loginMethod === 'phone' && (
                                    <div className="space-y-4">
                                        <div id="doctor-recaptcha-container"></div>
                                        {!isOtpSent ? (
                                            <form onSubmit={handleSendOtp} className="space-y-4">
                                                <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                                                    <div className="group relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors"><Phone size={20} /></div>
                                                        <input
                                                            type="tel"
                                                            value={phoneNumber}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (!val.startsWith('+91')) val = '+91 ' + val.replace(/^\+91\s?/, '');
                                                                setPhoneNumber(val);
                                                            }}
                                                            placeholder="+91 99999 99999"
                                                            className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl px-4 py-3 pl-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold text-base"
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border border-white/10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-amber-500/20 text-base"
                                                >
                                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>Get OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                                <div className="text-center mb-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                                    <p className="text-slate-300 text-sm">Code sent to <span className="text-amber-400 font-mono font-bold">{phoneNumber}</span></p>
                                                    <button type="button" onClick={() => setIsOtpSent(false)} className="text-xs text-slate-500 hover:text-white mt-1 underline decoration-dashed">Change Number</button>
                                                </div>
                                                <input
                                                    type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6}
                                                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl px-4 py-3 text-center text-3xl tracking-[0.5em] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 font-mono font-bold"
                                                />
                                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-base">
                                                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Login"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                <div className="relative my-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-black/20 backdrop-blur-md px-3 py-1 text-slate-400 font-bold tracking-wider rounded border border-white/5">Or Continue With</span></div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-white/5 border border-slate-200 text-base"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                                    <span>Continue with Google</span>
                                </button>
                                
                                <div className="mt-3 pt-3 border-t border-slate-800 text-center">
                                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                        <Lock size={10} /> Encrypted Session • HIPAA Compliant
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 2: PROFILE --- */}
                        {authStep === 'profile' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="flex justify-center -mt-2">
                                    <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer group hover:border-amber-500 transition-all" onClick={() => fileInputRef.current?.click()}>
                                        {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="flex flex-col items-center gap-1"><User size={24} className="text-slate-500 group-hover:text-amber-500" /><span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Upload</span></div>}
                                        <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-900 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={12} /></div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, 'profile')} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs" placeholder="John" /></div>
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs" placeholder="Doe" /></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Degree</label><input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs" placeholder="MBBS" /></div>
                                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</label><input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs" placeholder="Cardio" /></div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500" size={14} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs" placeholder="contact@clinic.com" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical License</label>
                                    <div className="flex items-center gap-3 bg-slate-950/30 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => licenseInputRef.current?.click()}>
                                        <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0">
                                            {licensePreview ? <img src={licensePreview} alt="License" className="w-full h-full object-cover rounded" /> : <div className="text-amber-500"><Camera size={16} /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-300">{licenseImage ? licenseImage.name.substring(0, 15) + '...' : "Upload Photo"}</p>
                                            <p className="text-[10px] text-slate-500">Required</p>
                                        </div>
                                    </div>
                                    <input type="file" ref={licenseInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, 'license')} />
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-1 text-sm">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Submit Application"}
                                </button>
                            </form>
                        )}

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-300 text-xs overflow-hidden">
                                    <ShieldAlert size={14} className="shrink-0 text-rose-500" /><span className="font-medium">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

            </motion.div>

            {/* Return to Homepage Footer */}
            <div className="mt-8 text-center z-20 relative">
                <a href="/" className="text-slate-500 hover:text-white transition-colors text-sm font-medium tracking-wide">
                    Return to Homepage
                </a>
            </div>
        </div>
    );
}
