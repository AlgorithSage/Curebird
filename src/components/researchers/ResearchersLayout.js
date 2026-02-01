import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ResearcherSidebar from './ResearcherSidebar';
import { Menu } from '../Icons';

export default function ResearchersLayout({ user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex">
            <ResearcherSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                onBackToApp={() => navigate('/dashboard')}
            />

            {/* Main Content Area */}
            <main className="w-full min-h-screen transition-all duration-300 flex flex-col">
                {/* Mobile Header for Sidebar Toggle */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/10 relative z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                        Research Portal
                    </span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>

                {/* Content Container */}
                <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
