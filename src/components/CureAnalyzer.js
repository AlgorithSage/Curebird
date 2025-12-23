import React, { useState } from 'react';
import { UploadCloud, Loader, AlertTriangle, Pill, Stethoscope, Bot } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Header from './Header';

const CureAnalyzer = ({ user, onLogout, onLoginClick, onToggleSidebar }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setAnalysisResult(null);
        setError('');
    };

    const handleAnalysis = async () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'An unknown error occurred.');
            }

            const data = await response.json();
            setAnalysisResult(data);

        } catch (err) {
            console.error('AI Analysis Error:', err);
            setError(`Failed to process image: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <Header
                title="Cure Analyzer"
                description="Upload an image of a medical document to automatically identify key information."
                user={user}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
            />

            {/* Premium Feature Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-8 mb-12 text-center mt-6">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6 animate-pulse">
                    <Bot size={16} /> CORE FEATURE
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                    Cure Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Analyzer</span>
                </h1>

                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Upload any complex prescription or medical report. Our <span className="text-amber-400 font-semibold">Dual-Core AI</span> will instantly extract the technical data and translate it into a simple, easy-to-understand summary just for you.
                </p>

                <div className="flex justify-center gap-8 mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400"><UploadCloud /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Upload</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><Bot /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Analyze</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400"><Stethoscope /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Understand</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="relative group p-1 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
                    <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all duration-700 rounded-2xl"></div>
                    <div className="relative bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">1</span>
                            Upload Document
                        </h2>

                        <div className="flex-grow flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-amber-500/50 eth-card-bg transition-all duration-300 group/drop">
                                <div className="absolute inset-0 bg-amber-500/0 group-hover/drop:bg-amber-500/5 transition-all duration-300 rounded-2xl"></div>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 transition-transform duration-300 group-hover/drop:scale-105">
                                    <div className="p-4 rounded-full bg-slate-800/50 mb-3 group-hover/drop:bg-amber-500/20 transition-colors">
                                        <UploadCloud className="w-10 h-10 text-slate-400 group-hover/drop:text-amber-400 transition-colors" />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-bold text-amber-400">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500">PNG, JPG, or GIF (Max 10MB)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <p className="text-sm text-emerald-300 truncate font-medium">{selectedFile.name}</p>
                            </div>
                        )}

                        <button onClick={handleAnalysis} disabled={isLoading || !selectedFile} className="mt-6 w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed">
                            {isLoading ? <div className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={20} /> Processing...</div> : 'Analyze Document'}
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                <div className="relative group p-1 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
                    <div className="absolute inset-0 bg-sky-500/5 blur-xl group-hover:bg-sky-500/10 transition-all duration-700 rounded-2xl"></div>
                    <div className="relative bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 text-sm border border-sky-500/30">2</span>
                            AI Insights
                        </h2>

                        <div className="w-full flex-grow bg-black/40 rounded-2xl p-6 overflow-y-auto border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent min-h-[400px]">
                            {isLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Bot className="text-slate-600" size={24} />
                                        </div>
                                    </div>
                                    <p className="text-slate-400 font-medium animate-pulse">Consulting medical intelligence...</p>
                                </div>
                            )}

                            {error && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-rose-400 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                    <AlertTriangle size={48} className="mb-4 opacity-80" />
                                    <p className="font-semibold">{error}</p>
                                </div>
                            )}

                            {analysisResult && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {/* Comprehensive Summary Section */}
                                    {analysisResult.summary && (
                                        <div className="bg-gradient-to-br from-sky-900/20 to-blue-900/10 border border-sky-500/20 p-5 rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10"><Bot size={48} /></div>
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-3 uppercase tracking-wider">
                                                <Bot size={18} /> Cure Intelligence Summary
                                            </h4>
                                            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                {analysisResult.summary}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 opacity-80">
                                                <Stethoscope size={14} /> Clinical Findings
                                            </h4>
                                            {(analysisResult.analysis?.diseases || []).length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {analysisResult.analysis.diseases.map(d => (
                                                        <span key={d} className="bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors text-xs font-semibold px-3 py-1.5 rounded-lg">{d}</span>
                                                    ))}
                                                </div>
                                            ) : <p className="text-slate-600 text-xs italic">No specific conditions detected.</p>}
                                        </div>

                                        <div>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 opacity-80 mt-2">
                                                <Pill size={14} /> Prescribed Meds
                                            </h4>
                                            {(analysisResult.analysis?.medications || []).length > 0 ? (
                                                <div className="space-y-2">
                                                    {analysisResult.analysis.medications.map((med, i) => (
                                                        <div key={i} className="flex items-center justify-between text-slate-300 text-xs bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg hover:bg-slate-800 transition-colors group/med">
                                                            <div className="font-bold text-emerald-400 group-hover/med:text-emerald-300">{med.name}</div>
                                                            <div className="flex gap-2 text-slate-500 font-mono text-[10px]">
                                                                <span>{med.dosage}</span>
                                                                <span className="w-px h-3 bg-slate-700"></span>
                                                                <span>{med.frequency}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-slate-600 text-xs italic">No specific medications detected.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLoading && !error && !analysisResult && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                                    <Bot size={64} className="text-slate-600" />
                                    <p className="text-slate-500 font-medium max-w-[200px]">AI is ready to analyze your report. Upload a document to begin.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CureAnalyzer;
