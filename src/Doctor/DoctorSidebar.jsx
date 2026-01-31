import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, Calendar, ClipboardList, FileText,
    BarChart2, Bell, Settings, Shield, HelpCircle, LogOut, X,
    Stethoscope, ChevronDown, Siren, Check, Video
 } from '../components/Icons';
import CureBirdLogo from '../curebird_logo.png';

const SidebarItem = ({ icon: Icon, label, active, onClick, delay, subItems, expanded, onToggleExpand, badge }) => {

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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                    ? 'bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-400/30 text-yellow-100 shadow-[0_4px_20px_rgba(16,185,129,0.15)] backdrop-blur-md animated-border animated-border-hybrid'
                    : (subItems && expanded ? 'bg-emerald-500/5 text-amber-100 border border-transparent' : 'text-slate-400 hover:bg-emerald-500/5 hover:text-yellow-200 hover:border-amber-400/20 hover:backdrop-blur-sm border border-transparent')
                    }`}
            >
                {/* Active Gloss (Top Highlight - Warm Amber/Green) */}
                {active && (
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
                )}

                {/* Active Glow Bar (Amber for contrast) */}
                {active && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-[0_0_12px_#f59e0b]" />
                )}

                <div className="flex items-center gap-4">
                    <Icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-500 group-hover:text-yellow-400'}`} />
                    <span className="relative z-10 font-medium tracking-wide text-sm">{label}</span>
                </div>

                {/* Chevron or Badge */}
                {subItems ? (
                    <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180 text-amber-400' : 'text-slate-600 group-hover:text-amber-400'}`} />
                ) : (
                    badge > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-rose-900/50">{badge}</span>
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
                        className="overflow-hidden ml-10 space-y-1 pt-1 border-l border-amber-500/20 pl-2"
                    >
                        {subItems.map((sub, idx) => (
                            <button
                                key={sub.id}
                                onClick={() => onClick(sub.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${active === sub.id // Check if sub-item ID matches active view (need to pass full ID logic)
                                    ? 'text-yellow-300 bg-yellow-500/10 backdrop-blur-sm border-yellow-500/20'
                                    : 'text-slate-500 hover:text-yellow-200 hover:bg-yellow-500/5 border-transparent'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${active === sub.id ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-700 group-hover:bg-amber-500/50'}`} />
                                {sub.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DoctorSidebar = ({ isOpen, onClose, activeView, onNavigate, onLogout, unreadCount, user }) => {

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
                { id: 'telehealth', label: 'Telehealth', icon: Video },
                { id: 'medical_records', label: 'Medical Records', icon: FileText },
            ]
        },
        {
            title: "Insights & Tools",
            items: [
                { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        // EMERALD GLASS WITH AMBER BORDERS
                        // Reverted to the 30% opacity Green glass
                        // HYBRID THEME: Gold Borders, Deep Emerald Shadow/Depth with High Opacity to prevent overlap clutter
                        className="fixed top-0 left-0 bottom-0 w-72 bg-slate-950 border-r border-amber-400/30 z-[100] shadow-[20px_0_60px_rgba(16,185,129,0.1)] flex flex-col"
                    >
                        {/* Header with Warm Amber Hue */}
                        {/* Header: Tab-Style UX */}
                        <div className="px-5 pt-6 pb-2 shrink-0 relative z-20 mb-6">
                            <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.1)] flex items-center justify-between group overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]">

                                {/* Lively Amber Glow */}
                                <div className="absolute top-1/2 left-8 w-16 h-16 bg-amber-500/30 blur-[40px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

                                <div className="flex items-center gap-4 relative z-10 w-full">
                                    {/* Logo */}
                                    <div className="w-10 h-10 flex items-center justify-center relative shrink-0">
                                        <div className="absolute inset-0 bg-amber-400 blur-md rounded-full opacity-25"></div>
                                        <img src={CureBirdLogo} alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                                    </div>

                                    {/* Text Identity - Uncluttered */}
                                    <div className="flex flex-col justify-center min-w-0">
                                        <h2 className="text-xl font-black text-white tracking-tight leading-none drop-shadow-md truncate">CureBird</h2>
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] leading-none mt-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] truncate">Doctor Portal</p>
                                    </div>
                                </div>

                            </div>
                            {/* Visual Divider to prevent clash with menu */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mt-6"></div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-8">
                            {menuGroups.map((group, idx) => (
                                <div key={idx}>
                                    <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 uppercase tracking-[0.2em] mb-4 pl-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">{group.title}</h3>
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
                                                badge={item.badge}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Doctor ID & Footer */}
                        <div className="p-4 border-t border-yellow-500/10 bg-amber-950/10 backdrop-blur-md space-y-3">


                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-medium hover:backdrop-blur-sm"
                            >
                                <LogOut size={20} />
                                <span className="text-rose-100/80">Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default DoctorSidebar;
