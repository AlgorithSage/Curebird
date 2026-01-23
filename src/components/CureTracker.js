import React, { useState } from 'react';
import DiseaseList from './diseases/DiseaseList';
import DiseaseDetail from './diseases/DiseaseDetail';
import { ChevronLeft } from './Icons';

import Header from './Header';

const CureTracker = ({ user, userId, onNavigate, onLogout, onLoginClick, onToggleSidebar }) => {
    const [selectedDisease, setSelectedDisease] = useState(null);

    // Use userId from props or fallback to user.uid if object passed
    const activeUserId = userId || (user ? user.uid : null);

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    title="Cure Tracker"
                    description="Monitor and manage your active health conditions."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            <main className="mt-8">
                {selectedDisease ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <button
                            onClick={() => setSelectedDisease(null)}
                            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                        >
                            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Tracker
                        </button>
                        <DiseaseDetail
                            userId={activeUserId}
                            disease={selectedDisease}
                            onBack={() => setSelectedDisease(null)}
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
                        <DiseaseList userId={activeUserId} user={user} onSelectDisease={setSelectedDisease} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CureTracker;
