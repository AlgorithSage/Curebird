import React, { useState } from 'react';
import { UploadCloud, FileText, Loader, AlertTriangle, Pill, Stethoscope, Bot } from 'lucide-react';

const CureAnalyzer = () => {
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
            const response = await fetch('http://127.0.0.1:5001/api/analyze-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'An unknown error occurred.');
            }

            const data = await response.json();
            setAnalysisResult(data.analysis);

        } catch (err) {
            console.error('AI Analysis Error:', err);
            setError(`Failed to process image: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <header className="pb-6 border-b border-slate-800">
                <h1 className="text-3xl font-bold text-white">Cure Analyzer</h1>
                <p className="text-slate-400 mt-1">Upload an image of a medical document to automatically identify key information.</p>
            </header>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4">1. Choose an Image File</h2>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-500">PNG, JPG, or GIF</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                    {selectedFile && <p className="text-center mt-4 text-slate-300">Selected file: {selectedFile.name}</p>}
                    <button onClick={handleAnalysis} disabled={isLoading || !selectedFile} className="mt-6 w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 font-semibold transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isLoading ? <Loader className="mx-auto animate-spin" /> : 'Analyze Document'}
                    </button>
                </div>

                {/* Result Section */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bot /> 2. Analysis Results</h2>
                    <div className="w-full h-96 bg-slate-950 rounded-lg p-4 overflow-y-auto border border-slate-700">
                        {isLoading && <p className="text-slate-400">Processing image...</p>}
                        {error && <div className="text-red-400 flex items-center gap-2"><AlertTriangle /> {error}</div>}
                        {analysisResult && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-medium text-amber-400"><Stethoscope size={16} />Detected Conditions / Diseases</h4>
                                    {analysisResult.diseases.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {analysisResult.diseases.map(d => <span key={d} className="bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full">{d}</span>)}
                                        </div>
                                    ) : <p className="text-slate-400 text-sm mt-1">No specific conditions detected.</p>}
                                </div>
                                <div>
                                     <h4 className="flex items-center gap-2 text-sm font-medium text-sky-400"><Pill size={16} />Detected Medications</h4>
                                     {analysisResult.medications.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {analysisResult.medications.map((med, i) => (
                                                <p key={i} className="text-slate-300 text-sm font-mono bg-slate-700/50 p-1 rounded">
                                                    &gt; {med.name} - {med.dosage} - {med.frequency}
                                                </p>
                                            ))}
                                        </div>
                                     ) : <p className="text-slate-400 text-sm mt-1">No specific medications detected.</p>}
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
