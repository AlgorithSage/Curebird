import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Bot, Users, Plus } from './Icons';
import useHaptics from '../hooks/useHaptics';

const BottomNav = ({ onAddClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { triggerHaptic } = useHaptics();

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Records', path: '/all-records', icon: FileText },
        // Floating Action Button Placeholder in middle
        { name: 'Add', isFab: true, icon: Plus },
        { name: 'Chat', path: '/messages', icon: MessageSquare },
        { name: 'AI', path: '/cure-ai', icon: Bot },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glassmorphic Container */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 pb-2">

                {navItems.map((item, idx) => {
                    if (item.isFab) {
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    triggerHaptic('heavy');
                                    onAddClick();
                                }}
                                className="relative -top-5 bg-gradient-to-tr from-amber-400 to-amber-600 p-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] border-4 border-slate-900 group transition-transform active:scale-95"
                            >
                                <Plus size={28} className="text-black" weight="bold" />
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                            </button>
                        );
                    }

                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.name}
                            onClick={() => {
                                triggerHaptic('light');
                                navigate(item.path);
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${active ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <item.icon
                                size={24}
                                weight={active ? "fill" : "duotone"}
                                className={`transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}`}
                            />
                            <span className={`text-[10px] font-bold mt-1 transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
                                {item.name}
                            </span>
                            {/* Active Dot Indicator */}
                            {active && (
                                <span className="absolute bottom-2 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(245,158,11,1)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
