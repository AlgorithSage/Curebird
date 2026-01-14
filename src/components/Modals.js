import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  X, Copy, AlertTriangle, Trash2, UploadCloud, Pill, Stethoscope, Loader, Camera  } from './Icons';
import { jsPDF } from "jspdf";
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { deleteUser } from "firebase/auth";
import { API_BASE_URL } from '../config';

const ModalWrapper = ({ onClose, children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden !p-0" onClick={(e) => e.stopPropagation()}>
            {children}
        </motion.div>
    </motion.div>
);

// --- NEW: A form for adding and editing appointments ---
export const AppointmentFormModal = ({ onClose, appointment, userId, appId, db }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (appointment) {
            const appointmentDate = appointment.date?.toDate ? appointment.date.toDate().toISOString().split('T')[0] : '';
            setFormData({ ...appointment, date: appointmentDate });
        } else {
            setFormData({ date: new Date().toISOString().split('T')[0], status: 'upcoming' });
        }
    }, [appointment]);

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            date: new Date(formData.date)
        };

        const appointmentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/appointments`);

        try {
            if (dataToSave.id) {
                const { id, ...dataToUpdate } = dataToSave;
                const appointmentRef = doc(appointmentsCollectionRef, id);
                await updateDoc(appointmentRef, dataToUpdate);
            } else {
                await addDoc(appointmentsCollectionRef, dataToSave);
            }
            onClose();
        } catch (error) {
            console.error("Error saving appointment:", error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="flex justify-between items-center p-5 border-b border-amber-500/10 bg-black/20">
                <h2 className="text-xl font-semibold text-white">{appointment ? 'Edit' : 'Add'} Appointment</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" name="date" value={formData.date || ''} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500" required />
                    <select name="status" value={formData.status || 'upcoming'} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer">
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <input type="text" name="doctorName" placeholder="Doctor's Name" value={formData.doctorName || ''} onChange={handleInputChange} className="w-full p-2 border bg-transparent border-slate-600 rounded-md text-white" required />
                <input type="text" name="hospitalName" placeholder="Hospital/Clinic Name" value={formData.hospitalName || ''} onChange={handleInputChange} className="w-full p-2 border bg-transparent border-slate-600 rounded-md text-white" required />
                <textarea name="reason" placeholder="Reason for visit..." value={formData.reason || ''} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 h-24 resize-none focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500"></textarea>
                <div className="flex justify-end pt-4 border-t border-amber-500/10 gap-3">
                    <button type="button" onClick={onClose} className="bg-black/30 border border-amber-500/10 text-slate-300 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-400 font-semibold transition-colors">
                        {appointment ? 'Update' : 'Save'} Appointment
                    </button>
                </div>
            </form>
        </ModalWrapper>
    )
}


const AnalysisResult = ({ result, onApply }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3 flex justify-between items-center">
            <span>AI Analysis Results</span>
        </h3>
        
        <div className="space-y-4">
            <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-amber-400"><Stethoscope size={16} />Detected Conditions / Diseases</h4>
                {(result?.diseases || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(result?.diseases || []).map(d => <span key={d} className="bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full">{d}</span>)}
                    </div>
                ) : <p className="text-slate-400 text-sm mt-1">No specific conditions detected.</p>}
            </div>
            <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-sky-400"><Pill size={16} />Detected Medications</h4>
                {(result?.medications || []).length > 0 ? (
                    <div className="space-y-2 mt-2">
                        {(result?.medications || []).map((med, i) => {
                             const dosageVal = med.dosage ? (typeof med.dosage === 'object' ? (med.dosage.dosage || JSON.stringify(med.dosage)) : med.dosage) : "N/A";
                             return (
                                <p key={i} className="text-slate-300 text-sm font-mono bg-slate-700/50 p-1 rounded">
                                    &gt; {med.name || "Unknown Drug"} - {dosageVal} - {med.frequency || "N/A"}
                                </p>
                             );
                        })}
                        <button onClick={onApply} className="text-sm text-sky-400 hover:text-sky-300 font-semibold mt-2">Auto-fill Medications</button>
                    </div>
                ) : <p className="text-slate-400 text-sm mt-1">No specific medications detected.</p>}
            </div>
        </div>
    </div>
);

export const RecordFormModal = ({ onClose, record, userId, appId, db, storage }) => {
    const [type, setType] = useState(record?.type || 'prescription');
    const [formData, setFormData] = useState({});
    const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '' }]);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisError, setAnalysisError] = useState('');

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = React.useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setShowCamera(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Convert to PDF
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');

        const file = new File([pdfBlob], `captured_prescription_${Date.now()}.pdf`, { type: "application/pdf" });

        setFile(file);
        stopCamera();
    };

    useEffect(() => {
        if (showCamera && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera, stream]);

    useEffect(() => {
        if (record) {
            const date = record.date?.toDate ? record.date.toDate().toISOString().split('T')[0] : '';
            setFormData({ ...record, date });
            if (record.type === 'prescription' && record.details?.medications) setMedications(record.details.medications);
        } else {
            setFormData({ date: new Date().toISOString().split('T')[0], details: {} });
        }
    }, [record]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // PDFs don't need AI analysis usually, but images do.
        // For now, let's allow up to 10MB on Storage (Spark Plan limit is 5GB total)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setAnalysisError("File is too large. Please select a file under 10MB.");
            return;
        }

        setFile(selectedFile);
        setAnalysisResult(null);
        setAnalysisError('');

        // Only analyze images for medical data extraction
        if (selectedFile.type.startsWith('image/')) {
            setIsAnalyzing(true);
            const fileData = new FormData();
            fileData.append('file', selectedFile);

            try {
                // Use the advanced VLM processor
                const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, {
                    method: 'POST',
                    body: fileData,
                });
                
                if (!response.ok) {
                    throw new Error('Analysis failed. The server returned an error.');
                }
                
                const rawData = await response.json();
                const result = rawData.analysis || {};
                const summary = rawData.summary || "";

                // Auto-fill Logic
                const newFormData = { ...formData };
                
                // 1. Date
                if (result.date) {
                    newFormData.date = result.date;
                } else {
                    // Fallback date regex
                    const dateMatch = summary.match(/\b(\d{4}-\d{2}-\d{2})\b/) || summary.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
                    if (dateMatch) {
                        const dStr = dateMatch[1].replace(/\//g, '-');
                        const dObj = new Date(dStr);
                        if (!isNaN(dObj.getTime())) newFormData.date = dObj.toISOString().split('T')[0];
                    }
                }

                // 2. Doctor Name
                if (result.doctor_name) {
                    newFormData.doctorName = result.doctor_name;
                } else {
                    const drMatch = summary.match(/(?:Dr\.|Doctor)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
                    if (drMatch) newFormData.doctorName = "Dr. " + drMatch[1];
                }

                // 3. Hospital Name
                if (result.hospital_name || result.clinic_name) {
                    newFormData.hospitalName = result.hospital_name || result.clinic_name;
                } else {
                    const hospMatch = summary.match(/([A-Z][a-z0-9\s]+(?:Hospital|Clinic|Medical Center|Nursing Home|Labs|Diagnostics))/i);
                    if (hospMatch) newFormData.hospitalName = hospMatch[1].trim();
                }

                setFormData(newFormData);

                // 4. Medications
                if (result.medications && result.medications.length > 0) {
                     setMedications(result.medications);
                }

                setAnalysisResult(result);

            } catch (err) {
                console.error("Analysis failed:", err);
                setAnalysisError("AI could not read the document: " + err.message);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMedicationChange = (index, e) => {
        const newMeds = [...medications];
        newMeds[index][e.target.name] = e.target.value;
        setMedications(newMeds);
    };
    const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
    const removeMedication = (index) => setMedications(medications.filter((_, i) => i !== index));
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const recordToSave = { ...formData, type };
        recordToSave.date = new Date(recordToSave.date);
        // Important: Add createdAt timestamp for precise "Latest Uploaded" sorting
        if (!recordToSave.createdAt) {
            recordToSave.createdAt = new Date(); // Current timestamp
        }

        if (type === 'prescription') recordToSave.details.medications = medications;

        try {
            // 1. If there's a new file, upload it to Firebase Storage
            if (file) {
                const storageRef = ref(storage, `users/${userId}/medical_records/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error("Storage upload error:", error);
                            if (error.code === 'storage/unauthorized') {
                                reject(new Error("Firebase Storage: Permission denied. Please check your security rules."));
                            } else {
                                reject(new Error(`Storage Error: ${error.message}`));
                            }
                        },
                        async () => {
                            try {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                recordToSave.fileUrl = downloadURL;
                                recordToSave.storagePath = storageRef.fullPath; // Save path for secure access
                                recordToSave.fileName = file.name;
                                recordToSave.fileType = file.type;
                                resolve();
                            } catch (e) {
                                reject(new Error("Failed to get download URL after upload."));
                            }
                        }
                    );
                });
            }

            // 2. Save to Firestore
            const recordsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
            if (recordToSave.id) {
                const { id, ...dataToUpdate } = recordToSave;
                await updateDoc(doc(recordsCollectionRef, id), dataToUpdate);
            } else {
                await addDoc(recordsCollectionRef, recordToSave);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save record:", error);
            setAnalysisError(error.message || "Could not save the record to the database.");
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="flex justify-between items-center p-5 border-b border-amber-500/10 bg-black/20 flex-shrink-0">
                <h2 className="text-xl font-semibold text-white">{record ? 'Edit' : 'Add'} Medical Record</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" name="date" value={formData.date || ''} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all" required />
                    <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer">
                        <option value="prescription" className="bg-slate-900">Prescription</option><option value="test_report" className="bg-slate-900">Test Report</option><option value="diagnosis" className="bg-slate-900">Diagnosis</option>
                        <option value="admission" className="bg-slate-900">Hospital Admission</option><option value="ecg" className="bg-slate-900">ECG</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="doctorName" placeholder="Doctor's Name" value={formData.doctorName || ''} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500" required />
                    <input type="text" name="hospitalName" placeholder="Hospital/Clinic Name" value={formData.hospitalName || ''} onChange={handleInputChange} className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-500" required />
                </div>

                <div className="pt-4 border-t border-amber-500/10 space-y-4">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-amber-500/20 border-dashed rounded-2xl bg-black/20 hover:bg-black/30 transition-colors group">
                        <div className="space-y-1 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-amber-500/60 group-hover:text-amber-400 transition-colors mb-2 drop-shadow-lg" />
                            <div className="flex text-sm text-slate-400 justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-amber-500/5 px-4 py-2 rounded-xl font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all shadow-lg">
                                    <span>{file ? 'Change File' : 'Upload PDF or Image'}</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*" />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 pt-2">{file ? file.name : (record?.fileUrl ? 'Existing document attached' : 'No file selected')}</p>
                        </div>
                    </div>

                    {/* Camera Button */}
                    {!showCamera && (
                        <div className="flex justify-center">
                            <button type="button" onClick={startCamera} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-600">
                                <Camera size={20} />
                                <span>Capture from Camera</span>
                            </button>
                        </div>
                    )}

                    {/* Camera View */}
                    {showCamera && (
                        <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-600">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <button type="button" onClick={stopCamera} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold backdrop-blur-sm transition-colors">
                                    Cancel
                                </button>
                                <button type="button" onClick={captureImage} className="bg-emerald-500/80 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold backdrop-blur-sm transition-colors flex items-center gap-2">
                                    <Camera size={18} /> Capture
                                </button>
                            </div>
                        </div>
                    )}

                    {uploadProgress > 0 && (
                        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="bg-gradient-to-r from-sky-500 to-amber-500 h-full rounded-full transition-all duration-300" />
                            <p className="text-[10px] text-slate-400 mt-1 text-center font-bold uppercase tracking-widest">{Math.round(uploadProgress)}% Uploaded</p>
                        </div>
                    )}

                    {isAnalyzing && <div className="flex items-center justify-center gap-2 text-slate-300 py-4 bg-white/5 rounded-xl"><Loader className="animate-spin text-sky-400" size={20} /> <p className="text-sm font-medium">AI is analyzing medical data...</p></div>}
                    {analysisError && <div className="text-red-400 text-center text-sm p-3 bg-red-900/20 border border-red-900/50 rounded-xl">{analysisError}</div>}
                    {analysisResult && <AnalysisResult result={analysisResult} onApply={() => setMedications(analysisResult.medications)} />}
                </div>

                <AnimatePresence>
                    {type === 'prescription' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="space-y-3 pt-4 border-t border-slate-700">
                                <h4 className="font-bold text-white flex items-center gap-2"><Pill size={18} className="text-rose-400" />Medications</h4>
                                {medications.map((med, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <input type="text" name="name" placeholder="Medication Name" value={med.name} onChange={e => handleMedicationChange(index, e)} className="p-2 bg-slate-800 border border-slate-700 rounded-lg md:col-span-2 text-white text-sm focus:border-sky-500 outline-none transition-colors" required />
                                        <input type="text" name="dosage" placeholder="Dosage" value={med.dosage} onChange={e => handleMedicationChange(index, e)} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-sky-500 outline-none transition-colors" />
                                        <div className="flex items-center">
                                            <input type="text" name="frequency" placeholder="Frequency" value={med.frequency} onChange={e => handleMedicationChange(index, e)} className="p-2 bg-slate-800 border border-slate-700 rounded-lg w-full text-white text-sm focus:border-sky-500 outline-none transition-colors" />
                                            <button type="button" onClick={() => removeMedication(index)} className="ml-2 text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addMedication} className="text-sm text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors">+ Add Medication</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-end pt-6 border-t border-amber-500/10 gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-amber-500/10 text-slate-300 hover:bg-amber-500/5 transition-colors font-bold">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none" disabled={isSaving || isAnalyzing}>
                        {isSaving ? 'Cloud Syncing...' : 'Save Record'}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export const ShareModal = ({ onClose, userId }) => {
    const [isCopied, setIsCopied] = useState(false);
    const shareableLink = `${window.location.origin}?shareId=${userId}`;
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareableLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-semibold text-center text-white">Share Your Portfolio</h2>
                <p className="text-slate-400 text-center mt-2 mb-4">Share this secure, read-only link with your doctor.</p>
                <div className="flex items-center space-x-2 bg-slate-700 p-3 rounded-lg">
                    <input type="text" value={shareableLink} readOnly className="flex-grow bg-transparent focus:outline-none text-sm font-mono text-slate-300" />
                    <button onClick={copyToClipboard} className="bg-amber-500 text-black px-3 py-1 rounded-md text-sm hover:bg-amber-400 font-semibold flex items-center transition-colors">
                        <Copy size={14} className="mr-1" />{isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- MODIFIED: Renamed to avoid confusion ---
export const DeleteConfirmModal = ({ onClose, onConfirm }) => (
    <ModalWrapper onClose={onClose}>
        <div className="p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-rose-500" />
            <h2 className="text-xl font-semibold mt-4 text-white">Are you sure?</h2>
            <p className="text-slate-400 mt-2">This action cannot be undone. All data for this record will be permanently deleted.</p>
            <div className="flex justify-center space-x-4 mt-6">
                <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600">Delete</button>
            </div>
        </div>
    </ModalWrapper>
);

// --- NEW: A modal to confirm account deletion ---
export const DeleteAccountModal = ({ onClose, user }) => {
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            await deleteUser(user);
            // The onAuthStateChanged listener in App.js will handle the rest
            onClose();
        } catch (error) {
            console.error("Error deleting account:", error);
            // This is a common security feature. For production, you would need
            // to prompt the user to re-enter their password.
            setError("Could not delete account. Please log out and log back in to try again.");
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6 text-center">
                <AlertTriangle size={48} className="mx-auto text-rose-500" />
                <h2 className="text-xl font-semibold mt-4 text-white">Permanently Delete Account?</h2>
                <p className="text-slate-400 mt-2">This is irreversible. All of your medical records and account data will be permanently deleted. Are you absolutely sure?</p>
                {error && <p className="text-rose-400 bg-rose-900/50 p-2 rounded-md mt-4 text-sm">{error}</p>}
                <div className="flex justify-center space-x-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white">Cancel</button>
                    <button onClick={handleDelete} className="px-6 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600">Yes, Delete My Account</button>
                </div>
            </div>
        </ModalWrapper>
    );
};
