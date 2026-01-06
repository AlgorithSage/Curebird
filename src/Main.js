import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoadingScreen from './components/LoadingScreen';

// Lazy load heavy components
const App = React.lazy(() => import('./App'));
const DoctorPortal = React.lazy(() => import('./Doctor/DoctorPortal'));
const PatientTelehealthSession = React.lazy(() => import('./components/PatientTelehealthSession'));

export default function Main() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const isDoctorContext = location.pathname.startsWith('/doctor');
    const [doctorRoleVerified, setDoctorRoleVerified] = useState(false);

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
    }, [isDoctorContext]);

    if (loading) {
        return <LoadingScreen />;
    }

    // RENDER LOGIC
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Doctor Portal Routes */}
                <Route path="/doctor/*" element={
                    user ? (
                        doctorRoleVerified ? (
                            <DoctorPortal user={user} />
                        ) : (
                            <DoctorPortal user={user} isNewDoctor={true} />
                        )
                    ) : (
                        <DoctorPortal user={null} />
                    )
                } />

                {/* Patient Telehealth Route */}
                <Route path="/telehealth/:appointmentId" element={
                    <PatientTelehealthSession user={user} />
                } />

                {/* Main Patient App (Catch-all) */}
                <Route path="/*" element={<App />} />
            </Routes>
        </Suspense>
    );
}
