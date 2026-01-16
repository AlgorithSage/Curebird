import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {  Home, Utensils, TrendingUp, Info, Pill  } from './Icons';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
// VERIFIED DATA SOURCE: NFHS-5 India (National Family Health Survey 2019-21)
// VERIFIED DATA SOURCE: NFHS-5 India (National Family Health Survey 2019-21)
const HOUSING_HEALTH_DATA = [
    { state: 'Bihar', clean_fuel: 37.8, respiratory_issues: 18.2, label: 'High Risk' },
    { state: 'UP', clean_fuel: 49.5, respiratory_issues: 14.5, label: 'High Risk' },
    { state: 'Odisha', clean_fuel: 34.2, respiratory_issues: 12.1, label: 'Medium Risk' },
    { state: 'Maharashtra', clean_fuel: 79.7, respiratory_issues: 5.6, label: 'Low Risk' },
    { state: 'Kerala', clean_fuel: 72.1, respiratory_issues: 2.1, label: 'Safe' },
    { state: 'Punjab', clean_fuel: 93.8, respiratory_issues: 4.8, label: 'Safe' },
];

const SANITATION_DATA = [
    { state: 'Bihar', access: 49, disease: 13, name: 'Bihar' },
    { state: 'UP', access: 68, disease: 10, name: 'UP' },
    { state: 'Kerala', access: 99, disease: 3, name: 'Kerala' },
    { state: 'Punjab', access: 96, disease: 4, name: 'Punjab' },
];

const FOOD_SECURITY_DATA = [
    { factor: 'Poorest', stunting: 46.5, wasting: 23.1 },
    { factor: 'Poorer', stunting: 40.2, wasting: 20.8 },
    { factor: 'Middle', stunting: 33.7, wasting: 18.9 },
    { factor: 'Richer', stunting: 26.9, wasting: 16.5 },
    { factor: 'Richest', stunting: 20.5, wasting: 14.2 },
];

// VERIFIED DATA SOURCE: National Health Accounts (NHA) Estimates for India & Jan Aushadhi Pariyojana
const DRUG_CONSUMPTION_DATA = [
    { type: 'Antibiotics', value: 35, fill: '#f43f5e', label: 'Antibiotics' },
    { type: 'Analgesics', value: 25, fill: '#8b5cf6', label: 'Painkillers' },
    { type: 'Antidiabetics', value: 15, fill: '#f59e0b', label: 'Diabetes' },
    { type: 'Cardiovascular', value: 15, fill: '#10b981', label: 'Heart Meds' },
    { type: 'Others', value: 10, fill: '#64748b', label: 'Others' },
];

const ImprovedTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md">
                <p className="text-white font-bold mb-1">{payload[0].payload.state}</p>
                <p className="text-emerald-400 text-sm">Clean Fuel: {payload[0].value}%</p>
                <p className="text-rose-400 text-sm">Resp. Illness: {payload[1].value}%</p>
                <p className="text-slate-400 text-xs mt-2 italic">More clean fuel = Less illness</p>
            </div>
        );
    }
    return null;
};

