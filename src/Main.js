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
            // STRICT ISOLATION LOGIC:
            // Only check Doctor Role if we are explicitly in the Doctor Context (URL starts with /doctor)
            // This ensures "Login as User" (at /) NEVER triggers a Doctor DB read.

            if (currentUser && isDoctorContext) {
                // If we have a user in doctor context, we MUST verify role before showing content.
                // We set/keep loading true to prevent "Access Denied" flicker while awaiting Firestore.
                setLoading(true);
                setUser(currentUser);

                try {
                    const doctorDoc = await getDoc(doc(db, 'doctors', currentUser.uid));
                    if (doctorDoc.exists() && doctorDoc.data().role === 'doctor') {
                        // Merge Auth user with Firestore Doctor data (firstName, degree, etc.)
                        const doctorData = doctorDoc.data();
                        setUser({ ...currentUser, ...doctorData });
                        setDoctorRoleVerified(true);
                    } else {
                        // Correct flow: User authenticated but no doctor profile -> Send to onboarding
                        setUser(currentUser);
                        setDoctorRoleVerified(false);
                    }
                } catch (error) {
                    console.error("Error verifying doctor role:", error);
                    setDoctorRoleVerified(false);
                } finally {
                    // Only release loading state after verification is done
                    setLoading(false);
                }
            } else {
                // Not in doctor context, or not logged in -> No need to verify doctor role
                // We can proceed immediately
                setUser(currentUser);
                setDoctorRoleVerified(false);
                setLoading(false);
            }
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
                // Authenticated but NOT a verified Doctor -> New Doctor Onboarding
                return <DoctorPortal user={user} isNewDoctor={true} />;
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
