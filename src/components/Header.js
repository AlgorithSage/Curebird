import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, Share2, Bell, LogIn, LogOut, Settings, Menu,
    LayoutDashboard, Bot, Activity, Mail, MessageSquare,
    Users, Calendar, ClipboardList, FileText, BarChart2,
    Shield, HelpCircle, Stethoscope, Siren, Microscope
 } from './Icons';
import { AnimatePresence, motion } from 'framer-motion';
import CureBirdLogo from '../curebird_logo.png';

const UserProfile = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Effect to close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 group">
                <div className="relative">
                    <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-amber-400 transition-colors shadow-lg"
                        referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute right-0 mt-3 w-64 glass rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-white/10 mb-2">
                            <p className="font-bold text-white truncate">
                                {user.role === 'doctor' ? `Dr. ${user.name || user.displayName}` : (user.displayName || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Anonymous User'))}
                            </p>
                            <p className="text-xs text-slate-300 truncate">
                                {user.role === 'doctor' && user.degree
                                    ? `${user.specialization || 'Doctor'} • ${user.degree}`
                                    : user.email}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <button onClick={() => {
                                setIsOpen(false);
                                if (user.role === 'doctor') {
                                    onNavigate && onNavigate('profile');
                                } else {
                                    onNavigate && onNavigate('Settings');
                                }
                            }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium">
                                <Settings size={16} />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 text-rose-300 hover:bg-rose-500/20 rounded-xl transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

};

// Notification Dropdown Component
const NotificationDropdown = ({ alerts, onClose }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-3 w-80 glass rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10 shadow-2xl">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Bell size={16} className="text-amber-400" /> Notifications
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.length > 0 ? (
                    alerts.map((alert, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-700/50 border-white/5'}`}>
                            <div className={`text-xs font-bold uppercase mb-1 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                                {alert.title}
                            </div>
                            <div className="text-sm text-slate-200">{alert.message}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">No new notifications</div>
                )}
            </div>
        </div>
    );
};

// This Header component is now fully responsive
const Header = ({ title, description, user, onAddClick, onShareClick, onLoginClick, onLogout, onToggleSidebar, onNavigate, onNotificationClick, alerts = [], navItems: propNavItems = [] }) => {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = (e) => {
            const scrollTop = e.target.scrollTop || window.scrollY;
            setIsScrolled(scrollTop > 10);
        };

        window.addEventListener('scroll', onScroll, true); // Capture phase is key here
        return () => window.removeEventListener('scroll', onScroll, true);
    }, []);

    // Default Navigation Items (Patient Portal Defaults)
    const defaultNavItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Cure Analyzer', icon: <Microscope size={20} /> },
        { name: 'Cure Stat', icon: <BarChart2 size={20} /> },
        { name: 'Cure AI', icon: <Bot size={20} /> },
        { name: 'Settings', icon: <Settings size={20} /> },
        { name: 'Contact', icon: <Mail size={20} /> }
    ];

    const navItems = propNavItems.length > 0 ? propNavItems : defaultNavItems;


    const HeaderText = () => (
        <div className="text-center xl:text-left">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="inline">
                    <span className="text-white">Welcome {user?.firstName || 'User'} | </span>
                    <span className="text-white">Cure</span><span className="text-amber-200">Bird</span>
                    <span className="text-white"> is at your service!</span>
                </span>
            </h1>
            <div className="flex items-center justify-center xl:justify-start gap-2 text-slate-400 text-xs sm:text-sm font-medium">
                <span className="text-amber-500/90 uppercase tracking-wider font-bold truncate">{title}</span>
                <span className="hidden md:inline truncate max-w-xl text-slate-400/80">{description}</span>
            </div>
        </div>
    );

    return (

        <>
            <header className="z-50 rounded-full bg-slate-900/40 backdrop-blur-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)] flex flex-nowrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4 transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] group relative">
                {/* Subtle sheen reflection for metallic/glass rim effect */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none"></div>
                <div className="absolute -inset-[1px] rounded-full border border-amber-500/10 opacity-50 blur-[1px] pointer-events-none"></div>

                {/* Left Group: Menu, Logo, Nav - Always First */}
                <div className="flex items-center gap-2 sm:gap-4 order-1 min-w-0">
                    {/* Mobile Hamburger Menu Button */}
                    <motion.button
                        onClick={onToggleSidebar}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-lg shadow-black/20 shrink-0"
                    >
                        <Menu size={20} className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                    </motion.button>

                    <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/40 p-1.5 flex items-center justify-center transition-transform duration-500 hover:scale-105 shrink-0">
                        <img
                            src={CureBirdLogo}
                            alt="Logo"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-[pulse_3s_ease-in-out_infinite] hover:drop-shadow-[0_0_20px_rgba(245,158,11,1)] transition-all duration-300"
                        />
                    </div>

                    {/* Quick Navigation Chain */}
                    <div className='bg-slate-900/50 p-1 rounded-full border border-white/5 backdrop-blur-sm shadow-inner block min-w-0'>
                        <div className='flex items-center gap-1 overflow-x-auto max-w-[30vw] sm:max-w-none [scrollbar-width:none]'>
                            {navItems.map((item, i) => {
                                const isActive = title === item.name;
                                return (
                                    <motion.button
                                        key={item.name}
                                        onClick={() => onNavigate && onNavigate(item.id || item.name)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={isActive ? {
                                            scale: 1.1,
                                            backgroundColor: "rgba(245, 158, 11, 0.1)"
                                        } : {
                                            scale: 1,
                                            backgroundColor: "rgba(0,0,0,0)"
                                        }}
                                        className={`p-1.5 rounded-full relative z-10 shrink-0 ${isActive
                                            ? 'text-amber-400'
                                            : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                        title={item.name}
                                    >
                                        {React.cloneElement(item.icon, {
                                            size: 18,
                                            className: isActive ? "text-amber-400 w-[18px] h-[18px]" : "currentColor w-[18px] h-[18px]"
                                        })}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Center Text: Visible ONLY on Large Screens (XL+) inside Header */}
                <div className="hidden xl:flex flex-1 justify-center px-4 xl:order-2">
                    <HeaderText />
                </div>

                {/* Right Group: Actions - Order 2 on small/zoom, Order 3 on wide */}
                <div className="flex items-center gap-2 sm:gap-3 order-2 xl:order-3 ml-auto shrink-0">
                    {user && onAddClick && (
                        <>
                            {/* Hidden on very small screens if needed, or keep for access */}
                            <button onClick={onShareClick} className="hidden sm:block p-2 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white">
                                <Share2 size={18} />
                            </button>
                            <div className="relative relative-notif-container">
                                <button onClick={() => onNotificationClick ? onNotificationClick() : setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white relative">
                                    <Bell size={18} />
                                    {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                                </button>
                                <AnimatePresence>
                                    {isNotifOpen && <NotificationDropdown alerts={alerts} onClose={() => setIsNotifOpen(false)} />}
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={onAddClick}
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-bold border border-white/10 whitespace-nowrap"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Add Record</span>
                            </button>
                        </>
                    )}

                    {user ? (
                        <UserProfile user={user} onLogout={onLogout} onNavigate={onNavigate} />
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-lg transition-all text-sm font-bold"
                        >
                            <LogIn size={18} />
                            <span className="hidden sm:inline">Login</span>
                        </button>
                    )}
                </div>

            </header>

            {/* Mobile/Zoomed Text: Visible OUTSIDE Header on Smaller Screens (< XL) */}
            <AnimatePresence>
                {!isScrolled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24, marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="xl:hidden w-full px-4 flex justify-center overflow-hidden"
                    >
                        <HeaderText />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Header;
