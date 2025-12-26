import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, User, CheckCircle, XCircle, MoreVertical,
    Video, Phone, MessageSquare, MapPin, Filter, Plus, ChevronLeft,
    ChevronRight, AlertCircle
} from 'lucide-react';

// --- Sub-Components ---

const AppointmentCard = ({ appt, type }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/60 transition-all group"
    >
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${type === 'upcoming' ? 'bg-sky-500/20 text-sky-400' :
                        type === 'request' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-700 text-slate-400'
                    }`}>
                    {appt.patientName.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{appt.patientName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        {appt.type === 'video' ? <Video size={12} /> : <MapPin size={12} />}
                        {appt.reason}
                    </p>
                </div>
            </div>
            {/* Status Pill or Time */}
            <div className="text-right">
                <p className="text-sm font-bold text-white tracking-wide">{appt.time}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{appt.date}</p>
            </div>
        </div>

        {/* Actions Area */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            {type === 'upcoming' && (
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                    <Video size={14} /> Join Call
                </button>
            )}
            {type === 'request' && (
                <div className="flex gap-2 w-full">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors">
                        Reject
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-colors border border-emerald-500/20 hover:border-emerald-500">
                        Accept
                    </button>
                </div>
            )}
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors ml-auto">
                <MoreVertical size={16} />
            </button>
        </div>
    </motion.div>
);

const ScheduleSlot = ({ time, status }) => (
    <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${status === 'booked' ? 'bg-emerald-500/10 border-emerald-500/20' :
            status === 'blocked' ? 'bg-slate-800/50 border-slate-700 dashed-border opacity-50' :
                'bg-slate-900/50 border-white/5 hover:border-white/10'
        }`}>
        <span className={`text-sm font-mono font-bold ${status === 'booked' ? 'text-emerald-400' : 'text-slate-400'}`}>{time}</span>
        {status === 'booked' ? (
            <span className="text-xs text-white bg-emerald-500/20 px-2 py-0.5 rounded font-bold">John Doe</span>
        ) : status === 'blocked' ? (
            <span className="text-xs text-slate-600">Blocked</span>
        ) : (
            <span className="text-xs text-slate-500 flex items-center gap-1"><Plus size={12} /> Available</span>
        )}
    </div>
);

// --- Main Manager Component ---

const AppointmentManager = ({ view = 'overview' }) => {
    // view prop comes from sidebar: 'overview', 'requests', 'schedule'

    // Mock Data
    const upcomingAppts = [
        { id: 1, patientName: "Sarah Connor", time: "10:30 AM", date: "Today", reason: "Follow-up", type: "video" },
        { id: 2, patientName: "Kyle Reese", time: "02:00 PM", date: "Today", reason: "Consultation", type: "in-person" },
    ];

    const requests = [
        { id: 3, patientName: "Marty McFly", time: "11:00 AM", date: "Tomorrow", reason: "New Symptom", type: "video" },
        { id: 4, patientName: "Emmett Brown", time: "04:30 PM", date: "Fri, 27 Oct", reason: "Lab Review", type: "video" },
    ];

    return (
        <div className="space-y-6">

            {/* Context Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <Calendar className="text-orange-400" size={20} />
                        </div>
                        Appointment Center
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {view === 'overview' && "Daily snapshot and upcoming events."}
                        {view === 'requests' && "Manage pending appointment requests."}
                        {view === 'schedule' && "Configure availability and time slots."}
                    </p>
                </div>
                {view === 'schedule' && (
                    <button className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <Plus size={16} /> Add Slot
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
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Left: Today's Agenda */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-emerald-400" /> Today's Agenda
                                </h3>
                                <div className="space-y-3">
                                    {upcomingAppts.map(appt => (
                                        <AppointmentCard key={appt.id} appt={appt} type="upcoming" />
                                    ))}
                                    {upcomingAppts.length === 0 && <p className="text-slate-500 text-sm">No appointments scheduled for today.</p>}
                                </div>
                            </div>

                            {/* Stats Mockup */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
                                    <h4 className="text-2xl font-bold text-white">8</h4>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Served</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
                                    <h4 className="text-2xl font-bold text-amebr-400">3</h4>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Pending</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
                                    <h4 className="text-2xl font-bold text-rose-400">1</h4>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">No-Show</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Requests Preview */}
                        <div className="glass-card p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5 h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-400" /> Requests
                                </h3>
                                <button className="text-xs text-emerald-400 hover:text-emerald-300 font-bold">View All</button>
                            </div>
                            <div className="space-y-3">
                                {requests.slice(0, 2).map(req => (
                                    <AppointmentCard key={req.id} appt={req} type="request" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'requests' && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {requests.map(req => (
                            <AppointmentCard key={req.id} appt={req} type="request" />
                        ))}
                        {requests.map(req => ( // duplicate mock to fill
                            <AppointmentCard key={req.id + 99} appt={{ ...req, id: req.id + 99 }} type="request" />
                        ))}
                    </motion.div>
                )}

                {view === 'schedule' && (
                    <motion.div
                        key="schedule"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5"
                    >
                        {/* Calendar Week Strip */}
                        <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                <button key={day} className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all ${i === 2 ? 'bg-emerald-500 text-white shadow-lg border-emerald-400' : 'bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/10'}`}>
                                    <span className="text-xs font-bold uppercase">{day}</span>
                                    <span className="text-xl font-bold">{24 + i}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'].map(t => <ScheduleSlot key={t} time={t} status="booked" />)}
                            {['11:00 AM', '11:30 AM'].map(t => <ScheduleSlot key={t} time={t} status="available" />)}
                            {['12:00 PM', '12:30 PM'].map(t => <ScheduleSlot key={t} time={t} status="blocked" />)}
                            {['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'].map(t => <ScheduleSlot key={t} time={t} status="available" />)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AppointmentManager;
