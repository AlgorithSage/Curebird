import React, { useState } from 'react';
import { User, Shield, Stethoscope, Mail, Phone, Award, ToggleLeft, ToggleRight } from 'lucide-react';

const DoctorProfile = ({ user }) => {
    const [isOnline, setIsOnline] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Header / Identity - UPDATED OPACITY */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-2xl">
                        <User size={64} className="text-slate-400" />
                    </div>
                    {/* Verification Badge */}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-4 border-slate-800 shadow-lg" title="Verified Med Practitioner">
                        <Shield size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                        {user.displayName}
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 tracking-wide uppercase">
                            Authorized
                        </span>
                    </h2>
                    <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                        <Stethoscope size={16} className="text-amber-500" />
                        Cardiology Specialist • MBBS, MD
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-6 pt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-2"><Award size={14} /> 12 Years Exp.</span>
                        <span className="flex items-center gap-2">Lic #MD-99283-NY</span>
                    </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                    <button onClick={() => setIsOnline(!isOnline)} className="transition-all duration-300">
                        {isOnline ? (
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ToggleRight size={40} fill="currentColor" className="opacity-100" />
                                <span className="font-bold">Online</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500">
                                <ToggleLeft size={40} className="opacity-50" />
                                <span className="font-medium">Offline</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Profile Grid - UPDATED OPACITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white">Contact Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-400 p-3 rounded-xl bg-black/30">
                            <Mail size={18} /> <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 p-3 rounded-xl bg-black/30">
                            <Phone size={18} /> <span>+1 (555) 012-3490</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white">Clinic Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-slate-500">Clinic Name</span>
                            <span className="text-slate-200 font-medium">Curebird Central</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-slate-500">Department</span>
                            <span className="text-slate-200 font-medium">Cardiology</span>
                        </div>
                        <div className="flex justify-between text-sm py-2">
                            <span className="text-slate-500">Room No.</span>
                            <span className="text-slate-200 font-medium">304-B</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
