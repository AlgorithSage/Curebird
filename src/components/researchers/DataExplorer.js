import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Database, Loader, BarChart2, PieChart as PieChartIcon, Activity } from '../Icons';
import { API_BASE_URL } from '../../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DataExplorer() {
    const [filters, setFilters] = useState({
        disease: '',
        region: '',
        age_bucket: ''
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('data'); // 'data' | 'visualize'

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/data/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters })
            });
            const data = await response.json();
            setResults(data.results);
            if (data.results.length > 0) setActiveTab('visualize');
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const getDiseaseDistribution = () => {
        if (!results) return [];
        const counts = {};
        results.forEach(r => { counts[r.disease] = (counts[r.disease] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    const COLORS = ['#F59E0B', '#D97706', '#FBBF24', '#B45309', '#78350F'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2">Data Explorer</h1>
                    <p className="text-slate-400">Query and analyze anonymized patient datasets.</p>
                </div>
                <div className="flex gap-3">
                    {results && (
                        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 border border-amber-500/20">
                            <Download size={18} /> Export Report
                        </button>
                    )}
                </div>
            </div>

            {/* Search Panel */}
            <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-500/80 uppercase ml-1">Disease Focus</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="e.g. Diabetes"
                                className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-600"
                                value={filters.disease}
                                onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-500/80 uppercase ml-1">Region</label>
                        <select
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer"
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                        >
                            <option value="">All Regions</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-500/80 uppercase ml-1">Age Group</label>
                        <select
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer"
                            value={filters.age_bucket}
                            onChange={(e) => setFilters({ ...filters, age_bucket: e.target.value })}
                        >
                            <option value="">All Ages</option>
                            <option value="20-30">20-30</option>
                            <option value="30-40">30-40</option>
                            <option value="40-50">40-50</option>
                            <option value="50-60">50-60</option>
                            <option value="60+">60+</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : 'Run Query'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] flex flex-col">
                {results ? (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-4 p-4 border-b border-white/5">
                            <button
                                onClick={() => setActiveTab('visualize')}
                                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 rounded-xl transition-all relative overflow-hidden ${activeTab === 'visualize' ? 'text-amber-400 animated-border bg-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <BarChart2 size={18} /> Visual Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('data')}
                                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 rounded-xl transition-all relative overflow-hidden ${activeTab === 'data' ? 'text-amber-400 animated-border bg-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Database size={18} /> Raw Data ({results.length})
                            </button>
                        </div>

                        <div className="p-6 flex-1">
                            {activeTab === 'visualize' ? (
                                <div className="h-full w-full flex flex-col">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Activity className="text-amber-500" /> Disease Distribution
                                        </h3>
                                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Based on {results.length} records</span>
                                    </div>
                                    <div className="flex-1 w-full min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={getDiseaseDistribution()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {getDiseaseDistribution().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-8">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Total Records</h4>
                                            <p className="text-2xl font-black text-white">{results.length}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Unique Conditions</h4>
                                            <p className="text-2xl font-black text-amber-400">{getDiseaseDistribution().length}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Avg. Confidence</h4>
                                            <p className="text-2xl font-black text-emerald-400">92%</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-white/10">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10">
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">ID</th>
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">Disease</th>
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">Region</th>
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">Age</th>
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">Gender</th>
                                                <th className="p-4 text-xs font-bold text-amber-500/80 uppercase tracking-wider">Metrics</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.map((row, i) => (
                                                <motion.tr
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={row.id}
                                                    className="hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="p-4 font-mono text-xs text-slate-500">{row.id}</td>
                                                    <td className="p-4 text-sm font-bold text-white">{row.disease}</td>
                                                    <td className="p-4 text-sm text-slate-300">{row.region}</td>
                                                    <td className="p-4 text-sm text-slate-300">{row.age_bucket}</td>
                                                    <td className="p-4 text-sm text-slate-300">{row.gender}</td>
                                                    <td className="p-4 text-xs text-slate-400 font-mono">
                                                        {JSON.stringify(Object.fromEntries(
                                                            Object.entries(row).filter(([k]) => !['id', 'disease', 'region', 'age_bucket', 'gender'].includes(k))
                                                        )).replace(/[{}"]/g, '').replace(/:/g, ': ').replace(/,/g, ', ')}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Database size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">Ready to Explore</h3>
                        <p className="text-sm max-w-sm mx-auto mb-8">Select filters above and click "Run Query" to fetch anonymized patient records for analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
