import React, { useState, useEffect, useRef } from 'react';
import { Plus, Share2, Bell, Search, LogIn, LogOut, Settings, Menu, LayoutDashboard, FileText, Calendar, Pill, HeartPulse, Bot, Activity, Mail, ScrollText, Shield, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
                            <p className="font-bold text-white truncate">{user.displayName || 'Anonymous User'}</p>
                            <p className="text-xs text-slate-300 truncate">{user.email}</p>
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
const Header = ({ title, description, user, onAddClick, onShareClick, onLoginClick, onLogout, onToggleSidebar, onNavigate }) => {

    // Quick Navigation Items
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Cure Analyzer', icon: <Bot size={20} /> },
        { name: 'Cure Stat', icon: <Activity size={20} /> },
        { name: 'Cure AI', icon: <MessageSquare size={20} /> }
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 relative z-20">
            <div className="flex items-center gap-4">
                {/* Mobile Hamburger Menu Button - Decorated & Lively */}
                <motion.button
                    onClick={onToggleSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        borderColor: ["rgba(255,255,255,0.1)", "rgba(245,158,11,0.4)", "rgba(255,255,255,0.1)"],
                        backgroundColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0)"],
                        boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(245,158,11,0.2)", "0 0 0px rgba(0,0,0,0)"],
                        color: ["#cbd5e1", "#fbbf24", "#cbd5e1"] // slate-300 to amber-400
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3 rounded-full border border-white/10 text-slate-300 group shadow-lg shadow-black/20"
                >
                    <Menu size={20} />
                </motion.button>

                {/* Quick Navigation Chain of Icons - Animated & Glowy */}
                <div className='flex items-center gap-2 mr-4 sm:mr-0 bg-slate-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-sm shadow-inner overflow-hidden'>
                    {navItems.map((item) => {
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
                                    color: ["#64748b", "#fbbf24", "#64748b"], // slate-500 to amber-400
                                }}
                                transition={isActive ? { type: "spring", stiffness: 300 } : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                                className={`p-2.5 rounded-full relative z-10 ${isActive
                                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 text-black font-bold'
                                    : 'border border-transparent bg-transparent'
                                    }`}
                                title={item.name}
                            >
                                {/* Icon */}
                                <span className="block">
                                    {React.cloneElement(item.icon, {
                                        size: 20,
                                        className: isActive ? "text-black animate-[spin_3s_linear_infinite_paused] hover:animate-[spin_1s_ease_in_out]" : "currentColor"
                                    })}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="hidden sm:block w-px h-8 bg-white/10 mx-2"></div>

                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 pb-1">{title}</h1>
                    <p className="text-slate-300 mt-1 font-medium text-sm hidden md:block">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-auto group">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                    <input type="text" placeholder="Search..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder:text-slate-500 transition-all shadow-sm" />
                </div>
                {user && onAddClick && (
                    <>
                        <button onClick={onShareClick} className="hidden lg:block p-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white">
                            <Share2 size={20} />
                        </button>
                        <button className="hidden lg:block p-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white">
                            <Bell size={20} />
                        </button>
                        <button
                            onClick={onAddClick}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black p-2.5 sm:px-5 sm:py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 text-sm font-bold border border-white/10"
                        >
                            <Plus size={20} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="hidden sm:inline">Add Record</span>
                        </button>
                    </>
                )}

                {user ? (
                    <UserProfile user={user} onLogout={onLogout} />
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all text-sm font-bold"
                    >
                        <LogIn size={18} />
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;


