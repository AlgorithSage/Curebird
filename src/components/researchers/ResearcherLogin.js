import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Microscope, Loader2, ArrowRight, ShieldCheck, Lock, Phone } from '../Icons';
import { motion } from 'framer-motion';

const googleProvider = new GoogleAuthProvider();

export default function ResearcherLogin() {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone Auth State
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Initialize Recaptcha
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            const container = document.getElementById('researcher-recaptcha-container');
            if (container) container.innerHTML = '';

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'researcher-recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("Researcher reCAPTCHA Solved");
                },
                'expired-callback': () => {
                    setError("Recaptcha expired. Please try again.");
                }
            });
        }
    }

    const checkRoleAndRedirect = async (user) => {
        setLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'researcher' || userData.role === 'admin') {
                    navigate('/research');
                } else {
                    // Auto-upgrade existing user to Researcher for this portal
                    console.log("Existing user accessing Research Portal: Granting Access...");
                    await updateDoc(userDocRef, {
                        role: 'researcher'
                    });
                    navigate('/research');
                }
            } else {
                // AUTO-SIGNUP LOGIC for Researcher Portal
                console.log("New User on Research Portal: Creating Profile...");
                const names = user.displayName ? user.displayName.split(' ') : ['Researcher', 'User'];

                await setDoc(userDocRef, {
                    uid: user.uid,
                    firstName: names[0],
                    lastName: names.slice(1).join(' ') || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    photoURL: user.photoURL || '',
                    role: 'researcher', // Auto-assign role
                    createdAt: new Date(),
                    isProfileComplete: true
                });

                navigate('/research');
            }
        } catch (err) {
            console.error("Role Check Error:", err);
            setError('System error during authorization.');
            await auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            checkRoleAndRedirect(result.user);
        } catch (err) {
            setError('Invalid email or password.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            checkRoleAndRedirect(result.user);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const inputNumber = phoneNumber.trim();
        if (inputNumber.length < 12) {
            setError("Please enter a valid number (+91...)");
            return;
        }

        setLoading(true);
        onCaptchVerify();
        const appVerifier = window.recaptchaVerifier;

        try {
            const confirmation = await signInWithPhoneNumber(auth, inputNumber.replace(/\s/g, ''), appVerifier);
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            setLoading(false);
        } catch (error) {
            console.error("OTP Error:", error);
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
            checkRoleAndRedirect(result.user);
        } catch (error) {
            setError("Invalid OTP.");
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('+91')) {
            val = '+91 ' + val.replace(/^\+91\s?/, '');
        }
        setPhoneNumber(val);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-200 font-sans selection:bg-amber-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-slate-900 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-6 p-4 relative group">
                        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <Microscope size={40} className="text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Researcher <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Portal</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Secure access for authorized personnel only.</p>
                </div>

                <div className="relative group">
                    {/* Animated Gradient Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>

                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden">

                        <div id="researcher-recaptcha-container"></div>

                        {/* Method Switcher */}
                        <div className="flex bg-black/40 p-1 rounded-lg mb-6 border border-white/10">
                            <button
                                onClick={() => setLoginMethod('email')}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${loginMethod === 'email' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Email ID
                            </button>
                            <button
                                onClick={() => setLoginMethod('phone')}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${loginMethod === 'phone' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Phone OTP
                            </button>
                        </div>

                        {loginMethod === 'email' ? (
                            <form onSubmit={handleEmailLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Access ID</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                        placeholder="researcher@institute.org"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                                        <ShieldCheck size={18} className="shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>Authenticate <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {!isOtpSent ? (
                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                    <Phone size={18} />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={handlePhoneChange}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                                                    placeholder="+91 99999 99999"
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                                                <ShieldCheck size={18} className="shrink-0" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>Get OTP <ArrowRight size={18} /></>
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
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono font-bold"
                                        />
                                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Login"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-3 text-slate-500 font-bold backdrop-blur-xl">Or continue with</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            Google
                        </button>

                        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                <Lock size={12} /> Encrypted Session • HIPAA Compliant
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
                        Return to Homepage
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
