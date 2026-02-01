import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Download, Database, Loader,
    BarChart2, Activity, Map, TrendingUp,
    Share2, ChevronRight, Info, ShieldCheck,
    Calendar, MapPin
} from '../Icons';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
    ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { fetchAggregatedData } from '../../services/mockDataService';

// --- SUB-COMPONENTS ---

const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-white/10 last:border-0 pb-4 mb-4">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left mb-2 group"
        >
            <span className="text-xs font-bold text-amber-500/80 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                {title}
            </span>
            <ChevronRight
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-2 space-y-3">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const ChartCard = ({ title, subtitle, children, fullWidth = false, height = 300 }) => (
    <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col ${fullWidth ? 'col-span-1 lg:col-span-2' : ''}`}>
        <div className="p-4 border-b border-white/5 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    {title}
                </h3>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </div>
        <div className="w-full p-4 relative" style={{ height: height }}>
            {children}
        </div>
    </div>
);

const StatCard = ({ label, value, subtext, color = "text-white" }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</span>
        <span className={`text-2xl font-black ${color}`}>{value}</span>
        {subtext && <span className="text-xs text-slate-500 mt-1">{subtext}</span>}
    </div>
);

// --- MAIN COMPONENT ---

export default function AdvancedDataExplorer() {
    // State
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [sectionsOpen, setSectionsOpen] = useState({ geo: true, time: true, filter: true });

    // Filters
    const [filters, setFilters] = useState({
        state: 'Maharashtra',
        district: 'All', // Not used in mock yet but UI ready
        // timeRange removed
        disease: 'Diabetes Type 2',
        ageGroup: 'All',
        gender: 'All'
    });
    // Active filters (snapshot of filters when query was run)
    const [activeFilters, setActiveFilters] = useState(filters);

    // Initial Load
    useEffect(() => {
        runQuery();
    }, []); // Run once on mount with defaults

    const runQuery = async () => {
        setLoading(true);
        try {
            const result = await fetchAggregatedData(filters);
            setData(result);
            setActiveFilters(filters);
        } catch (err) {
            console.error("Query failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleSection = (key) => {
        setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const exportData = () => {
        if (!data) return;
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `curebird_analysis_${filters.disease.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    // Colors
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 overflow-hidden">

            {/* --- LEFT SIDEBAR: FILTERS --- */}
            <aside className="w-full lg:w-80 flex-shrink-0 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col h-full overflow-hidden rounded-r-2xl lg:rounded-2xl">
                <div className="p-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="text-amber-500" weight="duotone" /> Query Builder
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Define cohort parameters.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">

                    {/* Geography */}
                    <FilterSection
                        title="Geographic Scope"
                        isOpen={sectionsOpen.geo}
                        onToggle={() => toggleSection('geo')}
                    >
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">State</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                                    value={filters.state}
                                    onChange={(e) => handleFilterChange('state', e.target.value)}
                                >
                                    {[
                                        'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
                                        'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
                                        'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
                                        'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
                                        'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
                                        'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
                                    ].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">District</label>
                                <div className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-500 cursor-not-allowed">
                                    All Districts Included
                                </div>
                            </div>
                        </div>
                    </FilterSection>

                    {/* Report Parameters */}
                    <FilterSection
                        title="Analysis Scope"
                        isOpen={sectionsOpen.time}
                        onToggle={() => toggleSection('time')}
                    >
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Disease / Condition</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                                    value={filters.disease}
                                    onChange={(e) => handleFilterChange('disease', e.target.value)}
                                >
                                    {['Diabetes Type 2', 'Hypertension', 'Asthma', 'COPD', 'Dengue', 'Malaria', 'Covid-19'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </FilterSection>

                    {/* Demographics */}
                    <FilterSection
                        title="Demographics"
                        isOpen={sectionsOpen.filter}
                        onToggle={() => toggleSection('filter')}
                    >
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Age Group</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                                    value={filters.ageGroup}
                                    onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                                >
                                    <option value="All">All Ages</option>
                                    <option value="0_18">Under 18</option>
                                    <option value="18_60">18 - 60</option>
                                    <option value="60_PLUS">60+</option>
                                </select>
                            </div>
                        </div>
                    </FilterSection>
                </div>

                <div className="p-5 border-t border-white/10 bg-black/20">
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : (
                            <>
                                <Database size={18} weight="fill" /> Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT: DASHBOARD --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">

                {/* Header Toolbar */}
                <header className="flex-shrink-0 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-6">
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                            Advanced Analytics
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <ShieldCheck size={12} weight="fill" /> Privacy Protected
                            </span>
                            <span className="text-xs text-slate-500 border-l border-white/10 pl-2">
                                Values &lt; 10 suppressed
                            </span>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={exportData}
                            disabled={!data || loading}
                            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Export CSV/JSON
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
                    {!data && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <TrendingUp size={60} weight="thin" className="mb-4 text-slate-600" />
                            <p>Select parameters and run analysis</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex items-center justify-center">
                            <Loader className="animate-spin text-amber-500" size={40} />
                        </div>
                    )}

                    {data && !loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

                            {/* KPIS */}
                            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard label="Total Records" value={data.meta.totalRecords.toLocaleString()} subtext={data.meta.dataSource || "Matched filters"} color="text-white" />
                                <StatCard label="Privacy Threshold" value={data.meta.privacyThreshold} subtext="Minimum bin size" color="text-emerald-400" />
                                <StatCard
                                    label="Time Window"
                                    value={data.trends.length > 0
                                        ? `${data.trends[0].date.slice(0, 4)} - ${data.trends[data.trends.length - 1].date.slice(0, 4)}`
                                        : "No Data"}
                                    subtext="Historical Range"
                                    color="text-amber-400"
                                />
                                <StatCard label="Region" value={activeFilters.state} subtext="Aggregated" color="text-sky-400" />
                            </div>

                            {/* 1. Main Trend Line */}
                            <ChartCard title="Incidence Trend & Environmental Factors" subtitle="Correlating disease cases with AQI over time" fullWidth height={350}>
                                <ResponsiveContainer width="99%" height="100%">
                                    <AreaChart data={data.trends}>
                                        <defs>
                                            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#64748B" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                                        <YAxis yAxisId="left" stroke="#F59E0B" fontSize={10} label={{ value: 'Cases', angle: -90, position: 'insideLeft', fill: '#F59E0B' }} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} label={{ value: 'AQI', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Legend />
                                        <Area connectNulls yAxisId="right" type="monotone" dataKey="aqi" stroke="#64748B" fillOpacity={1} fill="url(#colorAqi)" name="Avg AQI" />
                                        <Area connectNulls yAxisId="left" type="monotone" dataKey="cases" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorCases)" name="Cases" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* 2. Geo Heatmap */}
                            <ChartCard title="Geographic Heatmap" subtitle={`District-wise intensity in ${activeFilters.state}`}>
                                <div className="h-full w-full grid grid-cols-2 gap-4 overflow-y-auto pr-2">
                                    {data.geoMap.map((region, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                                                    style={{ backgroundColor: `rgba(245, 158, 11, ${0.2 + (region.intensity * 0.8)})` }}
                                                >
                                                    {(region.intensity * 100).toFixed(0)}%
                                                </div>
                                                <span className="text-sm font-medium text-slate-300">{region.region}</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{region.value === null ? '<10' : region.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>

                            {/* 3. Demographics Pie */}
                            <ChartCard title="Demographic Split" subtitle="Age distribution of selected cohort">
                                <ResponsiveContainer width="99%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.demographics.age}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.demographics.age.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* 4. Correlation Scatter */}
                            <ChartCard title="Correlation Analysis" subtitle="AQI Impact on Case Volume">
                                <ResponsiveContainer width="99%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis type="number" dataKey="x" name="AQI" stroke="#94a3b8" fontSize={10} label={{ value: 'AQI', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
                                        <YAxis type="number" dataKey="y" name="Cases" stroke="#94a3b8" fontSize={10} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                        <Scatter name="Datapoints" data={data.correlations} fill="#10B981">
                                            {data.correlations.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.x > 150 ? '#EF4444' : '#10B981'} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </ChartCard>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
