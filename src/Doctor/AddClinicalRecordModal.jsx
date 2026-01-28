import React, { useState } from 'react';
import {  X, Upload, FileText, User, Calendar, AlertTriangle, CheckCircle, Loader, Bot, Sparkles, Printer, Eye, RefreshCcw, UserPlus, Camera, Trash2, Pill  } from '../components/Icons';
import ReactMarkdown from 'react-markdown';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Import auth from main firebase config
import curebirdLogo from '../curebird_logo.png';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TabButton = ({ children, active, onClick, colorClass = "text-amber-400" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`relative flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group border ${active
                ? 'bg-amber-500/10 border-amber-500 ' + colorClass
                : 'bg-stone-900 border-white/5 text-stone-500 hover:text-stone-300'
                }`}
        >
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(100px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.15), transparent 80%)`
                    ),
                }}
            />
            <span className="relative z-10">{children}</span>
        </button>
    );
};

const AddClinicalRecordModal = ({ isOpen, onClose, patients = [], user, onRecordAdded, initialData }) => {
    // Firebase instances
    const storage = getStorage();

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = React.useRef(null);
    const [stream, setStream] = useState(null);

    React.useEffect(() => {
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

        canvas.toBlob((blob) => {
             const file = new File([blob], `captured_record_${Date.now()}.jpg`, { type: "image/jpeg" });
             // Use existing handler
             const event = { target: { files: [file] } };
             handleFileChange(event);
             stopCamera();
        }, 'image/jpeg', 0.95);
    };

    // Digitization State
    const [digitizing, setDigitizing] = useState(false);
    const [digitizeError, setDigitizeError] = useState('');
    const [digitalCopy, setDigitalCopy] = useState(null);
    const [showDigitalPreview, setShowDigitalPreview] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        patientId: '',
        title: '',
        diagnosis: '',
        vitals: '',
        type: 'consultation_note',
        description: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'routine',
        medications: [],
        file: null
    });

    // Reset when opening
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                patientId: initialData?.patientId || '',
                title: initialData?.title || '',
                diagnosis: initialData?.diagnosis || '',
                vitals: initialData?.vitals || '',
                type: initialData?.type || 'consultation_note',
                description: initialData?.description || '',
                date: new Date().toISOString().split('T')[0],
                priority: 'routine',
                medications: [],
                file: null
            });
            setPatientSearchQuery('');
            setSuccess(false);
            setError('');
            setLoading(false);
        }
    }, [isOpen, initialData]);

    // Patient Search/Autofill State
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);

    const recordTypes = [
        { id: 'consultation_note', label: 'Consultation Note' },
        { id: 'prescription', label: 'Prescription' },
        { id: 'lab_report', label: 'Lab Report' },
        { id: 'vitals_log', label: 'Vitals Log' },
        { id: 'referral', label: 'Referral' }
    ];

    const priorities = [
        { id: 'routine', label: 'Routine', color: 'text-emerald-400' },
        { id: 'urgent', label: 'Urgent', color: 'text-amber-400' },
        { id: 'critical', label: 'Critical', color: 'text-rose-400' }
    ];

    const [autofilling, setAutofilling] = useState(false);

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, file: file }));
            setDigitalCopy(null);
            setDigitizeError('');

            // Trigger Smart Autofill
            await handleAutofill(file);
        }
    };

    const handleAutofill = async (file) => {
        setAutofilling(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            // SWITCHED TO VLM ENDPOINT
            const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, {
                method: 'POST',
                body: uploadData,
            });

            if (!response.ok) throw new Error("Autofill analysis failed");
            const rawData = await response.json();
            
            // VLM Response Structure:
            // rawData.analysis = { medications: [], diseases: [], digital_copy: "..." }
            // rawData.summary = "..."
            
            const analysis = rawData.analysis || {};
            const summary = rawData.summary || "";
            
            // --- Intelligent Mapping Logic ---
            let newData = { ...formData, file: file }; 

            // 1. Diagnosis (from VLM diseases)
            if (analysis.diseases && analysis.diseases.length > 0) {
                newData.diagnosis = analysis.diseases.join(", ");
            }

            // 2. Medications (Robust VLM extraction)
            if (analysis.medications && Array.isArray(analysis.medications)) {
                newData.medications = analysis.medications.map(m => ({
                    name: m.name || m.medicine_name || m.input || 'Unknown',
                    dosage: typeof m.dosage === 'object' ? (m.dosage.dosage || JSON.stringify(m.dosage)) : (m.dosage || 'As prescribed'),
                    frequency: m.frequency || 'See instructions',
                    status: 'Active'
                }));
            }

            // 3. Description & Summary
            let fullDescription = summary;
            
            // Append formatted medications list to description for readability
            if (newData.medications && newData.medications.length > 0) {
                fullDescription += "\n\n**Extracted Medications:**\n" + newData.medications.map(m => `• ${m.name} - ${m.dosage} (${m.frequency})`).join("\n");
            }

            // --- NEW: Doctor & Hospital Extraction ---
            let extractedDoctor = analysis.doctor_name;
            let extractedHospital = analysis.hospital_name || analysis.clinic_name;
            let extractedDate = analysis.date;

            // Regex Fallbacks if API didn't return specific fields
            if (!extractedDoctor) {
                const drMatch = summary.match(/(?:Dr\.|Doctor)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
                if (drMatch) extractedDoctor = "Dr. " + drMatch[1];
            }

            if (!extractedHospital) {
                const hospMatch = summary.match(/([A-Z][a-z0-9\s]+(?:Hospital|Clinic|Medical Center|Nursing Home|Labs|Diagnostics))/i);
                if (hospMatch) extractedHospital = hospMatch[1].trim();
            }

            if (!extractedDate) {
                // Try to find a date in YYYY-MM-DD or DD/MM/YYYY format
                const dateMatch = summary.match(/\b(\d{4}-\d{2}-\d{2})\b/) || summary.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
                if (dateMatch) {
                    // Normalize to YYYY-MM-DD for input[type="date"]
                    const dStr = dateMatch[1].replace(/\//g, '-');
                    const dObj = new Date(dStr);
                    if (!isNaN(dObj.getTime())) {
                        extractedDate = dObj.toISOString().split('T')[0];
                    }
                }
            }

            // Apply Extracted Info
            if (extractedDate) {
                newData.date = extractedDate;
            }

            if (extractedDoctor || extractedHospital) {
                fullDescription += "\n";
                if (extractedDoctor) fullDescription += `\n**Prescribing Doctor:** ${extractedDoctor}`;
                if (extractedHospital) fullDescription += `\n**Facility:** ${extractedHospital}`;
            }
            // ----------------------------------------
            
            // Append digital copy if available
            if (analysis.digital_copy) {
                setDigitalCopy(analysis.digital_copy); // Set for "Smart Digitization" feature
            }
            
            newData.description = fullDescription;

            // 4. Record Type Inference
            const textContext = (summary + " " + (newData.diagnosis || "")).toLowerCase();
            if (newData.medications.length > 0 || textContext.includes("prescription") || textContext.includes("rx")) {
                newData.type = 'prescription';
            } else if (textContext.includes("lab") || textContext.includes("test") || textContext.includes("report")) {
                newData.type = 'lab_report';
            }

            // 5. Vitals Extraction (Regex Fallback on Summary if structured not available)
            // Note: Current VLM endpoint might not return structured vitals yet, so we scan the summary.
            const vMap = {};
            const combinedText = summary.toLowerCase();

            const bpMatch = combinedText.match(/(?:bp|blood pressure|b\.p)[^0-9]*(\d{2,3}[\/-]\d{2,3})/i);
            if (bpMatch) vMap.bp = bpMatch[1];

            const hrMatch = combinedText.match(/(?:hr|heart rate|pulse)[^0-9]*(\d{2,3})/i);
            if (hrMatch) vMap.heartRate = hrMatch[1];
            
            const tempMatch = combinedText.match(/(?:temp|temperature)[^0-9]*(\d{2,3}(?:\.\d+)?)/i);
            if (tempMatch) vMap.temperature = tempMatch[1];

            const spo2Match = combinedText.match(/(?:spo2|o2|oxygen)[^0-9]*(\d{2,3})%/i);
            if (spo2Match) vMap.spo2 = spo2Match[1];

            if (Object.keys(vMap).length > 0) newData.vitals = vMap;
            // If structured vitals come in future VLM update, add check here.

            // 6. Patient Name (Regex Scan on Summary)
            // VLM endpoint output includes summary which might have name.
            let extractedName = null;
            const nameMatch = summary.match(/(?:patient|name)[\s:-]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
            if (nameMatch) {
               extractedName = nameMatch[1];
            } else {
               // Fallback: Look for "Mr./Mrs. X"
               const honorificMatch = summary.match(/(?:Mr\.|Ms\.|Mrs\.)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
               if (honorificMatch) extractedName = honorificMatch[1];
            }

            if (extractedName) {
                setPatientSearchQuery(extractedName);
                // Try to auto-match existing patient
                if (patients) {
                    const match = patients.find(p => p.name.toLowerCase().includes(extractedName.toLowerCase()));
                    if (match) newData.patientId = match.id;
                }
            }

            setFormData(newData);
            console.log("Auto-fill complete", newData);

        } catch (error) {
            console.error("Autofill error:", error);
            // Fail silently so user can manually enter
        } finally {
            setAutofilling(false);
        }
    };

    const handleDigitize = async () => {
        // ... (Keep existing handleDigitize if user wants explicit full OCR later, or we can leave it)
        // For now, I'll perform a simplified version or just return since we did autofill.
        // But the user might want the specific 'Digital Transcript' feature.
        // I will largely leave the original logic available but the button calls this.
        if (!formData.file) return;
        setDigitizing(true);
        setDigitizeError('');
        const uploadData = new FormData();
        uploadData.append('file', formData.file);
        try {
            const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, { method: 'POST', body: uploadData });
            if (!response.ok) throw new Error("Digitization failed");
            const data = await response.json();
            if (data.analysis?.digital_copy) setDigitalCopy(data.analysis.digital_copy);
        } catch (err) { setDigitizeError(err.message); }
        finally { setDigitizing(false); }
    };

    const handlePrintDigitalCopy = () => {
        if (!digitalCopy) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Medical Record Digital Copy</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        body { font-family: 'Inter', sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; }
                        h1, h2, h3 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #334155; }
                        th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
                        strong { color: #0f172a; }
                        .header { margin-bottom: 40px; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1 style="margin:0; border:none; padding:0; font-size: 24px;">DIGITAL TRANSCRIPT</h1>
                            <p style="margin:5px 0 0; color: #f59e0b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">CureBird Verified Record</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <img src="${window.location.origin + curebirdLogo}" alt="CureBird Logo" style="height: 40px; margin-bottom: 5px;" />
                            <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                        </div>
                    </div>
                    <div class="content">
                        ${document.getElementById('modal-markdown-hidden')?.innerHTML || ''}
                    </div>
                    <div class="footer">
                        <p>Generated by CureBird AI • Verified Digitization</p>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // NEW: Auto-Create Patient Feature
            if (!formData.patientId && patientSearchQuery) {
                // Determine First/Last name roughly
                const nameParts = patientSearchQuery.trim().split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                const newPatientRef = await addDoc(collection(db, "patients"), {
                    name: patientSearchQuery.trim(),
                    firstName: firstName,
                    lastName: lastName,
                    age: 0, // Default/Unknown
                    gender: 'Unknown',
                    dob: new Date().toISOString().split('T')[0], // Default to today
                    bloodType: 'Unknown',
                    condition: formData.diagnosis || 'Undiagnosed',
                    status: 'Stable',
                    allergies: 'None',
                    phone: '',
                    email: '',
                    address: '',
                    lastVisit: 'Just now',
                    createdAt: serverTimestamp(),
                    doctorId: user?.uid || auth.currentUser?.uid
                });

                // Use the new ID
                formData.patientId = newPatientRef.id;
            }

            if (!formData.patientId) throw new Error("Please select or enter a patient name.");
            if (!formData.title) throw new Error("Please enter a record title.");

            let fileUrl = '';
            let fileName = '';

            if (formData.file) {
                fileName = formData.file.name;
                const storageRef = ref(storage, `records/${formData.patientId}/${Date.now()}-${fileName}`);
                const uploadTask = uploadBytesResumable(storageRef, formData.file);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            const recordData = {
                type: formData.type,
                title: formData.title,
                diagnosis: formData.diagnosis || '',
                vitals: formData.vitals || '',
                description: formData.description,
                date: formData.date,
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. CureBird',
                patientId: formData.patientId,
                patientName: patientSearchQuery || patients.find(p => p.id === formData.patientId)?.name || 'Unknown Patient',
                priority: formData.priority,
                medications: formData.medications || [],
                fileUrl,
                fileName,
                createdAt: serverTimestamp(),
                status: 'finalized'
            };

            // 1. Save to Patient's Record (Subcollection)
            const patientRecordRef = collection(db, `users/${formData.patientId}/medical_records`);
            await addDoc(patientRecordRef, recordData);

            // 2. Save to Main Medical Records Collection (For Doctor Dashboard)
            const mainRecordRef = collection(db, 'medical_records');
            await addDoc(mainRecordRef, recordData);

            setSuccess(true);

            // Construct patient object for navigation
            const patientObj = patients.find(p => p.id === formData.patientId) || {
                id: formData.patientId,
                name: patientSearchQuery.trim(),
                status: 'Stable', // Default for new
                firstName: patientSearchQuery.trim().split(' ')[0],
                lastName: patientSearchQuery.trim().split(' ').slice(1).join(' ') || '',
                age: 0,
                gender: 'Unknown',
                bloodType: 'Unknown'
            };

            setTimeout(() => {
                onClose();
                // Navigate to workspace
                if (onRecordAdded) onRecordAdded(patientObj);

                // FORCE COMPLETE RESET
                setFormData({
                    patientId: '',
                    title: '',
                    diagnosis: '',
                    vitals: '',
                    type: 'consultation_note',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    priority: 'routine',
                    medications: [],
                    file: null
                });
                setPatientSearchQuery('');
                setSuccess(false);
            }, 1000);
        } catch (err) {
            console.error("Error adding record:", err);
            setError(err.message || "Failed to add record.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Main Card with Rotating Border Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="glass-card w-full max-w-4xl !p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                >

                    {/* Header - Reference Quality Match */}
                    <div className="flex justify-between items-center p-5 border-b border-amber-500/10 bg-black/20 flex-shrink-0">
                        <h2 className="text-xl font-semibold text-white">Add Medical Record</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={24} /></button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        <form id="add-record-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Row 1: Patient & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Patient Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 z-10" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search or Enter New Patient..."
                                            value={patientSearchQuery}
                                            onChange={(e) => {
                                                setPatientSearchQuery(e.target.value);
                                                setFormData({ ...formData, patientId: '' }); // Clear ID on type
                                                setShowPatientSuggestions(true);
                                            }}
                                            onFocus={() => setShowPatientSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowPatientSuggestions(false), 200)}
                                            className="w-full p-2.5 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 sm:text-sm"
                                            required
                                        />

                                        {/* Suggestions Dropdown */}
                                        {showPatientSuggestions && patientSearchQuery && (
                                            <div className="absolute top-[110%] left-0 w-full bg-[#0f0b05] border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                                {patients.filter(p => p.name.toLowerCase().includes(patientSearchQuery.toLowerCase())).length > 0 ? (
                                                    patients.filter(p => p.name.toLowerCase().includes(patientSearchQuery.toLowerCase())).map(p => (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => {
                                                                setPatientSearchQuery(p.name);
                                                                setFormData({ ...formData, patientId: p.id });
                                                                setShowPatientSuggestions(false);
                                                            }}
                                                            className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm text-stone-300 hover:text-white transition-colors flex items-center justify-between"
                                                        >
                                                            <span>{p.name}</span>
                                                            {p.id === formData.patientId && <CheckCircle size={14} className="text-amber-500" />}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-3 text-xs text-amber-500/70 font-bold uppercase tracking-wider flex items-center gap-2">
                                                        <UserPlus size={14} />
                                                        <span>New Patient will be created</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Record Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full p-2.5 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all [color-scheme:dark] sm:text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Record Type</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-2.5 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer sm:text-sm"
                                        >
                                            {recordTypes.map(t => <option key={t.id} value={t.id} className="bg-stone-900">{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Priority</label>
                                    <div className="relative">
                                        <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full p-2.5 pl-10 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all appearance-none cursor-pointer sm:text-sm"
                                        >
                                            {priorities.map(p => <option key={p.id} value={p.id} className="bg-stone-900">{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Clinical Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Annual Cardiovascular Assessment"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2.5 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Primary Diagnosis</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hypertension, Type 2 Diabetes"
                                        value={formData.diagnosis || ''}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                        className="w-full p-2.5 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Medical Parameters (Vitals) */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Medical Parameters (Vitals)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BP: 120/80, HR: 72 bpm, SpO2: 98%"
                                    value={formData.vitals || ''}
                                    onChange={(e) => setFormData({ ...formData, vitals: e.target.value })}
                                    className="w-full p-2.5 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 sm:text-sm"
                                />
                            </div>

                            {/* Row 5: Detailed Observations */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Clinical Details & Observations</label>
                                <textarea
                                    rows={5}
                                    placeholder="Enter full clinical observations, symptoms, and assessments..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border bg-black/30 border-amber-500/10 rounded-xl text-slate-200 focus:border-amber-500/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 custom-scrollbar resize-none leading-relaxed sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Row 5: Reference Quality Upload Section */}
                            <div className="pt-4 border-t border-amber-500/10 space-y-4">
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-amber-500/20 border-dashed rounded-2xl bg-black/20 hover:bg-black/30 transition-colors group">
                                    <div className="space-y-1 text-center">
                                        <div className="mx-auto h-12 w-12 text-amber-500/60 group-hover:text-amber-400 transition-colors mb-2 drop-shadow-lg flex items-center justify-center">
                                            <Upload size={32} />
                                        </div>
                                        <div className="flex text-sm text-slate-400 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-amber-500/5 px-4 py-2 rounded-xl font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all shadow-lg">
                                                <span>{formData.file ? 'Change File' : 'Upload PDF or Image'}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/*" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500 pt-2">{formData.file ? formData.file.name : 'No file selected'}</p>
                                    </div>
                                    
                                     {/* Autofill Overlay */}
                                    {autofilling && (
                                        <div className="absolute inset-0 bg-stone-900/90 rounded-2xl flex flex-col items-center justify-center z-30 transition-all backdrop-blur-sm border border-amber-500/20">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                                <Sparkles size={20} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                            </div>
                                            <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-3 animate-pulse">AI Autofilling...</p>
                                        </div>
                                    )}
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

                                {loading && uploadProgress > 0 && (
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden border border-white/5">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="bg-gradient-to-r from-sky-500 to-amber-500 h-full rounded-full transition-all duration-300" />
                                        <p className="text-[10px] text-slate-400 mt-1 text-center font-bold uppercase tracking-widest">{Math.round(uploadProgress)}% Uploaded</p>
                                    </div>
                                )}
                            </div>

                            {/* Hidden element for printing */}
                            {/* Hidden element for printing */}
                            <div id="modal-markdown-hidden" style={{ display: 'none' }}>
                                <div className="prose prose-slate max-w-none text-black prose-headings:text-black prose-p:text-black prose-td:text-black prose-strong:text-black">
                                    {digitalCopy && <ReactMarkdown>{digitalCopy}</ReactMarkdown>}
                                </div>
                            </div>

                            {/* Digitization Actions (Only if file is selected) */}
                            {formData.file && (
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className="text-amber-500" />
                                            <span className="text-sm font-bold text-white">Smart Digitization</span>
                                        </div>
                                        {digitalCopy && (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle size={10} /> Ready
                                            </span>
                                        )}
                                    </div>

                                    {!digitalCopy ? (
                                        <button
                                            type="button"
                                            onClick={handleDigitize}
                                            disabled={digitizing}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-800 hover:bg-amber-500/10 hover:text-amber-400 text-slate-400 border border-slate-700 hover:border-amber-500/50 transition-all text-xs font-bold uppercase tracking-wider group"
                                        >
                                            {digitizing ? (
                                                <><Loader size={14} className="animate-spin" /> Processing...</>
                                            ) : (
                                                <><Bot size={14} /> Convert to Digital Text</>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowDigitalPreview(!showDigitalPreview)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                                            >
                                                <Eye size={14} /> {showDigitalPreview ? 'Hide Preview' : 'View Text'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handlePrintDigitalCopy}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-black border border-amber-500 hover:bg-amber-400 transition-all text-xs font-bold uppercase tracking-wider"
                                            >
                                                <Printer size={14} /> Print
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDigitize}
                                                className="px-3 py-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all"
                                                title="Regenerate"
                                            >
                                                <RefreshCcw size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {digitizeError && (
                                        <div className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded flex items-center gap-2">
                                            <AlertTriangle size={12} /> {digitizeError}
                                        </div>
                                    )}

                                    {/* Inline Preview */}
                                    {showDigitalPreview && digitalCopy && (
                                        <div className="mt-2 p-4 bg-white text-slate-900 rounded-lg max-h-60 overflow-y-auto border-l-4 border-amber-500 shadow-inner">
                                            <div className="prose prose-slate max-w-none prose-sm 
                                                prose-headings:text-slate-900 
                                                prose-p:text-slate-800 
                                                prose-strong:text-slate-900 
                                                prose-td:text-slate-700">
                                                <ReactMarkdown>{digitalCopy}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Inline Save Button (Backup) */}
                            <div className="pt-4 pb-2">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    {loading ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer - Reference Quality Match */}
                    <div className="flex justify-end p-5 border-t border-amber-500/10 gap-3 bg-black/20 flex-shrink-0">
                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest mr-auto">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-amber-500/10 text-slate-300 hover:bg-amber-500/5 transition-colors font-bold">Cancel</button>
                        <button 
                            form="add-record-form"
                            type="submit" 
                            disabled={loading || success}
                            className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none flex items-center gap-2"
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            {loading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddClinicalRecordModal;
