import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Activity, TrendingUp, FileText, Trash2, Printer, UploadCloud, Eye, Download, File } from '../Icons';
import { DiseaseService } from '../../services/DiseaseService';

import { DISEASE_CONFIG, calculateCHI } from '../../data/diseaseMetrics';
import AddMetricModal from './AddMetricModal';
import ReviewExtractionModal from './ReviewExtractionModal';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';
import MedicationTimeline from './MedicationTimeline';
import ActionableInsightCard from './ActionableInsightCard';
import DoctorSummaryView from './DoctorSummaryView';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const DiseaseDetail = ({ userId, disease, onBack }) => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
    const [activeMetricType, setActiveMetricType] = useState(null);
    const [isDoctorMode, setIsDoctorMode] = useState(false);
    const [latestInsight, setLatestInsight] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents'
    const [documents, setDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null); // { url, type, name }

    // Extraction Review State
    const [extractionData, setExtractionData] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);


    const config = DISEASE_CONFIG[disease.configId];

    // ✅ Memoize availableMetrics so it doesn't change every render
    const availableMetrics = useMemo(() => {
        return config ? Object.values(config.metrics) : [];
    }, [config]);

    const activeMetricConfig = useMemo(() => {
        return availableMetrics.find(m => m.id === activeMetricType);
    }, [availableMetrics, activeMetricType]);

    // Get thresholds for the active metric
    const normalRange = activeMetricConfig ? activeMetricConfig.normal : null;

    // ✅ Set default active metric type once config loads
    useEffect(() => {
        if (availableMetrics.length > 0 && !activeMetricType) {
            setActiveMetricType(availableMetrics[0].id);
        }
    }, [availableMetrics, activeMetricType]);

    // ✅ Wrap fetchMetrics in useCallback so ESLint + hooks are happy
    const fetchMetrics = useCallback(async () => {
        if (!userId || !disease?.id || !activeMetricType) return;

        setLoading(true);
        try {
            const data = await DiseaseService.getMetrics(userId, disease.id, activeMetricType);
            setMetrics(data);

            // Recalculate CHI with *new* data + whatever else we might have
            // NOTE: Ideally we fetch ALL latest metrics for all types to get a real holistic score, 
            // but for now we trust the active set or we'd need a separate "fetchAllRecent" call.
            // Let's stick to calculating score based on what we see or expand later.
            // Actually, to make CHI meaningful, we need more than just the current active graph's data.
            // But doing a full fetch might be expensive. 
            // Better approach: Calculate specific CHI for this *Graph* or fetch summary.
            // Let's assume for this specific feature request, user wants to see the impact of *this* data.
            // Wait, calculateCHI expects a list of mixed metrics. 
            // If specific graph view only has 'Fasting Sugar', CHI is just based on that.

            // To do it right: fetch *latest* for all types for this disease
            // We can add a helper for that later. For now, let's use what we have in `metrics` (which is list of *one type* history)
            // This means CHI will show "Health Score for Fasting Sugar" effectively.
            // If user wants "Overall Health Index", we need to fetch all latest. 
            // Let's add a small effect to fetch all latest snapshots for score.

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [userId, disease?.id, activeMetricType]);

    // Fetch Documents
    const fetchDocuments = useCallback(async () => {
        if (!userId || !disease?.id) return;
        try {
            const docs = await DiseaseService.getDocuments(userId, disease.id);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    }, [userId, disease?.id]);

    useEffect(() => {
        if (activeTab === 'documents') {
            fetchDocuments();
        }
    }, [activeTab, fetchDocuments]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload Document for Reference
            await DiseaseService.uploadDocument(userId, disease.id, file);
            fetchDocuments(); // Refresh list

            // 2. Analyze & Extract Data (Automation)
            // Show toast or secondary loading state if possible, here using simple alerts/console for now
            console.log("Analyzing document...");
            const result = await DiseaseService.analyzeDocument(file);
            console.log("Analysis Result:", result);

            if (result && result.test_results && result.test_results.length > 0) {
                setExtractionData(result);
                setIsReviewOpen(true);
            } else {
                alert("Document uploaded, but no structured test results were found automatically.");
            }

        } catch (error) {
            console.error("Upload/Analysis failed:", error);
            alert("Failed to process document fully. It has been uploaded, but auto-extraction failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmExtraction = async (metricsToSave) => {
        let addedCount = 0;
        try {
            for (const metricData of metricsToSave) {
                await DiseaseService.addMetric(userId, disease.id, metricData);
                addedCount++;
            }
            fetchMetrics();
            alert(`Successfully saved ${addedCount} readings.`);
        } catch (error) {
            console.error("Failed to save metrics:", error);
            alert("Error saving metrics.");
        }
    };

    const handleViewDocument = (doc) => {
        setPreviewDoc(doc);
    };

    const handleDeleteDocument = async (docId, storagePath) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await DiseaseService.deleteDocument(userId, disease.id, docId, storagePath);
            fetchDocuments();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete document.");
        }
    };

    const handleDeleteMetric = async (metricId) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;

        try {
            await DiseaseService.deleteMetric(userId, disease.id, metricId);
            fetchMetrics();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete log.");
        }
    };

    const handleDeleteAllMetrics = async () => {
        if (!window.confirm("⚠️ ARE YOU SURE? \n\nThis will DELETE ALL LOGS for this disease history. This action cannot be undone.")) return;

        try {
            await DiseaseService.deleteAllMetrics(userId, disease.id);
            fetchMetrics();
        } catch (error) {
            console.error("Delete all failed:", error);
            alert("Failed to reset logs.");
        }
    };

    // ✅ useEffect depends only on stable callback
    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    // Transform data for Recharts
    const chartData = useMemo(() => {
        return (metrics || [])
            .map(m => ({
                timestamp: m.timestamp?.seconds || 0,
                date: m.timestamp?.seconds
                    ? new Date(m.timestamp.seconds * 1000).toLocaleDateString()
                    : '',
                time: m.timestamp?.seconds
                    ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '',
                val: m.value
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [metrics]);

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
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${disease.status === 'active'
                                    ? 'border-amber-500/30 text-amber-500'
                                    : 'border-green-500/30 text-green-500'
                                    }`}
                            >
                                {disease.status}
                            </span>
                            <span>•</span>
                            <span>Diagnosed {new Date(disease.diagnosisDate).toLocaleDateString()}</span>
                        </div>

                        {/* treating doctors */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(disease.doctors && disease.doctors.length > 0
                                ? disease.doctors
                                : [disease.primaryDoctor]
                            )
                                .filter(Boolean)
                                .map((doc, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 text-xs rounded-full border border-white/5"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                                        <span className="text-slate-300 font-medium">{doc}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Index Display */}
            <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/40 rounded-xl border border-white/5 mx-4 md:mx-0">
                <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Curebird Health Index</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">
                            {metrics.length > 0 ? calculateCHI(metrics, disease.configId) : '--'}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10"></div>
                <div className="text-xs text-slate-400 max-w-[150px] leading-tight">
                    Based on your {config?.metrics[activeMetricType]?.label || 'current'} trends.
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsDoctorMode(!isDoctorMode)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${isDoctorMode
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleDeleteAllMetrics}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Delete Total Log (Reset)"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={() => setIsAddMetricOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20"
                        >
                            <Plus size={18} /> Add Log
                        </button>
                    </div>
                )}
            </div>


            {/* Doctor View Render */}
            {
                isDoctorMode ? (
                    <DoctorSummaryView
                        user={getAuth().currentUser}
                        disease={disease}
                        metrics={metrics}
                        insights={latestInsight}
                        medications={[]}
                    />
                ) : (
                    <>
                        {/* Main Content Grid */}

                        {/* Tabs Navigation */}
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview'
                                    ? 'border-amber-500 text-white'
                                    : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'documents'
                                    ? 'border-amber-500 text-white'
                                    : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                Documents
                            </button>
                        </div>

                        {activeTab === 'overview' ? (
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
                                            <div className="h-full flex items-center justify-center text-slate-500">
                                                Loading data...
                                            </div>
                                        ) : chartData.length > 0 ? (
                                            <div className="h-[280px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: '#1e293b',
                                                                borderColor: '#334155',
                                                                color: '#fff'
                                                            }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                        {normalRange && (
                                                            <ReferenceArea
                                                                y1={normalRange[0]}
                                                                y2={normalRange[1]}
                                                                strokeOpacity={0}
                                                                fill="#10b981"
                                                                fillOpacity={0.1}
                                                            />
                                                        )}
                                                        <Line
                                                            type="monotone"
                                                            dataKey="val"
                                                            stroke="#f59e0b"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, fill: '#f59e0b' }}
                                                            activeDot={{ r: 6 }}
                                                        />
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
                                                <div
                                                    key={log.id}
                                                    className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition"
                                                >
                                                    <div>
                                                        <div className="text-white font-bold">
                                                            {log.value}{' '}
                                                            <span className="text-xs text-slate-500">{log.unit}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {new Date(log.timestamp.seconds * 1000).toLocaleDateString()} •{' '}
                                                            {new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
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
                                            {metrics.length === 0 && (
                                                <span className="text-sm text-slate-500">No logs found.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            // Document Tab Content
                            <div className="grid grid-cols-1 gap-6">
                                {/* Upload Area */}
                                <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-colors">
                                    <div className="p-4 bg-slate-800 rounded-full mb-4">
                                        <UploadCloud size={32} className="text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Upload Lab Reports</h3>
                                    <p className="text-slate-400 text-sm mb-6 max-w-sm">
                                        Store your prescriptions, test results, and imaging reports here securely.
                                    </p>
                                    <label className="cursor-pointer px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-amber-50 hover:text-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isUploading ? 'Uploading...' : 'Select File'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>

                                {/* Document List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl hover:border-amber-500/30 transition-colors flex flex-col justify-between">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="p-2 bg-slate-900/50 rounded-lg">
                                                    <FileText size={24} className="text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium truncate">{doc.name}</h4>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(doc.uploadedAt?.seconds * 1000).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                                <button
                                                    onClick={() => handleViewDocument(doc)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    <Eye size={14} /> Preview
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id, doc.storagePath)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {documents.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-500">
                                            No documents uploaded yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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

            <AnimatePresence>
                {isReviewOpen && (
                    <ReviewExtractionModal
                        isOpen={isReviewOpen}
                        onClose={() => setIsReviewOpen(false)}
                        onSave={handleConfirmExtraction}
                        extractedData={extractionData}
                        availableMetrics={availableMetrics}
                    />
                )}
            </AnimatePresence>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
                        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="text-white font-bold truncate max-w-md">{previewDoc.name}</h3>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={previewDoc.url}
                                        download={previewDoc.name}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Open Original"
                                    >
                                        <Download size={20} />
                                    </a>
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft size={20} className="rotate-180" /> {/* Using arrow as close or X */}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto bg-slate-950/50 p-4 flex items-center justify-center">
                                {previewDoc.type?.startsWith('image/') ? (
                                    <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                                ) : previewDoc.type === 'application/pdf' ? (
                                    <iframe src={previewDoc.url} title="Preview" className="w-full h-full min-h-[500px] rounded-lg border-0" />
                                ) : (
                                    <div className="text-center text-slate-400 py-12">
                                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>Preview not available for this file type.</p>
                                        <a href={previewDoc.url} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline mt-2 inline-block">Download to view</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default DiseaseDetail;
