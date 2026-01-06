import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Check, Calendar, Plus } from 'lucide-react';

const NewSlotModal = ({ isOpen, onClose, onConfirm }) => {
    // State for time inputs
    const [hour, setHour] = useState('09');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');
    const [duration, setDuration] = useState(30); // minutes

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Format: "09:00 AM"
        const timeString = `${hour}:${minute} ${period}`;
        onConfirm(timeString);
    };

    const durations = [15, 30, 45, 60];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0c0a05] border border-amber-500/20 rounded-[2rem] shadow-2xl overflow-hidden"
            >
                {/* Decorative Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

                <div className="p-6 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Clock size={18} />
                                </span>
                                New Availability
                            </h3>
                            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider ml-1 mt-1">Configure Time Slot</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/5 text-stone-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Time Input Section */}
                    <div className="bg-stone-900/40 rounded-2xl p-6 border border-white/5 mb-6 text-center">
                        <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-4 block">Select Start Time</label>

                        <div className="flex items-center justify-center gap-2">
                            {/* Hour */}
                            <input
                                type="text"
                                value={hour}
                                onChange={(e) => setHour(e.target.value.slice(0, 2))}
                                className="w-16 h-20 bg-[#080705] border border-white/10 focus:border-amber-500/50 rounded-xl text-4xl font-black text-white text-center focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all placeholder-white/10"
                                placeholder="09"
                            />
                            <span className="text-2xl font-bold text-stone-600">:</span>
                            {/* Minute */}
                            <input
                                type="text"
                                value={minute}
                                onChange={(e) => setMinute(e.target.value.slice(0, 2))}
                                className="w-16 h-20 bg-[#080705] border border-white/10 focus:border-amber-500/50 rounded-xl text-4xl font-black text-white text-center focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all placeholder-white/10"
                                placeholder="00"
                            />

                            {/* AM/PM Toggle */}
                            <div className="flex flex-col gap-1 ml-2">
                                <button
                                    onClick={() => setPeriod('AM')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${period === 'AM' ? 'bg-amber-500 text-black border-amber-500' : 'bg-stone-900 text-stone-500 border-white/5 hover:border-amber-500/30'}`}
                                >
                                    AM
                                </button>
                                <button
                                    onClick={() => setPeriod('PM')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${period === 'PM' ? 'bg-amber-500 text-black border-amber-500' : 'bg-stone-900 text-stone-500 border-white/5 hover:border-amber-500/30'}`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="mb-8">
                        <label className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-3 block">Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                            {durations.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${duration === d
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                            : 'bg-stone-900/40 text-stone-500 border-white/5 hover:border-amber-500/20 hover:text-stone-300'
                                        }`}
                                >
                                    {d}m
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Slot to Schedule
                    </button>

                </div>
            </motion.div>
        </div>
    );
};

export default NewSlotModal;
