import React, { useState } from 'react';
import { 
    Shield, Lock, Smartphone, Key, History, AlertTriangle,
    CheckCircle2, LogOut, Laptop, Globe, MapPin, ChevronRight
 } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityTab = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300
            ${active
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-stone-900/50 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 border border-stone-800 hover:border-amber-500/30'}
        `}
    >
        <Icon size={18} />
        {label}
    </button>
);

const Toggle = ({ enabled, onToggle }) => (
    <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-amber-500' : 'bg-stone-700'}`}
    >
        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
);

export default function DoctorSecurity() {
    const [activeTab, setActiveTab] = useState('protection');
    const [twoFactor, setTwoFactor] = useState(true);


    // Mock Data for Sessions
    const sessions = [
        { id: 1, device: 'Chrome on Windows', ip: '192.168.1.104', location: 'New York, USA', current: true, time: 'Now', icon: Laptop },
        { id: 2, device: 'iPhone 13 Pro', ip: '104.22.14.2', location: 'New York, USA', current: false, time: '2 hours ago', icon: Smartphone },
        { id: 3, device: 'iPad Air', ip: '142.11.23.55', location: 'New Jersey, USA', current: false, time: '1 day ago', icon: Smartphone }
    ];

    // Mock Data for Login History
    const loginHistory = [
        { id: 1, status: 'success', time: 'Today, 10:23 AM', ip: '192.168.1.104', location: 'New York, USA' },
        { id: 2, status: 'success', time: 'Yesterday, 08:15 PM', ip: '104.22.14.2', location: 'New York, USA' },
        { id: 3, status: 'failed', time: 'Oct 24, 02:30 AM', ip: '45.22.11.90', location: 'Moscow, RU' }, // Suspicious
        { id: 4, status: 'success', time: 'Oct 23, 09:00 AM', ip: '192.168.1.104', location: 'New York, USA' }
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <Shield className="text-amber-500" size={32} />
                    </div>
                    Security & Compliance
                </h2>
                <p className="text-stone-400 text-sm mt-2 ml-1">Manage your account protection, active sessions, and audit logs.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <SecurityTab active={activeTab === 'protection'} label="Account Protection" icon={Lock} onClick={() => setActiveTab('protection')} />
                <SecurityTab active={activeTab === 'sessions'} label="Active Sessions" icon={Globe} onClick={() => setActiveTab('sessions')} />
                <SecurityTab active={activeTab === 'audit'} label="Audit Logs" icon={History} onClick={() => setActiveTab('audit')} />
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'protection' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* 2FA Card */}
                        <div className="animated-border p-8 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <div className="w-1 h-5 bg-amber-500 rounded-full" />
                                        Two-Factor Authentication
                                    </h3>
                                    <Toggle enabled={twoFactor} onToggle={setTwoFactor} />
                                </div>
                                <p className="text-stone-400 text-sm">
                                    Add an extra layer of security to your account. We recommend using an authenticator app.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle2 size={12} /> SMS Active
                                    </span>
                                    <span className="px-3 py-1 bg-stone-800 text-stone-500 border border-stone-700 rounded-full text-xs font-bold">
                                        Authenticator App
                                    </span>
                                </div>
                            </div>
                            <button className="mt-6 w-full py-3 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-sm border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all">
                                Configure 2FA Methods
                            </button>
                        </div>

                        {/* Password Card */}
                        <div className="animated-border p-8 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] hover:border-amber-500/30 transition-all group">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <div className="w-1 h-5 bg-amber-500 rounded-full" />
                                    Password Management
                                </h3>
                                <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800 flex items-center gap-3">
                                    <Key className="text-stone-500" size={20} />
                                    <div>
                                        <p className="text-white font-mono text-sm">••••••••••••••••</p>
                                        <p className="text-xs text-stone-500">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-stone-800 text-stone-300 font-bold text-sm hover:bg-white/10 transition-colors">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'sessions' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] mb-6">
                            <h3 className="text-lg font-bold text-white mb-1">Where you're logged in</h3>
                            <p className="text-stone-400 text-sm">We'll alert you if we see any unusual activity from these devices.</p>
                        </div>

                        {sessions.map(session => (
                            <div key={session.id} className="animated-border p-4 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] flex items-center justify-between hover:border-amber-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-amber-500 border border-stone-800">
                                        <session.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            {session.device}
                                            {session.current && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-500/20">
                                                    Current Session
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {session.location}</span>
                                            <span>•</span>
                                            <span>{session.ip}</span>
                                            <span>•</span>
                                            <span className={session.current ? 'text-emerald-400 font-bold' : ''}>{session.time}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Revoke Access">
                                        <LogOut size={18} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-end mt-4">
                            <button className="flex items-center gap-2 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-bold">
                                <LogOut size={16} /> Sign out of all other sessions
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    >
                        <div className="animated-border rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] overflow-hidden p-1">
                            <div className="rounded-[1.8rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-800 bg-black/20 text-stone-400 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-bold">Status</th>
                                            <th className="p-4 font-bold">Time</th>
                                            <th className="p-4 font-bold">IP Address</th>
                                            <th className="p-4 font-bold">Location</th>
                                            <th className="p-4 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-800">
                                        {loginHistory.map(log => (
                                            <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    {log.status === 'success' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                                            <CheckCircle2 size={12} /> Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold animate-pulse">
                                                            <AlertTriangle size={12} /> Failed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-stone-300 font-medium text-sm">{log.time}</td>
                                                <td className="p-4 text-stone-400 font-mono text-xs">{log.ip}</td>
                                                <td className="p-4 text-stone-400 text-sm">{log.location}</td>
                                                <td className="p-4 text-right">
                                                    <button className="text-stone-600 group-hover:text-amber-500 transition-colors">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
