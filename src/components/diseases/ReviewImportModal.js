import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, AlertCircle, Activity, Pill } from 'lucide-react';
import { DiseaseService } from '../../services/DiseaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Note: Direct firestore usage for meds until MedService is created

const ReviewImportModal = ({ userId, analysisData, db, onClose, onComplete }) => {
    // Pre-select all by default
    const [selectedDiseases, setSelectedDiseases] = useState(
        (analysisData.diseases || []).map(d => ({ name: d, selected: true }))
    );
    const [selectedMeds, setSelectedMeds] = useState(
        (analysisData.medications || []).map(m => ({ ...m, selected: true }))
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1 = Diseases, 2 = Meds (if any)

    const hasDiseases = selectedDiseases.length > 0;
    const hasMeds = selectedMeds.length > 0;

    // Determine starting step
    if (!hasDiseases && hasMeds && step === 1) setStep(2);

    const toggleDisease = (index) => {
        const newDiseases = [...selectedDiseases];
        newDiseases[index].selected = !newDiseases[index].selected;
        setSelectedDiseases(newDiseases);
    };

    const toggleMed = (index) => {
        const newMeds = [...selectedMeds];
        newMeds[index].selected = !newMeds[index].selected;
        setSelectedMeds(newMeds);
    };

    const handleImport = async () => {
        setIsSubmitting(true);
        try {
            // 1. Import Diseases
            const diseasesToImport = selectedDiseases.filter(d => d.selected);
            for (const d of diseasesToImport) {
                // Simple duplicate check could be here, but for now we just add
                await DiseaseService.addDisease(userId, {
                    name: d.name,
                    diagnosisDate: new Date().toISOString().split('T')[0], // Default to today
                    status: 'active',
                    severity: 'moderate',
                    primaryDoctor: 'Imported via CureAnalyzer'
                });
            }

            // 2. Import Medications
            const medsToImport = selectedMeds.filter(m => m.selected);
            if (medsToImport.length > 0) {
                const medsRef = collection(db, 'users', userId, 'medications');
                // Batch write would be better, but loop is fine for MVP
                for (const m of medsToImport) {
                    await addDoc(medsRef, {
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                        startDate: serverTimestamp(),
                        status: 'active',
                        source: 'CureAnalyzer'
                    });
                }
            }

            onComplete(); // Trigger generic success callback
            onClose();
        } catch (error) {
            console.error("Import failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeDiseasesCount = selectedDiseases.filter(d => d.selected).length;
    const activeMedsCount = selectedMeds.filter(m => m.selected).length;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Check className="text-emerald-500" /> Review & Import
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Step 1: Diseases */}
                    {hasDiseases && (
                        <div className={step === 1 ? 'block' : 'hidden'}>
                            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                                <Activity size={14} /> New Conditions Detected
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">Select the conditions you want to track in your medical profile.</p>

                            <div className="space-y-2">
                                {selectedDiseases.map((d, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleDisease(idx)}
                                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${d.selected ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}
                                    >
                                        <span className="text-white font-medium">{d.name}</span>
                                        {d.selected && <Check size={18} className="text-amber-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Medications */}
                    {hasMeds && (
                        <div className={(!hasDiseases) || (hasDiseases && step === 2) ? 'block' : 'hidden'}>
                            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                                <Pill size={14} /> Medications Detected
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">Add these to your active medication list?</p>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {selectedMeds.map((m, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleMed(idx)}
                                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${m.selected ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}
                                    >
                                        <div>
                                            <div className="text-white font-medium">{m.name}</div>
                                            <div className="text-xs text-slate-500">{m.dosage} • {m.frequency}</div>
                                        </div>
                                        {m.selected && <Check size={18} className="text-emerald-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(!hasDiseases && !hasMeds) && (
                        <div className="text-center py-8 text-slate-500">
                            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                            No structured data was found to import.
                        </div>
                    )}

                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    {(hasDiseases && step === 1 && hasMeds) ? (
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-bold transition-colors"
                        >
                            Next: Review Medications ({activeMedsCount})
                        </button>
                    ) : (
                        <button
                            onClick={handleImport}
                            disabled={isSubmitting || (!hasDiseases && !hasMeds)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
                        >
                            {isSubmitting ? 'Importing...' : `Import Selected (${activeDiseasesCount + activeMedsCount} items)`}
                        </button>
                    )}
                </div>

            </motion.div>
        </div>
    );
};

export default ReviewImportModal;
