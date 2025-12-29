import React, { useState, useEffect, useRef } from 'react';
import { Plus, Share2, Bell, LogIn, LogOut, Settings, Menu, LayoutDashboard, FileText, Calendar, Pill, HeartPulse, Bot, Activity, Mail, ScrollText, Shield, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CurebirdLogo from '../curebird_logo.png';

const UserProfile = ({ user, onLogout }) => {
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
                            <button onClick={() => setIsOpen(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium">
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

// This Header component is now fully responsive
const Header = ({ title, description, user, onAddClick, onShareClick, onLoginClick, onLogout, onToggleSidebar, onNavigate, onNotificationClick }) => {

    // Quick Navigation Items
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Cure Analyzer', icon: <Bot size={20} /> },
        { name: 'Cure Stat', icon: <Activity size={20} /> },
        { name: 'Cure AI', icon: <MessageSquare size={20} /> },
        { name: 'Settings', icon: <Settings size={20} /> },
        { name: 'Contact', icon: <Mail size={20} /> }
    ];

    const getPageIcon = (pageTitle) => {
        // Fallback for pages not in the navItems list
        switch (pageTitle) {
            case 'All Records': return <FileText size={20} />;
            case 'Appointments': return <Calendar size={20} />;
            case 'Medications': return <Pill size={20} />;
            case 'Settings': return <Settings size={20} />;
            case 'Contact': return <Mail size={20} />;
            case 'Terms': return <ScrollText size={20} />;
            case 'Privacy': return <Shield size={20} />;
            default: return <HeartPulse size={20} />;
        }
    };

    return (
        <header className="flex flex-wrap items-center gap-y-4 gap-x-2 sm:gap-4 pb-6 border-b border-white/10 relative z-20">

            {/* Left Group: Menu, Logo, Nav */}
            <div className="flex items-center gap-1 sm:gap-4 order-1">
                {/* Mobile Hamburger Menu Button */}
                <motion.button
                    onClick={onToggleSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        borderColor: ["rgba(255,255,255,0.1)", "rgba(245,158,11,0.4)", "rgba(255,255,255,0.1)"],
                        backgroundColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0)"],
                        boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(245,158,11,0.2)", "0 0 0px rgba(0,0,0,0)"],
                        color: ["#cbd5e1", "#fbbf24", "#cbd5e1"]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="p-2 sm:p-3 rounded-full border border-white/10 text-slate-300 group shadow-lg shadow-black/20 shrink-0"
                >
                    <Menu size={20} className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                </motion.button>

                <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-black/40 p-1.5 sm:p-2 flex items-center justify-center transition-transform duration-500 hover:scale-105 shrink-0">
                    <img
                        src={CurebirdLogo}
                        alt="Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-[pulse_3s_ease-in-out_infinite] hover:drop-shadow-[0_0_20px_rgba(245,158,11,1)] transition-all duration-300"
                    />
                </div>

                {/* Quick Navigation Chain */}
                <div className='bg-slate-900/50 p-1 sm:p-1.5 rounded-full border border-white/5 backdrop-blur-sm shadow-inner shrink-0 overflow-hidden'>
                    <div className='flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[120px] sm:max-w-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                        {navItems.map((item, i) => {
                            const isActive = title === item.name;
                            return (
                                <motion.button
                                    key={item.name}
                                    onClick={() => onNavigate && onNavigate(item.name)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={false}
                                    animate={isActive ? {
                                        scale: 1.1,
                                        borderColor: "rgba(251, 191, 36, 0.5)",
                                        boxShadow: "0 0 20px rgba(245,158,11,0.6)",
                                        backgroundColor: "rgba(245, 158, 11, 0.1)"
                                    } : {
                                        scale: 1,
                                        borderColor: ["rgba(255,255,255,0)", "rgba(245,158,11,0.3)", "rgba(255,255,255,0)"],
                                        color: ["#64748b", "#fbbf24", "#64748b"],
                                        boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(245,158,11,0.2)", "0 0 0px rgba(0,0,0,0)"],
                                        backgroundColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.05)", "rgba(245, 158, 11, 0)"]
                                    }}
                                    transition={isActive ? { type: "spring", stiffness: 300 } : { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                                    className={`p-1.5 sm:p-2 rounded-full relative z-10 shrink-0 ${isActive
                                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 text-black font-bold'
                                        : 'border border-transparent bg-transparent'
                                        }`}
                                    title={item.name}
                                >
                                    <span className="block">
                                        {React.cloneElement(item.icon, {
                                            size: 18,
                                            className: isActive ? "text-black animate-[spin_3s_linear_infinite_paused] hover:animate-[spin_1s_ease_in_out] w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" : "currentColor w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]"
                                        })}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Vertical Divider for Desktop Symmetry */}
                <div className="hidden sm:block w-px h-10 bg-white/10 opacity-50 shrink-0"></div>
            </div>

            {/* Right Group: Actions (Add, Profile) */}
            <div className="flex items-center gap-1.5 sm:gap-4 order-2 sm:order-3 shrink-0 ml-auto">
                {user && onAddClick && (
                    <>
                        {/* Hidden on mobile to save space, shown on large screens */}
                        <button onClick={onShareClick} className="hidden lg:block p-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white">
                            <Share2 size={20} />
                        </button>
                        <button onClick={onNotificationClick} className="hidden lg:block p-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white">
                            <Bell size={20} />
                        </button>
                        <button
                            onClick={onAddClick}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black p-3 sm:px-5 sm:py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 text-sm font-bold border border-white/10"
                        >
                            <Plus size={22} className="w-[22px] h-[22px] sm:w-[18px] sm:h-[18px]" />
                            <span className="hidden sm:inline">Add Record</span>
                        </button>
                    </>
                )}

                {user ? (
                    <UserProfile user={user} onLogout={onLogout} />
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all text-sm font-bold"
                    >
                        <LogIn size={20} className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
                        Login
                    </button>
                )}
            </div>

            {/* Center/Bottom Group: Text */}
            <div className="w-full sm:w-auto order-3 sm:order-2 text-center sm:text-left mt-3 sm:mt-0">
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="sm:hidden">
                        <span className="text-white">Welcome, </span>
                        <span className="text-white">{user?.firstName || 'User'}</span><span className="text-white">!</span>
                    </span>
                    <span className="hidden sm:inline">
                        <span className="text-white">Welcome {user?.firstName || 'User'} | </span>
                        <span className="text-white">Cure</span><span className="text-amber-200">bird</span>
                        <span className="text-white"> is at your service!</span>
                    </span>
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs sm:text-sm font-medium">
                    <span className="text-amber-500/90 uppercase tracking-wider font-bold truncate">{title}</span>
                    <span className="hidden md:inline truncate max-w-xl text-slate-400/80">{description}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;


