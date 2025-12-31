import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const ScheduleQueueModal = ({ isOpen, onClose }) => {
    const appointments = [
        { id: '1', time: '09:30 AM', patient: 'Sarah Connor', type: 'Follow-up', status: 'Confirmed', urgency: 'Routine' },
        { id: '2', time: '10:15 AM', patient: 'John Smith', type: 'Consultation', status: 'Pending', urgency: 'Urgent' },
        { id: '3', time: '11:00 AM', patient: 'Ellen Ripley', type: 'Lab Review', status: 'Confirmed', urgency: 'Routine' },
        { id: '4', time: '11:45 AM', patient: 'Marty McFly', type: 'Injury Assessment', status: 'In-Queue', urgency: 'Routine' },
        { id: '5', time: '02:00 PM', patient: 'Tony Stark', type: 'Cardiac Check', status: 'Confirmed', urgency: 'STAT' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl h-[85vh] bg-[#050c0a] border border-emerald-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Daily Schedule</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Consultation Queue & Appointments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4 px-6 border-r border-white/10 hidden md:block">
                                    <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest">Today's Date</p>
                                    <p className="text-sm text-white font-bold uppercase">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        {/* Queue Stats Bar */}
                        <div className="px-8 py-4 bg-emerald-500/5 border-b border-white/5 flex gap-8 items-center relative z-10">
                            {[
                                { label: 'Remaining', val: '5', c: 'text-emerald-400' },
                                { label: 'Completed', val: '3', c: 'text-stone-500' },
                                { label: 'Urgent', val: '1', c: 'text-amber-500' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-stone-600">{s.label}:</span>
                                    <span className={`text-lg font-black ${s.c}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Timeline Content */}
                        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {appointments.map((appt, i) => (
                                    <motion.div
                                        key={appt.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group relative flex items-start gap-8"
                                    >
                                        {/* Time Indicator */}
                                        <div className="w-24 pt-2 text-right">
                                            <p className="text-xs font-black text-emerald-500/50 uppercase tracking-widest mb-1">{appt.time}</p>
                                            <div className="h-0.5 w-6 bg-emerald-500/20 ml-auto rounded-full" />
                                        </div>

                                        {/* Appointment Card */}
                                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                                                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${appt.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    appt.status === 'In-Queue' ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {appt.status}
                                                </div>
                                                {appt.urgency === 'STAT' && (
                                                    <div className="flex items-center gap-1.5 text-rose-500 animate-pulse">
                                                        <AlertCircle size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">CRITICAL</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{appt.patient}</h4>
                                                <p className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                                    {appt.type}
                                                    <span className="h-1 w-1 bg-stone-700 rounded-full" />
                                                    15 Minutes
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center gap-4">
                                                <button className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                                    Start Consultation
                                                    <ArrowRight size={14} />
                                                </button>
                                                <button className="px-5 py-3.5 rounded-xl bg-stone-900 border border-white/5 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                                                    Reschedule
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleQueueModal;
