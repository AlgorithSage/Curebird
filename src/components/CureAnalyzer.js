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
  Camera,
  Edit,
  ScanEye,
  BrainCircuit,
  Sparkles,
  Activity,
} from './Icons';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { API_BASE_URL } from "../config";
import { db } from "../firebase";
import curebirdLogo from '../curebird_logo.png';
import Header from "./Header";
import ReviewImportModal from "./diseases/ReviewImportModal";
import { motion, AnimatePresence } from 'framer-motion';

const CureAnalyzer = ({
  user,
  db,
  storage,
  appId,
  onLogout,
  onLoginClick,
  onToggleSidebar,
  onNavigate,
  onAskAI,
}) => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4
      }
    }
  };

  const fadeSlideUp = {
    hidden: { opacity: 0, y: 100, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerScale = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  };

  const blurReveal = {
    hidden: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

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
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `captured_document_${Date.now()}.jpg`, { type: "image/jpeg" });
      setSelectedFile(file);
      setAnalysisResult(null);
      setError('');
      setIsSaved(false);
      setIsDocSaved(false);
      setShowSavePrompt(false);
      setShowTypeSelect(false);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  React.useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
    setIsSaving(true);
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
                digital_copy: analysisResult?.analysis?.digital_copy,
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskAIClick = () => {
    if (!analysisResult?.analysis) return;

    const analysis = analysisResult.analysis;
    const medList = analysis.medications?.map(m =>
      `- ${m.name || m.medicine_name || m.input || 'Unknown Medicine'} (Dosage: ${m.dosage && typeof m.dosage === 'object' ? (m.dosage.dosage || JSON.stringify(m.dosage)) : (m.dosage || 'N/A')}, Freq: ${m.frequency || 'N/A'}) ${m.is_corrected ? '[Verified]' : ''}`
    ).join('\n') || 'None';

    const diseaseList = analysis.diseases?.join(', ') || 'None';

    const context = `
    CURRENT DOCUMENT CONTEXT:
    User has uploaded a medical document.
    
    Analysis Results:
    - Identified Conditions: ${diseaseList}
    - Medications Found:
    ${medList}
    
    Original Summary: ${analysisResult.summary}
    
    Please answer general questions based on this document.
    `;

    onAskAI(context);
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

    // FREE TIER LIMIT CHECK
    try {
      const { getCountFromServer, query, collection, getDoc, doc } = await import('firebase/firestore');
      // Check Tier
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const subscriptionTier = userData?.subscriptionTier || 'Free';

      if (subscriptionTier === 'Free') {
        const coll = collection(db, `artifacts/${appId}/users/${user.uid}/medical_records`);
        const snapshot = await getCountFromServer(coll);
        const count = snapshot.data().count;

        if (count >= 10) {
          setIsLoading(false);
          setError('Free Tier Limit Reached (10 Docs). Upgrade to Premium to analyze more documents.');
          return;
        }
      }
    } catch (err) {
      console.error("Limit check failed", err);
    }

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
                            <p style="margin:5px 0 0; color: #f59e0b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">CureBird Verified Record</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <img src="${window.location.origin}/favicon.ico" alt="CureBird Logo" style="height: 40px; margin-bottom: 5px;" />
                            <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                        </div>
                    </div>
                    ${document.getElementById("markdown-content-hidden")
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

  const startEditing = () => {
    setTempContent(analysisResult.analysis.digital_copy);
    setIsEditing(true);
  };

  const saveEdit = () => {
    setAnalysisResult(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        digital_copy: tempContent
      }
    }));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setTempContent("");
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
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }}
        variants={blurReveal}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-8 mb-12 text-center mt-6"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6 animate-pulse">
          <Bot size={16} /> CORE FEATURE
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          Cure Intelligence{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Analyzer
          </span>
        </h1>



        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload any complex prescription or medical report. Our{" "}
          <span className="text-amber-400 font-semibold">Triple-Core AI</span>{" "}
          (Vision OCR, Reasoning Verification, & Summary Synthesis) will instantly extract the technical data and translate it into a
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
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }}
        variants={containerVariants}
        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Upload Section */}
        {/* Upload Section - Futuristic Engine Border */}
        {/* Upload Section - Professional High-Fidelity Border */}
        <motion.div variants={fadeSlideUp} className="relative group rounded-3xl p-[1px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(245,158,11,0.3)]">
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
              {!showCamera ? (
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
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      SUPPORTED: PNG, JPG, GIF (MAX 10MB)
                    </p>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera();
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 text-slate-300 transition-all flex items-center gap-2 text-sm font-bold z-20"
                    >
                      <Camera size={16} /> Use Camera
                    </button>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative w-full h-72 bg-black rounded-2xl overflow-hidden border border-amber-500/30 flex flex-col items-center justify-center group/camera">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
                    <button
                      onClick={stopCamera}
                      className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm transition-colors shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={captureImage}
                      className="bg-emerald-500/80 hover:bg-emerald-600 text-white px-8 py-2 rounded-full font-bold backdrop-blur-sm transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Camera size={18} /> Capture
                    </button>
                  </div>
                </div>
              )}
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
        </motion.div>

        {/* Result Section */}
        {/* Result Section - Futuristic Engine Border */}
        {/* Result Section - Professional High-Fidelity Border */}
        <motion.div variants={fadeSlideUp} className="relative group rounded-3xl p-[1px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(14,165,233,0.3)]">
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="space-y-8"
                >
                  {/* Comprehensive Summary Section */}
                  {analysisResult.summary && (
                    <motion.div
                      variants={fadeSlideUp}
                      className="relative overflow-hidden rounded-2xl p-6 group/summary transition-all duration-500 bg-gradient-to-br from-[#eab308] via-[#f59e0b] to-[#d97706]"
                    >

                      {/* Decorative Elements - Subtle Pattern */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-[50px] rounded-full mix-blend-overlay"></div>

                      <div className="absolute bottom-0 right-0 p-4 opacity-10 blur-[0.5px]">
                        <Bot size={100} className="text-black" />
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between mb-6 relative z-10 border-b border-black/10 pb-4">
                        <h4 className="flex items-center gap-3 text-sm font-black text-black uppercase tracking-[0.2em] drop-shadow-sm">
                          <div className="p-1.5 bg-black/10 border border-black/5 rounded-lg shadow-inner">
                            <Sparkles size={16} className="text-black" />
                          </div>
                          Cure Executive Summary
                        </h4>
                        {analysisResult.analysis?.digital_copy && (
                          <button
                            onClick={() => setShowDigitalCopy(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-black/10 transition-all text-[10px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95"
                          >
                            <FileText size={14} weight="bold" /> View Digital Copy
                          </button>
                        )}
                      </div>

                      {/* Content with Smart Highlighting */}
                      <div className="text-slate-900 text-[15px] leading-relaxed relative z-10 font-medium">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom Text Processor for Highlighting
                            p: ({ children }) => {
                              const processText = (text) => {
                                if (typeof text !== 'string') return text;
                                // Split by Keywords AND Numerical Values
                                const parts = text.split(/(\b(?:high|low|critical|abnormal|elevated)\b|\b\d+(?:\.\d+)?(?:\s?(?:mg\/dL|g\/dL|u\/L|%|cm|kg|lbs|mm\/Hg))?\b)/gi);
                                return parts.map((part, i) => {
                                  const lower = part.toLowerCase();

                                  // High/Critical -> Solid Rose Badge (No Border)
                                  if (['high', 'elevated', 'critical', 'abnormal'].includes(lower)) {
                                    return <span key={i} className="inline-block bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded text-xs uppercase tracking-wide mx-0.5 transform -translate-y-px">{part}</span>;
                                  }
                                  // Low -> Solid Blue Badge (No Border)
                                  if (lower === 'low') {
                                    return <span key={i} className="inline-block bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded text-xs uppercase tracking-wide mx-0.5 transform -translate-y-px">{part}</span>;
                                  }
                                  // Numbers/Values -> White Highlight (No Border)
                                  if (/^\d/.test(part)) {
                                    return <span key={i} className="bg-white/60 text-black font-black px-1 rounded mx-0.5">{part}</span>;
                                  }
                                  return part;
                                });
                              };

                              return (
                                <div className="mb-3 last:mb-0">
                                  {React.Children.map(children, child => {
                                    if (typeof child === 'string') return processText(child);
                                    // Handle nested strong/em tags
                                    if (child?.props?.children && typeof child.props.children === 'string') {
                                      return React.cloneElement(child, { children: processText(child.props.children) });
                                    }
                                    return child;
                                  })}
                                </div>
                              );
                            },

                            // Medical Terms (Bold) -> Extra Bold Black
                            strong: ({ node, ...props }) => (
                              <span className="font-black text-slate-900" {...props} />
                            ),

                            ul: ({ node, ...props }) => <ul className="space-y-3 my-4" {...props} />,

                            li: ({ children }) => (
                              <li className="flex gap-3 text-slate-900 bg-black/5 p-2 rounded-lg transition-colors">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
                                <span className="font-medium flex-1">{children}</span>
                              </li>
                            ),

                            h1: ({ node, ...props }) => <h3 className="text-lg font-black text-black mt-4 mb-2 uppercase tracking-wide border-l-4 border-black pl-3" {...props} />,
                            h2: ({ node, ...props }) => <h4 className="text-base font-bold text-black mt-3 mb-2 uppercase tracking-wide" {...props} />,
                            h3: ({ node, ...props }) => <h5 className="text-sm font-bold text-black mt-2 mb-1 uppercase" {...props} />,
                          }}
                        >
                          {analysisResult.summary}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={fadeSlideUp} className="grid grid-cols-1 gap-6">
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

                  </motion.div>

                  {/* Lab Results Section */}
                  {(analysisResult.analysis?.test_results || []).length > 0 && (
                    <motion.div variants={fadeSlideUp} className="mt-6">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                        <Activity size={12} /> Lab Findings
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysisResult.analysis.test_results.map((test, i) => {
                          const isAbnormal = test.status?.toLowerCase().includes('high') || test.status?.toLowerCase().includes('low') || test.status?.toLowerCase().includes('critical');
                          return (
                            <div
                              key={i}
                              className={`flex flex-col p-4 rounded-xl border transition-all ${isAbnormal ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40' : 'bg-slate-900 border-slate-700 hover:border-sky-500/40'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold text-sm ${isAbnormal ? 'text-rose-400' : 'text-slate-200'}`}>
                                  {test.test_name}
                                </span>
                                {test.status && (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isAbnormal ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                    {test.status}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-white">{test.result_value}</span>
                                <span className="text-xs text-slate-500 font-mono">{test.unit}</span>
                              </div>
                              {test.reference_range && (
                                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                                  <span>Ref:</span>
                                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                    {test.reference_range}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={fadeSlideUp} className="relative">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                      <Pill size={12} /> Pharmacy Data extract
                    </h4>
                    {(analysisResult.analysis?.medications || []).length >
                      0 ? (
                      <div className="space-y-3">
                        {analysisResult.analysis.medications.map((med, i) => (
                          <div
                            key={i}
                            className="flex flex-col text-slate-300 text-sm bg-slate-900 border border-slate-700 p-4 rounded-xl hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group/med"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-emerald-400 group-hover/med:text-emerald-300 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                {med.name || med.medicine_name || med.input || "Unknown Medicine"}
                                {med.is_corrected && (
                                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    <Check size={10} /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-slate-500 font-mono text-xs">
                                <span className="opacity-70 group-hover/med:opacity-100 transition-opacity">
                                  DSG: {med.dosage && typeof med.dosage === 'object' ? (med.dosage.dosage || JSON.stringify(med.dosage)) : med.dosage || 'N/A'}
                                </span>
                                <span className="w-px h-full bg-slate-800"></span>
                                <span className="opacity-70 group-hover/med:opacity-100 transition-opacity">
                                  FRQ: {med.frequency}
                                </span>
                              </div>
                            </div>

                            {/* Alternative Medications Section */}
                            {med.alternatives && med.alternatives.length > 0 && (
                              <div className="mt-2 pl-4 border-l-2 border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                                  Approved Alternatives:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {med.alternatives.map((alt, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded hover:bg-slate-800 hover:text-sky-400 transition-colors cursor-help"
                                      title="Generic/Alternative Option"
                                    >
                                      {alt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-xs italic font-mono pl-2">
                        -- No medications detected --
                      </p>
                    )}
                  </motion.div>
                </motion.div>
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

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                disabled={!analysisResult?.analysis?.digital_copy}
                onClick={() => setShowDigitalCopy(true)}
                className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
              >
                <FileText size={18} /> View Digital
              </button>

              <button
                disabled={!analysisResult}
                onClick={handleAskAIClick}
                className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
              >
                <Bot size={18} /> Ask Cure AI
              </button>

              <button
                disabled={!analysisResult}
                onClick={handleSave}
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-all duration-500 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${isSaved
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
                disabled={!selectedFile || isSaving || !analysisResult}
                onClick={handleDocSave}
                className={`flex-1 py-4 rounded-xl font-bold text-black transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${isDocSaved
                  ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white"
                  : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-[length:200%_auto] hover:bg-right"
                  }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    SAVING...
                  </>
                ) : isDocSaved ? (
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
        </motion.div>
      </motion.div>
      {
        isImportModalOpen && analysisResult && (
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
        )
      }

      {/* Hidden div for printing markdown content */}
      <div id="markdown-content-hidden" style={{ display: "none" }}>
        {analysisResult?.analysis?.digital_copy && (
          <ReactMarkdown>{analysisResult.analysis.digital_copy}</ReactMarkdown>
        )}
      </div>

      {/* Digital Copy Modal */}
      {
        showDigitalCopy && analysisResult?.analysis?.digital_copy && (
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
                  {!isEditing ? (
                    <>
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
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
                    </>
                  ) : (
                    <>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <Check size={16} /> Save Changes
                      </button>
                    </>
                  )}
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
                        <img src="/favicon.ico" alt="CureBird Logo" className="h-10 w-auto" />
                        <span className="text-xl">CureBird</span>
                      </div>
                    </div>
                  </div>
                  {/* Actual Markdown Content - Forcing Colors with Inline Styles */}
                  <div className="markdown-content text-left" style={{ textAlign: 'left', color: '#000000' }}>
                    <style>{`
                          .markdown-content * {
                              color: #000000 !important;
                              opacity: 1 !important;
                              text-align: left !important;
                          }
                          .markdown-content strong {
                              font-weight: 800 !important;
                              color: #000000 !important;
                          }
                          .markdown-content li {
                              color: #000000 !important;
                          }
                          .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                              color: #000000 !important;
                              font-weight: 800 !important;
                          }
                          .markdown-content table {
                              width: 100%;
                              border-collapse: collapse;
                              margin: 1em 0;
                          }
                          .markdown-content th, .markdown-content td {
                              border: 1px solid #cbd5e1;
                              padding: 8px;
                              color: #000 !important;
                          }
                          .markdown-content th {
                              background-color: #f1f5f9;
                              font-weight: bold;
                          }
                      `}</style>
                    <div className="prose prose-sm max-w-none text-black">
                      {isEditing ? (
                        <textarea
                          value={tempContent}
                          onChange={(e) => setTempContent(e.target.value)}
                          className="w-full h-[60vh] p-4 rounded-xl border border-slate-300 bg-slate-50 font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none shadow-inner"
                          placeholder="Edit markdown content..."
                          style={{ color: '#000000' }}
                        />
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {analysisResult.analysis.digital_copy}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    <span>Generated by CureBird AI</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default CureAnalyzer;

