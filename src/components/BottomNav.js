import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Bot, Users, Plus, Microscope, BarChart2, Activity, Stethoscope, Settings, Mail } from './Icons';
import useHaptics from '../hooks/useHaptics';

const BottomNav = ({ onAddClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { triggerHaptic } = useHaptics();

    // Full list of navigation items
    const allNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Analyzer', path: '/cure-analyzer', icon: Microscope },
        { name: 'Stat', path: '/cure-stat', icon: BarChart2 },
        { name: 'AI', path: '/cure-ai', icon: Bot },
        { name: 'Tracker', path: '/cure-tracker', icon: Activity },
        { name: 'Doctors', path: '/doctor-access', icon: Stethoscope },
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    // Split items for Left and Right scrollable areas (4 items on left, 4 on right)
    const midPoint = 4; // Dashboard, Analyzer, Stat, AI | Tracker, Doctors, Settings, Contact
    const leftItems = allNavItems.slice(0, midPoint);
    const rightItems = allNavItems.slice(midPoint);

    const isActive = (path) => location.pathname === path;

    const NavGroup = ({ items }) => (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory flex-1 px-1">
            {items.map((item) => {
                const active = isActive(item.path);
                return (
                    <button
                        key={item.name}
                        onClick={() => {
                            triggerHaptic('light');
                            navigate(item.path);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[3.5rem] sm:min-w-[4rem] snap-center shrink-0 ${active ? 'bg-white/5 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <item.icon
                            size={20}
                            weight={active ? "fill" : "duotone"}
                            className={`transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}`}
                        />
                        <span className={`text-[9px] font-bold mt-1 tracking-wide ${active ? 'opacity-100' : 'opacity-60'}`}>
                            {item.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden user-select-none">
            {/* Main Container */}
            <div className="relative h-20 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex items-center justify-between px-2 pb-2">

                {/* Left Scrollable Section */}
                <NavGroup items={leftItems} />

                {/* Center Floating Action Button (FAB) */}
                <div className="relative -top-6 mx-2 shrink-0 z-10 w-16 flex justify-center">
                    <button
                        onClick={() => {
                            triggerHaptic('heavy');
                            onAddClick();
                        }}
                        className="bg-gradient-to-tr from-amber-400 to-amber-600 p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] border-4 border-slate-900 group transition-transform active:scale-95 flex items-center justify-center transform hover:-translate-y-1"
                    >
                        <Plus size={28} className="text-slate-900" weight="bold" />
                        {/* Pulse Ring */}
                        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20 pointer-events-none"></div>
                    </button>
                </div>

                {/* Right Scrollable Section */}
                <NavGroup items={rightItems} />

            </div>
        </div>
    );
};

export default BottomNav;
