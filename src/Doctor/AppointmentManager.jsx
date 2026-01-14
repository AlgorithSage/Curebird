import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, User, CheckCircle, XCircle, MoreVertical,
    Video, Phone, MessageSquare, MapPin, Filter, Plus, ChevronLeft,
    ChevronRight, AlertCircle
 } from '../components/Icons';
import NewSlotModal from './NewSlotModal';

// --- Sub-Components ---

const AppointmentCard = ({ appt, type, onAction }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 rounded-[1.5rem] border border-white/5 bg-[#0c0a05] hover:bg-[#14120a] transition-all group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 ${type === 'upcoming' ? 'bg-amber-500 text-black shadow-amber-500/20' :
                    type === 'request' ? 'bg-slate-800 text-slate-400' :
                        'bg-slate-900 text-slate-600'
                    }`}>
                    {appt.patientName.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors tracking-tight">{appt.patientName}</h4>
                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                        <Video size={12} className={type === 'upcoming' ? 'text-amber-500' : 'text-stone-600'} />
                        Topic: {appt.reason}
                    </p>
                </div>
            </div>
            {/* Status Pill or Time */}
            <div className="text-right">
                <p className="text-base font-black text-white tracking-wide">{appt.time}</p>
                <p className="text-[10px] text-amber-500/50 uppercase font-black tracking-widest">{appt.date}</p>
            </div>
        </div>

        {/* Actions Area */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
            {type === 'upcoming' && (
                <button
                    onClick={() => onAction('enter_room', appt)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
                >
                    <Video size={16} strokeWidth={2.5} />
                    <span>Enter Telehealth Room</span>
                </button>
            )}
            {type === 'request' && (
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => onAction('decline', appt)}
                        className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-rose-950/30 text-stone-500 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5 hover:border-rose-500/20"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => onAction('approve', appt)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all border border-amber-500/20 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20"
                    >
                        Approve
                    </button>
                </div>
            )}
        </div>
    </motion.div>
);

const ScheduleSlot = ({ time, status, patient }) => (
    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group ${status === 'booked' ? 'bg-amber-500/5 border-amber-500/20' :
        status === 'blocked' ? 'bg-stone-900/50 border-stone-800 border-dashed opacity-40' :
            'bg-stone-900/40 border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5'
        }`}>
        <div className="flex flex-col">
            <span className={`text-sm font-mono font-bold ${status === 'booked' ? 'text-amber-500' : 'text-stone-400 group-hover:text-amber-200'}`}>{time}</span>
            {status === 'booked' && patient && (
                <span className="text-[10px] text-stone-500 font-medium truncate w-24" title={patient}>
                    {patient}
                </span>
            )}
        </div>

        {status === 'booked' ? (
            <span className="text-[10px] text-black bg-amber-500 px-3 py-1 rounded-lg font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">Reserved</span>
        ) : status === 'blocked' ? (
            <span className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">Unavail</span>
        ) : (
            <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1"><Plus size={12} /> Open</span>
        )}
    </div>
);

// --- Main Manager Component ---

// --- Main Manager Component ---


