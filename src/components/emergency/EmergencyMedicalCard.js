import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Users, Droplet, AlertTriangle, ShieldAlert } from 'lucide-react';

const EmergencyMedicalCard = ({ user }) => {
    const profile = user?.emergencyProfile || {};
    const bloodGroup = profile.bloodGroup || 'UNK';
    const allergies = profile.allergies || 'None listed';
    const contacts = profile.contacts || [];

    return (
        <div className="glass-card text-white relative overflow-hidden h-full min-h-[400px] flex flex-col justify-between">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute -right-10 -top-10 text-red-900/20 rotate-12">
                <ShieldAlert size={200} />
            </div>

            {/* Header */}
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Emergency</h2>
                        <p className="text-red-100 font-medium">Medical ID</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <Droplet size={24} className="mb-1 opacity-80" />
                        <div className="text-4xl font-black bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/30">
                            {bloodGroup}
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Info */}
            <div className="relative z-10 my-6 bg-red-900/20 backdrop-blur-md rounded-2xl p-4 border border-red-400/30">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-300 shrink-0 mt-1" size={20} />
                    <div>
                        <h3 className="text-xs font-bold text-red-100 uppercase mb-1">Critical Allergies / Notes</h3>
                        <p className="font-bold text-lg leading-tight">{allergies}</p>
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            <div className="relative z-10 flex-grow">
                <h3 className="text-xs font-bold text-red-200 uppercase mb-3 flex items-center gap-2">
                    <Users size={14} /> Emergency Contacts
                </h3>
                <div className="space-y-3">
                    {contacts.length > 0 ? contacts.map((contact, idx) => (
                        <a
                            key={idx}
                            href={`tel:${contact.phone}`}
                            className="flex items-center justify-between bg-white text-red-600 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95 group"
                        >
                            <div>
                                <div className="font-bold text-lg leading-none">{contact.name}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase mt-1">{contact.relation}</div>
                            </div>
                            <div className="bg-red-100 p-2 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <Phone size={20} />
                            </div>
                        </a>
                    )) : (
                        <div className="text-center text-red-200 text-sm py-4 italic border-2 border-dashed border-red-400/30 rounded-xl">
                            No contacts set. Please setup profile.
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 text-center mt-6">
                <div className="text-[10px] text-red-200/60 font-mono">
                    ID: {user?.uid?.slice(0, 12)}
                </div>
            </div>
        </div>
    );
};

export default EmergencyMedicalCard;
