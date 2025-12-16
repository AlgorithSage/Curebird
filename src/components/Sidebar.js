import React from 'react';
import { LayoutDashboard, FileText, Calendar, Pill, Settings, HeartPulse, Bot, Activity, X } from 'lucide-react';

const Sidebar = ({ activeView, onNavigate, isOpen, onClose }) => {
    const navItems = [
        { name: 'Dashboard' },
        { name: 'All Records' },
        { name: 'Appointments' },
        { name: 'Medications' },
        { name: 'Cure Analyzer' },
        { name: 'Cure Stat' },
        { name: 'Settings' },
    ];

    const getIcon = (name) => {
        switch (name) {
            case 'Dashboard': return <LayoutDashboard size={20} />;
            case 'All Records': return <FileText size={20} />;
            case 'Appointments': return <Calendar size={20} />;
            case 'Medications': return <Pill size={20} />;
            case 'Cure Analyzer': return <Bot size={20} />;
            case 'Cure Stat': return <Activity size={20} />;
            case 'Settings': return <Settings size={20} />;
            default: return null;
        }
    };

    return (
        <>
            {/* Overlay: Appears behind the drawer and closes it when clicked. Visible on ALL screens when isOpen is true. */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar with universal slide-in behavior */}
            <aside
                className={`w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-screen fixed top-0 left-0 z-40 
                           transition-transform duration-300 ease-in-out shadow-2xl
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-800">
                    <div className='flex items-center gap-3'>
                        <div className="bg-sky-500 p-2 rounded-lg">
                            <HeartPulse size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Curebird</h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.name}>
                                <button
                                    onClick={() => {
                                        onNavigate(item.name);
                                        onClose(); // Close sidebar on mobile after navigation
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeView === item.name
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {getIcon(item.name)}
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;