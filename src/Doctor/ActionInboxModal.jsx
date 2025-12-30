import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, Bell, Zap, FileCheck, Loader2, ShieldAlert } from 'lucide-react';

const ActionInboxModal = ({ isOpen, onClose }) => {
    const actions = [
        { id: 'act_1', type: 'Lab Approval', title: 'Complete Blood Count', patient: 'Sarah Connor', time: '10m ago', priority: 'High', category: 'diagnostic' },
        { id: 'act_2', type: 'Clinical Alert', title: 'Hyperkalemia Risk', patient: 'John Smith', time: '25m ago', priority: 'Critical', category: 'alert' },
        { id: 'act_3', type: 'Report Sign-off', title: 'Radiology Report (Chest X-Ray)', patient: 'Ellen Ripley', time: '1h ago', priority: 'Medium', category: 'paperwork' },
        { id: 'act_4', type: 'Lab Approval', title: 'Lipid Profile', patient: 'Marty McFly', time: '2h ago', priority: 'Low', category: 'diagnostic' },
        { id: 'act_5', type: 'Critical Notice', title: 'Abnormal Creatinine Levels', patient: 'Tony Stark', time: '3h ago', priority: 'Critical', category: 'alert' },
    ];

    const getPriorityColor = (p) => {
        if (p === 'Critical') return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
        if (p === 'High') return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 shadow-xl shadow-rose-500/10">
                                    <ClipboardList size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Action Inbox</h2>
                                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.3em] mt-1">Pending Clinical Tasks & Approvals</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 text-stone-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="px-8 py-3 bg-rose-500/5 border-b border-white/5 flex gap-4 overflow-x-auto relative z-10 custom-scrollbar">
                            {['All Tasks', 'Lab Approvals', 'Urgent Alerts', 'Documentation'].map((tab, i) => (
                                <button key={i} className={`whitespace-nowrap px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-rose-500 text-black shadow-lg shadow-rose-500/20' : 'text-stone-500 hover:text-white'
                                    }`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Task List Content */}
                        <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {actions.map((action, i) => (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${action.category === 'alert' ? 'text-rose-500' :
                                                    action.category === 'diagnostic' ? 'text-emerald-400' : 'text-blue-400'
                                                    }`}>
                                                    {action.category === 'alert' ? <ShieldAlert size={20} /> :
                                                        action.category === 'diagnostic' ? <Bell size={20} /> : <FileCheck size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{action.type}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${getPriorityColor(action.priority)}`}>
                                                            {action.priority}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors tracking-tight leading-tight">{action.title}</h4>
                                                    <p className="text-sm text-stone-400 font-medium mt-1">Patient: <span className="text-white font-bold uppercase">{action.patient}</span></p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{action.time}</span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-8">
                                            <button className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-rose-500 border border-white/5 hover:border-rose-500 text-stone-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all">
                                                Review & Finalize
                                            </button>
                                            <button className="px-6 py-3.5 rounded-xl bg-black/40 text-stone-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                                                Approve
                                            </button>
                                            <button className="px-6 py-3.5 rounded-xl bg-black/40 text-stone-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
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
