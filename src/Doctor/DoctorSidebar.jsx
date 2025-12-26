import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Calendar, ClipboardList, FileText,
    BarChart2, Bell, Settings, Shield, HelpCircle, LogOut, X,
    Activity, Stethoscope, ChevronDown, List, Clock, CheckCircle,
    AlertCircle, Siren
} from 'lucide-react';
import CurebirdLogo from '../curebird_logo.png';

const SidebarItem = ({ icon: Icon, label, active, onClick, delay, subItems, expanded, onToggleExpand }) => {

    // Parent Item Click
    const handleMainClick = () => {
        if (subItems) {
            onToggleExpand();
        } else {
            onClick();
        }
    };

    return (
        <div className="mb-1">
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay }}
                onClick={handleMainClick}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10 shadow-lg'
                    : (subItems && expanded ? 'bg-white/5 text-slate-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent')
                    }`}
            >
                <div className="flex items-center gap-4">
                    {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full" />
                    )}
                    <Icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="relative z-10 font-medium tracking-wide text-sm">{label}</span>
                </div>

                {/* Chevron or Badge */}
                {subItems ? (
                    <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180 text-emerald-400' : 'text-slate-600'}`} />
                ) : (
                    label === 'Notifications' && (
                        <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">3</span>
                    )
                )}
            </motion.button>

            {/* Sub Items */}
            <AnimatePresence>
                {subItems && expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-10 space-y-1 pt-1 border-l border-white/5 pl-2"
                    >
                        {subItems.map((sub, idx) => (
                            <button
                                key={sub.id}
                                onClick={() => onClick(sub.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${active === sub.id // Check if sub-item ID matches active view (need to pass full ID logic)
                                    ? 'text-emerald-400 bg-emerald-500/5'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${active === sub.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                {sub.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DoctorSidebar = ({ isOpen, onClose, activeView, onNavigate, onLogout }) => {

    // Manage expanded states for groups
    const [expandedGroups, setExpandedGroups] = useState({ appointments: true }); // Default open for demo

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const menuGroups = [
        {
            title: "Overview",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: "Clinical & Patients",
            items: [
                { id: 'patient_workspace', label: 'Patient Workspace', icon: ClipboardList },
                { id: 'messages', label: 'Messages', icon: Siren },
                { id: 'patients', label: 'My Patients', icon: Users },
                // Appointments Group
                {
                    id: 'appointments_group',
                    label: 'Appointments',
                    icon: Calendar,
                    isGroup: true,
                    subItems: [
                        { id: 'appointments_overview', label: 'Overview' },
                        { id: 'appointments_requests', label: 'Requests' },
                        { id: 'appointments_schedule', label: 'Schedule' },
                    ]
                },
                { id: 'consultations', label: 'Consultations', icon: Stethoscope },
                { id: 'medical_records', label: 'Medical Records', icon: FileText },
            ]
        },
        {
            title: "Insights & Tools",
            items: [
                { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                { id: 'notifications', label: 'Notifications', icon: Bell },
            ]
        },
        // ... Account group same as before
        {
            title: "Account",
            items: [
                { id: 'profile', label: 'Profile & Settings', icon: Settings },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'help', label: 'Help & Support', icon: HelpCircle },
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                    />

                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-white/10 z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 p-2 flex items-center justify-center shadow-inner border border-white/5">
                                    <img src={CurebirdLogo} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg tracking-tight">Curebird</h2>
                                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Doctor Portal</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {menuGroups.map((group, idx) => (
                                <div key={idx}>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">{group.title}</h3>
                                    <div className="space-y-1">
                                        {group.items.map((item, itemIdx) => (
                                            <SidebarItem
                                                key={item.id}
                                                icon={item.icon}
                                                label={item.label}
                                                active={activeView === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeView))}
                                                // If subItem is clicked, calling default nav; if group is clicked, handled in item
                                                onClick={(subId) => {
                                                    // subId is present if clicked a sub-item
                                                    if (subId) {
                                                        onNavigate(subId);
                                                        onClose();
                                                    } else if (!item.subItems) {
                                                        onNavigate(item.id);
                                                        onClose();
                                                    }
                                                }}
                                                delay={(idx * 0.1) + (itemIdx * 0.05)}
                                                subItems={item.subItems}
                                                expanded={expandedGroups[item.id]} // Using item.id correctly
                                                onToggleExpand={() => toggleGroup(item.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/30">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-medium"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default DoctorSidebar;
