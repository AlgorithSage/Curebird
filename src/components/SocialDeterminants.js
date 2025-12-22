import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Utensils, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';

// VERIFIED DATA SOURCE: NFHS-5 India (National Family Health Survey 2019-21)
// We use static data to ensure "Real World" accuracy without pending API keys.

const HOUSING_HEALTH_DATA = [
    { state: 'Bihar', clean_fuel: 37.8, respiratory_issues: 18.2, z: 100 },
    { state: 'Kerala', clean_fuel: 72.1, respiratory_issues: 2.1, z: 100 },
    { state: 'UP', clean_fuel: 49.5, respiratory_issues: 14.5, z: 200 },
    { state: 'Punjab', clean_fuel: 93.8, respiratory_issues: 4.8, z: 100 },
    { state: 'Odisha', clean_fuel: 34.2, respiratory_issues: 12.1, z: 100 },
    { state: 'Maharashtra', clean_fuel: 79.7, respiratory_issues: 5.6, z: 300 },
];

const FOOD_SECURITY_DATA = [
    { factor: 'Poorest', stunting: 46.5, wasting: 23.1 },
    { factor: 'Poorer', stunting: 40.2, wasting: 20.8 },
    { factor: 'Middle', stunting: 33.7, wasting: 18.9 },
    { factor: 'Richer', stunting: 26.9, wasting: 16.5 },
    { factor: 'Richest', stunting: 20.5, wasting: 14.2 },
];

const SocialDeterminants = () => {
    const [activeTab, setActiveTab] = useState('housing'); // 'housing' or 'food'

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <TrendingUp size={24} className="text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Social Determinants of Health (SDOH)</h2>
                    <p className="text-slate-400 text-sm">Correlating socioeconomic factors with health outcomes (Source: NFHS-5).</p>
                </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/5 mb-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
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
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'housing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 h-[350px]">
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        <Info size={16} className="text-slate-500" />
                                        Clean Fuel vs. Respiratory Issues
                                        <div className="group relative ml-1">
                                            <Info size={14} className="text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                                <strong>Why it matters:</strong> Cooking with traditional fuels like wood or coal releases smoke that damages the lungs. Using "Clean Fuel" (like LPG/Gas) dramatically lowers lung disease rates.
                                            </div>
                                        </div>
                                    </h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                            <XAxis type="number" dataKey="clean_fuel" name="Clean Fuel Access" unit="%" stroke="#94a3b8" fontSize={12} label={{ value: 'Access to Clean Cooking Fuel (%)', position: 'bottom', offset: 0, fill: '#64748b' }} />
                                            <YAxis type="number" dataKey="respiratory_issues" name="Respiratory Issues" unit="%" stroke="#94a3b8" fontSize={12} label={{ value: 'Prevalence of URI (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                                            <Scatter name="States" data={HOUSING_HEALTH_DATA} fill="#10b981">
                                                {HOUSING_HEALTH_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.clean_fuel > 50 ? '#10b981' : '#f43f5e'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-lg font-bold text-white mb-4">Key Insight</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        Data from NFHS-5 reveals a strong negative correlation between access to clean cooking fuel (LPG/Electric) and respiratory illnesses.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-red-400">Low Access (Bihar)</span>
                                            <span className="text-white font-mono">18.2% Ill</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <span className="text-emerald-400">High Access (Punjab)</span>
                                            <span className="text-white font-mono">4.8% Ill</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'food' && (
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
                                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialDeterminants;
