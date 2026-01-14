import React, { useState } from 'react';
import { User, Shield, Stethoscope, Mail, Phone, Award, ToggleLeft, ToggleRight, Copy } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure correct import path

const DoctorProfile = ({ user }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [connectionCode, setConnectionCode] = useState(user.connectionCode || '');

    // Lazy Generation of Connection Code
    React.useEffect(() => {
        if (user && !user.connectionCode && !connectionCode) {
            const generateCode = async () => {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
                let result = 'DOC-';
                const length = 6;
                
                // Ensure at least one number and one letter for "alphanumeric" feel
                let randomPart = '';
                while (true) {
                    randomPart = '';
                    let hasNum = false;
                    let hasChar = false;
                    for (let i = 0; i < length; i++) {
                        const c = chars.charAt(Math.floor(Math.random() * chars.length));
                        if (c >= '0' && c <= '9') hasNum = true;
                        else hasChar = true;
                        randomPart += c;
                    }
                    if (hasNum && hasChar) break;
                }
                result += randomPart;
                
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { connectionCode: result });
                    setConnectionCode(result);
                } catch (err) {
                    console.error("Failed to generate code", err);
                }
            };
            generateCode();
        } else if (user.connectionCode) {
            setConnectionCode(user.connectionCode);
        }
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* ... keeping header ... */} 


            {/* Header / Identity - UPDATED OPACITY */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={64} className="text-slate-400" />
                        )}
                    </div>
                    {/* Verification Badge */}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-4 border-slate-800 shadow-lg" title="Verified Med Practitioner">
                        <Shield size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                        Dr. {user.name || user.displayName || 'Doctor'}
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 tracking-wide uppercase">
                            Authorized
                        </span>
                    </h2>
                    <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                        <Stethoscope size={16} className="text-amber-500" />
                        {user.specialization || 'General Practitioner'} • {user.degree || 'MBBS'}
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

            {/* DOCTOR CONNECT ID BANNER */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#0c0a09] border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Doctor Connect ID</h3>
                            <p className="text-stone-400 text-sm">Share this unique ID with patients to establish a secure connection.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto bg-black/40 p-2 pr-3 rounded-xl border border-white/5 group-hover:border-amber-500/30 transition-colors">
                        <code className="flex-1 md:flex-none text-center font-mono text-lg font-bold text-amber-400 tracking-wider px-6">
                            {connectionCode || 'Generating...'}
                        </code>
                        <button 
                            onClick={() => navigator.clipboard.writeText(connectionCode || user.uid)}
                            className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-colors shadow-lg hover:shadow-amber-500/25 active:scale-95"
                            title="Copy ID"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Grid - UPDATED OPACITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="animated-border p-8 rounded-[2rem] bg-[#1c1917] space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-amber-500 rounded-full" />
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 text-stone-300 p-4 rounded-xl bg-[#0c0a09] border border-stone-800/50 hover:border-amber-500/30 transition-colors group">
                            <div className="p-2 bg-stone-800/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                                <Mail size={18} className="text-stone-500 group-hover:text-amber-500 transition-colors" />
                            </div>
                            <span className="font-medium tracking-wide">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-stone-300 p-4 rounded-xl bg-[#0c0a09] border border-stone-800/50 hover:border-amber-500/30 transition-colors group">
                            <div className="p-2 bg-stone-800/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                                <Phone size={18} className="text-stone-500 group-hover:text-amber-500 transition-colors" />
                            </div>
                            <span className="font-medium tracking-wide">{user.phoneNumber || 'Not linked'}</span>
                        </div>
                    </div>
                </div>

                <div className="animated-border p-8 rounded-[2rem] bg-[#1c1917] space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-amber-500 rounded-full" />
                        Clinic Details
                    </h3>
                    <div className="space-y-0.5 bg-[#0c0a09] rounded-xl border border-stone-800/50 p-1">
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="text-stone-500 font-medium">Clinic Name</span>
                            <span className="text-amber-500 font-bold tracking-wide">Curebird Central</span>
                        </div>
                        <div className="w-full h-px bg-stone-800/50" />
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="text-stone-500 font-medium">Department</span>
                            <span className="text-stone-300 font-bold">Cardiology</span>
                        </div>
                        <div className="w-full h-px bg-stone-800/50" />
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <span className="text-stone-500 font-medium">Room No.</span>
                            <span className="text-stone-300 font-bold bg-stone-800 px-2 py-0.5 rounded text-xs">304-B</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
