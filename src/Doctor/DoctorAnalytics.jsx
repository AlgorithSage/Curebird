import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
    TrendingUp, Users, Activity, AlertTriangle, Calendar,
    BrainCircuit, Clock, Stethoscope, FileText, Trash2
 } from '../components/Icons';
import AIReportModal from './AIReportModal';
import AnalyzeDataModal from './AnalyzeDataModal';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';




// --- Components ---

const InsightCard = ({ insight }) => (
    <div className="p-5 rounded-2xl bg-[#0c0a09] border border-amber-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex gap-5 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.05)] transition-all cursor-default group">
        <div className="p-3 h-fit rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-amber-500/20 transition-colors">
            <BrainCircuit size={24} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-extrabold text-amber-500 uppercase tracking-widest drop-shadow-sm">{insight.type}</span>
                <span className="text-[11px] font-bold text-amber-500/60 border border-amber-500/10 bg-amber-950/30 px-2 py-1 rounded-lg">
                    {insight.confidence} Conf.
                </span>
            </div>
            <p className="text-[15px] text-stone-300 leading-relaxed font-medium group-hover:text-stone-200 transition-colors">{insight.text}</p>
        </div>
    </div>
);



// Reverted StatCard to use standard Global `glass-card` theme with optimized spacing
// StatCard with Semantic Tinting + Amber Base
const StatCard = ({ label, value, sub, icon: Icon, colorClass, accentColor = 'amber' }) => {
    // Dynamic color maps for subtle tints
    const borderMap = {
        emerald: 'border-emerald-500/20 group-hover:border-emerald-500/40',
        rose: 'border-rose-500/20 group-hover:border-rose-500/40',
        sky: 'border-sky-500/20 group-hover:border-sky-500/40',
        amber: 'border-amber-500/20 group-hover:border-amber-500/40',
    };
    const glowMap = {
        emerald: 'from-emerald-500/10 to-transparent',
        rose: 'from-rose-500/10 to-transparent',
        sky: 'from-sky-500/10 to-transparent',
        amber: 'from-amber-500/10 to-transparent',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative rounded-2xl p-6 flex flex-col justify-between min-h-[11rem] group overflow-hidden border transition-colors duration-300 bg-gradient-to-br from-[#1a1c10] to-[#020617] animated-border ${borderMap[accentColor] || borderMap.amber}`}
        >
            {/* Subtle Gradient Tint */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none ${glowMap[accentColor] || glowMap.amber}`} />

            {/* Helper gradient for internal glow */}
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={`p-3 rounded-xl bg-slate-950/50 border border-white/10 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {/* Animated Pulse for activity */}
                <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <div className="relative z-10 mt-4">
                <h3 className="text-4xl font-extrabold text-white mb-2 group-hover:text-amber-400 transition-colors tracking-tight">{value}</h3>
                <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <TrendingUp size={12} /> {sub}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const DoctorAnalytics = ({ onNavigateToPatient, onNavigate, patients = [] }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
    const [analyzedReports, setAnalyzedReports] = useState([]);
    const [showAllReports, setShowAllReports] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleAnalysisComplete = (newReport) => {
        // Optimistic update (optional, but wait for onSnapshot is better usually. 
        // But since we want immediate feedback and snapshot might be slightly delayed or we want to force open current...)
        // Actually, if we use onSnapshot, it will update automatically. 
        // We just need to open the modal.
        // We'll trust onSnapshot for the list, but we need to set selectedReport for the modal.
        setIsReportModalOpen(true);
    };

    // Handle Delete Report
    const handleDeleteReport = async (e, reportId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this analysis report?")) {
            try {
                await deleteDoc(doc(db, 'medical_records', reportId));
            } catch (error) {
                console.error("Error deleting report:", error);
                alert("Failed to delete report.");
            }
        }
    };

    // --- Persist: Live Fetch Analyzed Reports ---
    React.useEffect(() => {
        const fetchReports = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, 'medical_records'),
                where('doctorId', '==', user.uid),
                where('type', '==', 'lab_report'),
                // orderBy('createdAt', 'desc') // Requires index, use client side sort for safety if no index
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const reports = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        fileName: data.fileName || data.title || 'Document',
                        summary: data.description || '',
                        date: data.date,
                        key_findings: data.findings || [],
                        medication_adjustments: data.medications || [],
                        extracted_vitals: data.vitals || [],
                        recommendation: data.recommendation || '',
                    };
                });
                // FILTER OUT LEGACY HARDCODED RECORDS (Aggressive by Title & Content)
                // This ensures "AI Clinical Co-Pilot" doesn't show the old junk.
                const cleanReports = reports.filter(r =>
                    !r.fileName.includes("AI Clinical Analysis Report") && // fileName maps to data.title/fileName
                    !r.summary?.toLowerCase().includes("comprehensive analysis")
                );

                // Client-side sort desc
                cleanReports.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAnalyzedReports(cleanReports);
            });
            return () => unsubscribe();
        };
        fetchReports();
    }, []);

    // --- Live Clinical Activity (Heatmap) ---
    const [clinicalActivity, setClinicalActivity] = useState([]);

    React.useEffect(() => {
        // Robust Auth Listener to prevent race conditions
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, set up listener
                const q = query(
                    collection(db, 'medical_records'),
                    where('doctorId', '==', user.uid)
                );

                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const activities = snapshot.docs.map(doc => ({
                        id: doc.id,
                        date: doc.data().date || doc.data().createdAt, 
                        type: (doc.data().type === 'report' ? 'lab_report' : (doc.data().type === 'consultation' ? 'consultation_note' : doc.data().type)),
                        patientId: doc.data().patientId,
                        title: doc.data().title || '',
                        diagnosis: doc.data().diagnosis || '',
                        description: doc.data().description || '',
                        findings: doc.data().findings || ''
                    }));
                    
                    // Client-side sort: Newest first
                    activities.sort((a, b) => {
                        const dateA = new Date(a.date?.seconds ? a.date.seconds * 1000 : a.date);
                        const dateB = new Date(b.date?.seconds ? b.date.seconds * 1000 : b.date);
                        return dateB - dateA;
                    });
                    setClinicalActivity(activities);
                }, (error) => {
                    console.warn("Analytics: Could not fetch activity", error);
                });
                
                // Cleanup snapshot listener when auth changes or component unmounts
                return () => unsubscribeSnapshot();
            } else {
                setClinicalActivity([]);
            }
        });

        return () => unsubscribeAuth();
    }, []);


    // --- Derived Metrics ---
    const totalPatients = patients.length;

    // 1. Risk Stratification (Record-Aware + Patient Profile Aware)
    // We use Sets to ensure unique patients are counted per condition
    const riskSets = {
        'Hypertension': new Set(), 
        'Diabetes': new Set(), 
        'Cardiac': new Set(), 
        'Obesity': new Set(), 
        'Mobility': new Set(), 
        'Respiratory': new Set()
    };
    
    let riskCount = 0; // Total unique critical patients
    const criticalSet = new Set();
    const criticalList = []; // For display

    // Helper to scan text and add to sets
    const scanAndCategorize = (text, patientId, fullPatientObj = null) => {
       const t = text.toLowerCase();
       if (t.match(/hypertens|bp|pressure|hbp/)) riskSets['Hypertension'].add(patientId);
       if (t.match(/diabet|sugar|insulin|glucose|t2d|t1d|a1c/)) riskSets['Diabetes'].add(patientId);
       if (t.match(/cardiac|heart|arrhythmia|pulse|coronary|chf|angina/)) riskSets['Cardiac'].add(patientId);
       if (t.match(/obes|weight|bmi|fat|bariatric/)) riskSets['Obesity'].add(patientId);
       if (t.match(/mobil|arthrit|joint|pain|spine|knee|fracture|ortho/)) riskSets['Mobility'].add(patientId);
       if (t.match(/respir|lung|asthma|copd|breath|pneumonia|bronch/)) riskSets['Respiratory'].add(patientId);

       if (t.match(/critical|urgent|alert|severe|acute|emergency/)) {
            if (fullPatientObj && !criticalSet.has(patientId)) {
                criticalSet.add(patientId);
                criticalList.push(fullPatientObj);
            } else if (!criticalSet.has(patientId)) {
                criticalSet.add(patientId);
                // If we don't have the full object (from record), we can't push to list easily without lookup
                // But we mainly need the count for the stat card
            }
       }
    };

    // Pass 1: Scan Patient Profiles
    patients.forEach(p => {
        const text = `${p.condition || ''} ${p.medicalHistory || ''} ${p.notes || ''}`;
        scanAndCategorize(text, p.id, p);
    });

    // Pass 2: Scan Medical Records (Live Workspace Data)
    clinicalActivity.forEach(rec => {
        if (!rec.patientId) return;
        const text = `${rec.title} ${rec.diagnosis} ${rec.description} ${rec.findings}`;
        scanAndCategorize(text, rec.patientId);
    });

    const finalWatchlist = criticalList.length > 0 ? criticalList.slice(0, 3) : patients.slice(0, 3);
    const healthScore = totalPatients > 0 ? Math.round(((totalPatients - criticalList.length) / totalPatients) * 100) : 100;

    // ... (Growth Trends logic remains same) ...
     const monthCounts = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0 };
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    patients.forEach(p => {
        if (p.createdAt && p.createdAt.toDate) {
            const m = p.createdAt.toDate().toLocaleString('default', { month: 'short' });
            if (monthCounts[m] !== undefined) monthCounts[m]++;
        }
    });

    // Accumulate for growth curve (simplified)
    let runningTotal = 0;
    const trendData = months.map(m => {
        runningTotal += monthCounts[m];
        return {
            month: m,
            rate: runningTotal,
        projected: Math.round(runningTotal * 1.2) + 2 
        };
    });





    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-extrabold text-white mb-2">
                        Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Hub</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Population health intelligence & operational metrics.</p>
                </div>

            </div>

            <AIReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                report={selectedReport}
            />
            <AnalyzeDataModal
                isOpen={isAnalyzeModalOpen}
                onClose={() => setIsAnalyzeModalOpen(false)}
                onAnalysisComplete={handleAnalysisComplete}
            />

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Patients" value={totalPatients} sub="+12%" icon={Users} accentColor="emerald" />
                <StatCard label="Avg. Health Score" value={`${healthScore}%`} sub={healthScore > 80 ? 'Good' : 'Review'} icon={Activity} accentColor="emerald" />
                <StatCard label="High Risk Cases" value={riskCount || criticalList.length} sub="Alert" icon={AlertTriangle} accentColor="rose" />
                <StatCard label="Avg. Consult" value="18m" sub="~-1m" icon={Clock} accentColor="sky" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main: Adherence Dual-Area Chart (Dark Premium Theme + Dynamic Spotlight) */}
                <div
                    onMouseMove={handleMouseMove}
                    className="lg:col-span-2 relative rounded-[2rem] p-8 border border-amber-500/10 bg-[#0c0a09] shadow-2xl overflow-hidden group/chart animated-border"
                >
                    {/* Dynamic Spotlight Effect - Amber/Gold */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover/chart:opacity-100"
                        style={{
                            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245,158,11,0.15), rgba(251,191,36,0.1), transparent 40%)`
                        }}
                    />

                    {/* Base Glows */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent opacity-50" />

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Patient Growth vs Projected</h3>
                            <p className="text-sm text-stone-400 mt-1">Monthly patient enrollment tracking.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase">
                                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div> Projected
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase">
                                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div> Actual Rate
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#44403c', borderRadius: '12px', color: '#f5f5f4', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ paddingTop: '4px' }}
                                />
                                <Area type="monotone" dataKey="projected" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#amberGradient)" />
                                <Area type="monotone" dataKey="rate" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#yellowGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: AI Insights (Amber Glass Theme) */}
                <div className="glass-card p-6 flex flex-col border border-amber-500/10 relative overflow-hidden h-full">
                    {/* Subtle Amber Glow */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 blur-[60px] pointer-events-none" />

                    <div className="mb-6 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                            <BrainCircuit size={24} />
                        </div>
                        <h3 className="font-extrabold text-white text-2xl tracking-tight">AI Clinical Co-Pilot</h3>
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
                        {analyzedReports.length === 0 && (
                            <div className="p-4 rounded-xl border border-dashed border-stone-800 text-center">
                                <p className="text-xs text-stone-500 italic">No documents analyzed yet.</p>
                            </div>
                        )}
                        {analyzedReports.slice(0, showAllReports ? undefined : 3).map((report, i) => (
                            <div
                                key={i}
                                onClick={() => { setSelectedReport(report); setIsReportModalOpen(true); }}
                                className="p-4 rounded-xl bg-[#0c0a09] border border-stone-800 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all cursor-pointer group/card relative pr-10"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 rounded-lg bg-stone-900 text-amber-500 group-hover/card:bg-amber-500 group-hover/card:text-black transition-colors">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-[10px] font-mono text-stone-500">{report.date}</span>
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{report.fileName}</h4>
                                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{report.summary}</p>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDeleteReport(e, report.id)}
                                    className="absolute right-2 top-2 p-2 rounded-lg text-stone-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/card:opacity-100 z-20"
                                    title="Delete Report"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {analyzedReports.length > 3 && (
                            <button
                                onClick={() => setShowAllReports(!showAllReports)}
                                className="w-full py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-amber-500 transition-colors flex items-center justify-center gap-2"
                            >
                                {showAllReports ? 'Show Less' : `See ${analyzedReports.length - 3} More`}
                                <div className={`w-1.5 h-1.5 border-r border-b border-current transform transition-transform ${showAllReports ? 'rotate-[225deg] mt-1' : 'rotate-45 -mt-1'}`}></div>
                            </button>
                        )}

                        <button
                            onClick={() => setIsAnalyzeModalOpen(true)}
                            className="w-full p-4 rounded-xl border border-dashed border-slate-700 flex flex-col items-center text-center gap-2 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer group"
                        >
                            <div className="p-2 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 transition-colors">
                                <Stethoscope size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Analyze New Data</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Radar & Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Population Risk Radar (Dark Olive/Gold Theme) */}
                {/* 1. Patient Health Status (Donut Chart) */}
                <div className="relative rounded-[2rem] p-6 border border-emerald-500/10 bg-gradient-to-br from-[#1a1c10] to-[#020617] shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden animated-border">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />

                    <h3 className="font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                        <Activity className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" size={24} />
                        <span className="tracking-tight">Patient Health Status</span>
                    </h3>

                    {/* Logic for Status Counts */}
                    {(() => {
                        // Dynamically count ALL statuses found in patient data
                        const statusCounts = {};
                        patients.forEach(p => {
                            const rawStatus = p.status || 'Stable';
                            // Normalize Key
                            const key = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1); 
                            statusCounts[key] = (statusCounts[key] || 0) + 1;
                        });
                        
                        // Convert to array
                        const data = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));
                        
                        // Sort by value desc (so largest slices are consistent)
                        data.sort((a, b) => b.value - a.value);

                        // Dynamic Color Mapping (Fallbacks + Hash-like generation for new statuses)
                        const getColor = (name) => {
                            const map = { 
                                'Stable': '#10b981', 
                                'Critical': '#ef4444', 
                                'Monitoring': '#f59e0b', 
                                'Recovering': '#3b82f6',
                                'Discharged': '#64748b'
                            };
                            return map[name] || '#8b5cf6'; // Default Purple for custom statuses
                        };
                        
                        return (
                            <div className="h-[250px] w-full relative z-10 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend 
                                            verticalAlign="middle" 
                                            layout="vertical" 
                                            align="right"
                                            iconType="circle"
                                            formatter={(value, entry) => (
                                                <span className="text-xs font-bold text-stone-400 ml-1">{value} ({entry.payload.value})</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Total */}
                                <div className="absolute top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <div className="text-3xl font-black text-white">{patients.length}</div>
                                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Patients</div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* 2. Clinical Workload Distribution (Horizontal Bar Chart) */}
                <div className="relative rounded-[2rem] p-6 border border-amber-500/10 bg-gradient-to-br from-[#1a1c10] to-[#020617] shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden animated-border">
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/5 blur-[50px] pointer-events-none" />

                    <h3 className="font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                        <FileText className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={24} />
                        <span className="tracking-tight">Clinical Workload</span>
                    </h3>

                    {/* Logic for Workload Counts */}
                    {(() => {
                        // Dynamically count ALL record types
                        const typeCounts = {};
                        clinicalActivity.forEach(a => {
                             const rawType = a.type || 'Other';
                             typeCounts[rawType] = (typeCounts[rawType] || 0) + 1;
                        });
                        
                        // Map to Chart Data
                        const formatLabel = (t) => {
                            const map = {
                                'consultation_note': 'Consults',
                                'prescription': 'Rx',
                                'lab_report': 'Labs',
                                'referral': 'Ref',
                                'vitals_log': 'Vitals'
                            };
                            if (map[t]) return map[t];
                            // Fallback: title case
                            return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 8);
                        };

                        const getColor = (t) => {
                             const map = {
                                'consultation_note': '#3b82f6', // Blue
                                'prescription': '#f59e0b',    // Amber
                                'lab_report': '#10b981',      // Emerald
                                'referral': '#8b5cf6',        // Violet
                                'vitals_log': '#ec4899'       // Pink
                            };
                            return map[t] || '#64748b';
                        };

                        const workloadData = Object.keys(typeCounts).map(type => ({
                            name: formatLabel(type),
                            count: typeCounts[type],
                            fill: getColor(type),
                            full: type.replace(/_/g, ' ').toUpperCase()
                        }));

                        // Sort by count for better viz
                        workloadData.sort((a, b) => b.count - a.count);

                        return (
                             <div className="h-[250px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 'bold' }} 
                                            width={60}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#333', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value, name, props) => [value, props.payload.full]}
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: 'rgba(255,255,255,0.02)' }}>
                                            {workloadData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        );
                    })()}
                </div>

                {/* 3. Critical Patients List (Dark Olive/Gold Theme) */}
                <div className="relative rounded-[2rem] flex flex-col overflow-hidden border border-yellow-500/10 bg-gradient-to-br from-[#1a1c10] to-[#020617] shadow-[0_4px_20px_rgba(0,0,0,0.2)] group/panel animated-border">

                    {/* Header */}
                    <div className="p-6 border-b border-amber-500/10 flex justify-between items-start bg-amber-500/5">
                        <div>
                            <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <AlertTriangle size={20} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Critical Watchlist
                            </h4>
                            <p className="text-[10px] text-stone-500 uppercase font-extrabold tracking-widest mt-1 ml-1">Requires Immediate Action</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/10 rounded-lg text-amber-500 text-xs font-bold border border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">{finalWatchlist.length} Active</span>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {finalWatchlist.length === 0 && (
                            <div className="p-5 text-center text-stone-500 italic">No critical cases found.</div>
                        )}
                        {finalWatchlist.map((p, i) => (
                            <div
                                key={i}
                                onClick={() => onNavigateToPatient && onNavigateToPatient(p)}
                                className="p-5 border-b border-white/5 hover:bg-rose-500/10 transition-all duration-300 group cursor-pointer relative"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xl font-bold text-white group-hover:text-rose-100 transition-colors tracking-tight">{p.name}</span>
                                    <span className="text-[10px] font-mono font-bold text-stone-500 group-hover:text-rose-400/60">2h ago</span> {/* Time is hardcoded for now */}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                    <span className="text-sm font-bold text-rose-400 uppercase tracking-wide group-hover:text-rose-300 transition-colors drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]">{p.condition || "Observation Required"}</span>
                                </div>
                                {/* Side accent on hover */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300"></div>
                            </div>
                        ))}
                    </div>
                    <button className="p-4 text-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-amber-400 hover:bg-amber-500/5 transition-colors">
                        View All Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorAnalytics;
