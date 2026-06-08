import React, { useState, useEffect, useMemo, useRef } from 'react';
import LiquidButton from './ui/LiquidButton';
import GradientCard from './ui/GradientCard';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Pill, Calendar, ShieldCheck, UserPlus, FileText, Stethoscope, Hospital, HeartPulse, ChevronUp, Activity, Crown, Volume2, VolumeX, Play, Pause, Maximize, ScanEye, TrendingUp, Brain } from './Icons';
// import { AnalysisService } from '../services/AnalysisService';

import Header from './Header';
import StatCard from './StatCard';
import RecordsChart from './RecordsChart';
import RecordCard from './RecordCard';
import { ShareModal, DeleteConfirmModal } from './Modals';
import { SkeletonDashboard, SkeletonCard } from './SkeletonLoaders';
import DashboardOverview from './DashboardOverview';

import RotatingText from './RotatingText';
import { Button } from './ui/button';
// import HeroSection from './HeroSection'; // Removed per refactor



const MedicalPortfolio = ({ user, db, storage, appId, formatDate, capitalize, onLogout, onLoginClick, onToggleSidebar, onNavigate, onSubscribeClick, isRecordModalOpen, onAddRecordClick, onCloseRecordModal }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Premium Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.1 : 0.3,
                delayChildren: isMobile ? 0.1 : 0.4
            }
        }
    };

    const fadeSlideUp = {
        hidden: { opacity: 0, y: isMobile ? 30 : 100, filter: isMobile ? "blur(0px)" : "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: isMobile ? 0.5 : 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const staggerScale = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100
            }
        }
    };

    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [activeTypeFilter, setActiveTypeFilter] = useState(null); // Default to null (collapsed)

    // Phase 8: Health Score & Alerts

    // Video State
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const heroVideoRef = useRef(null);

    const formatTime = (time) => {
        if (isNaN(time) || time === Infinity || time < 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (heroVideoRef.current) {
            if (isPlaying) {
                heroVideoRef.current.pause();
            } else {
                heroVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const dashboardRef = useRef(null);
    const medicalHistoryRef = useRef(null); // Ref for scrolling to history

    const userId = user ? user.uid : null;

    const recordsCollectionRef = useMemo(() => {
        if (userId) {
            return collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
        }
        return null;
    }, [userId, db, appId]);

    useEffect(() => {
        const video = heroVideoRef.current;
        if (video) {
            const handleMetadata = () => {
                if (video.duration && !isNaN(video.duration)) {
                    setDuration(video.duration);
                }
            };

            // Explicitly try to play for lazy-loaded components
            const attemptPlay = async () => {
                try {
                    await video.play();
                    setIsPlaying(true);
                } catch (err) {
                    console.log("Autoplay prevented, user interaction might be needed:", err);
                    setIsPlaying(false);
                }
            };

            video.addEventListener('loadedmetadata', handleMetadata);
            video.addEventListener('durationchange', handleMetadata);

            if (video.readyState >= 2) {
                handleMetadata();
                attemptPlay();
            } else {
                video.addEventListener('loadeddata', attemptPlay, { once: true });
            }

            return () => {
                video.removeEventListener('loadedmetadata', handleMetadata);
                video.removeEventListener('durationchange', handleMetadata);
            };
        }
    }, []);

    useEffect(() => {
        if (recordsCollectionRef) {
            const q = query(recordsCollectionRef, orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecords(recordsData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching records: ", error);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setRecords([]);
        }
    }, [recordsCollectionRef]);

    // Phase 8: Fetch Metrics & Run Analysis
    /* 
    useEffect(() => {
        if (!userId) return;

        const runAnalysis = async () => {
            try {
                // 1. Fetch Diseases
                const diseasesRef = collection(db, 'users', userId, 'diseases');
                const dSnap = await getDocs(diseasesRef);
                const diseases = dSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // 2. Fetch Recent Metrics for each disease (PARALLEL)
                const metricsPromises = diseases.map(d => {
                    const mRef = collection(db, 'users', userId, 'diseases', d.id, 'metrics');
                    const q = query(mRef, orderBy('timestamp', 'desc'), limit(10));
                    return getDocs(q).then(mSnap =>
                        mSnap.docs.map(m => ({ id: m.id, diseaseId: d.id, ...m.data() }))
                    );
                });

                const metricsArrays = await Promise.all(metricsPromises);
                // const allMetrics = metricsArrays.flat(); // Kept for future use if AnalysisService is restored

                // 3. Run Analysis
                // const result = AnalysisService.calculateHealthScore(allMetrics, diseases);
                // const newAlerts = AnalysisService.generateAlerts(allMetrics);
            } catch (err) {
                console.error("Analysis Failed:", err);
            }
        };

        runAnalysis();
    }, [userId, db]); 
    */

    const handleDeleteRecord = async () => {
        if (!recordToDelete || !userId) return;
        try {
            const record = records.find(r => r.id === recordToDelete);
            if (record?.fileUrl) {
                const storageRef = ref(storage, record.fileUrl);
                await deleteObject(storageRef).catch(e => console.error("Error deleting storage object: ", e));
            }
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/medical_records`, recordToDelete));
        } catch (error) {
            console.error("Error deleting record: ", error);
        } finally {
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };

    const dashboardData = useMemo(() => {
        const counts = records.reduce((acc, record) => {
            const type = capitalize(record.type);
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [records, capitalize]);

    const lastVisit = records.length > 0 ? formatDate(records[0].date) : 'N/A';

    // Filter records based on selection
    const displayedRecords = useMemo(() => {
        if (!activeTypeFilter) return []; // Return empty if neither is selected
        if (activeTypeFilter === 'All') return records;
        return records.filter(r => r.type === activeTypeFilter);
    }, [records, activeTypeFilter]);

    const handleCategoryClick = (id) => {
        if (activeTypeFilter === id) {
            setActiveTypeFilter(null); // Collapse if clicking same
        } else {
            setActiveTypeFilter(id);
            // Optional: Scroll to list slightly
            setTimeout(() => {
                medicalHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    };

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
                <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                    <Header onLoginClick={onLoginClick} user={null} />
                </div>
                <div className="flex flex-col items-center justify-center h-4/5 text-center">
                    <UserPlus size={64} className="text-slate-500" />
                    <h1 className="text-3xl font-bold text-white mt-6">Welcome to Your Medical Portfolio</h1>
                    <p className="text-slate-400 mt-2 max-w-md">Please log in or create an account to securely access and manage your health records.</p>
                    <Button onClick={onLoginClick} variant="primary" size="lg" className="mt-8">
                        Login / Sign Up
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
            <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                <Header
                    user={user}
                    onAddClick={() => onAddRecordClick && onAddRecordClick()}
                    onShareClick={() => setIsShareModalOpen(true)}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                    // alerts={alerts} /* Removed unused alerts */
                />
            </div>

            {/* Testimonials & Stats Section */}
            <div className="glass-card mb-6">
                <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">CureBird Community</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Empowering Health, One Record at a Time</h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-sm">Trusted by 500+ active members globally. Built to revolutionize digital health tracking, recognized by Google Solutions Challenge.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { value: "500+", label: "Trusted Users" },
                        { value: "Google", label: "Solutions Challenge" },
                        { value: "4.9★", label: "User Rating" },
                    ].map(({ value, label }) => (
                        <div key={label} className="text-center p-4 rounded-2xl" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
                            <div className="text-xl sm:text-2xl font-black text-amber-400">{value}</div>
                            <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        { name: "Dr. Archisman Dey", title: "Primary Health Care Specialist", quote: "CureBird has completely streamlined how I track patient records. The AI Analyzer's capability to extract key metrics is incredibly accurate.", rating: 5.0 },
                        { name: "Subhashish Roy", title: "Chronic Care Manager & Patient", quote: "Managing blood sugar levels and medications was a constant struggle until I started using CureBird's intelligent tracker. It is truly life-changing.", rating: 4.8 },
                        { name: "Priya Sharma", title: "Wellness & Cardiovascular Tracker", quote: "The visual trends and dynamic metrics logs are beautifully designed. I can easily monitor my cardiovascular stats in real-time.", rating: 4.9 },
                    ].map(({ name, title, quote, rating }) => (
                        <div key={name} className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-slate-300 text-sm leading-relaxed flex-1">"{quote}"</p>
                            <div>
                                <div className="text-amber-400 text-xs mb-1">{"★".repeat(Math.floor(rating))} <span className="text-slate-500">{rating}</span></div>
                                <div className="font-semibold text-white text-sm">{name}</div>
                                <div className="text-slate-500 text-xs">{title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="mt-8">
                {/* Content Removed - Moved to Cure Tracker */}
                <>
                    {/* Welcome Text Block */}
                    <div className="mb-8 px-2 sm:px-6">
                        <div className="max-w-4xl text-center mx-auto">
                            <h1 className="text-lg sm:text-2xl xl:text-3xl font-extrabold tracking-tight leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="inline">
                                    <span className="text-white">Welcome {user?.firstName || 'User'}</span>
                                    <span className="hidden sm:inline text-white opacity-40 mx-2">|</span>
                                    <span className="ml-1 sm:ml-0 text-white">Cure</span><span className="text-amber-200">Bird</span>
                                    <span className="hidden md:inline text-white"> is at your service!</span>
                                </span>
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm font-medium">
                                <span className="text-amber-500/90 uppercase tracking-wider font-bold truncate">Medical Portfolio</span>
                                <span className="hidden md:inline truncate max-w-xl text-slate-400/80">Your centralized health dashboard</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Hero Section - Refactored */}
                    <div className="mb-16 mt-4 px-2 sm:px-6">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                            {/* Left Side: Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="w-full lg:w-1/2"
                            >
                                <div className="max-w-4xl text-center lg:text-left mx-auto lg:mx-0">
                                    <span className="inline-block py-1 px-3 rounded-full bg-slate-800/50 border border-slate-700 text-amber-500 text-xs font-bold tracking-wider mb-6 backdrop-blur-sm">
                                        AI-POWERED MEDICAL INTELLIGENCE
                                    </span>

                                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-8 sm:mb-10">
                                        Redefining Healthcare with <span className="font-black tracking-tight inline-flex items-baseline gap-x-2.5">
                                            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Cure</span>
                                            <RotatingText
                                                words={["Analyzer", "Stat", "AI", "Tracker"]}
                                                interval={80}
                                                typingSpeed={120}
                                                deletingSpeed={40}
                                            />
                                        </span>
                                    </h1>

                                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mt-4 sm:mt-0 relative z-10">
                                        Revolutionizing and Digitizing Healthcare with an <span className="text-amber-400 font-semibold">AI-Powered Ecosystem</span>. Seamlessly integrating intelligent health tracking, proactive insights, and a personalized health portfolio tailored just for you.
                                    </p>

                                    <div className="mt-8 sm:mt-10 flex flex-row flex-wrap gap-3 sm:gap-4">
                                        <LiquidButton
                                            onClick={() => onAddRecordClick && onAddRecordClick()}
                                            className="flex-1 sm:flex-none w-full sm:w-60 h-12 sm:h-14 px-5 sm:px-8 rounded-full text-sm sm:text-lg whitespace-nowrap flex items-center justify-center"
                                        >
                                            Add Health Record
                                        </LiquidButton>
                                        <button
                                            onClick={onNavigate ? () => onNavigate('Cure AI') : undefined}
                                            className="flex-1 sm:flex-none w-full sm:w-60 h-12 sm:h-14 px-5 sm:px-8 rounded-full text-sm sm:text-lg font-bold whitespace-nowrap text-amber-400 hover:text-amber-200 transition-all duration-300 active:scale-[0.97] flex items-center justify-center"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(10,10,10,0.80) 100%)",
                                                border: "1px solid rgba(245,158,11,0.28)",
                                                backdropFilter: "blur(12px)",
                                                WebkitBackdropFilter: "blur(12px)",
                                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.2)",
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.55)";
                                                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 25px -5px rgba(0,0,0,0.4), 0 0 20px -5px rgba(251,191,36,0.28)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.28)";
                                                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.2)";
                                            }}
                                        >
                                            Ask Cure AI
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side: Video */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="w-full lg:w-1/2 hidden lg:block lg:pl-16"
                            >
                                <div className="p-3 bg-white/15 backdrop-blur-2xl rounded-[4rem] border border-amber-500/20 shadow-[0_0_100px_-30px_rgba(245,158,11,0.25)] w-full transform rotate-y-11 hover:rotate-y-0 transition-transform duration-700 perspective-1000">
                                    <div className="relative w-full aspect-video rounded-[2.999rem] overflow-hidden border border-white/5 bg-slate-900/80 group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 z-10 pointer-events-none" />
                                        <video
                                            ref={heroVideoRef}
                                            autoPlay
                                            loop
                                            muted={isMuted}
                                            playsInline
                                            preload="auto"
                                            onTimeUpdate={() => setCurrentTime(heroVideoRef.current?.currentTime || 0)}
                                            onLoadedMetadata={() => setDuration(heroVideoRef.current?.duration || 0)}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            className="w-full h-full object-cover scale-[1.03] opacity-95 transition-opacity duration-500"
                                            onClick={togglePlay}
                                        >
                                            <source
                                                src="/assets/hero_video.mp4"
                                                type="video/mp4"
                                            />
                                        </video>

                                        {/* Properly Unified YouTube-Style Video Controls */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3 flex flex-col gap-2.5 shadow-2xl">
                                            {/* Progress Bar (Scrubber) */}
                                            <div
                                                className="relative h-1.5 bg-white/20 cursor-pointer group/progress overflow-visible rounded-full mx-1"
                                                onMouseDown={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const handleMove = (moveEvent) => {
                                                        const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                                                        const percentage = x / rect.width;
                                                        if (heroVideoRef.current && duration > 0) {
                                                            heroVideoRef.current.currentTime = percentage * duration;
                                                        }
                                                    };
                                                    const handleUp = () => {
                                                        window.removeEventListener('mousemove', handleMove);
                                                        window.removeEventListener('mouseup', handleUp);
                                                    };
                                                    window.addEventListener('mousemove', handleMove);
                                                    window.addEventListener('mouseup', handleUp);
                                                    handleMove(e);
                                                }}
                                            >
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 relative rounded-full transition-all duration-75"
                                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                                >
                                                    {/* Scrubber Knob */}
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform z-40" />
                                                </div>
                                            </div>

                                            {/* Controls Row */}
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={togglePlay}
                                                            className="text-white hover:text-amber-400 transition-colors transform active:scale-95"
                                                        >
                                                            {isPlaying ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
                                                        </button>
                                                        <button
                                                            onClick={() => setIsMuted(!isMuted)}
                                                            className="text-white hover:text-amber-400 transition-colors transform active:scale-95"
                                                        >
                                                            {isMuted ? <VolumeX size={22} weight="fill" /> : <Volume2 size={22} weight="fill" />}
                                                        </button>
                                                    </div>

                                                    <div className="text-white/90 text-sm font-bold tabular-nums tracking-tight">
                                                        {formatTime(currentTime)} <span className="text-white/30 mx-1.5 font-normal">/</span> {formatTime(duration)}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const v = heroVideoRef.current;
                                                        if (v) {
                                                            if (v.requestFullscreen) v.requestFullscreen();
                                                            else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
                                                            else if (v.msRequestFullscreen) v.msRequestFullscreen();
                                                        }
                                                    }}
                                                    className="text-white hover:text-amber-400 transition-colors transform active:scale-95"
                                                >
                                                    <Maximize size={22} weight="fill" />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>


                    {/* Core Features Showcase - Reference Design Match */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mb-16 px-2 sm:px-6"
                    >
                        {/* Promotional Intro */}
                        <div className="text-center max-w-4xl mx-auto mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Advanced <span className="text-amber-400">Health Intelligence</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                <span className="text-amber-200/80 font-semibold">Unlock advanced insights</span> from your health data, <span className="text-amber-200/80 font-semibold">predict potential risks</span>, and experience the future of personalized healthcare:
                            </p>
                        </div>

                        {/* 1. The Card Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {[
                                {
                                    id: "ai",
                                    label: "AI CONSULTANT",
                                    titlePre: "Cure",
                                    titleHighlight: "AI",
                                    desc: "Your dedicated 24/7 health consultant. Get intelligent answers based on your history.",
                                    icon: <Brain size={14} weight="fill" />,
                                    color: "text-amber-400",
                                    borderGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]",
                                    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
                                    animClass: "animated-border",
                                    route: "/cure-ai"
                                },
                                {
                                    id: "analyzer",
                                    label: "LAB ANALYSIS",
                                    titlePre: "Cure",
                                    titleHighlight: "Analyzer",
                                    desc: "Instantly decodes complex lab reports into clear, actionable insights.",
                                    icon: <ScanEye size={14} weight="fill" />,
                                    color: "text-sky-400",
                                    borderGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]",
                                    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
                                    animClass: "animated-border animated-border-sky",
                                    route: "/cure-analyzer"
                                },
                                {
                                    id: "stat",
                                    label: "NATIONAL STATS",
                                    titlePre: "Cure",
                                    titleHighlight: "Stat",
                                    desc: "Visualizes real-time disease trends and epidemic data globally.",
                                    icon: <Activity size={14} weight="fill" />,
                                    color: "text-emerald-400",
                                    borderGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
                                    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
                                    animClass: "animated-border animated-border-emerald",
                                    route: "/cure-stat"
                                },
                                {
                                    id: "tracker",
                                    label: "LIVE TRACKER",
                                    titlePre: "Cure",
                                    titleHighlight: "Tracker",
                                    desc: "Track conditions, monitor vitals, and manage daily insights.",
                                    icon: <TrendingUp size={14} weight="fill" />,
                                    color: "text-purple-400",
                                    borderGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]",
                                    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
                                    animClass: "animated-border animated-border-indigo",
                                    route: "/cure-tracker"
                                }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        relative p-8 rounded-[2rem] 
                                        backdrop-blur-3xl bg-white/5 
                                        border border-white/10
                                        flex flex-col items-center text-center
                                        group transition-all duration-300 hover:-translate-y-2
                                        shadow-2xl overflow-hidden cursor-pointer
                                        ${feature.borderGlow}
                                        ${feature.animClass}
                                    `}
                                    onClick={() => onNavigate && onNavigate(feature.route)}
                                >
                                    {/* Ultra-Glass Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    {/* Top Gradient Glow */}
                                    <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${feature.gradient} opacity-50 rounded-t-[2rem] blur-xl`} />

                                    {/* Pill Label - Floating Glass */}
                                    <div className={`
                                        relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full 
                                        bg-black/40 border border-white/10 ${feature.color} mb-6
                                        text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg backdrop-blur-md
                                        group-hover:bg-black/60 transition-colors
                                    `}>
                                        {feature.icon}
                                        {feature.label}
                                    </div>

                                    {/* Title */}
                                    <h3 className="relative z-10 text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                                        {feature.titlePre} <span className={`${feature.color} drop-shadow-[0_0_15px_rgba(currentColor,0.3)]`}>{feature.titleHighlight}</span>
                                    </h3>

                                    {/* Description */}
                                    <p className="relative z-10 text-sm text-slate-400 leading-relaxed max-w-[200px]">
                                        {feature.desc.split(feature.titleHighlight).map((part, i, arr) => (
                                            <span key={i}>
                                                {part}
                                                {i < arr.length - 1 && <span className="text-white font-medium">{feature.titleHighlight}</span>} {/* Simple highlight logic if needed, or just keep plain text */}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 2. Bottom Functionality Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-70">
                            {[
                                { icon: <ShieldCheck size={14} />, text: "SECURE HIPAA ANALYTICS" },
                                { icon: <Activity size={14} />, text: "REAL-TIME SYNTHESIS" },
                                { icon: <FileText size={14} />, text: "MULTI-FORMAT SUPPORT" },
                                { icon: <Brain size={14} />, text: "PREDICTIVE MODELING" },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-[10px] sm:text-xs font-bold text-slate-300 tracking-wider uppercase shadow-sm">
                                    <span className="text-amber-500">{badge.icon}</span>
                                    {badge.text}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Dashboard Overview Banner */}
                    <div className="mb-12 px-2 sm:px-6">
                        <DashboardOverview
                            user={user}
                            onNavigateToHistory={() => medicalHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        />
                    </div>

                    {/* Premium Banner */}
                    <div className="mb-8 px-2 sm:px-6">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            onClick={onSubscribeClick}
                            className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-xl cursor-pointer border border-amber-400/30 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex items-center gap-4 z-10">
                                <div className="p-3 bg-white/10 rounded-full text-amber-200">
                                    <Crown size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Upgrade to Premium</h3>
                                    <p className="text-amber-100/80">Get AI-powered insights, full report analysis, and 24/7 health coaching.</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={onSubscribeClick}
                                className="mt-4 md:mt-0 z-10"
                                size="sm"
                            >
                                View Plans
                            </Button>
                        </motion.div>
                    </div>

                    {
                        isLoading ? <SkeletonDashboard /> : (
                            <>
                                {/* Standard Stat Cards for Dashboard Overview */}
                                <motion.div
                                    ref={dashboardRef}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ margin: "-100px" }}
                                    variants={containerVariants}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 scroll-mt-24 px-2 sm:px-6"
                                >
                                    <motion.div variants={staggerScale}>
                                        <StatCard icon={<FileText size={24} className="text-black" />} label="Total Records" value={records.length} color="bg-yellow-500" />
                                    </motion.div>
                                    <motion.div variants={staggerScale}>
                                        <StatCard icon={<ShieldCheck size={24} className="text-black" />} label="Identity Verified" value="Active" color="bg-amber-400" />
                                    </motion.div>
                                    <motion.div variants={staggerScale}>
                                        <StatCard icon={<Calendar size={24} className="text-black" />} label="Last Visit" value={lastVisit} color="bg-yellow-600" />
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ margin: "-100px" }}
                                    variants={fadeSlideUp}
                                    className="mt-8 px-2 sm:px-6"
                                >
                                    <RecordsChart data={dashboardData} />
                                </motion.div>

                            </>
                        )
                    }

                    <div className="mt-12 mb-6 flex items-center justify-between px-2 sm:px-6" ref={medicalHistoryRef}>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Medical History Categories</h2>
                        {activeTypeFilter && (
                            <button
                                onClick={() => setActiveTypeFilter(null)}
                                className="text-sm px-4 py-2 rounded-full bg-slate-800/80 text-amber-400 border border-amber-500/30 hover:bg-slate-700 transition flex items-center gap-2"
                            >
                                <ChevronUp size={16} /> Close View
                            </button>
                        )}
                    </div>

                    {
                        isLoading ? (
                            <div className="space-y-4">
                                <SkeletonCard /><SkeletonCard />
                            </div>
                        ) : (
                            <>
                                {/* Category Grid / Scroll Snap Container */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ margin: "-100px" }}
                                    variants={containerVariants}
                                    className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-4 px-2 sm:px-6 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4 md:space-x-0 md:overflow-visible no-scrollbar"
                                >
                                    {[
                                        { id: 'prescription', label: 'Prescriptions', icon: <Pill size={32} /> },
                                        { id: 'test_report', label: 'Test Reports', icon: <FileText size={32} /> },
                                        { id: 'diagnosis', label: 'Diagnoses', icon: <Stethoscope size={32} /> },
                                        { id: 'admission', label: 'Admissions', icon: <Hospital size={32} /> },
                                        { id: 'ecg', label: 'ECG Records', icon: <HeartPulse size={32} /> },
                                    ].map((cat) => {
                                        const catRecords = records.filter(r => r.type === cat.id);
                                        const latestRecord = catRecords.length > 0 ? catRecords[0] : null;
                                        const count = catRecords.length;

                                        return (
                                            <motion.div
                                                key={cat.id}
                                                variants={staggerScale}
                                                className="snap-center"
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                <GradientCard
                                                    icon={React.cloneElement(cat.icon, { strokeWidth: 1.5 })}
                                                    count={count}
                                                    label={cat.label}
                                                    latestDate={latestRecord ? formatDate(latestRecord.date) : null}
                                                    isActive={activeTypeFilter === cat.id}
                                                    onClick={() => handleCategoryClick(cat.id)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                {/* Collapsible Section - Only shows when filter is active */}
                                <AnimatePresence>
                                    {activeTypeFilter && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="py-4">
                                                {displayedRecords.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between mb-2 px-2">
                                                            <h3 className="text-xl font-bold text-amber-400">
                                                                {activeTypeFilter === 'All' ? 'All Records' : capitalize(activeTypeFilter.replace('_', ' '))}
                                                            </h3>
                                                            <span className="text-sm text-slate-400">Showing {displayedRecords.length} records</span>
                                                        </div>
                                                        <AnimatePresence mode="popLayout">
                                                            {displayedRecords.map(record => (
                                                                <motion.div
                                                                    key={record.id}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: 20 }}
                                                                    layout
                                                                >
                                                                    <RecordCard
                                                                        record={record}
                                                                        db={db}
                                                                        userId={userId}
                                                                        appId={appId}
                                                                        storage={storage}
                                                                        onEdit={() => onAddRecordClick && onAddRecordClick(record)}
                                                                        onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                                                        userTier={user?.subscriptionTier || 'Free'}
                                                                    />
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                ) : (
                                                    <div className="glass-card text-center py-16 rounded-2xl border-dashed border-2 border-white/10 bg-slate-900/50">
                                                        <div className="bg-slate-800 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                                            <BarChart2 size={40} className="text-slate-500" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white">No {activeTypeFilter.replace('_', ' ')} records found.</h3>
                                                        <p className="text-slate-400 mt-2">There are no uploaded records for this category yet.</p>
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => onAddRecordClick && onAddRecordClick()}
                                                            className="mt-6"
                                                        >
                                                            Add New Record
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Bottom Close Button for Convenience */}
                                            {displayedRecords.length > 3 && (
                                                <div className="flex justify-center mt-4 mb-8">
                                                    <button
                                                        onClick={() => setActiveTypeFilter(null)}
                                                        className="text-sm px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-2 border border-slate-700"
                                                    >
                                                        <ChevronUp size={16} /> Retract List
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>

                        )
                    }
                </>
            </main >

            {/* SOS System Removed */}

            < AnimatePresence >

                {/* Removed local RecordFormModal rendering, now handled in App.js */}
                {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userId={userId} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
            </AnimatePresence >
        </div >
    );
};

export default MedicalPortfolio;
