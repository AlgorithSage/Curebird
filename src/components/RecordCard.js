import React, { useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import curebirdLogo from '../curebird_logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Stethoscope, Hospital, Pill, HeartPulse, Trash2, Edit, ExternalLink, Printer, X, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const RecordCard = ({ record, storage, onEdit, onDelete }) => {
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
                                <p style="margin:5px 0 0; color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Curebird Verified Record</p>
                            </div>
                            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <img src="${window.location.origin + curebirdLogo}" alt="Curebird Logo" style="height: 40px; margin-bottom: 5px;" />
                        <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                    </div>
                </div>
                    <div class="content" style="font-size: 14px; color: #000000 !important;">
                         ${document.getElementById(`markdown-content-${record.id}`)?.innerHTML || ''}
                    </div>
                    <div class="footer">
                        <p>Digitized by Curebird on ${new Date().toLocaleDateString()}</p>
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
            className="glass-card p-5 rounded-2xl group border-l-4 border-l-transparent hover:border-l-amber-500">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/5 p-3 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">{ICONS[record.type] || ICONS.default}</div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{capitalize(record.type)}</h3>
                            {record.fileUrl && (
                                <button
                                    onClick={handleViewFile}
                                    disabled={isLoadingFile}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/20 hover:bg-sky-500/20 transition-all text-[10px] uppercase font-black disabled:opacity-50"
                                >
                                    {isLoadingFile ? <span className="animate-spin">⌛</span> : <ExternalLink size={10} />} View
                                </button>
                            )}
                            {record.digital_copy && (
                                <button
                                    onClick={() => setShowDigitalModal(true)}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[10px] uppercase font-black"
                                >
                                    <Eye size={10} /> Digital Copy
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
                        className="bg-[#1c1605] border border-amber-500/20 w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Digital Transcript</h3>
                                    <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-black">AI-Generated Digitization</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
                                >
                                    <Printer size={16} /> Print Copy
                                </button>
                                <button 
                                    onClick={() => setShowDigitalModal(false)}
                                    className="p-2 text-stone-500 hover:text-white rounded-full hover:bg-white/10 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white font-sans" style={{ color: 'black' }}>
                            <div className="max-w-3xl mx-auto">
                                {/* Letterhead */}
                                <div className="border-b-2 border-amber-500 pb-6 mb-8 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 m-0 leading-none">DIGITAL TRANSCRIPT</h1>
                                        <p className="text-amber-600 font-bold text-xs tracking-[0.2em] mt-2 uppercase">Official Medical Record Copy</p>
                                    </div>
                                    <div className="text-right opacity-50">
                                        <div className="flex items-center justify-end gap-2 text-slate-400 font-bold">
                                            <img src={curebirdLogo} alt="Curebird Logo" className="h-8 w-auto opacity-70" />
                                            <span className="text-xl">Curebird</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actual Markdown Content - Forcing Colors */}
                                <div className="prose max-w-none text-black [&_*]:text-black [&_p]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_li]:text-black [&_strong]:text-black [&_td]:text-black [&_th]:text-black">
                                    <ReactMarkdown>
                                        {record.digital_copy}
                                    </ReactMarkdown>
                                </div>

                                {/* Footer */}
                                <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                    <span>Generated by Curebird AI</span>
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
