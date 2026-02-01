import React, { useState, useEffect, lazy, Suspense } from 'react'; // v2.0
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
import LoadingScreen from './components/LoadingScreen';

// Lazy load all components
const Sidebar = lazy(() => import('./components/Sidebar'));
const MedicalPortfolio = lazy(() => import('./components/MedicalPortfolio'));
const PatientChat = lazy(() => import('./components/PatientChat'));
const AuthModals = lazy(() => import('./components/AuthModals'));
const AllRecords = lazy(() => import('./components/AllRecords'));
const Appointments = lazy(() => import('./components/Appointments'));
const Background = lazy(() => import('./components/Background')); // Lazy load background too, it's not critical for logic
const Medications = lazy(() => import('./components/Medications'));
const Settings = lazy(() => import('./components/Settings'));
const CureStat = lazy(() => import('./components/CureStat'));
const CureAnalyzer = lazy(() => import('./components/CureAnalyzer'));
const CureAI = lazy(() => import('./components/CureAI'));
const CureTracker = lazy(() => import('./components/CureTracker'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Contact = lazy(() => import('./components/Contact'));
const RefundPolicy = lazy(() => import('./components/RefundPolicy'));

const ShareProfile = lazy(() => import('./components/ShareProfile'));
const DoctorPublicView = lazy(() => import('./components/DoctorPublicView'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const FamilyProfile = lazy(() => import('./components/FamilyProfile'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const RecordFormModal = lazy(() => import('./components/Modals').then(module => ({ default: module.RecordFormModal })));

// Researchers Module
const ResearchersLayout = lazy(() => import('./components/researchers/ResearchersLayout'));
const DataExplorer = lazy(() => import('./components/researchers/DataExplorer'));
const ModelPlayground = lazy(() => import('./components/researchers/ModelPlayground'));
const ModelRepository = lazy(() => import('./components/researchers/ModelRepository'));
const ResearchDashboard = lazy(() => import('./components/researchers/ResearchDashboard'));
const ResearcherLogin = lazy(() => import('./components/researchers/ResearcherLogin'));
const RequireResearcherAuth = lazy(() => import('./components/researchers/RequireResearcherAuth')); // Lazy load guard

const formatDate = (date) => date?.toDate ? date.toDate().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');

const RequireAuth = ({ user, children, redirectTo = "/" }) => {
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }
    return children;
};

const LayoutWithSidebar = ({ user, isSidebarOpen, setSidebarOpen, onSubscribeClick, onAddRecordClick, children }) => {
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
            <main className="w-full min-h-screen transition-all duration-300 pb-20 md:pb-0">
                {children}
            </main>
            <Suspense fallback={null}>
                {user && <BottomNav onAddClick={() => onAddRecordClick && onAddRecordClick()} />}
            </Suspense>

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
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false); // GLOBALLY LIFTED STATE

    const navigate = useNavigate();
    const location = useLocation();

    const handleAskAI = (context) => {
        navigate('/cure-ai', { state: context });
    };

    useEffect(() => {
        // Redirect logic removed as per user request to keep Vercel standalone


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
                    const { doc, onSnapshot, updateDoc } = await import('firebase/firestore');
                    const userDocRef = doc(db, 'users', currentUser.uid);

                    profileUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();

                            // Check for hackathon expiry
                            if (userData.isHackathonJudge && userData.hackathonExpiry) {
                                const expiry = userData.hackathonExpiry.toDate();
                                if (new Date() > expiry) {
                                    // Local Override (UI only)
                                    userData.subscriptionStatus = 'expired';
                                    userData.isHackathonJudge = false;

                                    // Optional: Persist to DB to clean up
                                    // await updateDoc(userDocRef, { subscriptionStatus: 'expired', isHackathonJudge: false });
                                }
                            }

                            const fullUser = { ...currentUser, ...userData };
                            setUser(fullUser);

                            if (userData.isProfileComplete === false) {
                                setIsAuthModalOpen(true);
                            }

                            // Show subscription modal only if not seen AND not already active/judge AND not in Research Module
                            if (!userData.hasSeenSubscription && userData.subscriptionStatus !== 'active' && !userData.isHackathonJudge && !window.location.pathname.startsWith('/research')) {
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



            // OPTIMIZATION: Removed artificial delay. 
            // The app is ready as soon as Auth check completes.
            setLoading(false);
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
            'Privacy': '/privacy',
            'Refund': '/refund-policy'
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
        onSubscribeClick: () => setIsSubscriptionModalOpen(true),
        onAddRecordClick: () => setIsRecordModalOpen(true),
        onCloseRecordModal: () => setIsRecordModalOpen(false),
        isRecordModalOpen: isRecordModalOpen
    };

    // Helper to open Add Record Modal from Bottom Nav (Global Context would be better, but passing props for now)
    // Actually, BottomNav is inside LayoutWithSidebar which has access to `setIsSubscriptionModalOpen` but typically Add Record is in MedicalPortfolio.
    // For now, let's wire BottomNav's Add to Subscription or a generic "Action" menu if Record Modal is not lifted.
    // Ideally, we move `isFormModalOpen` to App.js or use a Context.
    // Given the constraints, I will leave the "Add" button to open the Auth/Sub/Menu for now, 
    // OR we simply only render BottomNav where it makes sense. 
    // Let's pass a placeholder handler.

    return (
        <ToastProvider>
            <IconContext.Provider value={{ weight: "duotone", color: "currentColor", size: "1em" }}>
                <div className="min-h-screen font-sans text-slate-200 relative isolate overflow-hidden">
                    <Suspense fallback={<LoadingScreen />}>
                        {!location.pathname.startsWith('/research') && <Background />}
                        <Routes>
                            <Route path="/" element={
                                user ? <Navigate to="/dashboard" replace /> :
                                    <LandingPage
                                        onLoginClick={() => setIsAuthModalOpen(true)}
                                        onTermsClick={() => navigate('/terms')}
                                        onPrivacyClick={() => navigate('/privacy')}
                                        onRefundClick={() => navigate('/refund-policy')}
                                        onContactClick={() => navigate('/contact')}
                                        onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
                                    />
                            } />

                            <Route path="/terms" element={<TermsOfService onBack={() => navigate(-1)} {...pageProps} />} />
                            <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate(-1)} {...pageProps} />} />
                            <Route path="/refund-policy" element={<RefundPolicy onBack={() => navigate(-1)} {...pageProps} />} />
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
                            <Route path="/dashboard" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><MedicalPortfolio {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/all-records" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><AllRecords {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/appointments" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><Appointments {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/medications" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><Medications {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/cure-tracker" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><CureTracker {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/cure-analyzer" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><CureAnalyzer {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/cure-stat" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><CureStat {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/messages" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><PatientChat {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/cure-ai" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><CureAI {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/doctor-access" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><ShareProfile {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/settings" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><Settings {...pageProps} /></LayoutWithSidebar></RequireAuth>} />
                            <Route path="/family-profile" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><FamilyProfile {...pageProps} /></LayoutWithSidebar></RequireAuth>} />

                            <Route path="/family-profile" element={<RequireAuth user={user}><LayoutWithSidebar user={user} isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} onAddRecordClick={() => setIsRecordModalOpen(true)}><FamilyProfile {...pageProps} /></LayoutWithSidebar></RequireAuth>} />

                            {/* Researchers Module Routes */}
                            {/* Researchers Module Routes */}
                            <Route path="/research/login" element={<ResearcherLogin />} />

                            <Route element={<RequireResearcherAuth user={user} />}>
                                <Route path="/research" element={<ResearchersLayout user={user} />}>
                                    <Route index element={<ResearchDashboard />} />
                                    <Route path="data" element={<DataExplorer />} />
                                    <Route path="playground" element={<ModelPlayground />} />
                                    <Route path="models" element={<ModelRepository />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>

                    <AnimatePresence>
                        {isAuthModalOpen && (
                            <Suspense fallback={null}>
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
                            </Suspense>
                        )}
                        {isSubscriptionModalOpen && (
                            <Suspense fallback={null}>
                                <SubscriptionModal
                                    isOpen={isSubscriptionModalOpen}
                                    onClose={() => setIsSubscriptionModalOpen(false)}
                                    onSubscribe={async (tier, isJudge = false) => {
                                        if (user) {
                                            try {
                                                const { doc, updateDoc } = await import('firebase/firestore');
                                                const updateData = {
                                                    subscriptionStatus: 'active',
                                                    subscriptionTier: tier,
                                                    subscriptionUpdatedAt: new Date(),
                                                    hasSeenSubscription: true // Prevent future popups
                                                };

                                                if (isJudge) {
                                                    updateData.isHackathonJudge = true;
                                                    const expiryDate = new Date();
                                                    expiryDate.setDate(expiryDate.getDate() + 14); // 2 Weeks validity (Extended)
                                                    updateData.hackathonExpiry = expiryDate;
                                                }

                                                await updateDoc(doc(db, 'users', user.uid), updateData);
                                                // Refresh user context implicitly via onSnapshot
                                            } catch (e) {
                                                console.error("Error updating subscription:", e);
                                            }
                                        }
                                    }}
                                />
                            </Suspense>
                        )}
                        {isRecordModalOpen && (
                            <Suspense fallback={null}>
                                <RecordFormModal
                                    onClose={() => setIsRecordModalOpen(false)}
                                    userId={user?.uid}
                                    appId={appId}
                                    db={db}
                                    storage={storage}
                                />
                            </Suspense>
                        )}
                    </AnimatePresence>
                </div>
            </IconContext.Provider>
        </ToastProvider>
    );
}
