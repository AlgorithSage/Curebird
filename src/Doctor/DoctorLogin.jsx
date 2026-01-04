import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../App';
import { useToast } from '../context/ToastContext';

export default function DoctorLogin({ onSwitchToSignup }) {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Check Role
            const docRef = doc(db, 'doctors', user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists() || docSnap.data().role !== 'doctor') {
                // Not a doctor! Sign out immediately.
                await auth.signOut();
                showToast("Access Denied: This account is not registered as a Doctor.", "error");
            } else {
                showToast("Welcome back, Dr. " + (docSnap.data().name || ""), "success");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const docRef = doc(db, 'doctors', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // EXISTING: Verify Role
                if (docSnap.data().role !== 'doctor') {
                    await auth.signOut();
                    const toastMsg = "Access Denied: This Google account is for a Patient.";
                    showToast(toastMsg, "error");
                } else {
                    showToast("Welcome back, Dr. " + (docSnap.data().name || user.displayName), "success");
                }
            } else {
                // NEW: Auto-create Doctor account (Seamless Onboarding)
                // This fulfills the requirement: "create an account... then they can login"
                await setDoc(docRef, {
                    uid: user.uid,
                    email: user.email,
                    role: 'doctor',
                    name: user.displayName || 'Doctor',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    authProvider: 'google'
                });
                showToast("Account created! Welcome to Curebird Doctor Portal.", "success");
            }

        } catch (err) {
            console.error("Google Login Error:", err);
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-black/40 backdrop-blur-lg border border-amber-500/20 p-8 rounded-2xl shadow-2xl shadow-amber-500/10 max-w-md w-full mx-auto">
            <img src="/assets/curebird_logo_gold.png" alt="CureBird Gold Logo" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Doctor Portal Login</h2>
            <p className="text-center text-slate-400 mb-8">Secure access to clinical records.</p>



            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-widest ml-1" htmlFor="d-email">Doctor Email</label>
                    <input
                        id="d-email"
                        type="email"
                        required
                        value={email}
                        placeholder="Enter your doctor email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-2 p-4 border bg-slate-900/50 border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-base font-medium"
                    />
                </div>
                <div>
                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-widest ml-1" htmlFor="d-password">Password</label>
                    <input
                        id="d-password"
                        type="password"
                        required
                        value={password}
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-2 p-4 border bg-slate-900/50 border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-base font-medium"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 py-4 rounded-xl hover:from-amber-300 hover:to-amber-500 font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all disabled:opacity-50 mt-4 text-sm"
                >
                    {loading ? 'Logging in...' : 'Login as Doctor'}
                </button>
            </form>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-700/50 text-white py-3 rounded-lg hover:bg-slate-700 font-semibold transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                Continue with Google
            </button>

            <p className="mt-6 text-center text-slate-400 text-sm">
                Need a doctor account?{' '}
                <button onClick={onSwitchToSignup} className="font-semibold text-amber-400 hover:text-amber-300 ml-1 transition-colors">
                    Sign Up
                </button>
            </p>
        </div>
    );
}
