import React, { useState } from 'react';
import {
    Search, HelpCircle, FileText, Phone, MessageSquare,
    ChevronDown, ChevronUp, ExternalLink, Lock, Users, User, ArrowRight, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
    { id: 'sec', title: 'Security Settings', desc: 'Two-Factor Auth, Password Management', view: 'security', icon: Lock },
    { id: 'pat', title: 'Patient Management', desc: 'View active patients and records', view: 'patients', icon: Users },
    { id: 'chat', title: 'Messages & Chat', desc: 'Consultations with patients', view: 'chat', icon: MessageSquare },
    { id: 'prof', title: 'Doctor Profile', desc: 'Update clinic details & availability', view: 'profile', icon: User },
    { id: 'dash', title: 'Dashboard Analytics', desc: 'View adherence and trends', view: 'overview', icon: BarChart2 },
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-stone-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className={`font-medium transition-colors ${isOpen ? 'text-amber-500' : 'text-stone-300 group-hover:text-amber-500'}`}>
                    {question}
                </span>
                {isOpen ? <ChevronUp size={20} className="text-amber-500" /> : <ChevronDown size={20} className="text-stone-600 group-hover:text-amber-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-stone-400 text-sm leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function DoctorHelp({ onNavigate }) {
    const [query, setQuery] = useState('');

    const filteredFeatures = FEATURES.filter(f =>
        f.title.toLowerCase().includes(query.toLowerCase()) ||
        f.desc.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">

            {/* 1. Hero Search Section */}
            <div className="text-center space-y-6 py-8">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <HelpCircle size={32} className="text-amber-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    How can we assist you, <span className="text-amber-500">Doctor?</span>
                </h1>
                <p className="text-stone-400 max-w-lg mx-auto">
                    Search features, medical guidelines, or contact support directly.
                </p>

                <div className="relative max-w-xl mx-auto group">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center bg-[#0c0a09] border border-stone-800 group-hover:border-amber-500/50 rounded-full px-6 py-4 shadow-xl transition-all">
                        <Search size={20} className="text-stone-500 group-hover:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Type to find features (e.g. 'Security', 'Patients')..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-stone-600"
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            {/* SEARCH RESULTS MODE (Filtered) vs DEFAULT MODE */}
            <div className="min-h-[400px]">
                {query.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-stone-500 font-bold uppercase text-xs tracking-widest mb-6 ml-1">Search Results</h3>

                        {filteredFeatures.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredFeatures.map(feature => (
                                    <button
                                        key={feature.id}
                                        onClick={() => onNavigate && onNavigate(feature.view)}
                                        className="text-left animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] group hover:scale-[1.02] transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                                <feature.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold group-hover:text-amber-500 transition-colors">{feature.title}</h4>
                                                <p className="text-stone-500 text-xs">{feature.desc}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-stone-700 group-hover:text-amber-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-stone-500">
                                <p>No features found matching "{query}".</p>
                                <button onClick={() => setQuery('')} className="text-amber-500 text-sm mt-2 hover:underline">Clear Search</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        {/* 2. Quick Assist Cards (Simple & Unique) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                                    <FileText size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Platform Guide</h3>
                                <p className="text-xs text-stone-400 mb-4">Master the full potential of your workspace.</p>
                                <a href="https://help.curebird.com/tutorials" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    View Tutorials <ExternalLink size={14} />
                                </a>
                            </div>

                            <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                                    <MessageSquare size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
                                <p className="text-xs text-stone-400 mb-4">Chat with our support team instantly.</p>
                                <a href="https://support.curebird.com/chat" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    Start Chat <ExternalLink size={14} />
                                </a>
                            </div>

                            <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                                    <Phone size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Emergency</h3>
                                <p className="text-xs text-stone-400 mb-4">Critical issues affecting patient care.</p>
                                <a href="tel:+18882873247" className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                                    Call Hotline <ExternalLink size={14} />
                                </a>
                            </div>

                        </div>

                        {/* 3. Minimal FAQ */}
                        <div className="animated-border p-8 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)]">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-1">
                                <FAQItem
                                    question="How do I reset my secure prescription PIN?"
                                    answer="Go to Security settings > Password Management. You will need to verify your identity via 2FA to reset your signing PIN."
                                />
                                <FAQItem
                                    question="Why are patient vitals not syncing?"
                                    answer="Ensure the IoT device is connected to the same secure network. Access the 'Device Manager' tab in the patient's profile to re-pair."
                                />
                                <FAQItem
                                    question="How do I download end-of-month reports?"
                                    answer="Navigate to the Research/Analytics tab on your sidebar. Select the date range and click 'Export PDF'."
                                />
                                <FAQItem
                                    question="Can I customize my notification alerts?"
                                    answer="Yes. Click the 'Settings' gear icon in the Notifications panel to toggle email vs. in-app alerts for different priorities."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
