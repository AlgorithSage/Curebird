import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ResearcherSidebar from './ResearcherSidebar';
import Header from '../Header';
import { LayoutDashboard, Database, Layers, Brain } from '../Icons';
import Background from './Background';

export default function ResearchersLayout({ user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Define Research-specific navigation items for the Header
    const researchNavItems = [
        { name: 'Overview', id: '/research', icon: <LayoutDashboard size={20} /> },
        { name: 'Data', id: '/research/data', icon: <Database size={20} /> },
        { name: 'Models', id: '/research/models', icon: <Layers size={20} /> },
        { name: 'Playground', id: '/research/playground', icon: <Brain size={20} /> },
    ];

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden"> {/* Added overflow-hidden to prevent scrollbars from background */}

            {/* Background Effect Layer */}
            <Background />

            {/* Sidebar moved to root to ensure Z-index dominance over Header */}
            <ResearcherSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                onBackToApp={() => navigate('/dashboard')}
            />

            {/* Shared Header Component */}
            <div className="sticky top-4 z-40 px-4 sm:px-6">
                <Header
                    title="Research Portal"
                    user={user}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    onNavigate={handleNavigate}
                    navItems={researchNavItems}
                    onLogout={() => { /* Handle logout or back to app */ navigate('/dashboard'); }}
                    // Hide Add Record and other patient-specific actions
                    onAddClick={null}
                    onShareClick={null}
                    onNotificationClick={() => { }}
                    alerts={[]}
                />
            </div>

            <div className="flex flex-1 relative mt-4 z-10"> {/* z-10 to stay above background */}


                {/* Main Content Area */}
                <main className="w-full flex-1 transition-all duration-300 flex flex-col relative">
                    {/* Content Container */}
                    <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
