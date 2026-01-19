import React, { useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import curebirdLogo from '../curebird_logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Stethoscope, Hospital, Pill, HeartPulse, Trash2, Edit, ExternalLink, Printer, X, Eye, Check } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RecordCard = ({ record, storage, db, userId, appId, onEdit, onDelete }) => {
    const ICONS = {
        prescription: <Pill className="text-rose-400" />,
        test_report: <FileText className="text-fuchsia-400" />,
        diagnosis: <Stethoscope className="text-emerald-400" />,
        admission: <Hospital className="text-red-400" />,
        ecg: <HeartPulse className="text-pink-400" />,
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
        // Option 1: Try secure Fetch via Storage SDK
        if (record.storagePath && storage) {
            setIsLoadingFile(true);
            try {
                const storageRef = ref(storage, record.storagePath);
                const url = await getDownloadURL(storageRef);
                window.open(url, '_blank');
            } catch (error) {
                console.error("Secure fetch failed, falling back to public URL", error);
                // Fallback to stored URL if SDK fails
                if (record.fileUrl) window.open(record.fileUrl, '_blank');
            } finally {
                setIsLoadingFile(false);
            }
        }
        // Option 2: Fallback to tokenized URL
        else if (record.fileUrl) {
            window.open(record.fileUrl, '_blank');
        }
    };

    return (
        <>
            <motion.div layout initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="glass-card-amber p-6 rounded-2xl group border border-amber-500/10 hover:border-amber-500/30 shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/5 p-3 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">{ICONS[record.type] || ICONS.default}</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{capitalize(record.type)}</h3>
                                {record.fileUrl && (
                                    <button
                                        disabled={isLoadingFile}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-300 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition-all text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm"
                                    >
                                        {isLoadingFile ? <span className="animate-spin">⌛</span> : <ExternalLink size={12} />} View
                                    </button>
                                )}
                                {record.digital_copy && (
                                    <button
                                        onClick={() => setShowDigitalModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm"
                                    >
                                        <Eye size={12} /> Digital Copy
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 font-medium">On {formatDate(record.date)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/10 rounded-lg transition"><Edit size={16} /></button>
                        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                </div>
                <div className="mt-4 pl-16 border-t border-white/5 pt-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span><strong className="font-medium text-slate-300">Doctor:</strong> <span className="text-slate-200">{record.doctorName}</span></p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><strong className="font-medium text-slate-300">Facility:</strong> <span className="text-slate-200">{record.hospitalName}</span></p>
                </div>
            </motion.div>

            {/* Helper div for printing - Force light mode text for the print content source */}
            <div id={`markdown-content-${record.id}`} style={{ display: 'none' }}>
                {record.digital_copy && (
                    <div className="prose max-w-none text-black [&_*]:text-black">
                        <ReactMarkdown>{record.digital_copy}</ReactMarkdown>
                    </div>
                )}
            </div>

            <AnimatePresence>
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
