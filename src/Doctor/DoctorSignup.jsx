import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../App';

export default function DoctorSignup({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create Doctor Document
            await setDoc(doc(db, 'doctors', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'doctor',
                createdAt: serverTimestamp(),
                joinedVia: 'email'
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if doctor profile already exists
            const docRef = doc(db, 'doctors', user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // NEW DOCTOR: Create profile automatically
                await setDoc(docRef, {
                    uid: user.uid,
                    email: user.email,
                    role: 'doctor',
                    name: user.displayName || 'Doctor', // Attempt to capture name
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    joinedVia: 'google'
                });
            } else {
                // EXISTING USER: Check if they are actually a doctor
                if (docSnap.data().role !== 'doctor') {
                    await auth.signOut();
                    setError("This Google account is registered as a Patient, not a Doctor.");
                    return;
                }
                // If they are a doctor, doing nothing here is fine; 
                // auth state change in Main.js will pick it up and redirect to Dashboard.
            }

        } catch (err) {
            console.error("Google Sign In Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black/40 backdrop-blur-lg border border-amber-500/20 p-8 rounded-2xl shadow-2xl shadow-amber-500/10 max-w-md w-full mx-auto">
            <img src="/assets/curebird_logo_gold.png" alt="CureBird Gold Logo" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Doctor Registration</h2>
            <p className="text-center text-slate-400 mb-8">Join the clinical network.</p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400" htmlFor="s-email">Email</label>
                    <input
                        id="s-email"
                        type="email"
                        required
                        value={email}
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 p-3 border bg-slate-800/50 border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400" htmlFor="s-password">Password</label>
                    <input
                        id="s-password"
                        type="password"
                        required
                        value={password}
                        placeholder="Create a password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-3 border bg-slate-800/50 border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400" htmlFor="s-confirm-password">Confirm Password</label>
                    <input
                        id="s-confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        placeholder="Confirm your password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mt-1 p-3 border bg-slate-800/50 border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 text-slate-900 py-3 rounded-lg hover:bg-amber-400 font-semibold transition-colors disabled:opacity-50 mt-2"
                >
                    {loading ? 'Creating Account...' : 'Sign Up as Doctor'}
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
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-amber-400 hover:text-amber-300 ml-1 transition-colors">
                    Login
                </button>
            </p>
        </div>
    );
}
