import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Stethoscope, Hospital, Pill, HeartPulse, Trash2, Edit, ExternalLink } from 'lucide-react';

const RecordCard = ({ record, onEdit, onDelete }) => {
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

    return (
        <motion.div layout initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="glass-card p-5 rounded-2xl group border-l-4 border-l-transparent hover:border-l-amber-500">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/5 p-3 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">{ICONS[record.type] || ICONS.default}</div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{capitalize(record.type)}</h3>
                            {record.fileUrl && (
                                <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/20 hover:bg-sky-500/20 transition-all text-[10px] uppercase font-black">
                                    <ExternalLink size={10} /> View
                                </a>
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
    );
};

export default RecordCard;
