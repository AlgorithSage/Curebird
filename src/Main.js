import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import App, { auth, db } from './App';
import DoctorPortal from './Doctor/DoctorPortal';
import LoadingScreen from './components/LoadingScreen';

export default function Main() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [isDoctorContext, setIsDoctorContext] = useState(window.location.pathname.startsWith('/doctor'));
    const [doctorRoleVerified, setDoctorRoleVerified] = useState(false);

    useEffect(() => {
        const handleLocationChange = () => {
            const path = window.location.pathname;
            setCurrentPath(path);
            setIsDoctorContext(path.startsWith('/doctor'));
        };
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            // STRICT ISOLATION LOGIC:
            // Only check Doctor Role if we are explicitly in the Doctor Context (URL starts with /doctor)
            // This ensures "Login as User" (at /) NEVER triggers a Doctor DB read.

            if (currentUser && isDoctorContext) {
                try {
                    const doctorDoc = await getDoc(doc(db, 'doctors', currentUser.uid));
                    if (doctorDoc.exists() && doctorDoc.data().role === 'doctor') {
                        setDoctorRoleVerified(true);
                    } else {
                        setDoctorRoleVerified(false);
                    }
                } catch (error) {
                    console.error("Error verifying doctor role:", error);
                    setDoctorRoleVerified(false);
                }
            } else {
                // Not in doctor context, or not logged in -> No need to verify doctor role
                setDoctorRoleVerified(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [isDoctorContext]); // Re-run if context changes (e.g. user navigates to /doctor manually)

    if (loading) {
        return <LoadingScreen />;
    }

    // RENDER LOGIC

    // 1. DOCTOR CONTEXT (Path starts with /doctor)
    if (isDoctorContext) {
        if (user) {
            if (doctorRoleVerified) {
                // Authenticated Doctor in Doctor Area -> Allow
                return <DoctorPortal user={user} />;
            } else {
                // Authenticated but NOT a verified Doctor -> Access Denied
                // (e.g. a Patient tried to go to /doctor/dashboard)
                return (
                    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                        <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                        <p className="text-slate-400 mb-6">This account is not authorized to access the Doctor Portal.</p>
                        <button
                            onClick={() => {
                                auth.signOut();
                                window.location.href = '/doctor/login'; // Force reload/nav to doctor login
                            }}
                            className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600 mb-4"
                        >
                            Sign Out & Return to Login
                        </button>

                        {/* Developer Helper to Fix "Access Denied" for testers */}
                        <button
                            onClick={async () => {
                                try {
                                    const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                                    await setDoc(doc(db, 'doctors', user.uid), {
                                        uid: user.uid,
                                        email: user.email,
                                        role: 'doctor',
                                        createdAt: serverTimestamp(),
                                        joinedVia: 'dev_fix'
                                    });
                                    window.location.reload();
                                } catch (e) {
                                    alert("Error fixing account: " + e.message);
                                }
                            }}
                            className="text-xs text-amber-500 underline opacity-60 hover:opacity-100"
                        >
                            (DEV ONLY) Enable Doctor Access for this Account
                        </button>
                    </div>
                );
            }
        } else {
            // Not logged in -> Show Doctor Login (handled by Portal)
            return <DoctorPortal user={null} />;
        }
    }

    // 2. USER CONTEXT (Path is /, /dashboard, etc.)
    // We strictly render App. We NEVER checked the 'doctors' collection here.
    // If a Doctor logs in here, they get treated as a User (App handles the UI).
    // This satisfies "Doctor logic must NOT execute at all during User login".
    return <App />;
}
