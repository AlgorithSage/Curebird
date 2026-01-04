import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCircle2, AlertTriangle, FileText,
    MessageSquare, Activity,
    BrainCircuit, ArrowUpRight, Plus
} from 'lucide-react';

const NOTIFICATION_CATEGORIES = [
    { id: 'all', label: 'All Alerts', icon: Bell },
    { id: 'urgent', label: 'Priority & Critical', icon: AlertTriangle, color: 'text-rose-500' },
    { id: 'messages', label: 'Patient Messages', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'results', label: 'Lab Results', icon: FileText, color: 'text-amber-400' },
    { id: 'ai', label: 'AI Insights', icon: BrainCircuit, color: 'text-purple-400' },
    { id: 'system', label: 'System', icon: Activity, color: 'text-slate-400' }
];

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'urgent',
        title: 'Critical Vitals Alert - Sarah Jenkins',
        message: 'Patient detected with irregular heart rhythm (Arrhythmia) exceeding threshold.',
        time: '10 mins ago',
        read: false,
        action: 'Review Vitals',
        target: 'patient_workspace',
        patientData: { id: 'P-101', name: 'Sarah Jenkins', condition: 'Arrhythmia', age: 45, gender: 'Female' }
    },
    {
        id: 2,
        type: 'ai',
        title: 'Drug Interaction Warning',
        message: 'Potential interaction detected between prescribed Amoxicillin and recent Lisinopril refill.',
        time: '35 mins ago',
        read: false,
        action: 'Review Prescription',
        target: 'medical_records',
        patientData: { id: 'P-102', name: 'James Wilson', condition: 'Hypertension', age: 52, gender: 'Male' }
    },
    {
        id: 3,
        type: 'messages',
        title: 'New Message from James Wilson',
        message: 'Dr. Smith, I am feeling slight dizziness after the new medication.',
        time: '1 hour ago',
        read: true,
        action: 'Reply',
        target: 'messages',
        patientData: { id: 'P-102', name: 'James Wilson', condition: 'Hypertension', age: 52, gender: 'Male' }
    },
    {
        id: 4,
        type: 'results',
        title: 'Lab Results Ready - Blood Panel',
        message: 'Comprehensive Metabolic Panel results are available for review.',
        time: '2 hours ago',
        read: false,
        action: 'View Report',
        target: 'medical_records'
    },
    {
        id: 5,
        type: 'urgent',
        title: 'Appointment Cancellation',
        message: 'Michael Brown cancelled the 3:00 PM consultation.',
        time: '3 hours ago',
        read: true,
        action: 'View Schedule',
        target: 'appointments_schedule'
    },
    {
        id: 6,
        type: 'system',
        title: 'System Maintenance Scheduled',
        message: 'Routine maintenance is scheduled for Sunday at 2:00 AM EST.',
        time: '5 hours ago',
        read: true,
        action: 'Details',
        target: 'dashboard'
    }
];

export default function DoctorNotifications({ onNavigate, onNavigateToPatient }) {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'all' || n.type === activeTab;
        return matchesTab;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleReadToggle = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: !n.read } : n
        ));
    };

    const handleActionClick = (notification) => {
        console.log("Action Clicked:", notification.action, notification.target);
        if (notification.target === 'patient_workspace' && notification.patientData && onNavigateToPatient) {
            onNavigateToPatient(notification.patientData);
        } else if (onNavigate) {
            onNavigate(notification.target || 'dashboard');
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Bell className="text-amber-500" size={28} />
                        </div>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-sm bg-rose-500 text-white px-3 py-1 rounded-full font-bold animate-pulse shadow-lg shadow-rose-500/20">
                                {unreadCount} New
                            </span>
                        )}
                    </h2>
                    <p className="text-stone-400 text-sm mt-2 ml-1">Stay updated with critical patient alerts and system messages.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 text-sm">
                        <Plus size={18} /> Add Record
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/50 rounded-xl text-stone-300 hover:text-amber-500 transition-all duration-300 text-sm font-medium active:scale-95 group"
                    >
                        <CheckCircle2 size={16} className="group-hover:text-amber-500 transition-colors" /> Mark all read
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                {NOTIFICATION_CATEGORIES.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap border
                                ${isActive
                                    ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                                    : 'bg-amber-500/5 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                }
                            `}
                        >
                            <Icon size={18} className={isActive ? 'text-black' : 'text-amber-500'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ALERTS LIST */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                                    relative p-4 rounded-[2rem] transition-all duration-300 group animated-border
                                    ${notification.read
                                        ? 'bg-[#0c0a09]/80 opacity-75 grayscale-[0.3]'
                                        : 'bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)]'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    {/* ICON */}
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                                        ${notification.type === 'urgent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                            notification.type === 'ai' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                notification.type === 'results' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    'bg-slate-700/30 border-slate-600/30 text-slate-400'}
                                    `}>
                                        {notification.type === 'urgent' && <AlertTriangle size={24} />}
                                        {notification.type === 'ai' && <BrainCircuit size={24} />}
                                        {notification.type === 'messages' && <MessageSquare size={24} />}
                                        {notification.type === 'results' && <FileText size={24} />}
                                        {notification.type === 'system' && <Activity size={24} />}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`font-bold text-lg truncate pr-4 ${notification.read ? 'text-amber-500/50' : 'text-white'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs font-mono text-amber-500/60 whitespace-nowrap">{notification.time}</span>
                                        </div>
                                        <p className="text-base text-amber-100/70 mt-2 leading-relaxed line-clamp-2 font-medium">
                                            {notification.message}
                                        </p>

                                        {/* ACTION FOOTER */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 opacity-90 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActionClick(notification);
                                                }}
                                                className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider"
                                            >
                                                {notification.action} <ArrowUpRight size={14} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent parent click
                                                    handleReadToggle(notification.id);
                                                }}
                                                className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                                            >
                                                {notification.read ? 'Mark as Unread' : 'Mark as Read'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* UNREAD INDICATOR */}
                                    {!notification.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-600">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-slate-400 font-medium">No alerts found</h3>
                            <p className="text-slate-500 text-sm mt-1">You are all caught up!</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
