import React, { useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import curebirdLogo from '../curebird_logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Stethoscope, Hospital, Pill, HeartPulse, Trash2, Edit, ExternalLink, Printer, X, Eye, Check } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RecordCard = ({ record, storage, db, userId, appId, onEdit, onDelete }) => {
    // Step 5: Unified Iconography
    // Standardized all to use FileText (Document Icon) but kept color differentiation
    const ICONS = {
        prescription: <FileText className="text-rose-400" />,
        test_report: <FileText className="text-fuchsia-400" />,
        diagnosis: <FileText className="text-emerald-400" />,
        admission: <FileText className="text-red-400" />,
        ecg: <FileText className="text-pink-400" />,
        default: <FileText className="text-slate-400" />,
    };

    const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');
    const formatDate = (date) => {
        if (!date) return 'N/A';
        if (date.toDate) return date.toDate().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Invalid Date';
            return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [showDigitalModal, setShowDigitalModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState("");

    const startEditing = () => {
        setTempContent(record.digital_copy);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setTempContent("");
    };

    const saveEdit = async () => {
        if (!db || !userId || !appId) return;
        try {
            const recordRef = doc(db, `artifacts/${appId}/users/${userId}/medical_records`, record.id);
            await updateDoc(recordRef, {
                digital_copy: tempContent
            });
            setIsEditing(false);
            // The snapshot listener in parent will update the UI automatically
        } catch (error) {
            console.error("Error updating digital copy:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const handlePrint = () => {
        const printContent = record.digital_copy;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        // ... (Print Logic unchanged)
        printWindow.document.write(`
            <html>
                <head>
                    <title>Medical Record Digital Copy</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        body { font-family: 'Inter', sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1, h2, h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h1 style="margin:0; font-size: 24px; color: #1e293b;">DIGITAL TRANSCRIPT</h1>
                                <p style="margin:5px 0 0; color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">CureBird Verified Record</p>
                            </div>
                            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <img src="${window.location.origin}/favicon.ico" alt="CureBird Logo" style="height: 40px; margin-bottom: 5px;" />
                        <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                    </div>
                </div>
                    <div class="content" style="font-size: 14px; color: #000000 !important;">
                         ${document.getElementById(`markdown-content-${record.id}`)?.innerHTML || ''}
                    </div>
                    <div class="footer">
                        <p>Digitized by CureBird on ${new Date().toLocaleDateString()}</p>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleViewFile = async () => {
        if (record.storagePath && storage) {
            setIsLoadingFile(true);
            try {
                const storageRef = ref(storage, record.storagePath);
                const url = await getDownloadURL(storageRef);
                window.open(url, '_blank');
            } catch (error) {
                console.error("Secure fetch failed, falling back to public URL", error);
                if (record.fileUrl) window.open(record.fileUrl, '_blank');
            } finally {
                setIsLoadingFile(false);
            }
        }
        else if (record.fileUrl) {
            window.open(record.fileUrl, '_blank');
        }
    };

    return (
        <>
            <motion.div layout initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                // Step 1: Global Theme Integration
                // Used globally declared .glass-card-amber class
                className="glass-card-amber p-0 group flex flex-col overflow-hidden isolate relative">

                {/* Main Content Area */}
                <div className="p-5 flex gap-5 items-center relative z-10">
                    {/* Icon Container */}
                    <div className="relative group/icon">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-none" />
                        <div className="bg-slate-950/50 p-4 h-fit rounded-2xl shadow-inner ring-1 ring-white/10 relative z-10 group-hover:scale-105 transition-all duration-300">
                            {/* Step 5: Unified Icons rendered here */}
                            {React.cloneElement(ICONS[record.type] || ICONS.default, { size: 32 })}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-xl text-white group-hover:text-amber-400 transition-colors leading-tight truncate pr-4" title={record.docName || record.fileName}>
                            {record.docName || record.fileName || capitalize(record.type)}
                        </h3>

                        {/* Step 3: Professional Metadata Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {/* Date Badge */}
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                {formatDate(record.date)}
                            </span>
                            {/* Type Badge - Color Coded Pills */}
                            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm ${record.type === 'prescription' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                    record.type === 'test_report' ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' :
                                        record.type === 'diagnosis' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            record.type === 'admission' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                record.type === 'ecg' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' :
                                                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                }`}>
                                {capitalize(record.type)}
                            </span>
                        </div>

                        {/* Step 4: Smart Field Display */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-slate-300">
                            {/* Only show Doctor if valid */}
                            {record.doctorName && !["N/A", "Imported Doc"].includes(record.doctorName) && (
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-1.5 rounded-full h-1.5 bg-amber-500"></span>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold">Dr:</span>
                                    {record.doctorName}
                                </div>
                            )}
                            {/* Only show Facility if valid */}
                            {record.hospitalName && !["N/A", "Unknown Facility"].includes(record.hospitalName) && (
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-1.5 rounded-full h-1.5 bg-emerald-500"></span>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold">Facility:</span>
                                    {record.hospitalName}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0 h-full justify-center my-auto">
                        {/* Step 2: "Big Square" Action Buttons */}
                        <div className="flex items-center gap-3 h-full">
                            {record.fileUrl && (
                                <button
                                    onClick={handleViewFile}
                                    disabled={isLoadingFile}
                                    className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all disabled:opacity-50 transform hover:scale-[1.02] gap-1 group/btn relative overflow-hidden"
                                >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />

                                    {isLoadingFile ? <span className="animate-spin text-lg">⌛</span> : <ExternalLink size={24} />}
                                    <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">View</span>
                                </button>
                            )}
                            {record.digital_copy && (
                                <button
                                    onClick={() => setShowDigitalModal(true)}
                                    className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-[1.02] gap-1 group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    <Eye size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">Digital</span>
                                </button>
                            )}
                        </div>

                        {/* Step 6: Prominent Secondary Actions */}
                        {/* Always visible, no hover-to-reveal */}
                        <div className="flex gap-2 justify-end w-full mt-1">
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 transition-all text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                            >
                                <Edit size={14} /> Edit
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>

            </motion.div>

            {/* Print Helper */}
            <div id={`markdown-content-${record.id}`} style={{ display: 'none' }}>
                {record.digital_copy && (
                    <div className="prose max-w-none text-black [&_*]:text-black">
                        <ReactMarkdown>{record.digital_copy}</ReactMarkdown>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {/* ... (Modal code kept unchanged as it was already correct) */}
                {showDigitalModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900/95 backdrop-blur-xl border border-white/10 w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/5"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/20">
                                        <FileText size={20} weight="duotone" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Digital Transcript</h3>
                                        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black">AI-Generated Digitization</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                onClick={startEditing}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 hover:text-white transition-colors border border-white/5"
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
                                                onClick={() => setShowDigitalModal(false)}
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
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50 font-sans custom-scrollbar">
                                <div className="max-w-3xl mx-auto bg-slate-800/20 p-8 rounded-2xl border border-white/5">
                                    {/* Letterhead */}
                                    <div className="border-b-2 border-amber-500/50 pb-6 mb-8 flex justify-between items-end">
                                        <div>
                                            <h1 className="text-2xl font-black text-white m-0 leading-none tracking-tight">DIGITAL TRANSCRIPT</h1>
                                            <p className="text-amber-500 font-bold text-xs tracking-[0.2em] mt-2 uppercase">Official Medical Record Copy</p>
                                        </div>
                                        <div className="text-right opacity-100">
                                            <div className="flex items-center justify-end gap-2 text-white font-bold">
                                                <img src="/favicon.ico" alt="CureBird Logo" className="h-10 w-auto brightness-110 drop-shadow-lg" />
                                                <span className="text-xl tracking-tight">CureBird</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actual Markdown Content - Dark Mode Styles */}
                                    <div className="markdown-content text-left">
                                        <style>{`
                                            .markdown-content * {
                                                color: #e2e8f0 !important;
                                                opacity: 1 !important;
                                                text-align: left !important;
                                            }
                                            .markdown-content strong {
                                                font-weight: 800 !important;
                                                color: #fff !important;
                                                text-align: left !important;
                                            }
                                            .markdown-content li {
                                                color: #cbd5e1 !important;
                                            }
                                            .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                                                color: #f59e0b !important;
                                                font-weight: 800 !important;
                                            }
                                            .markdown-content table {
                                                width: 100%;
                                                border-collapse: collapse;
                                                margin: 1em 0;
                                            }
                                            .markdown-content th, .markdown-content td {
                                                border: 1px solid #334155;
                                                padding: 8px;
                                                color: #e2e8f0 !important;
                                            }
                                            .markdown-content th {
                                                background-color: #1e293b;
                                                font-weight: bold;
                                                color: #fbbf24 !important;
                                            }
                                        `}</style>
                                        <div className="prose prose-sm prose-invert max-w-none text-slate-200">
                                            {isEditing ? (
                                                <textarea
                                                    value={tempContent}
                                                    onChange={(e) => setTempContent(e.target.value)}
                                                    className="w-full h-[60vh] p-4 rounded-xl border border-white/10 bg-slate-950/50 font-mono text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none shadow-inner"
                                                    placeholder="Edit markdown content..."
                                                />
                                            ) : (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {record.digital_copy}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                        <span>Generated by CureBird AI</span>
                                        <span>ID: {record.id}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RecordCard;