const AppointmentManager = ({ view = 'overview', onNavigate, patients = [] }) => {
    // view prop comes from sidebar: 'overview', 'requests', 'schedule'

    // Interactive State (Mapped from Live Patients)
    // Interactive State (Mapped from Live Patients)
    const baseUpcomingAppts = React.useMemo(() => {
        // Take first 3 patients for "Today's Queue"
        return patients.slice(0, 3).map((p, i) => ({
            id: p.id,
            patientName: p.name,
            time: `${10 + i}:30 ${i < 2 ? 'AM' : 'PM'}`,
            date: "Today",
            reason: p.condition || "Follow-up",
            type: "video"
        }));
    }, [patients]);

    // Use state for requests so they can be "approved/declined" locally for the demo
    const [requests, setRequests] = useState([]);
    const [approvedAppts, setApprovedAppts] = useState([]); // Store locally approved requests

    const upcomingAppts = [...baseUpcomingAppts, ...approvedAppts];

    React.useEffect(() => {
        // Take next 2 patients for "Requests"
        if (patients.length > 3) {
            const reqs = patients.slice(3, 5).map((p, i) => ({
                id: p.id,
                patientName: p.name,
                time: `${9 + i}:00 AM`,
                date: "Tomorrow",
                reason: p.condition || "General Consult",
                type: "video"
            }));
            setRequests(reqs);
        }
    }, [patients]);

    const [extraSlots, setExtraSlots] = useState([]);

    // Scheduler State (Dynamic)
    const slots = React.useMemo(() => {
        // Define standard daily slots
        const baseTimes = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
            '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
        ];

        // Combine base times with any extra manually added slots
        const allTimes = [...baseTimes, ...extraSlots.map(s => s.time)];

        // Remove duplicates and sort (simple sort for strings works okay for HH:MM AM/PM for this demo, or we can just append)
        // For simplicity, we just append extra slots at the end or keep logic simple.

        return allTimes.map(time => {
            // Check if this time matches any upcoming appointment
            const bookedAppt = upcomingAppts.find(appt => appt.time === time);

            if (bookedAppt) {
                return {
                    time,
                    status: 'booked',
                    patient: bookedAppt.patientName,
                    id: bookedAppt.id
                };
            }

            // Check if it's an extra slot (default to available)
            const isExtra = extraSlots.find(s => s.time === time);
            if (isExtra) return { time, status: 'available' };

            // Mock some blocked slots for realism (e.g. Lunch)
            if (time === '12:00 PM' || time === '12:30 PM') {
                return { time, status: 'blocked' };
            }

            return { time, status: 'available' };
        });
    }, [upcomingAppts, extraSlots]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handlers
    const handleAction = (action, appt) => {
        if (action === 'enter_room') {
            if (onNavigate) {
                onNavigate('consultations');
            } else {
                console.warn('Navigation handler missing for Telehealth Room');
            }
        }
        else if (action === 'approve') {
            // Move from requests to upcoming
            setRequests(prev => prev.filter(r => r.id !== appt.id));
            setApprovedAppts(prev => [...prev, { ...appt, type: 'video', date: 'Today' }]); // Simplified for demo
        }
        else if (action === 'decline') {
            // Remove from requests
            setRequests(prev => prev.filter(r => r.id !== appt.id));
        }
    };

    const handleAddSlot = (timeString) => {
        setExtraSlots(prev => [...prev, { time: timeString }]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8">

            {/* Context Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                            <Video className="text-amber-500" size={24} />
                        </div>
                        Telehealth Scheduler
                    </h2>
                    <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 ml-1">
                        {view === 'overview' && "Live Queue & Daily Briefing"}
                        {view === 'requests' && "Pending Video Consultations"}
                        {view === 'schedule' && "Manage Digital Availability"}
                    </p>
                </div>
                {view === 'schedule' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                    >
                        <Plus size={16} /> New Slot
                    </button>
                )}
            </div>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
                {view === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Left: Today's Agenda */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass-card p-8 rounded-[2rem] bg-[#080705] border border-white/5 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-lg">
                                    <Clock size={20} className="text-amber-400" /> Today's Video Queue
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    <AnimatePresence>
                                        {upcomingAppts.map(appt => (
                                            <AppointmentCard key={appt.id} appt={appt} type="upcoming" onAction={handleAction} />
                                        ))}
                                    </AnimatePresence>
                                    {upcomingAppts.length === 0 && <p className="text-stone-600 text-sm font-medium italic">No video sessions scheduled for today.</p>}
                                </div>
                            </div>

                            {/* Stats Mockup */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 rounded-[2rem] bg-stone-900/40 border border-white/5 text-center group hover:bg-stone-900/60 transition-colors">
                                    <h4 className="text-3xl font-black text-white group-hover:text-amber-500 transition-colors">8</h4>
                                    <p className="text-[10px] text-stone-500 uppercase font-black tracking-[0.2em] mt-2">Completed</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-stone-900/40 border border-white/5 text-center group hover:bg-stone-900/60 transition-colors">
                                    <h4 className="text-3xl font-black text-amber-400">{requests.length}</h4>
                                    <p className="text-[10px] text-stone-500 uppercase font-black tracking-[0.2em] mt-2">Pending</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-stone-900/40 border border-white/5 text-center group hover:bg-stone-900/60 transition-colors">
                                    <h4 className="text-3xl font-black text-rose-500">1</h4>
                                    <p className="text-[10px] text-stone-500 uppercase font-black tracking-[0.2em] mt-2">Missed</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Requests Preview */}
                        <div className="glass-card p-8 rounded-[2rem] bg-[#0c0a05] border border-white/5 h-fit relative">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <AlertCircle size={20} className="text-amber-500" /> New Requests
                                </h3>
                                <button
                                    onClick={() => onNavigate && onNavigate('appointments_requests')}
                                    className="text-[10px] text-amber-500 hover:text-amber-300 font-black uppercase tracking-widest"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {requests.slice(0, 2).map(req => (
                                        <AppointmentCard key={req.id} appt={req} type="request" onAction={handleAction} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'requests' && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {requests.map(req => (
                                <AppointmentCard key={req.id} appt={req} type="request" onAction={handleAction} />
                            ))}
                        </AnimatePresence>
                        {requests.length === 0 && (
                            <div className="col-span-full py-20 text-center text-stone-500">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest">No pending requests</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {view === 'schedule' && (
                    <motion.div
                        key="schedule"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8 rounded-[2.5rem] bg-[#080705] border border-white/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        {/* Calendar Week Strip */}
                        <div className="flex justify-between items-center mb-8 overflow-x-auto pb-4 relative z-10 no-scrollbar gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                <button key={day} className={`flex flex-col items-center justify-center min-w-[4.5rem] h-24 rounded-2xl border transition-all ${i === 2 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 border-amber-400 scale-110' : 'bg-stone-900/50 text-stone-500 border-white/5 hover:border-amber-500/30 hover:text-white'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-wider mb-1">{day}</span>
                                    <span className="text-2xl font-black">{24 + i}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mb-6 transition-all">
                            {slots.map((s, i) => (
                                <ScheduleSlot key={i} time={s.time} status={s.status} patient={s.patient} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <NewSlotModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={handleAddSlot}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AppointmentManager;
