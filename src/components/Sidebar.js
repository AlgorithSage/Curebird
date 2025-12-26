import React from 'react';
import { LayoutDashboard, FileText, Calendar, Pill, Settings, HeartPulse, Bot, Activity, X, MessageSquare, Mail, Shield, ScrollText } from 'lucide-react';
import CurebirdLogo from '../curebird_logo.png';

const Sidebar = ({ activeView, onNavigate, isOpen, onClose, user }) => {

    const menuGroups = [
        {
            title: "Overview",
            items: [
                { name: 'Dashboard', icon: LayoutDashboard },
                { name: 'All Records', icon: FileText },
            ]
        },
        {
            title: "Health Management",
            items: [
                { name: 'Appointments', icon: Calendar },
                { name: 'Medications', icon: Pill },
            ]
        },
        {
            title: "Core Features",
            items: [
                { name: 'Cure Analyzer', icon: Bot },
                { name: 'Cure Stat', icon: Activity },
                { name: 'Cure AI', icon: MessageSquare },
            ]
        },
        {
            title: "Account",
            items: [
                { name: 'Settings', icon: Settings },
                { name: 'Contact', icon: Mail },
                { name: 'Terms', icon: ScrollText },
                { name: 'Privacy', icon: Shield },
            ]
        }
    ];

    return (
        <>
            {/* Overlay: Appears behind the drawer and closes it when clicked. Visible on ALL screens when isOpen is true. */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar with universal slide-in behavior and premium glass look */}
            <aside
                className={`w-72 flex-shrink-0 bg-black/95 backdrop-blur-2xl border-r border-yellow-500/20 h-screen fixed top-0 left-0 z-40 
                           transition-transform duration-300 ease-in-out
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-white/10 relative">
                    {/* Glass Card for Branding */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/10 group/card">

                        <div className="relative group shrink-0">
                            {/* Logo Container */}
                            <div className="relative w-12 h-12 rounded-full bg-black/40 p-2 flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110">
                                {/* The Logo Itself */}
                                <img
                                    src={CurebirdLogo}
                                    alt="Curebird Logo"
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-[pulse_3s_ease-in-out_infinite] hover:drop-shadow-[0_0_20px_rgba(245,158,11,1)] transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">Curebird</h1>
                            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">Patient Portal</p>
                        </div>
                    </div>

                    {/* Mobile Close Button - Absolute Position */}
                    <button onClick={onClose} className="lg:hidden absolute top-2 right-2 p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32 space-y-8 h-[calc(100vh-180px)]">
                    {menuGroups.map((group, idx) => (
                        <div key={idx}>
                            <div className="flex justify-center w-full mb-4">
                                <h3 className="inline-block px-4 py-1.5 rounded-xl bg-white/10 border border-white/10 [box-shadow:0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase tracking-widest shadow-lg">
                                    {group.title}
                                </h3>
                            </div>
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => {
                                                    onNavigate(item.name);
                                                    onClose(); // Close sidebar on mobile after navigation
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeView === item.name
                                                    ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 text-amber-500 border border-amber-500/30'
                                                    : 'text-slate-100 hover:bg-white/5 hover:text-amber-200 hover:translate-x-1'
                                                    }`}
                                            >
                                                <span className={`transition-colors duration-200 ${activeView === item.name ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>
                                                    <Icon size={20} />
                                                </span>
                                                <span className="font-bold tracking-wide text-sm">{item.name}</span>
                                                {activeView === item.name && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* User Profile Section */}
                {user && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                            <div className="relative w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500/30 overflow-hidden shrink-0">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500 font-bold">
                                        {user.firstName ? user.firstName.charAt(0) : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                                    {user.firstName ? `Welcome, ${user.firstName}` : 'Welcome, User'}
                                </h4>
                                <p className="text-xs text-amber-500/80 font-medium">Pro Member</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside >
        </>
    );
};

export default Sidebar;