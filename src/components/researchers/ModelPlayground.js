import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, TrendingUp, AlertTriangle, CheckCircle, Loader, Play } from '../Icons';
import { API_BASE_URL } from '../../config';

export default function ModelPlayground() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch available models
        fetch(`${API_BASE_URL}/api/v1/models`)
            .then(res => res.json())
            .then(data => {
                setModels(data);
                if (data.length > 0) setSelectedModel(data[0].id);
            })
            .catch(err => console.error("Failed to load models", err));
    }, []);

    const handleInputChange = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const runInference = async () => {
        if (!selectedModel) return;
        setLoading(true);
        setPrediction(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/models/${selectedModel}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input_data: inputs })
            });
            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error("Inference failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-800 border-slate-700';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2">Model Playground</h1>
                    <p className="text-slate-400">Test pre-trained models with custom inputs.</p>
                </div>

                <div className="p-6 bg-black/40 backdrop-blur-xl animated-border rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>

                    <label className="block text-xs font-bold text-amber-500/80 uppercase mb-2 ml-1">Select Model</label>
                    <div className="relative mb-8">
                        <select
                            className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer font-medium"
                            value={selectedModel || ''}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.name} (v{m.version})</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>

                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                            Parameter Inputs
                        </h3>

                        {/* Input Fields */}
                        <InputGroup label="Age" type="number" placeholder="Years" value={inputs.age || ''} onChange={v => handleInputChange('age', v)} />
                        <InputGroup label="BMI" type="number" placeholder="kg/m²" value={inputs.bmi || ''} onChange={v => handleInputChange('bmi', v)} />
                        <InputGroup label="Fasting Glucose" type="number" placeholder="mg/dL" value={inputs.fasting_glucose || ''} onChange={v => handleInputChange('fasting_glucose', v)} />
                        <InputGroup label="HbA1c" type="number" step="0.1" placeholder="%" value={inputs.hba1c || ''} onChange={v => handleInputChange('hba1c', v)} />

                        <div className="flex items-center gap-3 pt-4 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                id="history"
                                className="w-5 h-5 rounded bg-black border-slate-600 text-amber-500 focus:ring-amber-500/50"
                                checked={inputs.family_history || false}
                                onChange={e => handleInputChange('family_history', e.target.checked)}
                            />
                            <label htmlFor="history" className="text-sm font-medium text-slate-300 cursor-pointer select-none">Family History of Diabetes</label>
                        </div>
                    </div>

                    <button
                        onClick={runInference}
                        disabled={loading || !selectedModel}
                        className="w-full mt-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-amber-400/20"
                    >
                        {loading ? <Loader className="animate-spin" /> : <Play size={20} weight="fill" />}
                        Run Prediction Model
                    </button>
                </div>
            </div>

            {/* Right Panel: Results */}
            <div className="lg:col-span-2">
                <div className="h-full bg-black/40 backdrop-blur-xl animated-border rounded-3xl p-8 relative overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
                    {/* Background Detail */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.05),_transparent_40%)] pointer-events-none"></div>

                    {prediction ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 relative z-10"
                        >
                            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Brain size={28} className="text-amber-400" />
                                        Inference Results
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1 font-mono">ID: {prediction.model_id}</p>
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono flex items-center gap-2">
                                    <CheckCircle size={14} weight="fill" />
                                    Completed {(prediction.prediction.confidence * 100).toFixed(1)}% Conf.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className={`p-8 rounded-2xl border ${getRiskColor(prediction.prediction.risk_category)} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-current opacity-[0.03]"></div>
                                    <Activity size={56} className="mb-4 opacity-100" />
                                    <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Predicted Risk Level</h3>
                                    <p className="text-5xl font-black tracking-tight">{prediction.prediction.risk_category}</p>
                                </div>

                                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
                                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * prediction.prediction.risk_score)} className="text-amber-400 transition-all duration-1000 ease-out" />
                                        </svg>
                                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-white">{(prediction.prediction.risk_score * 100).toFixed(0)}</span>
                                            <span className="text-xs text-slate-400 uppercase font-bold">% Score</span>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Quantified Risk Score</h3>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    Explainability Analysis (SHAP)
                                </h3>
                                <div className="space-y-4">
                                    {prediction.explanation?.top_factors?.map((factor, i) => (
                                        <div key={i} className="flex items-center gap-4 group">
                                            <span className="w-32 text-xs font-bold text-slate-400 text-right uppercase tracking-wider">{factor.feature.replace('_', ' ')}</span>
                                            <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${factor.contribution * 100}%` }}
                                                    transition={{ delay: 0.3 + (i * 0.1), duration: 1, ease: "circOut" }}
                                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                />
                                            </div>
                                            <span className="w-12 text-xs text-white font-mono font-bold text-right">{(factor.contribution * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6 animate-pulse-slow">
                                <Brain size={48} className="text-slate-400" weight="duotone" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-300 mb-2">Awaiting Parameters</h2>
                            <p className="text-sm">Configure the model inputs on the left to generate real-time predictions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const InputGroup = ({ label, type, value, onChange, step, placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-amber-500/60 uppercase mb-1 ml-1 tracking-wider">{label}</label>
        <input
            type={type}
            step={step}
            placeholder={placeholder}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium placeholder:text-slate-700"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
