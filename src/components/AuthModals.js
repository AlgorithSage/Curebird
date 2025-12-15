// --- ADDED: Import Firebase functions ---
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup 
} from "firebase/auth";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Stethoscope, Hospital, X, ShieldAlert } from 'lucide-react'; // Added ShieldAlert for errors

// --- ADDED: Firebase Configuration ---
// IMPORTANT: Replace this with your actual Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyB6phfALFUYNvEhF3BkVwuHK4OeocV-IEo",
  authDomain: "curebird-535e5.firebaseapp.com",
  projectId: "curebird-535e5",
  storageBucket: "curebird-535e5.firebasestorage.app",
  messagingSenderId: "325018733204",
  appId: "1:325018733204:web:8b10b21d92afe506e1c281"
};

// --- ADDED: Initialize Firebase and Auth ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');

const ModalWrapper = ({ onClose, children }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
        onClick={onClose}
    >
        <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            className="w-full max-w-md bg-black/40 backdrop-blur-lg border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10" 
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </motion.div>
    </motion.div>
);

// --- MODIFIED: The form now accepts props to handle state and submission ---
const AuthForm = ({ ctaText, activeTab, onSubmit, setEmail, setPassword }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <label className="text-xs text-slate-400" htmlFor="email">{capitalize(activeTab)} ID / Email</label>
            <input 
                id="email"
                name="email"
                type="email" 
                placeholder={`Enter your ${activeTab} email`}
                onChange={(e) => setEmail(e.target.value)} // --- ADDED ---
                className="w-full mt-1 p-3 border bg-slate-800/50 border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
        </div>
        <div>
            <label className="text-xs text-slate-400" htmlFor="password">Password</label>
            <input 
                id="password"
                name="password"
                type="password" 
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)} // --- ADDED ---
                className="w-full mt-1 p-3 border bg-slate-800/50 border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
        </div>
        <button type="submit" className="w-full bg-amber-500 text-slate-900 py-3 rounded-lg hover:bg-amber-400 font-semibold transition-colors">
            {ctaText}
        </button>
    </form>
);

const AuthModals = ({ onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [activeTab, setActiveTab] = useState('user');
    
    // --- ADDED: State for form inputs and error messages ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const tabs = [
        { id: 'user', name: 'User', icon: <User size={20} /> },
    ];

    // --- ADDED: Handler for form submission ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        if (isLoginView) {
            // Handle Login
            signInWithEmailAndPassword(auth, email, password)
                .then(userCredential => {
                    console.log('Logged in!', userCredential.user);
                    onClose(); // Close modal on success
                })
                .catch(err => {
                    setError(err.message);
                    console.error("Login Error:", err);
                });
        } else {
            // Handle Sign Up
            createUserWithEmailAndPassword(auth, email, password)
                .then(userCredential => {
                    console.log('Signed up!', userCredential.user);
                    onClose(); // Close modal on success
                })
                .catch(err => {
                    setError(err.message);
                    console.error("Sign Up Error:", err);
                });
        }
    };
    
    // --- ADDED: Handler for Google Sign-In ---
    const handleGoogleSignIn = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log('Google Sign-In successful!', result.user);
                onClose(); // Close modal on success
            }).catch((err) => {
                setError(err.message);
                console.error("Google Sign-In Error:", err);
            });
    }

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                <h1 className="text-3xl font-bold text-center text-white mb-2">{isLoginView ? 'Welcome Back' : 'Create an Account'}</h1>
                <p className="text-center text-slate-400 mb-8">{isLoginView ? 'Securely access your medical portfolio.' : 'Join and start managing your health records.'}</p>
                
                <div className="flex border-b border-slate-700 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                                activeTab === tab.id ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {tab.icon}
                            {tab.name}
                            {activeTab === tab.id && (
                                <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-amber-400" layoutId="underline" />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* --- MODIFIED: Pass state and handlers to the form --- */}
                        <AuthForm 
                            ctaText={`${isLoginView ? 'Login' : 'Sign Up'} as ${capitalize(activeTab)}`}
                            activeTab={activeTab}
                            onSubmit={handleFormSubmit}
                            setEmail={setEmail}
                            setPassword={setPassword}
                        />
                    </motion.div>
                </AnimatePresence>
                
                {/* --- ADDED: Google Sign-In Button --- */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 bg-slate-700/50 text-white py-3 rounded-lg hover:bg-slate-700 font-semibold transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Continue with Google
                </button>

                {/* --- ADDED: Error Display --- */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                        <ShieldAlert size={20} />
                        <span>{error}</span>
                    </div>
                )}
                
                <p className="text-center text-sm text-slate-400 mt-6">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-amber-400 hover:text-amber-300 ml-1">
                        {isLoginView ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </ModalWrapper>
    );
};

export default AuthModals;
