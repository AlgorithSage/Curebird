import React, { useState } from "react";
import {
  UploadCloud,
  Loader,
  AlertTriangle,
  Pill,
  Stethoscope,
  Bot,
  Save,
  Check,
  FileCheck,
  Printer,
  FileText,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { API_BASE_URL } from "../config";
import { db } from "../firebase";
import curebirdLogo from '../curebird_logo.png';
import Header from "./Header";
import ReviewImportModal from "./diseases/ReviewImportModal";

const CureAnalyzer = ({
  user,
  db,
  storage,
  appId,
  onLogout,
  onLoginClick,
  onToggleSidebar,
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDocSaved, setIsDocSaved] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showDigitalCopy, setShowDigitalCopy] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null);
    setError("");
    setIsSaved(false);
    setIsDocSaved(false);
    setShowSavePrompt(false);
    setShowTypeSelect(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setShowSavePrompt(false);
  };

  const performSave = async (recordType, details = {}) => {
    try {
      const storageRef = ref(
        storage,
        `users/${user.uid}/medical_records/${Date.now()}_${selectedFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const recordData = {
                type: recordType,
                date: new Date(),
                doctorName: "Imported Document",
                hospitalName: "Upload",
                details: details,
                fileUrl: downloadURL,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                storagePath: storageRef.fullPath,
                createdAt: new Date(),
              };
              await addDoc(
                collection(
                  db,
                  `artifacts/${appId}/users/${user.uid}/medical_records`
                ),
                recordData
              );
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        );
      });
      setIsDocSaved(true);
      setShowTypeSelect(false);
    } catch (err) {
      console.error("Error saving document:", err);
      setError("Failed to save document. Please try again.");
    }
  };

  const handleManualSave = (type) => {
    performSave(type);
  };

  const handleDocSave = async () => {
    if (!selectedFile || !user || isDocSaved) return;

    if (analysisResult) {
      let recordType = "test_report";
      const medications = analysisResult?.analysis?.medications || [];
      if (medications.length > 0) recordType = "prescription";
      else if (analysisResult?.summary) {
        const lowerSummary = analysisResult.summary.toLowerCase();
        if (
          lowerSummary.includes("prescription") ||
          lowerSummary.includes(" rx ") ||
          lowerSummary.startsWith("rx ")
        ) {
          recordType = "prescription";
        }
      }
      const details = recordType === "prescription" ? { medications } : {};
      await performSave(recordType, details);
    } else {
      setShowTypeSelect(true);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysisResult(null);
    setIsSaved(false);
    setShowSavePrompt(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An unknown error occurred.");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setShowSavePrompt(true);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(`Failed to process image: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = analysisResult?.analysis?.digital_copy;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Medical Record Digital Copy</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        body { font-family: 'Inter', sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; }
                        h1, h2, h3 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1 style="margin:0; border:none; padding:0; font-size: 24px;">DIGITAL TRANSCRIPT</h1>
                            <p style="margin:5px 0 0; color: #f59e0b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Curebird Verified Record</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <img src="${window.location.origin + curebirdLogo}" alt="Curebird Logo" style="height: 40px; margin-bottom: 5px;" />
                            <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                        </div>
                    </div>
                    ${
                      document.getElementById("markdown-content-hidden")
                        .innerHTML
                    }
                    <div class="footer">
                        <p>Disclaimer: This is an AI-generated digitization. Please verify with the original document.</p>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
      <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
        <Header
          title="Cure Analyzer"
          description="Upload an image of a medical document to automatically identify key information."
          user={user}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          onToggleSidebar={onToggleSidebar}
          onNavigate={onNavigate}
        />
      </div>

      {/* Premium Feature Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-8 mb-12 text-center mt-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6 animate-pulse">
          <Bot size={16} /> CORE FEATURE
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
          Cure Intelligence{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Analyzer
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload any complex prescription or medical report. Our{" "}
          <span className="text-amber-400 font-semibold">Dual-Core AI</span>{" "}
          will instantly extract the technical data and translate it into a
          simple, easy-to-understand summary just for you.
        </p>

        <div className="flex justify-center gap-8 mt-8 opacity-70">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400">
              <UploadCloud />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-white">
              Upload
            </span>
          </div>
          <div className="w-16 h-px bg-slate-700 self-center"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
              <Bot />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-white">
              Analyze
            </span>
          </div>
          <div className="w-16 h-px bg-slate-700 self-center"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
              <Stethoscope />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-white">
              Understand
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        {/* Upload Section - Futuristic Engine Border */}
        {/* Upload Section - Professional High-Fidelity Border */}
        <div className="relative group rounded-3xl p-[1px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(245,158,11,0.3)]">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 group-hover:from-amber-600 group-hover:via-amber-500/20 group-hover:to-orange-900 transition-colors duration-700"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_120deg,rgba(245,158,11,0.5)_180deg,transparent_360deg)] opacity-0 group-hover:opacity-100 animate-[spin_4s_linear_infinite] transition-opacity duration-700"></div>

          {/* Inner Content Container */}
          <div className="relative bg-[#090e1a] rounded-[23px] h-full flex flex-col p-8 overflow-hidden z-10 backdrop-blur-xl">
            {/* Subtle Grid - Professional */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            ></div>

            {/* Premium Glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>

            <div className="absolute top-6 right-6 opacity-30 flex gap-2">
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
            </div>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 text-white z-10 tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 text-lg border border-amber-500/20 group-hover:border-amber-500/50 group-hover:bg-amber-500/20 transition-all shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
                1
              </span>
              Upload any Medical Document
            </h2>

            <div className="flex-grow flex items-center justify-center w-full z-10">
              <label
                htmlFor="dropzone-file"
                className="relative flex flex-col items-center justify-center w-full h-72 border border-dashed border-slate-700 bg-slate-800/20 rounded-2xl cursor-pointer hover:border-amber-500/60 hover:bg-slate-800/40 transition-all duration-500 group/drop overflow-hidden"
              >
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 w-full h-1 bg-amber-500/30 blur-sm top-0 group-hover/drop:animate-[scan_2s_ease-in-out_infinite]"></div>

                <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-transform duration-300 group-hover/drop:scale-105">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 mb-4 group-hover/drop:border-amber-500/50 group-hover/drop:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all">
                    <UploadCloud className="w-12 h-12 text-slate-400 group-hover/drop:text-amber-400 transition-colors" />
                  </div>
                  <p className="mb-2 text-base text-slate-300 font-medium">
                    <span className="text-amber-400 font-bold underline decoration-amber-500/30 underline-offset-4">
                      Click to upload
                    </span>{" "}
                    or drag file
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    SUPPORTED: PNG, JPG, GIF (MAX 10MB)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6 p-4 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center gap-3 shadow-lg z-10 relative overflow-hidden group/file">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover/file:bg-emerald-500/10 transition-colors"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></div>
                <p className="text-sm text-emerald-200 truncate font-mono tracking-wide">
                  {selectedFile.name}
                </p>
              </div>
            )}

            <button
              onClick={handleAnalysis}
              disabled={isLoading || !selectedFile}
              className="mt-8 w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} /> INITIALIZING
                  SCAN...
                </>
              ) : (
                "INITIATE ANALYSIS"
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        {/* Result Section - Futuristic Engine Border */}
        {/* Result Section - Professional High-Fidelity Border */}
        <div className="relative group rounded-3xl p-[1px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(14,165,233,0.3)]">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 group-hover:from-sky-600 group-hover:via-sky-500/20 group-hover:to-blue-900 transition-colors duration-700"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_120deg,rgba(14,165,233,0.5)_180deg,transparent_360deg)] opacity-0 group-hover:opacity-100 animate-[spin_4s_linear_infinite] transition-opacity duration-700"></div>

          {/* Inner Content Container */}
          <div className="relative bg-[#090e1a] rounded-[23px] h-full flex flex-col p-8 z-10 backdrop-blur-xl">
            {/* Subtle Grid - Professional */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            ></div>

            {/* Premium Glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700"></div>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 text-white z-10 tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 text-lg border border-sky-500/20 group-hover:border-sky-500/50 group-hover:bg-sky-500/20 transition-all shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]">
                2
              </span>
              Analysis of Document
            </h2>

            <div className="w-full flex-grow bg-slate-900/80 rounded-2xl p-6 overflow-y-auto border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent h-72 relative z-10 shadow-inner">
              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-800 border-t-amber-500 border-r-amber-500 rounded-full animate-spin"></div>
                    <div className="w-16 h-16 border-4 border-slate-800 border-b-sky-500 border-l-sky-500 rounded-full animate-spin absolute top-2 left-2 reverse-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bot className="text-white animate-pulse" size={24} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-400 font-bold tracking-widest text-sm animate-pulse">
                      PROCESSING DATA...
                    </p>
                    <p className="text-slate-500 text-xs font-mono">
                      Running VLM Sequence v2.2
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-rose-400 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                  <AlertTriangle
                    size={48}
                    className="mb-4 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  />
                  <h3 className="font-bold text-lg mb-2 text-white">
                    Analysis Interrupted
                  </h3>
                  <p className="font-medium opacity-80">{error}</p>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {/* Comprehensive Summary Section */}
                  {analysisResult.summary && (
                    <div className="bg-slate-800/50 border border-sky-500/30 p-6 rounded-2xl relative overflow-hidden group/summary">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Bot size={80} />
                      </div>
                      <div className="absolute inset-0 bg-sky-500/5 group-hover/summary:bg-sky-500/10 transition-all"></div>

                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h4 className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-[0.2em]">
                          <Bot size={16} /> Cure Executive Summary
                        </h4>
                        {analysisResult.analysis?.digital_copy && (
                          <button
                            onClick={() => setShowDigitalCopy(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-sky-500/30 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all text-[10px] font-bold text-sky-300 uppercase tracking-wider"
                          >
                            <FileText size={12} /> View Digital Copy
                          </button>
                        )}
                      </div>

                      <div className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-medium relative z-10">
                        {analysisResult.summary}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                        <Stethoscope size={12} /> Detected Conditions
                      </h4>
                      {(analysisResult.analysis?.diseases || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.diseases.map((d) => (
                            <span
                              key={d}
                              className="bg-slate-800 text-slate-100 border border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300 text-xs font-bold px-4 py-2 rounded-lg cursor-default"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 text-xs italic font-mono pl-2">
                          -- No specific conditions detected --
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                        <Pill size={12} /> Pharmacy Data extract
                      </h4>
                      {(analysisResult.analysis?.medications || []).length >
                      0 ? (
                        <div className="space-y-3">
                          {analysisResult.analysis.medications.map((med, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-slate-300 text-sm bg-slate-900 border border-slate-700 p-4 rounded-xl hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group/med"
                            >
                              <div className="font-bold text-emerald-400 group-hover/med:text-emerald-300 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                {med.name}
                              </div>
                              <div className="flex gap-4 text-slate-500 font-mono text-xs">
                                <span className="opacity-70 group-hover/med:opacity-100 transition-opacity">
                                  DSG: {med.dosage}
                                </span>
                                <span className="w-px h-full bg-slate-800"></span>
                                <span className="opacity-70 group-hover/med:opacity-100 transition-opacity">
                                  FRQ: {med.frequency}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 text-xs italic font-mono pl-2">
                          -- No medications detected --
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !error && !analysisResult && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                  <div className="w-24 h-24 rounded-full border border-dashed border-slate-500 flex items-center justify-center">
                    <Bot size={40} className="text-slate-500" />
                  </div>
                  <p className="text-white font-bold font-mono text-xs tracking-widest uppercase">
                    System Standby // Awaiting Input
                  </p>
                </div>
              )}
            </div>

            {/* Save Prompt Dialog */}
            {showSavePrompt && analysisResult && (
              <div className="mt-4 mb-2 p-4 rounded-xl bg-slate-800/80 border border-sky-500/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 shadow-lg backdrop-blur-md">
                <p className="text-sm font-semibold text-sky-100">
                  Do you want to save the Analysis of Document?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    Import Data
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition-colors shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  >
                    Save Record
                  </button>
                </div>
              </div>
            )}

            {/* Manual Type Selection Dialog */}
            {showTypeSelect && (
              <div className="mt-4 mb-2 p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 animate-in fade-in slide-in-from-top-2 shadow-lg backdrop-blur-md">
                <p className="text-sm font-semibold text-amber-100 mb-3 text-center">
                  Unanalyzed Document: Select Category
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleManualSave("prescription")}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 border border-slate-600 hover:border-amber-500/50 transition-all group"
                  >
                    <Pill
                      size={16}
                      className="text-slate-400 group-hover:text-amber-400"
                    />
                    <span className="text-xs font-bold">Prescription</span>
                  </button>
                  <button
                    onClick={() => handleManualSave("test_report")}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-sky-500/20 hover:text-sky-400 text-slate-300 border border-slate-600 hover:border-sky-500/50 transition-all group"
                  >
                    <FileCheck
                      size={16}
                      className="text-slate-400 group-hover:text-sky-400"
                    />
                    <span className="text-xs font-bold">Test Report</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowTypeSelect(false)}
                  className="w-full mt-3 text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-bold"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button
                disabled={!analysisResult}
                onClick={handleSave}
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-all duration-500 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${
                  isSaved
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"
                    : "bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 bg-[length:200%_auto] hover:bg-right"
                }`}
              >
                {isSaved ? (
                  <>
                    <Check size={18} /> RECORD SAVED
                  </>
                ) : (
                  <>
                    <Save size={18} /> SAVE RECORD
                  </>
                )}
              </button>

              <button
                disabled={!selectedFile}
                onClick={handleDocSave}
                className={`flex-1 py-4 rounded-xl font-bold text-black transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${
                  isDocSaved
                    ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-[length:200%_auto] hover:bg-right"
                }`}
              >
                {isDocSaved ? (
                  <>
                    <FileCheck size={18} /> DOCUMENT UPLOADED
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} /> SAVE DOCUMENT
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isImportModalOpen && analysisResult && (
        <ReviewImportModal
          userId={user.uid}
          analysisData={analysisResult.analysis}
          db={db}
          onClose={() => setIsImportModalOpen(false)}
          onComplete={() => {
            setIsImportModalOpen(false);
            handleSave(); // Trigger save state update
            // Maybe show toast?
          }}
        />
      )}

      {/* Hidden div for printing markdown content */}
      <div id="markdown-content-hidden" style={{ display: "none" }}>
        {analysisResult?.analysis?.digital_copy && (
          <ReactMarkdown>{analysisResult.analysis.digital_copy}</ReactMarkdown>
        )}
      </div>

      {/* Digital Copy Modal */}
      {showDigitalCopy && analysisResult?.analysis?.digital_copy && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-amber-500/20">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Digital Transcript</h3>
                                    <p className="text-[10px] text-amber-600 uppercase tracking-widest font-black">AI-Generated Digitization</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                                >
                                    <Printer size={16} /> Print Copy
                                </button>
                                <button
                                    onClick={() => setShowDigitalCopy(false)}
                                    className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white font-sans" style={{ color: 'black' }}>
                            <div className="max-w-3xl mx-auto">
                                {/* Digital Paper Header */}
                                <div className="border-b-2 border-amber-500 pb-6 mb-8 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 m-0 leading-none">DIGITAL TRANSCRIPT</h1>
                                        <p className="text-amber-600 font-bold text-xs tracking-[0.2em] mt-2 uppercase">Official Medical Record Copy</p>
                                    </div>
                                    <div className="text-right opacity-100">
                                        <div className="flex items-center justify-end gap-2 text-slate-900 font-bold">
                                            <img src={curebirdLogo} alt="Curebird Logo" className="h-10 w-auto" />
                                            <span className="text-xl">Curebird</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="prose max-w-none text-black [&_*]:text-black [&_p]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_li]:text-black [&_strong]:text-black [&_td]:text-black [&_th]:text-black">
                                    <ReactMarkdown>
                                        {analysisResult.analysis.digital_copy}
                                    </ReactMarkdown>
                                </div>
                                 {/* Footer */}
                                 <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                    <span>Generated by Curebird AI</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
      )}
    </div>
  );
};

export default CureAnalyzer;

