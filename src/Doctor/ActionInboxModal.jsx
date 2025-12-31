import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, Bell, Zap, FileCheck, Loader2, ShieldAlert } from 'lucide-react';

const ActionInboxModal = ({ isOpen, onClose, onResolve }) => {
    const [activeTab, setActiveTab] = React.useState('pending');

    const actions = [
        { id: '1', title: 'Complete Blood Count', patient: 'Sarah Connor', type: 'Lab Approval', priority: 'High', time: '2m ago', category: 'diagnostic' },
        { id: '2', title: 'Chest X-Ray Review', patient: 'John Smith', type: 'Imaging', priority: 'Urgent', time: '15m ago', category: 'imaging' },
        { id: '3', title: 'Medication Amendment', patient: 'Ellen Ripley', type: 'Prescription', priority: 'Routine', time: '1h ago', category: 'rx' },
        { id: '4', title: 'Abnormal Glucose Level', patient: 'Tony Stark', type: 'Alert', priority: 'Critical', time: 'Just Now', category: 'diagnostic' },
    ];

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Critical': return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
            case 'Urgent': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
            case 'High': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
            default: return 'text-slate-400 border-white/10 bg-white/5';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl h-[85vh] bg-[#0c0506] border border-rose-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-500/5 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 shadow-xl shadow-rose-500/10">
                                    <ClipboardList size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Action Inbox</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Pending Clinical Tasks & Approvals</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="px-8 py-4 bg-rose-500/5 border-b border-white/5 flex gap-8 items-center relative z-10 overflow-x-auto no-scrollbar">
                            {['Pending', 'Urgent Alerts', 'Documentation', 'Resolved'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative z-10 ${activeTab === tab.toLowerCase()
                                        ? 'text-white shadow-lg shadow-rose-500/20'
                                        : 'text-stone-500 hover:text-rose-400 hover:bg-rose-500/5'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase() && (
                                        <motion.div
                                            layoutId="activeTabInbox"
                                            className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl z-[-1]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {actions.map((action, i) => (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group glass-card animated-border animated-border-rose overflow-hidden transition-all duration-300 hover:bg-rose-500/5 p-6 flex flex-col gap-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-5">
                                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-white/5 group-hover:scale-110 transition-transform">
                                                    {action.category === 'diagnostic' ? <Bell size={20} /> : <FileCheck size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{action.type}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${getPriorityColor(action.priority)}`}>
                                                            {action.priority}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors tracking-tight leading-tight mb-2">{action.title}</h4>
                                                    <p className="text-sm text-stone-400 font-medium">Patient: <span className="text-white font-bold uppercase">{action.patient}</span></p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{action.time}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => onResolve?.('review', action)}
                                                className="flex-1 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-black transition-all"
                                            >
                                                Review & Finalize
                                            </button>
                                            <button
                                                onClick={() => onResolve?.('approve', action)}
                                                className="px-6 py-3 rounded-xl bg-stone-900 border border-white/5 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all hover:bg-white/5"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => onResolve?.('forward', action)}
                                                className="px-6 py-3 rounded-xl bg-stone-900 border border-white/5 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all hover:bg-white/5"
                                            >
                                                Forward
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ActionInboxModal;
