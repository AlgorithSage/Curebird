import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  ArrowLeft, Plus, Activity, Calendar, TrendingUp, AlertCircle, FileText, Trash2  } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';
import { DISEASE_CONFIG } from '../../data/diseaseMetrics';
import AddMetricModal from './AddMetricModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import MedicationTimeline from './MedicationTimeline';
import ActionableInsightCard from './ActionableInsightCard';
import DoctorSummaryView from './DoctorSummaryView';
import { getAuth } from 'firebase/auth'; // Using auth from context in MedicalPortfolio usually, but here props.
import { getFirestore } from 'firebase/firestore'; // Ensure we have db access
import {  Printer  } from '../Icons';

const DiseaseDetail = ({ userId, disease, onBack }) => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
    const [activeMetricType, setActiveMetricType] = useState(null);
    const [isDoctorMode, setIsDoctorMode] = useState(false);
    const [latestInsight, setLatestInsight] = useState(null); // Store insight for Doctor View

    const config = DISEASE_CONFIG[disease.configId];
    // Default to first metric type if available
    const availableMetrics = config ? Object.values(config.metrics) : [];
    const activeMetricConfig = availableMetrics.find(m => m.id === activeMetricType);

    // Get thresholds for the active metric
    const normalRange = activeMetricConfig ? activeMetricConfig.normal : null; // [min, max]

    useEffect(() => {
        if (availableMetrics.length > 0 && !activeMetricType) {
            setActiveMetricType(availableMetrics[0].id);
        }
    }, [availableMetrics, activeMetricType]);

    const fetchMetrics = async () => {
        if (!userId || !disease.id || !activeMetricType) return;
        setLoading(true);
        try {
            // Fetch specifically activeMetricType
            const data = await DiseaseService.getMetrics(userId, disease.id, activeMetricType);
            setMetrics(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMetric = async (metricId) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;
        try {
            await DiseaseService.deleteMetric(userId, disease.id, metricId);
            // Refresh metrics
            fetchMetrics();
        } catch (error) {
            console.error("Failed to delete metric:", error);
            alert("Failed to delete record.");
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [userId, disease, activeMetricType]);

    // Transform data for Recharts
    const chartData = metrics.map(m => ({
        timestamp: m.timestamp.seconds,
        date: new Date(m.timestamp.seconds * 1000).toLocaleDateString(),
        time: new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        val: m.value
    })).sort((a, b) => a.timestamp - b.timestamp); // Ensure Ascending Order (Left=Oldest, Right=Newest)

    return (
        <div className="glass-card min-h-full border border-white/5">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${disease.status === 'active' ? 'border-amber-500/30 text-amber-500' : 'border-green-500/30 text-green-500'}`}>
                                {disease.status}
                            </span>
                            <span>•</span>
                            <span>Diagnosed {new Date(disease.diagnosisDate).toLocaleDateString()}</span>
                        </div>

                        {/* treating doctors */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(disease.doctors && disease.doctors.length > 0 ? disease.doctors : [disease.primaryDoctor]).filter(Boolean).map((doc, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 text-xs rounded-full border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                                    <span className="text-slate-300 font-medium">{doc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDoctorMode(!isDoctorMode)}
                        className={`px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${isDoctorMode ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {isDoctorMode ? 'Exit Clinical View' : 'Doctor View'}
                    </button>

                    {isDoctorMode && (
                        <button
                            onClick={() => window.print()}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                            title="Print Report"
                        >
                            <Printer size={20} />
                        </button>
                    )}

                    {!isDoctorMode && (
                        <button
                            onClick={() => setIsAddMetricOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20"
                        >
                            <Plus size={18} /> Add Log
                        </button>
                    )}
                </div>
            </div>

            {/* Doctor View Render */}
            {
                isDoctorMode ? (
                    <DoctorSummaryView
                        user={getAuth().currentUser}
                        disease={disease}
                        metrics={metrics}
                        insights={latestInsight}
                        medications={[]} // Todo: pass real meds
                    />
                ) : (
                    <>
                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Col: Chart & Tabs */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Metric Selector Tabs */}
                                {availableMetrics.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {availableMetrics.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setActiveMetricType(m.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeMetricType === m.id
                                                    ? 'bg-white text-slate-900 shadow-md'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Chart Container */}
                                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 h-[350px] flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-blue-400" />
                                        {availableMetrics.find(m => m.id === activeMetricType)?.label || 'Trends'}
                                    </h3>

                                    {loading ? (
                                        <div className="h-full flex items-center justify-center text-slate-500">Loading data...</div>
                                    ) : chartData.length > 0 ? (
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    {normalRange && (
                                                        <ReferenceArea y1={normalRange[0]} y2={normalRange[1]} strokeOpacity={0} fill="#10b981" fillOpacity={0.1} />
                                                    )}
                                                    <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex-1 w-full box-border flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-xl p-4">
                                            <Activity size={32} className="mb-2 opacity-50" />
                                            No data logged yet.
                                        </div>
                                    )}
                                </div>

                                {/* Medication Timeline */}
                                <div className="mt-6">
                                    <MedicationTimeline userId={userId} db={getFirestore()} />
                                </div>

                            </div>

                            {/* Right Col: Recent Logs & Insight */}
                            <div className="space-y-6">

                                {/* Actionable Insight (Topic 4.3) */}
                                <ActionableInsightCard
                                    userId={userId}
                                    disease={disease}
                                    metrics={metrics}
                                    onInsightLoaded={setLatestInsight}
                                />

                                {/* Recent History List */}
                                <div className="bg-slate-800/30 rounded-2xl p-5 border border-white/5 max-h-[400px] overflow-y-auto">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400" /> Recent Logs
                                    </h3>
                                    <div className="space-y-3">
                                        {metrics.map((log) => (
                                            <div key={log.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition">
                                                <div>
                                                    <div className="text-white font-bold">{log.value} <span className="text-xs text-slate-500">{log.unit}</span></div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(log.timestamp.seconds * 1000).toLocaleDateString()} • {new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${Number(log.value) > 100 ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <button
                                                        onClick={() => handleDeleteMetric(log.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Log"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {metrics.length === 0 && <span className="text-sm text-slate-500">No logs found.</span>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                )
            }

            <AnimatePresence>
                {isAddMetricOpen && (
                    <AddMetricModal
                        userId={userId}
                        disease={disease}
                        onClose={() => setIsAddMetricOpen(false)}
                        onMetricAdded={fetchMetrics}
                    />
                )}
            </AnimatePresence>

        </div >
    );
};

export default DiseaseDetail;
