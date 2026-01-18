import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    deleteDoc,
    setDoc,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    deleteObject,
    getMetadata
} from 'firebase/storage';
import { API_BASE_URL } from '../config';
import { db, storage } from '../firebase';

/**
 * Service to handle Disease-Centric Data interactions.
 */
export const DiseaseService = {

    async getDiseaseInsight(disease, metrics) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/disease-insight`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disease, metrics })
            });

            if (!response.ok) throw new Error("Failed to get AI insight");
            return await response.json();
        } catch (error) {
            console.error("AI Insight Error:", error);
            // Return Fallback/Dummy data if API fails so UI doesn't break
            return {
                patientView: {
                    title: "Trend Analysis Unavailable",
                    explanation: "We couldn't generate a personalized insight right now. Please try again later.",
                    action: "Continue monitoring your levels as prescribed."
                },
                doctorView: {
                    points: ["Analysis service unreachable", "Review raw data points manually"]
                }
            };
        }
    },

    /**
     * Initialize a new disease or return existing one if name matches (De-duplication).
     * @param {string} userId - Auth UID
     * @param {object} diseaseData - { name, diagnosisDate, status, severity, primaryDoctor, metadata }
     * @returns {Promise<string>} - The new or existing Disease ID
     */
    async addDisease(userId, diseaseData) {
        try {
            // Check for existing disease with same name (case-insensitive)
            const diseasesRef = collection(db, 'users', userId, 'diseases');
            const q = query(diseasesRef, where('name', '==', diseaseData.name)); // Ideally use a normalized field for better match
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Return existing ID
                const existingDoc = snapshot.docs[0];
                const existingData = existingDoc.data();

                // Merge Logic: Update 'updatedAt' and doctor info
                await updateDoc(doc(db, 'users', userId, 'diseases', existingDoc.id), {
                    updatedAt: serverTimestamp(),
                    // Treat primaryDoctor as the "latest active" for simple view, but track all in doctors list.
                    primaryDoctor: diseaseData.primaryDoctor || existingData.primaryDoctor,
                    doctors: (existingData.doctors || []).includes(diseaseData.primaryDoctor)
                        ? (existingData.doctors || [])
                        : [...(existingData.doctors || []), diseaseData.primaryDoctor].filter(Boolean)
                });

                return existingDoc.id;
            }

            // Create new if not found
            const docRef = await addDoc(diseasesRef, {
                ...diseaseData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                doctors: diseaseData.primaryDoctor ? [diseaseData.primaryDoctor] : [] // Initialize doctors array
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding disease:", error);
            throw error;
        }
    },

    /**
     * Delete a disease.
     * @param {string} userId
     * @param {string} diseaseId
     */
    async deleteDisease(userId, diseaseId) {
        try {
            const diseaseRef = doc(db, 'users', userId, 'diseases', diseaseId);
            await deleteDoc(diseaseRef);
        } catch (error) {
            console.error("Error deleting disease:", error);
            throw error;
        }
    },

    /**
     * Fetch all diseases for a patient.
     * @param {string} userId 
     * @returns {Promise<Array>} List of diseases with IDs
     */
    async getDiseases(userId) {
        try {
            const diseasesRef = collection(db, 'users', userId, 'diseases');
            // Sort by status (active first) then createdAt
            const q = query(diseasesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching diseases:", error);
            throw error;
        }
    },

    /**
     * Add a tracked metric for a specific disease.
     * @param {string} userId 
     * @param {string} diseaseId 
     * @param {object} metricData - { type, value, unit, source, context, timestamp }
     */
    async addMetric(userId, diseaseId, metricData) {
        try {
            const metricsRef = collection(db, 'users', userId, 'diseases', diseaseId, 'metrics');

            // Robust Deduplication: Client-side check on recent entries.
            // We fetch the last 10 metrics of this type to see if this value/date was already logged.
            // This avoids complex Firestore queries that might require indexes.
            if (metricData.timestamp) {
                const checkDate = new Date(metricData.timestamp);
                const startOfDay = new Date(checkDate); startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(checkDate); endOfDay.setHours(23, 59, 59, 999);

                // Simple query: Get recent metrics of this type
                const q = query(
                    metricsRef,
                    where('type', '==', metricData.type),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );

                // Note: If this query fails due to index (Type + Timestamp sort), 
                // we can just fall back to no-sort, or just simple fetch. 
                // But usually type+timestamp index is standard or auto-created for simple fields.
                // Safest fall back: just query by type and filter in JS.
                const safeQ = query(metricsRef, where('type', '==', metricData.type), limit(20));

                const recentSnapshot = await getDocs(safeQ);

                const isDuplicate = recentSnapshot.docs.some(doc => {
                    const data = doc.data();
                    if (!data.timestamp) return false;

                    const dDate = new Date(data.timestamp.seconds * 1000);
                    const isSameDay = dDate >= startOfDay && dDate <= endOfDay;
                    const isSameValue = String(data.value) === String(metricData.value);

                    return isSameDay && isSameValue;
                });

                if (isDuplicate) {
                    console.log(`Duplicate metric skipped: ${metricData.type}`);
                    return; // Skip adding
                }
            }

            await addDoc(metricsRef, {
                ...metricData,
                timestamp: metricData.timestamp || serverTimestamp()
            });

            // Update the parent disease 'lastUpdated' field
            const diseaseRef = doc(db, 'users', userId, 'diseases', diseaseId);
            await updateDoc(diseaseRef, {
                updatedAt: serverTimestamp()
            });

        } catch (error) {
            console.error("Error adding metric:", error);
            throw error;
        }
    },

    /**
     * Get metrics for a specific type (e.g., 'fasting_sugar')
     * @param {string} userId 
     * @param {string} diseaseId 
     * @param {string} metricType 
     * @param {number} limitCount 
     */
    async getMetrics(userId, diseaseId, metricType, limitCount = 20) {
        try {
            const metricsRef = collection(db, 'users', userId, 'diseases', diseaseId, 'metrics');
            const q = query(
                metricsRef,
                where('type', '==', metricType),
                // orderBy('timestamp', 'desc'), // REMOVED: Requires composite index
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort (Newest first)
            return docs.sort((a, b) => {
                const tA = a.timestamp?.seconds || 0;
                const tB = b.timestamp?.seconds || 0;
                return tB - tA;
            }).reverse(); // Return in chronological order (Oldest -> Newest) for graphs
        } catch (error) {
            console.error("Error fetching metrics:", error);
            throw error;
        }
    },

    /**
     * Delete a specific metric.
     * @param {string} userId
     * @param {string} diseaseId
     * @param {string} metricId
     */
    async deleteMetric(userId, diseaseId, metricId) {
        try {
            const metricRef = doc(db, 'users', userId, 'diseases', diseaseId, 'metrics', metricId);
            await deleteDoc(metricRef);
        } catch (error) {
            console.error("Error deleting metric:", error);
            throw error;
        }
    },

    /**
     * Delete ALL metrics for a disease (RESET).
     * @param {string} userId
     * @param {string} diseaseId
     */
    async deleteAllMetrics(userId, diseaseId) {
        try {
            const metricsRef = collection(db, 'users', userId, 'diseases', diseaseId, 'metrics');
            const snapshot = await getDocs(metricsRef);

            if (snapshot.empty) return;

            // Firestore Batch Limit is 500
            const batch = writeBatch(db);
            let count = 0;

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                count++;
            });

            await batch.commit();
            console.log(`Deleted ${count} metrics.`);

            // Reset disease updated timestamp
            const diseaseRef = doc(db, 'users', userId, 'diseases', diseaseId);
            await updateDoc(diseaseRef, {
                updatedAt: serverTimestamp()
            });

        } catch (error) {
            console.error("Error deleting all metrics:", error);
            throw error;
        }
    },

    /**
     * Link an existing medical record to a disease.
     * @param {string} userId 
     * @param {string} recordId 
     * @param {string} diseaseId 
     */
    async linkRecordToDisease(userId, recordId, diseaseId) {
        try {
            const recordRef = doc(db, 'users', userId, 'medical_records', recordId);
            const recordSnap = await getDoc(recordRef);

            if (recordSnap.exists()) {
                const currentLinks = recordSnap.data().relatedDiseaseIds || [];
                if (!currentLinks.includes(diseaseId)) {
                    await updateDoc(recordRef, {
                        relatedDiseaseIds: [...currentLinks, diseaseId]
                    });
                }
            }
        } catch (error) {
            console.error("Error linking record:", error);
            throw error;
        }
    },

    /**
     * Upload a document for a specific disease condition.
     * @param {string} userId
     * @param {string} diseaseId
     * @param {File} file
     * @returns {Promise<object>} Metadata of uploaded file
     */
    async uploadDocument(userId, diseaseId, file) {
        try {
            // 1. Upload to Storage
            const storagePath = `users/${userId}/diseases/${diseaseId}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Save Metadata to Firestore
            // We store metadata in a subcollection so we can query/sort/filter easily
            const docRef = await addDoc(collection(db, 'users', userId, 'diseases', diseaseId, 'documents'), {
                name: file.name,
                url: downloadURL,
                storagePath: storagePath,
                type: file.type,
                size: file.size,
                uploadedAt: serverTimestamp()
            });

            return { id: docRef.id, name: file.name, url: downloadURL };
        } catch (error) {
            console.error("Error uploading document:", error);
            throw error;
        }
    },

    /**
     * Analyze a document to extract clinical metrics.
     * @param {File} file 
     * @returns {Promise<object>} Extracted data
     */
    async analyzeDocument(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/api/analyze-report`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Analysis failed");
            return await response.json();
        } catch (error) {
            console.error("Error analyzing document:", error);
            throw error;
        }
    },

    /**
     * Get list of documents for a disease.
     * @param {string} userId 
     * @param {string} diseaseId 
     */
    async getDocuments(userId, diseaseId) {
        try {
            const docsRef = collection(db, 'users', userId, 'diseases', diseaseId, 'documents');
            const q = query(docsRef, orderBy('uploadedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error;
        }
    },

    /**
     * Delete a document.
     * @param {string} userId 
     * @param {string} diseaseId 
     * @param {string} docId 
     * @param {string} storagePath 
     */
    async deleteDocument(userId, diseaseId, docId, storagePath) {
        try {
            // 1. Delete from Storage
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);

            // 2. Delete from Firestore
            await deleteDoc(doc(db, 'users', userId, 'diseases', diseaseId, 'documents', docId));
        } catch (error) {
            console.error("Error deleting document:", error);
            throw error;
        }
    }
};
