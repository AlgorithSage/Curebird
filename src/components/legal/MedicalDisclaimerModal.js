import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const MedicalDisclaimerModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-card max-w-lg w-full overflow-hidden !p-0"
                >
                    <div className="bg-amber-500/10 p-6 border-b border-white/10 flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-full text-amber-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-amber-300">Medical Disclaimer</h2>
                            <p className="text-xs text-amber-200/60">Please read carefully before proceeding</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed h-[300px] overflow-y-auto">
                        <p><strong>1. No Medical Advice:</strong> Curebird is a health management tool designed to help you organize and track your medical information. It does <span className="text-red-400 font-bold">NOT</span> provide medical advice, diagnosis, or treatment.</p>

                        <p><strong>2. AI Limitations:</strong> The "Cure Insight" and "Cure AI" features use artificial intelligence to analyze data. These insights are automated observations and may contain errors. They should never replace professional medical judgment.</p>

                        <p><strong>3. Emergency Use:</strong> Do not rely on Curebird for immediate life-saving assistance during critical emergencies. Always call your local emergency services (e.g., 911, 112) first.</p>

                        <p><strong>4. Data Privacy:</strong> Your data is stored securely. However, you are responsible for the security of your account credentials and any data you choose to share via the "Doctor Mode" or "Print" features.</p>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck size={18} /> I Understand & Accept
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MedicalDisclaimerModal;