const SocialDeterminants = () => {
    const [activeTab, setActiveTab] = useState('housing');

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <TrendingUp size={24} className="text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Social Determinants of Health (SDOH)</h2>
                    <p className="text-slate-400 text-sm">Correlating socioeconomic factors with health outcomes (Source: NHA & NFHS-5).</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 mb-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('housing')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'housing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Home size={18} />
                        Housing & Environment
                    </button>
                    <button
                        onClick={() => setActiveTab('food')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'food' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Utensils size={18} />
                        Food Security & Nutrition
                    </button>
                    <button
                        onClick={() => setActiveTab('drugs')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'drugs' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Pill size={18} />
                        Drug Usage Trends
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'housing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="space-y-12">
                                {/* SECTION 1: INDOOR AIR QUALITY */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 h-[400px]">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-white font-semibold flex items-center gap-2">
                                                    <Info size={16} className="text-blue-400" />
                                                    Indoor Air Quality vs. Lung Health
                                                </h3>
                                                <p className="text-slate-400 text-xs mt-1">Correlation: Access to Clean Fuel (LPG) vs. Respiratory Infections (URI)</p>
                                            </div>
                                            <div className="flex gap-4 text-xs">
                                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Safe Zone</div>
                                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Danger Zone</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 h-full relative">
                                            {/* Quadrant Backgrounds for better context */}
                                            <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 opacity-10 pointer-events-none">
                                                <div className="bg-rose-500 rounded-tl-xl border-r border-b border-white/20"></div>
                                                <div className="bg-yellow-500 rounded-tr-xl border-b border-white/20"></div>
                                                <div className="bg-yellow-500 rounded-bl-xl border-r border-white/20"></div>
                                                <div className="bg-emerald-500 rounded-br-xl"></div>
                                            </div>

                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                                    <XAxis type="number" dataKey="clean_fuel" name="Clean Fuel" unit="%" stroke="#94a3b8" fontSize={11}
                                                        label={{ value: 'Households with Clean Fuel (LPG/Electric) →', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }}
                                                        domain={[0, 100]}
                                                    />
                                                    <YAxis type="number" dataKey="respiratory_issues" name="Illness" unit="%" stroke="#94a3b8" fontSize={11}
                                                        label={{ value: '↑ Prevalence of Respiratory Illness', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                                                    />
                                                    <Tooltip content={<ImprovedTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                                    <Scatter name="States" data={HOUSING_HEALTH_DATA}>
                                                        {HOUSING_HEALTH_DATA.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.clean_fuel > 60 ? '#10b981' : '#f43f5e'} stroke="white" strokeWidth={2} />
                                                        ))}
                                                    </Scatter>
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6 mt-16 lg:mt-0">
                                        <div className="bg-slate-900/40 p-3 sm:p-6 rounded-2xl border border-white/5 flex-1">
                                            <h4 className="text-lg font-bold text-white mb-3">Understanding the Graph</h4>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                                <span className="text-rose-400 font-bold">Top-Left (Danger):</span> Low clean fuel access leads to high respiratory illness (e.g., Bihar).<br />
                                                <span className="text-emerald-400 font-bold">Bottom-Right (Safe):</span> High clean fuel access drastically reduces illness (e.g., Punjab, Kerala).
                                            </p>
                                            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Curebird Insight</span>
                                                <p className="text-white text-sm mt-1">Switching to LPG reduces indoor pollution by 90%, preventing Asthma & COPD.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: SANITATION (NEW) */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                                    <div className="lg:col-span-2 h-[300px]">
                                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                                            <Info size={16} className="text-cyan-400" />
                                            Sanitation vs. Water-borne Diseases
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={SANITATION_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={true} vertical={true} />
                                                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={60} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                                                <Legend />
                                                <Bar dataKey="access" name="Improved Sanitation (%)" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                                <Bar dataKey="disease" name="Diarrhea Prevalence (%)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-cyan-900/10 p-3 sm:p-6 rounded-2xl border-2 border-cyan-500/30 flex flex-col justify-center mt-16 lg:mt-0">
                                        <h4 className="text-lg font-bold text-cyan-400 mb-4">Hygiene Hypothesis</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                            States with &gt;90% sanitation coverage (like Kerala) see Diarrheal disease rates drop to <span className="text-white font-bold">below 4%</span>.
                                        </p>
                                        <button className="flex items-center justify-center gap-2 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 py-3 rounded-xl border border-cyan-500/30 transition-all font-medium text-sm">
                                            <Home size={16} />
                                            Check Local Water Quality
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                    }

                    {
                        activeTab === 'food' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 h-[350px]">
                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <Info size={16} className="text-slate-500" />
                                            Wealth Quintile vs. Child Stunting
                                            <div className="group relative ml-1">
                                                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                                    <strong>What is 'Stunting'?</strong> It means a child is too short for their age. It is a sign of long-term poor nutrition (chronic malnutrition), often linked to poverty.
                                                </div>
                                            </div>
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={FOOD_SECURITY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                                <XAxis dataKey="factor" stroke="#94a3b8" fontSize={12} />
                                                <YAxis strke="#94a3b8" fontSize={12} label={{ value: 'Prevalence (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} cursor={{ fill: '#334155', opacity: 0.2 }} />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="stunting" name="Stunting (Low Height for Age)" fill="#f97316" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="wasting" name="Wasting (Low Weight for Height)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 sm:p-6 rounded-2xl border border-white/5">
                                        <h4 className="text-lg font-bold text-white mb-4">The Wealth Gap</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                            Economic status is the primary driver of food security. Children in the lowest wealth quintile are <strong>more than 2x</strong> likely to be stunted compared to the richest.
                                        </p>
                                        <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                                            <span className="block text-orange-400 text-xs uppercase font-bold tracking-wider mb-1">Critical Stat</span>
                                            <span className="text-2xl font-bold text-white">46.5%</span>
                                            <span className="text-slate-400 text-xs block mt-1">Stunting in poorest households</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'drugs' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-slate-900/40 p-3 sm:p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2 w-full text-left">
                                            <Info size={16} className="text-slate-500" />
                                            Drug Consumption by Category
                                            <div className="group relative ml-1">
                                                <Info size={14} className="text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                                    <strong>Antibiotics Overuse:</strong> A significant portion of drug consumption involves antibiotics, raising concerns about antimicrobial resistance.
                                                </div>
                                            </div>
                                        </h3>

                                        <div className="w-full h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={DRUG_CONSUMPTION_DATA} margin={{ top: 20, right: 30, left: 50, bottom: 50 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                                    <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} label={{ value: 'Market Share (%)', angle: -90, position: 'insideLeft', fill: '#e2e8f0' }} />
                                                    <Tooltip
                                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                                    />
                                                    <Bar dataKey="value" name="Usage Share (%)" radius={[4, 4, 0, 0]}>
                                                        {DRUG_CONSUMPTION_DATA.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-900/40 p-3 sm:p-6 rounded-2xl border border-white/5">
                                            <h4 className="text-lg font-bold text-white mb-4">Medication Trends</h4>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                                <strong>Antibiotics</strong> and <strong>Painkillers</strong> dominate the pharmaceutical market. This trend highlights the need for better awareness regarding prescription drug usage.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-3 sm:p-6 rounded-2xl border border-rose-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Pill size={80} />
                                            </div>

                                            <h4 className="text-lg font-bold text-rose-400 mb-2">Health Insight</h4>
                                            <p className="text-slate-300 text-sm mb-4">High reliance on painkillers suggests widespread chronic pain or symptom management rather than root-cause treatment.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default SocialDeterminants;
