import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, CheckCircle2, FlaskConical, Bell, CalendarClock, ChevronRight } from 'lucide-react';

const ConsultationStatusModal = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('active');
    const [followUpDate, setFollowUpDate] = useState('2024-02-15');

    if (!isOpen) return null;

    const statuses = [
        {
            id: 'active',
            label: 'Active / Ongoing',
            desc: 'Standard consultation SLA',
            icon: Clock,
            color: 'blue'
        },
        {
            id: 'awaiting',
            label: 'Awaiting Results',
            desc: 'Pauses response timer',
            icon: FlaskConical,
            color: 'amber'
        },
        {
            id: 'completed',
            label: 'Completed',
            desc: 'Archives session',
            icon: CheckCircle2,
            color: 'emerald'
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#1c1200] border border-blue-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-7 border-b border-blue-500/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#1c1200] to-[#1c1200] flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                <CalendarClock size={26} className="text-blue-400 drop-shadow-[0_0_5px_rgba(37,99,235,0.5)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-amber-100 to-blue-400 tracking-tight">
                                    Consultation Status
                                </h2>
                                <p className="text-blue-500/80 text-xs font-bold uppercase tracking-[0.2em] mt-1.5">Session Administration</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/10 text-stone-500 hover:text-blue-200 transition-colors relative z-10">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 bg-[linear-gradient(to_bottom,rgba(28,18,0,0.5),rgba(28,18,0,0.9))]">

                        {/* Status Selectors */}
                        <div className="space-y-5">
                            <label className="text-sm font-black text-amber-500 uppercase tracking-widest pl-1 block drop-shadow-sm">Current State</label>
                            <div className="flex flex-col gap-3.5">
                                {statuses.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setStatus(item.id)}
                                        className={`flex items-center gap-4 p-4.5 rounded-xl border transition-all text-left relative overflow-hidden group ${status === item.id
                                                ? `bg-gradient-to-r from-${item.color}-500/10 to-transparent border-${item.color}-500/40 shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                                                : 'bg-[#0f0a05] border-white/5 hover:bg-white/5 hover:border-amber-500/20'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-lg transition-colors duration-300 relative z-10 ${status === item.id
                                                ? `bg-${item.color}-500/20 text-${item.color}-400 shadow-[0_0_10px_rgba(0,0,0,0.2)]`
                                                : 'bg-stone-900/80 text-stone-600 group-hover:text-stone-400'
                                            }`}>
                                            <item.icon size={22} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className={`font-bold text-lg transition-colors tracking-tight ${status === item.id ? 'text-stone-100' : 'text-stone-400 group-hover:text-stone-300'}`}>
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-stone-500/80 mt-1 font-medium tracking-wide">{item.desc}</div>
                                        </div>

                                        {status === item.id && (
                                            <div className="ml-auto relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${item.color}-500 opacity-60`}>Selected</span>
                                                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_8px_currentColor] animate-pulse`} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-r from-${item.color}-500/0 via-${item.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Follow Up */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 space-y-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-2.5 text-stone-300 font-bold text-xs uppercase tracking-widest">
                                    <Calendar size={16} className="text-blue-400" />
                                    Next Check-in
                                </div>
                                <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/10">Automated</div>
                            </div>

                            <div className="relative z-10 group-focus-within:ring-1 group-focus-within:ring-blue-500/30 rounded-lg transition-all">
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full bg-[#0c0a09] border border-stone-800 rounded-xl px-5 py-4 text-stone-200 text-base font-bold focus:outline-none focus:border-blue-500/50 appearance-none shadow-inner tracking-wider"
                                />
                                <CalendarClock size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-2.5 text-xs text-stone-500 font-medium relative z-10">
                                <Bell size={14} className="text-amber-500/60" />
                                Will send "How are you feeling?" prompt at 9:00 AM
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-7 border-t border-white/5 bg-[#140c00] flex justify-end relative z-10">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                        >
                            Update Status <ChevronRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConsultationStatusModal;
