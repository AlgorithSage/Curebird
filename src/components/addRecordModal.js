import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { API_BASE_URL } from '../config'; // Import API wrapper

// NOTE: Make sure you have initialized Firebase in your main App.js or a firebase.js config file
// import { app } from './firebase'; // Example import
// const storage = getStorage(app);
// const db = getFirestore(app);

const AddRecordModal = ({ closeModal, userId }) => {
    // Dummy Firebase instances for demonstration. Replace with your actual initialized instances.
    const storage = getStorage();
    const db = getFirestore();

    const [recordType, setRecordType] = useState('Prescription');
    const [date, setDate] = useState('');
    const [doctor, setDoctor] = useState('');
    const [details, setDetails] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isAutofilling, setIsAutofilling] = useState(false); // New AI state
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Trigger AI Auto-fill
            await handleAutofill(selectedFile);
        }
    };

    const handleAutofill = async (file) => {
        setIsAutofilling(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/analyzer/process`, {
                method: 'POST',
                body: uploadData,
            });

            if (!response.ok) throw new Error("Analysis failed");
            const rawData = await response.json();

            const analysis = rawData.analysis || {};
            const summary = rawData.summary || "";

            // 1. Extract Date
            let extractedDate = analysis.date;
            if (!extractedDate) {
                const dateMatch = summary.match(/\b(\d{4}-\d{2}-\d{2})\b/) || summary.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
                if (dateMatch) {
                    const dStr = dateMatch[1].replace(/\//g, '-');
                    const dObj = new Date(dStr);
                    if (!isNaN(dObj.getTime())) extractedDate = dObj.toISOString().split('T')[0];
                }
            }
            if (extractedDate) setDate(extractedDate);

            // 2. Extract Doctor
            let extractedDoctor = analysis.doctor_name;
            if (!extractedDoctor) {
                const drMatch = summary.match(/(?:Dr\.|Doctor)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
                if (drMatch) extractedDoctor = "Dr. " + drMatch[1];
            }
            if (extractedDoctor) setDoctor(extractedDoctor);

            // 3. Build Details (Summary + Meds)
            let builtDetails = summary;

            if (analysis.medications && analysis.medications.length > 0) {
                builtDetails += "\n\nMedications:\n" + analysis.medications.map(m => `- ${m.name} (${m.dosage || 'N/A'})`).join("\n");
            }

            if (analysis.hospital_name) {
                builtDetails += `\n\nFacility: ${analysis.hospital_name}`;
            }

            if (builtDetails) setDetails(builtDetails);

            // 4. Infer Type
            if (analysis.medications?.length > 0 || summary.toLowerCase().includes('prescription')) {
                setRecordType('Prescription');
            } else if (summary.toLowerCase().includes('lab') || summary.toLowerCase().includes('blood')) {
                setRecordType('Blood Test');
            }

        } catch (err) {
            console.error("AI Auto-fill error:", err);
            // Non-blocking error, user can type manually
        } finally {
            setIsAutofilling(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        if (!userId) {
            setError('You must be logged in to upload records.');
            return;
        }

        // FREE TIER LIMIT: Check Record Count
        try {
            const { getCountFromServer, query: qQuery, collection: qCollection } = await import('firebase/firestore');
            // We need to fetch the user profile to check tier
            const { doc: qDoc, getDoc: qGetDoc } = await import('firebase/firestore');
            const userRef = qDoc(db, 'users', userId);
            const userSnap = await qGetDoc(userRef);
            const userData = userSnap.data();
            const subscriptionTier = userData?.subscriptionTier || 'Free';

            if (subscriptionTier === 'Free') {
                const coll = qCollection(db, `users/${userId}/records`);
                const snapshot = await getCountFromServer(coll);
                const count = snapshot.data().count;

                if (count >= 10) {
                    setError('Free Tier Limit Reached (10 Docs). Upgrade to Premium to upload more.');
                    return;
                }
            }
        } catch (err) {
            console.error("Error checking limits:", err);
            // Verify defensively if check fails? For now, allow or just log.
        }

        setIsUploading(true);
        setError('');

        // 1. Create a storage reference
        // Unique path for each user and file: `records/{userId}/{timestamp}-{fileName}`
        const storageRef = ref(storage, `records/${userId}/${Date.now()}-${file.name}`);

        // 2. Start the upload task
        const uploadTask = uploadBytesResumable(storageRef, file);

        // 3. Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(Math.round(progress));
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                setError('File upload failed. Please try again.');
                setIsUploading(false);
            },
            () => {
                // 4. Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    console.log('File available at', downloadURL);

                    // 5. Save the record metadata (including the file URL) to Firestore
                    try {
                        await addDoc(collection(db, `users/${userId}/records`), {
                            recordType,
                            date,
                            doctor,
                            details,
                            fileUrl: downloadURL,
                            fileName: file.name,
                            createdAt: serverTimestamp()
                        });

                        // Reset state and close modal
                        setIsUploading(false);
                        closeModal();

                    } catch (dbError) {
                        console.error("Error writing document to Firestore: ", dbError);
                        setError('Failed to save record. Please try again.');
                        setIsUploading(false);
                    }
                });
            }
        );
    };


    const modalVariants = {
        hidden: { opacity: 0, scale: 0.7, y: 200, rotateX: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 22,
                stiffness: 180,
                duration: 0.7
            }
        },
        exit: { opacity: 0, scale: 0.8, y: 100, transition: { duration: 0.3 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, filter: "blur(10px)", scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform max-h-[92vh] overflow-y-auto"
                >
                    <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">Add New Medical Record</motion.h2>
                    <form onSubmit={handleFormSubmit}>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <motion.div variants={itemVariants} className="relative">
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${isAutofilling ? 'animate-pulse bg-blue-50' : ''}`} />
                                {isAutofilling && <span className="absolute right-2 top-2 text-xs text-blue-500 font-bold">AI...</span>}
                            </motion.div>
                            <motion.select variants={itemVariants} value={recordType} onChange={e => setRecordType(e.target.value)} className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Prescription</option>
                                <option>Blood Test</option>
                                <option>X-Ray</option>
                                <option>ECG</option>
                                <option>Other</option>
                            </motion.select>
                            <motion.div variants={itemVariants} className="relative">
                                <input type="text" placeholder="Doctor's Name" value={doctor} onChange={e => setDoctor(e.target.value)} required className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${isAutofilling ? 'animate-pulse bg-blue-50' : ''}`} />
                            </motion.div>
                            <motion.div variants={itemVariants} className="relative">
                                <input type="text" placeholder="Details / Diagnosis" value={details} onChange={e => setDetails(e.target.value)} className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${isAutofilling ? 'animate-pulse bg-blue-50' : ''}`} />
                            </motion.div>
                        </motion.div>

                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                                Upload Document (PDF, IMG, etc.)
                            </label>
                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all ${isAutofilling ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
                                <div className="space-y-1 text-center">
                                    {isAutofilling ? (
                                        <div className="flex flex-col items-center py-4">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <p className="text-sm text-blue-600 font-bold animate-pulse">Analyzing Document...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            {file && <p className="text-xs text-gray-500">{file.name}</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs italic mb-4">{error}</motion.p>}

                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button type="button" onClick={closeModal} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors text-sm uppercase tracking-wide">
                                Cancel
                            </button>
                            <button type="submit" disabled={isUploading || isAutofilling} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] text-sm uppercase tracking-wide shadow-lg shadow-blue-500/20">
                                {isUploading ? `Uploading... ${uploadProgress}%` : 'Add Record'}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddRecordModal;
