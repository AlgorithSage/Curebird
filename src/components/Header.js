import React, { useState, useEffect, useRef } from 'react';
import { Plus, Share2, Bell, Search, LogIn, LogOut, Settings, Menu } from 'lucide-react';

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
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-amber-500 transition-colors"
                    referrerPolicy="no-referrer"
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                    <div className="p-4 border-b border-slate-700">
                        <p className="font-semibold text-white truncate">{user.displayName || 'Anonymous User'}</p>
                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                        <button onClick={() => setIsOpen(false)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700">
                            <Settings size={16} />
                            <span>Profile Settings</span>
                        </button>
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// This Header component is now fully responsive
const Header = ({ title, description, user, onAddClick, onShareClick, onLoginClick, onLogout, onToggleSidebar }) => {
    return (
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
                {/* Mobile Hamburger Menu Button (visible on screens smaller than lg) */}
                <button onClick={onToggleSidebar} className="p-2.5 -ml-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                    <Menu size={20} className="text-slate-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">{title}</h1>
                    <p className="text-slate-400 mt-1">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-auto">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search..." className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white" />
                </div>
                {user && onAddClick && ( // Only show these buttons if user is logged in AND on a page with an Add button
                    <>
                        <button onClick={onShareClick} className="hidden sm:block p-2.5 rounded-lg hover:bg-slate-800 border border-slate-700 transition-colors">
                            <Share2 size={20} className="text-slate-400" />
                        </button>
                        <button className="hidden sm:block p-2.5 rounded-lg hover:bg-slate-800 border border-slate-700 transition-colors">
                            <Bell size={20} className="text-slate-400" />
                        </button>
                        <button
                            onClick={onAddClick}
                            className="hidden sm:flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-sky-600 transition-colors text-sm font-semibold"
                        >
                            <Plus size={16} />
                            Add Record
                        </button>
                    </>
                )}

                {user ? (
                    <UserProfile user={user} onLogout={onLogout} />
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg shadow-sm hover:bg-amber-400 transition-colors text-sm font-semibold"
                    >
                        <LogIn size={16} />
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;


