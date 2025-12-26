import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, FilePlus, ChevronRight } from 'lucide-react';

const ConsultationWorkflow = () => {
    const [activeTab, setActiveTab] = useState('pending');

    const requests = [
        { id: 1, patient: 'James Bond', reason: 'Shoulder Pain', time: '10:00 AM', type: 'Initial', status: 'pending' },
        { id: 2, patient: 'Tony Stark', reason: 'Palpitations', time: '11:30 AM', type: 'Follow-up', status: 'pending' },
        { id: 3, patient: 'Natasha R', reason: 'Lab Review', time: '09:00 AM', type: 'Review', status: 'active' },
        { id: 4, patient: 'Bruce Banner', reason: 'Mood Swings', time: 'Yesterday', type: 'Therapy', status: 'completed' },
    ];

    const filteredRequests = requests.filter(r => r.status === activeTab);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">

            {/* Left Col: Request List */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                {/* Tabs - Higher Opacity */}
                <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700/50 backdrop-blur-xl">
                    {['pending', 'active', 'completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/10'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List - Higher Opacity Items */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {filteredRequests.length === 0 && (
                        <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                            <p className="text-sm">No {activeTab} consultations.</p>
                        </div>
                    )}
                    {filteredRequests.map(req => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/30 cursor-pointer group transition-all shadow-md backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">{req.patient}</h4>
                                <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded">{req.time}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{req.reason} <span className="text-slate-600">• {req.type}</span></p>

                            {activeTab === 'pending' && (
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Accept</button>
                                    <button className="px-3 py-1.5 bg-slate-700/30 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-colors">Ignore</button>
                                </div>
                            )}
                            {activeTab === 'active' && (
                                <button className="w-full py-1.5 bg-sky-500/10 text-sky-400 text-xs font-bold rounded-lg border border-sky-500/20 hover:bg-sky-500/20 flex items-center justify-center gap-2">
                                    Open Workspace <ChevronRight size={14} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right Col: Workspace - High Opacity Background */}
            <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
                {activeTab === 'active' && filteredRequests.length > 0 ? (
                    <>
                        <div className="flex justify-between items-start border-b border-white/5 pb-6 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Natasha R.</h2>
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Session Active • Started 15m ago
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors">
                                End Consultation
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 flex-1">
                            {/* Notes Area */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes (Private)</label>
                                <textarea
                                    className="flex-1 w-full bg-black/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none shadow-inner"
                                    placeholder="Type patient symptoms, diagnosis, and observations..."
                                ></textarea>
                            </div>

                            {/* Prescription Area */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Prescription</label>
                                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col">
                                    <div className="space-y-3 mb-4 flex-1">
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Drug Name" className="flex-1 bg-black/40 border-0 rounded-lg px-3 py-2 text-sm text-white" />
                                            <input type="text" placeholder="Dosage" className="w-24 bg-black/40 border-0 rounded-lg px-3 py-2 text-sm text-white" />
                                        </div>
                                        <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                            <FilePlus size={14} /> Add Drug
                                        </button>
                                    </div>
                                    <button className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                                        Sign & Send Prescription
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <ClipboardList size={64} className="mb-4 opacity-20" />
                        <p className="font-medium">Select an active consultation to view workspace</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultationWorkflow;
