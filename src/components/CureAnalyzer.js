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

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="glass-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4">1. Choose an Image File</h2>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-yellow-500/30 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/30 hover:border-yellow-500/50 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-amber-400" />
                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-500">PNG, JPG, or GIF</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                    {selectedFile && <p className="text-center mt-4 text-slate-300">Selected file: {selectedFile.name}</p>}
                    <button onClick={handleAnalysis} disabled={isLoading || !selectedFile} className="mt-6 w-full bg-amber-500 text-black py-3 rounded-lg hover:bg-amber-400 font-semibold transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isLoading ? <Loader className="mx-auto animate-spin" /> : 'Analyze Document'}
                    </button>
                </div>

                {/* Result Section */}
                <div className="glass-card p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bot /> 2. Analysis Results</h2>
                    <div className="w-full h-96 bg-black/30 rounded-xl p-4 overflow-y-auto border border-yellow-500/20">
                        {isLoading && <p className="text-slate-400">Processing image...</p>}
                        {error && <div className="text-red-400 flex items-center gap-2"><AlertTriangle /> {error}</div>}
                        {analysisResult && (
                            <div className="space-y-6">
                                {/* Comprehensive Summary Section */}
                                {analysisResult.summary && (
                                    <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-2 uppercase tracking-wider">
                                            <Bot size={18} /> Cure Intelligence Summary
                                        </h4>
                                        <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                            {analysisResult.summary}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                                            <Stethoscope size={16} /> Detected Conditions
                                        </h4>
                                        {(analysisResult.analysis?.diseases || []).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.analysis.diseases.map(d => (
                                                    <span key={d} className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full">{d}</span>
                                                ))}
                                            </div>
                                        ) : <p className="text-slate-500 text-xs">No specific conditions detected.</p>}
                                    </div>

                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                                            <Pill size={16} /> Detected Medications
                                        </h4>
                                        {(analysisResult.analysis?.medications || []).length > 0 ? (
                                            <div className="space-y-2">
                                                {analysisResult.analysis.medications.map((med, i) => (
                                                    <p key={i} className="text-slate-300 text-xs font-mono bg-white/5 border border-white/10 p-2 rounded-lg">
                                                        &gt; {med.name} - {med.dosage} - {med.frequency}
                                                    </p>
                                                ))}
                                            </div>
                                        ) : <p className="text-slate-500 text-xs">No specific medications detected.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && !analysisResult && <p className="text-slate-500">Results will appear here...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CureAnalyzer;
