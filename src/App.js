import React, { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';

import { auth, db, storage, googleProvider, appId } from './firebase';
import { ToastProvider } from './context/ToastContext';

// Import all components
import Sidebar from './components/Sidebar';
import MedicalPortfolio from './components/MedicalPortfolio';
import PatientChat from './components/PatientChat';
import AuthModals from './components/AuthModals';
import AllRecords from './components/AllRecords';
import Appointments from './components/Appointments';
import Background from './components/Background';
import Medications from './components/Medications';
import Settings from './components/Settings';
import CureStat from './components/CureStat';
import CureAnalyzer from './components/CureAnalyzer';
import CureAI from './components/CureAI';
import CureTracker from './components/CureTracker';
import LandingPage from './components/LandingPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import LoadingScreen from './components/LoadingScreen';
import ShareProfile from './components/ShareProfile';
import DoctorPublicView from './components/DoctorPublicView';
import SubscriptionModal from './components/SubscriptionModal';
import FamilyProfile from './components/FamilyProfile';

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
    const [chatContext, setChatContext] = useState(null); // New state for passing context to Chat
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const handleAskAI = (context) => {
        setChatContext(context);
        setActiveView('Cure AI');
    };



    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareToken = params.get('share');
        if (shareToken) {
            setPublicView('doctor_view');
        }
    }, []);

    useEffect(() => {
        let profileUnsubscribe = null;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Set initial user with Auth data to avoid delay
                // setUser(currentUser); // Optional: Set basic user first

                try {
                    const { doc, onSnapshot } = await import('firebase/firestore');
                    const userDocRef = doc(db, 'users', currentUser.uid);

                    // Listen for real-time updates to the user profile
                    profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            const fullUser = { ...currentUser, ...userData };
                            // Important: If Auth displayName changes, it might not trigger this if only Firestore changes
                            // But since we update both, Firestore update will trigger this.
                            setUser(fullUser);


                            if (userData.isProfileComplete === false) {
                                setIsAuthModalOpen(true);
                            }

                            // Check for New User / Subscription Prompt
                            // If user is new (no subscriptionData) or specific flag is missing
                            // For this mock, we'll check if 'hasSeenSubscription' is false/undefined
                            if (!userData.hasSeenSubscription) {
                                setTimeout(() => setIsSubscriptionModalOpen(true), 1500); // Slight delay after login
                                // In a real app, we would update this flag ONLY after they interact or close the modal
                                // For now, we'll just open it.
                            }

                        } else {
                            // No profile yet
                            setUser(currentUser);
                            setIsAuthModalOpen(true);
                        }
                    }, (error) => {
                        console.error("Error listening to user profile:", error);
                    });

                } catch (error) {
                    console.error("Error setting up profile listener:", error);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
                if (profileUnsubscribe) {
                    profileUnsubscribe();
                    profileUnsubscribe = null;
                }
            }

            // Artificial delay for loading screen
            setTimeout(() => {
                setLoading(false);
            }, 2000); // Reduced delay for snappier feel
        });

        return () => {
            unsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
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
            onNavigate: setActiveView,
            onAskAI: handleAskAI, // Pass handler to all pages
            onSubscribeClick: () => setIsSubscriptionModalOpen(true) // Pass trigger
        };

        switch (activeView) {
            case 'Dashboard': return <MedicalPortfolio {...pageProps} />;
            case 'All Records': return <AllRecords {...pageProps} />;
            case 'Appointments': return <Appointments {...pageProps} />;
            case 'Medications': return <Medications {...pageProps} />;
            case 'Cure Tracker': return <CureTracker {...pageProps} />;
            case 'Cure Analyzer': return <CureAnalyzer {...pageProps} />;
            case 'Cure Stat': return <CureStat {...pageProps} />;
            case 'Messages': return <PatientChat {...pageProps} />;
            case 'Cure AI': return <CureAI {...pageProps} initialContext={chatContext} />; // Pass context to Chat
            case 'Doctor Access': return <ShareProfile {...pageProps} />;
            case 'Settings': return <Settings {...pageProps} />;
            case 'Contact': return <Contact {...pageProps} db={db} />;
            case 'Terms': return <TermsOfService {...pageProps} />;
            case 'Privacy': return <PrivacyPolicy {...pageProps} />;
            case 'Family Profile': return <FamilyProfile {...pageProps} />;
            default: return <MedicalPortfolio {...pageProps} />;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <ToastProvider>
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
                            onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
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
                        {publicView === 'doctor_view' && (
                            <DoctorPublicView
                                db={db}
                                appId={appId}
                                shareToken={new URLSearchParams(window.location.search).get('share')}
                                onBack={() => {
                                    setPublicView(null);
                                    window.history.replaceState({}, document.title, "/");
                                }}
                            />
                        )}

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
                                onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
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
                            allowClose={user ? user.isProfileComplete : true} // Only allow close if profile is complete (if user exists)
                            onLogin={handleLogin}
                            onSignUp={handleSignUp}
                            onGoogleSignIn={handleGoogleSignIn}
                            capitalize={capitalize}
                            error={authError}
                        />
                    )}
                    {isSubscriptionModalOpen && (
                        <SubscriptionModal
                            isOpen={isSubscriptionModalOpen}
                            onClose={() => setIsSubscriptionModalOpen(false)}
                            onSubscribe={(tier) => {
                                console.log("Subscribed to:", tier);
                                // Here we would update the user record in Firestore
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </ToastProvider>
    );
}

