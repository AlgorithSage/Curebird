import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    TrendingUp, Users, Activity, AlertTriangle, Calendar,
    BrainCircuit, Clock, Stethoscope
} from 'lucide-react';
import AIReportModal from './AIReportModal';
import AnalyzeDataModal from './AnalyzeDataModal';

// --- Improved Mock Data ---

const riskRadarData = [
    { subject: 'Hypertension', A: 120, B: 110, fullMark: 150 },
    { subject: 'Diabetes', A: 98, B: 130, fullMark: 150 },
    { subject: 'Cardiac', A: 86, B: 130, fullMark: 150 },
    { subject: 'Obesity', A: 99, B: 100, fullMark: 150 },
    { subject: 'Mobility', A: 85, B: 90, fullMark: 150 },
    { subject: 'Respiratory', A: 65, B: 85, fullMark: 150 },
];

const adherenceTrendData = [
    { month: 'Jan', rate: 45, projected: 65 },
    { month: 'Feb', rate: 52, projected: 70 },
    { month: 'Mar', rate: 48, projected: 68 },
    { month: 'Apr', rate: 60, projected: 75 },
    { month: 'May', rate: 55, projected: 72 },
    { month: 'Jun', rate: 70, projected: 85 },
];

const heatmapData = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    intensity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
}));

const aiInsights = [
    { id: 1, type: 'prediction', text: 'Adherence drop predicted for hypertensive group (Age 60+) next week due to seasonal factors.', confidence: '92%' },
    { id: 2, type: 'anomaly', text: 'Unusual spike in respiratory complaints detected in Sector 4 patients.', confidence: '88%' },
    { id: 3, type: 'optimization', text: 'Schedule efficiency gap: Tuesdays 2PM-4PM show 45% cancellation rate.', confidence: '76%' },
];

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

const HeatmapCell = ({ intensity, day }) => {
    const getColor = () => {
        // Amber/Gold Theme
        if (intensity === 'high') return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-400'; // High Activity
        if (intensity === 'medium') return 'bg-amber-700/60 border border-amber-600/30'; // Medium
        return 'bg-stone-800/40 border border-stone-700/30'; // Low
    };
    return (
        <div className={`w-full aspect-square rounded-lg ${getColor()} transition-all hover:scale-110 cursor-pointer relative group`}>
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
        </div>
    );
};

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

const DoctorAnalytics = ({ onNavigateToPatient, onNavigate }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

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
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-2"
                >
                    <BrainCircuit size={20} /> Generate AI Report
                </button>
            </div>

            <AIReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
            <AnalyzeDataModal
                isOpen={isAnalyzeModalOpen}
                onClose={() => setIsAnalyzeModalOpen(false)}
                onNavigate={onNavigate}
            />

            {/* Top Stats Row - Using Semantic Tints on Amber Base */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Patients" value="1,248" sub="+12%" icon={Users} colorClass="text-amber-400" accentColor="amber" />
                <StatCard label="Avg. Adherence" value="89%" sub="+2.4%" icon={Activity} colorClass="text-emerald-400" accentColor="emerald" />
                <StatCard label="High Risk Cases" value="14" sub="Alert" icon={AlertTriangle} colorClass="text-rose-400" accentColor="rose" />
                <StatCard label="Avg. Consult" value="18m" sub="-1m" icon={Clock} colorClass="text-sky-400" accentColor="sky" />
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
                            <h3 className="text-2xl font-bold text-white tracking-tight">Adherence vs Projected</h3>
                            <p className="text-sm text-stone-400 mt-1">Comparative analysis of treatment compliance.</p>
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
                            <AreaChart data={adherenceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        {aiInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
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
                <div className="relative rounded-[2rem] p-6 border border-yellow-500/10 bg-gradient-to-br from-[#1a1c10] to-[#020617] shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden animated-border">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[60px] pointer-events-none" />

                    <h3 className="font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                        <Activity className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={24} />
                        <span className="tracking-tight">Population Risk Stratification</span>
                    </h3>

                    <div className="h-[250px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={riskRadarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 11, fontWeight: '600' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="This Clinic"
                                    dataKey="A"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fill="#f59e0b"
                                    fillOpacity={0.3}
                                />
                                <Radar
                                    name="National Avg"
                                    dataKey="B"
                                    stroke="#57534e"
                                    strokeWidth={1}
                                    fill="transparent"
                                    fillOpacity={0.1}
                                    strokeDasharray="4 4"
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff' }}
                                    itemStyle={{ color: '#fcd34d' }}
                                />
                                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Clinic Load Heatmap (Dark Olive/Gold Theme) */}
                <div className="relative rounded-[2rem] p-6 border border-yellow-500/10 bg-gradient-to-br from-[#1a1c10] to-[#020617] shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden animated-border">
                    {/* Subtle Internal Yellow Glow */}
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-500/5 blur-[50px] pointer-events-none" />

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="font-bold text-white flex items-center gap-3">
                            <Calendar className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={24} />
                            <span className="tracking-tight">Clinic Load Intensity</span>
                        </h3>
                        <div className="flex gap-3 text-[10px] uppercase font-bold text-stone-500">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.6)]"></div> High</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-stone-700"></div> Low</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3 relative z-10">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-bold text-stone-500 mb-1">{d}</div>
                        ))}
                        {heatmapData.map((d, i) => (
                            <HeatmapCell key={i} day={d.day} intensity={d.intensity} />
                        ))}
                    </div>
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
                        <span className="px-3 py-1 bg-amber-500/10 rounded-lg text-amber-500 text-xs font-bold border border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">3 Active</span>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {[
                            { name: 'John Doe', issue: 'Sustained High BP', time: '2h ago', id: 'P-002', age: 45, gender: 'M', condition: 'Hypertension' },
                            { name: 'Jane Smith', issue: 'Missed Insulin', time: '4h ago', id: 'P-003', age: 29, gender: 'F', condition: 'Diabetes T1' },
                            { name: 'Robert C.', issue: 'Arrhythmia Alert', time: '1d ago', id: 'P-005', age: 48, gender: 'M', condition: 'Cardiac Arrhythmia' },
                        ].map((p, i) => (
                            <div
                                key={i}
                                onClick={() => onNavigateToPatient && onNavigateToPatient(p)}
                                className="p-5 border-b border-white/5 hover:bg-rose-500/10 transition-all duration-300 group cursor-pointer relative"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xl font-bold text-white group-hover:text-rose-100 transition-colors tracking-tight">{p.name}</span>
                                    <span className="text-[10px] font-mono font-bold text-stone-500 group-hover:text-rose-400/60">{p.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                    <span className="text-sm font-bold text-rose-400 uppercase tracking-wide group-hover:text-rose-300 transition-colors drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]">{p.issue}</span>
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
