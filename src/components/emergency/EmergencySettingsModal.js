import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertTriangle, UserPlus, Droplet } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

const EmergencySettingsModal = ({ user, db, onClose, currentData = {} }) => {
    const [formData, setFormData] = useState({
        bloodGroup: currentData.bloodGroup || '',
        allergies: currentData.allergies || '',
        emergencyContacts: currentData.emergencyContacts || [{ name: '', phone: '', relation: '' }]
    });
    const [isSaving, setIsSaving] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.emergencyContacts];
        newContacts[index][field] = value;
        setFormData({ ...formData, emergencyContacts: newContacts });
    };

    const addContact = () => {
        if (formData.emergencyContacts.length < 3) {
            setFormData({ ...formData, emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }] });
        }
    };

    const removeContact = (index) => {
        const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
        setFormData({ ...formData, emergencyContacts: newContacts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                emergencyProfile: {
                    bloodGroup: formData.bloodGroup,
                    allergies: formData.allergies,
                    contacts: formData.emergencyContacts.filter(c => c.name && c.phone) // Clean empty
                }
            });
            onClose();
        } catch (error) {
            console.error("Error saving emergency profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-lg overflow-hidden !p-0"
            >
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-red-500/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Emergency Setup
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Critical Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                <Droplet size={14} className="text-red-400" /> Blood Group
                            </label>
                            <select
                                value={formData.bloodGroup}
                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="">Unknown</option>
                                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Major Allergies</label>
                            <input
                                type="text"
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                placeholder="e.g. Peanuts, Penicillin"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Contacts */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-slate-400">Emergency Contacts</label>
                            {formData.emergencyContacts.length < 3 && (
                                <button type="button" onClick={addContact} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold">
                                    <UserPlus size={14} /> Add Contact
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData.emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <input
                                            placeholder="Name"
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                                            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-red-500 outline-none"
                                            required={idx === 0}
                                        />
                                        <input
                                            placeholder="Phone"
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                                            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-red-500 outline-none font-mono"
                                            required={idx === 0}
                                        />
                                        <input
                                            placeholder="Relation"
                                            value={contact.relation}
                                            onChange={(e) => handleContactChange(idx, 'relation', e.target.value)}
                                            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-red-500 outline-none"
                                        />
                                    </div>
                                    {formData.emergencyContacts.length > 1 && (
                                        <button type="button" onClick={() => removeContact(idx)} className="p-2 text-slate-500 hover:text-red-400">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex justify-center items-center gap-2"
                    >
                        {isSaving ? 'Saving Profile...' : <><Save size={18} /> Save Emergency Profile</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EmergencySettingsModal;
