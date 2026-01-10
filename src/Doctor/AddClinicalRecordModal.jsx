import React, { useState } from 'react';
import { X, Upload, FileText, User, Calendar, AlertTriangle, CheckCircle, Loader, Bot, Sparkles, Printer, Eye, RefreshCcw, UserPlus } from 'lucide-react';
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

const AddClinicalRecordModal = ({ isOpen, onClose, patients = [], user }) => {
    // Firebase instances
    const storage = getStorage();

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
        file: null
    });

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
            // Use the robust analysis endpoint
            const response = await fetch(`${API_BASE_URL}/api/analyze-report`, {
                method: 'POST',
                body: uploadData,
            });

            if (!response.ok) throw new Error("Autofill analysis failed");
            const data = await response.json();

            // --- Intelligent Mapping Logic ---
            let newData = { ...formData, file: file }; // specific spread to keep file

            // 1. Diagnosis & Vitals Mapping
            if (data.key_findings && data.key_findings.length > 0) {
                // Enhanced Diagnosis Inference: Join top 2 findings or use as is
                newData.diagnosis = data.key_findings.slice(0, 2).join(", ");
            }

            if (data.extracted_vitals && data.extracted_vitals.length > 0) {
                // Format Vitals as string
                newData.vitals = data.extracted_vitals.map(v => `${v.label}: ${v.value}`).join(", ");
            }

            // 2. Description & Summary
            let fullDescription = data.summary || "";
            if (data.medication_adjustments && data.medication_adjustments.length > 0) {
                fullDescription += "\n\nMedications:\n• " + data.medication_adjustments.map(m => `${m.name} (${m.action})`).join("\n• ");
            }
            if (fullDescription) newData.description = fullDescription;

            // 2. Title Inference
            if (data.title && data.title !== "Clinical Document" && data.title !== "Analyzed Report") {
                newData.title = data.title;
            } else if (data.fileName) {
                // Clean up filename for a decent title
                newData.title = data.fileName.replace(/\.[^/.]+$/, "").split('_').join(' ').split('-').join(' ');
            }

            // 3. Date Extraction
            if (data.date) {
                newData.date = data.date;
            }

            // 4. Type Context Inference
            const textContext = (data.summary + " " + (data.title || "")).toLowerCase();
            if (textContext.includes("prescription") || textContext.includes("rx") || textContext.includes("medication")) newData.type = 'prescription';
            else if (textContext.includes("lab") || textContext.includes("blood") || textContext.includes("panel") || textContext.includes("test")) newData.type = 'lab_report';
            else if (textContext.includes("referral") || textContext.includes("letter")) newData.type = 'referral';
            else if (textContext.includes("vital") || textContext.includes("measurement")) newData.type = 'vitals_log';

            // 5. Priority Inference
            if (textContext.includes("emergency") || textContext.includes("critical") || textContext.includes("severe") || textContext.includes("immediately")) newData.priority = 'critical';
            else if (textContext.includes("urgent") || textContext.includes("acute") || textContext.includes("asap")) newData.priority = 'urgent';

            // 6. Patient Identification (Smart Match or New)

            // Strategy: 1. API Field -> 2. Regex Extraction (Aggressive) -> 3. Context Search
            let extractedName = data.patient_name || data.patientName;

            if (!extractedName && fullDescription) {
                // Stricter Regex: Enforce Capitalized Words (Title Case) to avoid capturing sentences like "patient with multiple..."
                // Removed /i flag to ensure we only capture Proper Nouns
                const namePatterns = [
                    /patient,?\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})(?=[,\.]|\s+is|\s+has|\s+who|\s+was)/,  // "The patient, John Doe," or "patient John Doe is"
                    /name\s*:\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/,                                       // "Name: John Doe"
                    /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3}),?\s+(?:is\s+)?(?:a|an)?\s*\d+\s*-?\s*year/         // "John Doe, 20-year-old"
                ];

                for (let pattern of namePatterns) {
                    const match = fullDescription.match(pattern);
                    if (match) {
                        // Extra check: exclude common false positive words even if capitalized at start of sentence
                        const candidate = match[1];
                        const invalidWords = ["The", "A", "An", "This", "Patient", "With"];
                        if (!invalidWords.includes(candidate.split(' ')[0])) {
                            extractedName = candidate;
                            console.log("Extracted Name via Regex:", extractedName);
                            break;
                        }
                    }
                }
            }

            if (extractedName) {
                // Formatting: Capitalize first letters
                const rawName = extractedName.trim();
                setPatientSearchQuery(rawName); // Pre-fill input with extracted name

                if (patients && patients.length > 0) {
                    const matchedPatient = patients.find(p => p.name.toLowerCase().includes(rawName.toLowerCase()));
                    if (matchedPatient) {
                        newData.patientId = matchedPatient.id;
                        setPatientSearchQuery(matchedPatient.name); // Normalize to existing record name
                    } else {
                        newData.patientId = ''; // Reset ID to indicate new patient creation needed
                    }
                }
            } else if (patients && patients.length > 0) {
                // Fallback: Try finding name in text context if API didn't return explicit field
                const matchedPatient = patients.find(p => textContext.includes(p.name.toLowerCase()));
                if (matchedPatient) {
                    newData.patientId = matchedPatient.id;
                    setPatientSearchQuery(matchedPatient.name);
                }
            }

            setFormData(newData);

            // Also set digital copy if available from this endpoint (it might be in a different format, but let's try)
            // The previous endpoint returned data.analysis.digital_copy. This one returns summary etc.
            // We can treat the summary as the digital copy for now or leave it null.

        } catch (error) {
            console.error("Autofill error:", error);
            // Fail silently on autofill, let user type manually
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
                            <p style="margin:5px 0 0; color: #f59e0b; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Curebird Verified Record</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <img src="${window.location.origin + curebirdLogo}" alt="Curebird Logo" style="height: 40px; margin-bottom: 5px;" />
                            <div style="font-size: 14px; font-weight: bold; color: #64748b;">CUREBIRD</div>
                        </div>
                    </div>
                    <div class="content">
                        ${document.getElementById('modal-markdown-hidden')?.innerHTML || ''}
                    </div>
                    <div class="footer">
                        <p>Generated by Curebird AI • Verified Digitization</p>
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

            const patientRecordRef = collection(db, `users/${formData.patientId}/medical_records`);

            await addDoc(patientRecordRef, {
                type: formData.type,
                title: formData.title,
                diagnosis: formData.diagnosis || '',
                vitals: formData.vitals || '',
                description: formData.description,
                date: formData.date,
                doctorId: user?.uid || auth.currentUser?.uid,
                doctorName: user?.name || user?.displayName || auth.currentUser?.displayName || 'Dr. Curebird',
                patientId: formData.patientId,
                patientName: patientSearchQuery || patients.find(p => p.id === formData.patientId)?.name || 'Unknown Patient',
                priority: formData.priority,
                fileUrl,
                fileName,
                createdAt: serverTimestamp(),
                status: 'finalized'
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setFormData({
                    patientId: '',
                    title: '',
                    diagnosis: '',
                    vitals: '',
                    type: 'consultation_note',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    priority: 'routine',
                    file: null
                });
                setPatientSearchQuery(''); // Reset search input
                setSuccess(false);
            }, 1500);

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
                    className="relative w-full h-full max-w-4xl bg-[#1c1605] rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_120px_rgba(245,158,11,0.08)] border border-amber-500/20"
                >
                    {/* Premium Vibrant Amber Backdrop */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(251,191,36,0.12),_transparent_60%),_radial-gradient(circle_at_75%_75%,_rgba(217,119,6,0.08),_transparent_60%)] pointer-events-none" />

                    {/* Soft Warm Diffusion Layer */}
                    <div className="absolute inset-0 bg-amber-950/20 backdrop-blur-3xl pointer-events-none" />
                    {/* Global Grain/Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {/* Header */}
                    <div className="px-8 py-6 border-b-2 border-amber-500/20 flex items-center justify-between relative bg-gradient-to-r from-amber-500/[0.07] via-transparent to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">Add Clinical Record</h2>
                                <p className="text-[11px] text-amber-500/60 uppercase tracking-[0.3em] font-black mt-1">Medical Documentation</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        <form id="add-record-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Row 1: Patient & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Patient Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 z-10" size={20} />
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
                                            className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl h-[3.8rem] pl-12 pr-6 text-base text-white outline-none transition-all placeholder-stone-700 font-medium"
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

                                <div className="space-y-3">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Record Date</label>
                                    <div className="relative flex items-center bg-[#141211] border border-white/[0.05] focus-within:border-amber-500/30 rounded-xl h-[3.8rem] transition-all font-sans">
                                        <Calendar className="absolute left-4 text-stone-600 focus-within:text-amber-500" size={20} />
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-transparent border-none outline-none pl-12 pr-4 text-base text-white [color-scheme:dark] transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Record Type</label>
                                    <div className="grid grid-cols-2 gap-2 relative">
                                        {recordTypes.slice(0, 2).map(type => (
                                            <TabButton
                                                key={type.id}
                                                active={formData.type === type.id}
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                            >
                                                {type.label}
                                            </TabButton>
                                        ))}
                                    </div>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-[#141211] border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-400 focus:outline-none focus:border-amber-500/30 appearance-none cursor-pointer"
                                    >
                                        {recordTypes.map(t => <option key={t.id} value={t.id} className="bg-stone-900">{t.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Priority</label>
                                    <div className="flex gap-2 relative">
                                        {priorities.map(p => (
                                            <TabButton
                                                key={p.id}
                                                active={formData.priority === p.id}
                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                colorClass={p.color}
                                            >
                                                {p.label}
                                            </TabButton>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Title & Diagnosis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Clinical Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Annual Cardiovascular Assessment"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl h-[3.8rem] px-6 text-base text-white outline-none transition-all placeholder-stone-700 font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Primary Diagnosis</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hypertension, Type 2 Diabetes"
                                        value={formData.diagnosis || ''}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                        className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl h-[3.8rem] px-6 text-base text-white outline-none transition-all placeholder-stone-700 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Medical Parameters (Vitals) */}
                            <div className="space-y-4">
                                <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Medical Parameters (Vitals)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BP: 120/80, HR: 72 bpm, SpO2: 98%"
                                    value={formData.vitals || ''}
                                    onChange={(e) => setFormData({ ...formData, vitals: e.target.value })}
                                    className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-xl h-[3.8rem] px-6 text-base text-white outline-none transition-all placeholder-stone-700 font-medium"
                                />
                            </div>

                            {/* Row 5: Detailed Observations */}
                            <div className="space-y-4">
                                <label className="text-[13px] font-black text-amber-500/70 uppercase tracking-[0.2em] ml-1">Clinical Details & Observations</label>
                                <textarea
                                    rows={5}
                                    placeholder="Enter full clinical observations, symptoms, and assessments..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#141211] border border-white/[0.05] focus:border-amber-500/30 rounded-2xl py-5 px-6 text-base text-white placeholder-stone-800 outline-none transition-all custom-scrollbar resize-none leading-relaxed font-medium"
                                    required
                                />
                            </div>

                            {/* Row 5: File Upload */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.2em] ml-1">Attachment (Optional)</label>
                                <div className="relative border-2 border-dashed border-white/[0.05] group-hover:border-amber-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-slate-950/20 cursor-pointer relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="p-3 bg-stone-900 rounded-full text-stone-500 group-hover:text-amber-500 transition-all mb-3">
                                        <Upload size={22} />
                                    </div>
                                    <p className="text-sm text-stone-400 font-bold tracking-tight">
                                        {formData.file ? formData.file.name : 'Click to Upload or Drag & Drop'}
                                    </p>
                                    <p className="text-[10px] text-stone-700 uppercase tracking-widest mt-1 font-black">PDF, JPG, PNG up to 10MB</p>

                                    {/* Autofill Overlay */}
                                    {autofilling && (
                                        <div className="absolute inset-0 bg-stone-900/90 rounded-2xl flex flex-col items-center justify-center z-30 transition-all backdrop-blur-sm border border-amber-500/20">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                                <Sparkles size={20} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                            </div>
                                            <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-3 animate-pulse">AI Autofilling Details...</p>
                                        </div>
                                    )}
                                </div>
                                {loading && uploadProgress > 0 && (
                                    <div className="w-full h-1 bg-stone-950/50 rounded-full overflow-hidden mt-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-amber-500"
                                        />
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
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t-2 border-amber-500/20 bg-black/40 flex items-center justify-between font-sans">
                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
                                <AlertTriangle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        {!error && !success && <div></div>}

                        {success && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                <CheckCircle size={14} />
                                <span>Entry Secured</span>
                            </div>
                        )}

                        <div className="flex items-center gap-6">
                            <button onClick={onClose} className="text-stone-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Cancel</button>
                            <motion.button
                                form="add-record-form"
                                type="submit"
                                disabled={loading || success}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                {loading ? 'Saving...' : 'Save Record'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddClinicalRecordModal;
