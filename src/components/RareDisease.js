import React from 'react';
import { motion } from 'framer-motion';
import { Database, AlertOctagon, FileSpreadsheet, Globe, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';

// VERIFIED DATA SOURCE: Organization for Rare Diseases India (ORDI) & ICMR
// "The Invisible Wedge" - Highlighting the massive gap between estimated and registered cases.

const DATA_GAP_STATS = [
    { category: 'Estimated Cases', value: 70000000, fill: '#ef4444', label: '70 Million' }, // ~70M in India
    { category: 'Registered Cases', value: 15000, fill: '#3b82f6', label: '~15k (Est.)' }, // Very low registry coverage
];

const FRAGMENTATION_DATA = [
    { name: 'Unregistered / Lost', value: 99.9, fill: '#1e293b' },
    { name: 'Digitally Registered', value: 0.1, fill: '#10b981' },
];

const RareDisease = () => {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-rose-500/20 p-2.5 rounded-xl border border-rose-500/30 shadow-lg shadow-rose-500/10">
                    <AlertOctagon size={24} className="text-rose-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Rare Diseases: The Data Gap</h2>
                    <p className="text-slate-400 text-sm">Visualizing the "Silent Burden" and registry fragmentation (Source: ORDI/ICMR Est).</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* CHART 1: The Invisible Wedge */}
                    <div className="h-[350px] bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Globe size={16} className="text-blue-400" />
                            Estimated vs. Registered (India)
                            <div className="group relative ml-1">
                                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                    <strong>The Data Gap:</strong> We estimate 70 million people have rare diseases, but only ~15,000 are in official records. This means millions are invisible to the healthcare system.
                                </div>
                            </div>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Massive disparity between disease prevalence and tracked data.</p>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={DATA_GAP_STATS} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000000}M`} />
                                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={12} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    formatter={(value) => new Intl.NumberFormat('en-IN').format(value)}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                    {DATA_GAP_STATS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* CHART 2: Fragmentation / Visibility */}
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Database size={16} className="text-emerald-400" />
                                Registry Visibility
                                <div className="group relative ml-1">
                                    <Info size={14} className="text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                        <strong>Fragmented Data:</strong> Most patient records are stuck in "silos" (individual hospitals or paper files) instead of a central digital database, blocking research and treatment.
                                    </div>
                                </div>
                            </h3>
                            <p className="text-xs text-slate-400 mb-4">Less than 0.1% of rare disease patients are found in centralized digital registries.</p>
                        </div>

                        <div className="flex-1 flex justify-center items-center relative">
                            {/* Donut Chart */}
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={FRAGMENTATION_DATA}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {FRAGMENTATION_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value, entry) => <span className="text-slate-300 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                                <span className="text-3xl font-bold text-white">99%</span>
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Invisible</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                            <span className="block text-rose-400 text-xs uppercase font-bold tracking-wider mb-1">
                                <FileSpreadsheet size={12} className="inline mr-1" />
                                Critical Insight
                            </span>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Most data exists in "Silos"—handwritten hospital notes, PDF reports, or unconnected excel sheets—making it impossible for researchers to find patterns or cures.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RareDisease;
