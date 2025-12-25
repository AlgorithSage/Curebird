// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Phone, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

// --- Firebase Configuration ---
// IMPORTANT: Ensure "Phone" is enabled in Firebase Console -> Authentication -> Sign-in method
const firebaseConfig = {
    apiKey: "AIzaSyB6phfALFUYNvEhF3BkVwuHK4OeocV-IEo",
    authDomain: "curebird-535e5.firebaseapp.com",
    projectId: "curebird-535e5",
    storageBucket: "curebird-535e5.firebasestorage.app",
    messagingSenderId: "325018733204",
    appId: "1:325018733204:web:8b10b21d92afe506e1c281"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const ModalWrapper = ({ onClose, children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

            {children}
        </motion.div>
    </motion.div>
);

const AuthModals = ({ onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Initialize Recaptcha
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    // onSubmit(); // We handle this manually
                },
                'expired-callback': () => {
                    setError("Recaptcha expired. Please try again.");
                }
            });
        }
    }

    // Cleanup Recaptcha on unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    }, []);

    // Handle Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const formattedNumber = phoneNumber.trim();
        if (formattedNumber.length < 12) { // crude check for +91 + 10 digits
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
            setError("Failed to send OTP. Ensure the number is correct and try again.");
            setLoading(false);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    };

    // Handle Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!otp || otp.length < 6) {
            setError("Please enter the 6-digit valid OTP.");
            setLoading(false);
            return;
        }

        try {
            const result = await confirmationResult.confirm(otp);
            console.log("Phone Login Success:", result.user);
            setLoading(false);
            onClose(); // Close modal on success
        } catch (error) {
            console.error("OTP Verify Error:", error);
            setError("Invalid OTP. PLease check and try again.");
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setError('');
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log('Google Sign-In successful!', result.user);
                onClose();
            }).catch((err) => {
                setError(err.message);
                console.error("Google Sign-In Error:", err);
            });
    }

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        // Enforce +91 prefix
        if (!val.startsWith('+91')) {
            val = '+91 ' + val.replace(/^\+91\s?/, '');
        }
        setPhoneNumber(val);
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to Curebird</h1>
                    <p className="text-slate-400 text-sm">Your intelligent health companion.</p>
                </div>

                {/* Google Login (Primary) */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-xs font-medium uppercase tracking-wider">Or Login using Phone</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                {/* Phone Login Section */}
                <div className="space-y-4">
                    {/* Invisible Recaptcha */}
                    <div id="recaptcha-container"></div>

                    {!isOtpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="+91 99999 99999"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                    <>
                                        Get OTP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-slate-500 text-center">
                                By continuing, you may receive an SMS for verification. Standard message and data rates may apply.
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-3">
                            <div className="text-center mb-2">
                                <p className="text-slate-400 text-sm">OTP sent to <span className="text-white font-mono">{phoneNumber}</span></p>
                                <button type="button" onClick={() => setIsOtpSent(false)} className="text-amber-500 text-xs hover:underline mt-1">Change Number</button>
                            </div>

                            <div>
                                <input
                                    type="text" // using text to avoid spinners
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Login"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm"
                        >
                            <ShieldAlert size={18} className="shrink-0 text-red-500" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalWrapper>
    );
};

export default AuthModals;
