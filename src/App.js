import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { AnimatePresence } from 'framer-motion';

// Import all components
import Sidebar from './components/Sidebar';
import MedicalPortfolio from './components/MedicalPortfolio';
import AuthModals from './components/AuthModals';
import AllRecords from './components/AllRecords';
import Appointments from './components/Appointments';
import Background from './components/Background';
import Medications from './components/Medications';
import Settings from './components/Settings';
import CureStat from './components/CureStat';
import CureAnalyzer from './components/CureAnalyzer';
import CureAI from './components/CureAI';
import LandingPage from './components/LandingPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import LoadingScreen from './components/LoadingScreen';

const firebaseConfig = {
    apiKey: "AIzaSyB6phfALFUYNvEhF3BkVwuHK4OeocV-IEo",
    authDomain: "curebird-535e5.firebaseapp.com",
    projectId: "curebird-535e5",
    storageBucket: "curebird-535e5.firebasestorage.app",
    messagingSenderId: "325018733204",
    appId: "1:325018733204:web:8b10b21d92afe506e1c281"
};

// Export initialized Firebase instances for use in other modules (like Main.js)
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const appId = firebaseConfig.appId;
const googleProvider = new GoogleAuthProvider();

const formatDate = (date) => date?.toDate ? date.toDate().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publicView, setPublicView] = useState(null); // 'terms', 'privacy', 'contact', or null
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [activeView, setActiveView] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user profile from Firestore to get custom fields (firstName, photoURL, etc.)
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        // Merge Auth user with Firestore data
                        const userData = userDoc.data();
                        setUser({ ...currentUser, ...userData });
                    } else {
                        // If no profile yet, just use Auth user (AuthModals will handle creation)
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }

            // Artificial delay for loading screen
            setTimeout(() => {
                setLoading(false);
            }, 4000);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (email, password) => {
        setAuthError(null);
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (error) { setAuthError(error.message); }
    };
    const handleSignUp = async (email, password) => {
        setAuthError(null);
        try { await createUserWithEmailAndPassword(auth, email, password); }
        catch (error) { setAuthError(error.message); }
    };
    const handleGoogleSignIn = async () => {
        setAuthError(null);
        try { await signInWithPopup(auth, googleProvider); }
        catch (error) { setAuthError(error.message); }
    };
    const handleLogout = () => {
        signOut(auth).catch(error => setAuthError(error.message));
    };

    const renderActiveView = () => {
        const pageProps = {
            user, db, storage, appId, formatDate, capitalize,
            onLogout: handleLogout,
            onLoginClick: () => setIsAuthModalOpen(true),
            onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
            onNavigate: setActiveView
        };

        switch (activeView) {
            case 'Dashboard': return <MedicalPortfolio {...pageProps} />;
            case 'All Records': return <AllRecords {...pageProps} />;
            case 'Appointments': return <Appointments {...pageProps} />;
            case 'Medications': return <Medications {...pageProps} />;
            case 'Cure Analyzer': return <CureAnalyzer {...pageProps} />;
            case 'Cure Stat': return <CureStat {...pageProps} />;
            case 'Cure AI': return <CureAI {...pageProps} />;
            case 'Settings': return <Settings {...pageProps} />;
            case 'Contact': return <div className="p-6"><Contact onBack={() => setActiveView('Dashboard')} db={db} /></div>;
            case 'Terms': return <div className="p-6"><TermsOfService onBack={() => setActiveView('Dashboard')} /></div>;
            case 'Privacy': return <div className="p-6"><PrivacyPolicy onBack={() => setActiveView('Dashboard')} /></div>;
            default: return <MedicalPortfolio {...pageProps} />;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen font-sans text-slate-200 relative isolate overflow-hidden">
            <Background />

            {user ? (
                <div className="relative min-h-screen flex">
                    <Sidebar
                        activeView={activeView}
                        onNavigate={setActiveView}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        user={user} // Pass updated user with profile data
                    />
                    <main className="w-full min-h-screen transition-all duration-300">
                        {renderActiveView()}
                    </main>
                </div>
            ) : (
                <>
                    {publicView === 'terms' && <TermsOfService onBack={() => setPublicView(null)} />}
                    {publicView === 'privacy' && <PrivacyPolicy onBack={() => setPublicView(null)} />}
                    {publicView === 'contact' && <Contact onBack={() => setPublicView(null)} db={db} />}

                    {!publicView && (
                        <LandingPage
                            onLoginClick={() => setIsAuthModalOpen(true)}
                            onTermsClick={() => setPublicView('terms')}
                            onPrivacyClick={() => setPublicView('privacy')}
                            onContactClick={() => setPublicView('contact')}
                            onNavigate={(view) => {
                                if (user) {
                                    setActiveView(view);
                                } else {
                                    setIsAuthModalOpen(true);
                                }
                            }}
                        />
                    )}
                </>
            )}

            <AnimatePresence>
                {isAuthModalOpen && (
                    <AuthModals
                        user={user}
                        auth={auth}
                        db={db}
                        storage={storage}
                        onLogout={handleLogout}
                        onClose={() => setIsAuthModalOpen(false)}
                        onLogin={handleLogin}
                        onSignUp={handleSignUp}
                        onGoogleSignIn={handleGoogleSignIn}
                        capitalize={capitalize}
                        error={authError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

