import React, { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup
} from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { auth, db, storage, googleProvider, appId } from './firebase';
import { ToastProvider } from './context/ToastContext';
import { IconContext } from '@phosphor-icons/react';

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

const RequireAuth = ({ user, children, redirectTo = "/" }) => {
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }
    return children;
};

const LayoutWithSidebar = ({ user, isSidebarOpen, setSidebarOpen, onSubscribeClick, children }) => {
    return (
        <div className="relative min-h-screen flex">
            <Sidebar
                // activeView is now handled internally in Sidebar or we can pass it if needed, 
                // but better to let Sidebar use useLocation.
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onSubscribeClick={onSubscribeClick}
            />
            <main className="w-full min-h-screen transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleAskAI = (context) => {
        navigate('/cure-ai', { state: context });
    };

    useEffect(() => {
        // Redirect legacy domain to new custom domain
        if (window.location.hostname.includes('vercel.app')) {
            window.location.replace('https://www.curebird.tech' + window.location.pathname + window.location.search);
        }

        const params = new URLSearchParams(window.location.search);
        const shareToken = params.get('share');
        if (shareToken && location.pathname !== '/doctor-view') {
            navigate(`/doctor-view?share=${shareToken}`);
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        let profileUnsubscribe = null;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const { doc, onSnapshot } = await import('firebase/firestore');
                    const userDocRef = doc(db, 'users', currentUser.uid);

                    profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            const fullUser = { ...currentUser, ...userData };
                            setUser(fullUser);

                            if (userData.isProfileComplete === false) {
                                setIsAuthModalOpen(true);
                            }

                            if (!userData.hasSeenSubscription) {
                                setTimeout(() => setIsSubscriptionModalOpen(true), 1500);
                            }

                        } else {
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

            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const isSlow = connection && (['slow-2g', '2g', '3g'].includes(connection.effectiveType));
            const finalDelay = isSlow ? 3500 : 1000;

            setTimeout(() => {
                setLoading(false);
            }, finalDelay);
        });

        return () => {
            unsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    const handleLogin = async (email, password) => {
        setAuthError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsAuthModalOpen(false);
        }
        catch (error) { setAuthError(error.message); }
    };
    const handleSignUp = async (email, password) => {
        setAuthError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setIsAuthModalOpen(false);
        }
        catch (error) { setAuthError(error.message); }
    };
    const handleGoogleSignIn = async () => {
        setAuthError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            setIsAuthModalOpen(false);
        }
        catch (error) { setAuthError(error.message); }
    };
    const handleLogout = () => {
        signOut(auth).catch(error => setAuthError(error.message));
        navigate('/');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const handleNavigate = (pathOrViewName) => {
        const routeMap = {
            'Dashboard': '/dashboard',
            'All Records': '/all-records',
            'Appointments': '/appointments',
            'Medications': '/medications',
            'Cure Tracker': '/cure-tracker',
            'Cure Analyzer': '/cure-analyzer',
            'Cure Stat': '/cure-stat',
            'Messages': '/messages',
            'Cure AI': '/cure-ai',
            'Doctor Access': '/doctor-access',
            'Settings': '/settings',
            'Family Profile': '/family-profile',
            'Contact': '/contact',
            'Terms': '/terms',
            'Privacy': '/privacy'
        };
        const target = routeMap[pathOrViewName] || pathOrViewName;
        navigate(target);
    };

    const pageProps = {
        user, db, storage, appId, formatDate, capitalize,
        onLogout: handleLogout,
        onLoginClick: () => setIsAuthModalOpen(true),
        onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
        onNavigate: handleNavigate,
        onAskAI: handleAskAI,
        onSubscribeClick: () => setIsSubscriptionModalOpen(true)
    };

    return (
        <ToastProvider>
            <IconContext.Provider value={{ weight: "duotone", color: "currentColor", size: "1em" }}>
                <div className="min-h-screen font-sans text-slate-200 relative isolate overflow-hidden">
                    <Background />

                    <Routes>
                        <Route path="/" element={
                            user ? <Navigate to="/dashboard" replace /> :
                                <LandingPage
                                    onLoginClick={() => setIsAuthModalOpen(true)}
                                    onTermsClick={() => navigate('/terms')}
                                    onPrivacyClick={() => navigate('/privacy')}
                                    onContactClick={() => navigate('/contact')}
                                    onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
                                />
                        } />

                        <Route path="/terms" element={<TermsOfService onBack={() => navigate(-1)} {...pageProps} />} />
                        <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate(-1)} {...pageProps} />} />
                        <Route path="/contact" element={<Contact onBack={() => navigate(-1)} db={db} {...pageProps} />} />
                        <Route path="/doctor-view" element={
                            <DoctorPublicView
                                db={db}
                                appId={appId}
                                shareToken={new URLSearchParams(window.location.search).get('share')}
                                onBack={() => navigate('/')}
                            />
                        } />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><MedicalPortfolio {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/all-records" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><AllRecords {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/appointments" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><Appointments {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/medications" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><Medications {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/cure-tracker" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><CureTracker {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/cure-analyzer" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><CureAnalyzer {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/cure-stat" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><CureStat {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/messages" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><PatientChat {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/cure-ai" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><CureAI {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/doctor-access" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><ShareProfile {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/settings" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><Settings {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                        <Route path="/family-profile" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)}><FamilyProfile {...pageProps} /></LayoutWithSidebar></RequireAuth>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <AnimatePresence>
                        {isAuthModalOpen && (
                            <AuthModals
                                user={user}
                                auth={auth}
                                db={db}
                                storage={storage}
                                onLogout={handleLogout}
                                onClose={() => setIsAuthModalOpen(false)}
                                allowClose={user ? user.isProfileComplete : true}
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
                                onSubscribe={async (tier) => {
                                    if (user) {
                                        try {
                                            const { doc, updateDoc } = await import('firebase/firestore');
                                            await updateDoc(doc(db, 'users', user.uid), {
                                                subscriptionStatus: 'active',
                                                subscriptionTier: tier,
                                                subscriptionUpdatedAt: new Date()
                                            });
                                            // Refresh user context implicitly via onSnapshot
                                        } catch (e) {
                                            console.error("Error updating subscription:", e);
                                        }
                                    }
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </IconContext.Provider>
        </ToastProvider>
    );
}
