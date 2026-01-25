import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {  Search, MoreVertical, Paperclip, Send, Mic, FileText, CheckCircle, Clock, Bot, Flag, Pill, AlertTriangle, Activity, ChevronRight, Shield, ClipboardCheck, Phone, Video, Calendar, Image, X, Zap, MessageSquare  } from '../../components/Icons';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import InsightReviewModal from './InsightReviewModal';
import GenerateSummaryModal from './actions/GenerateSummaryModal';
import FlagObservationModal from './actions/FlagObservationModal';
import UpdateCarePlanModal from './actions/UpdateCarePlanModal';
import ConsultationStatusModal from './actions/ConsultationStatusModal';
import EscalateRiskModal from './actions/EscalateRiskModal';

const DoctorChat = ({ onNavigateToPatient, initialPatientId }) => {
    const navigate = useNavigate();
    // Firestore Hooks
    const [chats, setChats] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [patients, setPatients] = React.useState([]); // New Patient List State
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loadingChats, setLoadingChats] = React.useState(true);

    // UI State
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [activeAction, setActiveAction] = useState(null); // 'summary', 'flag', 'carePlan', 'status', 'escalate'
    const [isRxModalOpen, setIsRxModalOpen] = useState(false); // Quick Rx State

    const [contextMenu, setContextMenu] = useState(null); // { x, y, messageId }
    const [isVoiceCallActive, setIsVoiceCallActive] = useState(false); // New: In-App Voice Call State
    const [showPatientDetails, setShowPatientDetails] = useState(false); // Feature 1: Patient Snapshot Panel State

    // Auth Check
    React.useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(user => {
            if (user) setCurrentUser(user);
        });
        return () => unsubAuth();
    }, []);

    // Derived Action: Calculate Active Chat Data EARLY (Moved up for dependencies)
    const allChats = React.useMemo(() => {
        const combined = [...chats];
        const existingPatientIds = new Set(chats.map(c => c.patientId));
        patients.forEach(p => {
            if (!existingPatientIds.has(p.id)) {
                combined.push({
                    id: `temp_${p.id}`, 
                    patientId: p.id,
                    patient: p.name,
                    patientName: p.name,
                    condition: p.condition || 'General Care',
                    lastMsg: 'Start a conversation...',
                    time: '',
                    unread: 0,
                    status: p.status === 'Active' ? 'online' : 'offline',
                    avatarColor: 'bg-stone-700',
                    isTemp: true
                });
            }
        });
        return combined;
    }, [chats, patients]);

    const filteredChats = allChats.filter(chat =>
        chat.patient?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let activeChatData = allChats.find(c => c.id === activeChat);

    if (!activeChatData && activeChat && initialPatientId && activeChat === `temp_${initialPatientId.id}`) {
        activeChatData = {
            id: activeChat,
            patientId: initialPatientId.id,
            patient: initialPatientId.name,
            patientName: initialPatientId.name,
            condition: initialPatientId.condition || 'General Care',
            status: 'offline',
            avatarColor: 'bg-stone-700',
            isTemp: true
        };
    }

    // 1. Fetch Conversations (Real-time)
    React.useEffect(() => {
        if (!currentUser) return;
        setLoadingChats(true);
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Helper for display logic
                patient: doc.data().patientName, // Mapped for UI
                time: doc.data().updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'New',
                timestamp: doc.data().updatedAt?.toMillis() || 0, // for sorting
                avatarColor: doc.data().avatarColor || 'bg-stone-700'
            }));
            
            // Client-side sort
            fetchedChats.sort((a, b) => b.timestamp - a.timestamp);
            
            setChats(fetchedChats);
            setLoadingChats(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 1b. Fetch All Patients (To show as potential chats)
    React.useEffect(() => {
        if (!currentUser) return;
        // In a real app, you might filter by assigned doctor. For now, fetch all.
        const q = query(collection(db, 'patients'), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPatients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPatients(fetchedPatients);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. Handle Profile -> Chat Navigation (Dynamic Creation)
    React.useEffect(() => {
        const handleInitialPatient = async () => {
            if (!initialPatientId || !currentUser || loadingChats) return;

            // Normalize input
            const patientObj = typeof initialPatientId === 'object' ? initialPatientId : null;
            if (!patientObj) return;

            // Check if chat already exists
            const existingChat = chats.find(c => c.patientId === patientObj.id);

            if (existingChat) {
                setActiveChat(existingChat.id);
            } else {
                // Check if we already have a temp chat selected
                const tempId = `temp_${patientObj.id}`;
                if (activeChat !== tempId) {
                    setActiveChat(tempId);
                }
            }
        };

        handleInitialPatient();
    }, [initialPatientId, currentUser, chats, loadingChats]); // key dependency loadingChats

    // 3. Fetch Messages for Active Chat
    React.useEffect(() => {
        if (!activeChat) return;

        // If activeChat is a "temporary" ID (e.g. starts with 'temp_'), we don't fetch messages yet.
        // But our logic above creates real chats immediately on selection, so activeChat should always be a real ID eventually.
        // However, if the user clicks a "potential chat" from the list, we need to handle that click to Create the chat.

        // Wait, if activeChat is real, fetch messages
        if (!activeChat.startsWith('temp_')) {
            const msgsRef = collection(db, `chats/${activeChat}/messages`);
            const q = query(msgsRef, orderBy('createdAt', 'asc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMsgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(fetchedMsgs);
            });
            return () => unsubscribe();
        } else {
            setMessages([]); // Clear messages for temp chat
        }
    }, [activeChat]);

    // --- Feature: Live Patient Snapshot Data Fetching ---
    const [snapshotRecords, setSnapshotRecords] = useState([]);
    
    React.useEffect(() => {
        // Only fetch if panel is open and we have a valid patient
        if (!showPatientDetails || !activeChatData || !activeChatData.patientId) return;

        const recordsRef = collection(db, `users/${activeChatData.patientId}/medical_records`);
        // Fetch last 20 records to derive state
        const q = query(recordsRef, orderBy('date', 'desc')); // limit not strictly needed/supported without index sometimes, keeping simple

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSnapshotRecords(fetched);
        });

        return () => unsubscribe();
    }, [showPatientDetails, activeChatData?.patientId]);

    // --- Feature: Live Patient Snapshot Data Fetching (Matches PatientWorkspace Record Logic) ---
    
    // Robust Regex Parsing Helper
    const parseVitalsString = (str) => {
        const v = {};

        // 1. BP: Aggressive Match for "120/80" pattern even without label
        // Must be 2-3 digits / 2-3 digits. Avoids dates like 1/1/2024.
        const bpMatch = str.match(/(?:bp|press|sys)[^0-9]*(\d{2,3}\s*[\/-]\s*\d{2,3})/i) ||
            str.match(/\b(\d{2,3}\s*[\/-]\s*\d{2,3})\s*mmhg/i) ||
            str.match(/\b(1[0-9]{2}|[9]\d)\s*[\/-]\s*([4-9]\d|1\d{2})\b/); // Heuristic: 90-199 / 40-199

        // 2. HR: Look for 'bpm' or explicit label
        const hrMatch = str.match(/(?:hr|heart rate|pulse|rate)[^0-9]*(\d{2,3})/i) || str.match(/(\d{2,3})\s*bpm/i);

        // 3. Temp: Look for 'F'/'C' or explicit label
        const tempMatch = str.match(/(?:temp|t)[^0-9]*(\d{2,3}(?:\.\d+)?)/i) || str.match(/(\d{2,3}(?:\.\d+)?)\s*(?:°|deg)?(?:f|c)\b/i);

        // 4. SpO2: Look for '%' or explicit label
        const spo2Match = str.match(/(?:spo2|o2|sat)[^0-9]*(\d{2,3})/i) || str.match(/(\d{2,3})%/);

        if (bpMatch) v.bp = bpMatch[1].replace(/\s/g, '');
        if (hrMatch) v.heartRate = hrMatch[1];
        if (tempMatch) v.temperature = tempMatch[1];
        if (spo2Match) v.spo2 = spo2Match[1];

        // Sanity Check: Don't return crazy values
        if (v.spo2 && parseInt(v.spo2) > 100) delete v.spo2;

        return v;
    };

    // Helper: Logic to extract latest vitals from records (Deep Scan)
    const getSnapshotVitals = () => {
        const sorted = [...snapshotRecords].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const aggregatedVitals = {};
        
        for (const record of sorted) {
            if (aggregatedVitals.bp && aggregatedVitals.heartRate && aggregatedVitals.temperature && aggregatedVitals.spo2) break; // Stop if full
            
            // 1. EXTRACT FROM STRUCTURED OBJECT
            if (record.vitals && typeof record.vitals === 'object' && !Array.isArray(record.vitals)) {
                if (!aggregatedVitals.bp && record.vitals.bp) aggregatedVitals.bp = record.vitals.bp;
                if (!aggregatedVitals.heartRate && record.vitals.heartRate) aggregatedVitals.heartRate = record.vitals.heartRate;
                if (!aggregatedVitals.temperature && record.vitals.temperature) aggregatedVitals.temperature = record.vitals.temperature;
                if (!aggregatedVitals.spo2 && record.vitals.spo2) aggregatedVitals.spo2 = record.vitals.spo2;
            }

             // 2. TEXT SCANNING (Fallback)
            let textToScan = '';
            if (typeof record.vitals === 'string') textToScan += record.vitals + ' ';
            textToScan += (record.description || '') + ' ' + (record.summary || '');
            
            if (textToScan.trim()) {
                 const text = textToScan.toLowerCase();
                 const parsed = parseVitalsString(text);
                 
                 if (!aggregatedVitals.bp && parsed.bp) aggregatedVitals.bp = parsed.bp;
                 if (!aggregatedVitals.heartRate && parsed.heartRate) aggregatedVitals.heartRate = parsed.heartRate;
                 if (!aggregatedVitals.temperature && parsed.temperature) aggregatedVitals.temperature = parsed.temperature;
                 if (!aggregatedVitals.spo2 && parsed.spo2) aggregatedVitals.spo2 = parsed.spo2;
            }
        }
        return aggregatedVitals;
    };

    // Helper: Logic to extract active meds (Deep Scan including Descriptions)
    const getSnapshotMeds = () => {
        const medicationRecords = snapshotRecords.flatMap(r => {
            // Priority 1: Modern Structured Array
            if (r.medications && Array.isArray(r.medications) && r.medications.length > 0) {
                return r.medications;
            }

            // Priority 2: Legacy Description Parsing (Backfill)
            if (r.description && (r.description.includes('Medications:') || r.description.includes('•'))) {
                const meds = [];
                const lines = r.description.split('\n');
                let inMedsSection = false;

                for (let line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.toLowerCase().includes('medications:')) {
                        inMedsSection = true;
                        continue;
                    }
                    if (inMedsSection || trimmed.startsWith('•') || trimmed.startsWith('-')) {
                        const match = trimmed.match(/^[•\-]?\s*([A-Za-z0-9\s\/\.]+)(\((.*?)\)|$)/);
                        if (match && match[1] && match[1].length > 3) {
                            const name = match[1].trim();
                            if (!['patient', 'diagnosis', 'plan', 'history'].includes(name.toLowerCase())) {
                                meds.push({
                                    name: name,
                                    dosage: match[3] || 'Legacy Record',
                                    freq: 'See Notes',
                                    status: 'Active (Legacy)'
                                });
                            }
                        }
                    }
                    if (inMedsSection && trimmed === '') inMedsSection = false;
                }
                return meds;
            }
            return [];
        });

        // Dedup by name
        const unique = [];
        const seen = new Set();
        medicationRecords.forEach(m => {
            if (m.name && !seen.has(m.name)) {
                unique.push(m);
                seen.add(m.name);
            }
        });
        return unique;
    };

    // 4. Send Message (File)


    // --- Voice Recording Logic ---
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = React.useRef(null);
    const audioChunksRef = React.useRef([]);

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        if (!activeChat) {
             alert("Please select a valid chat first.");
             return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Ensure we have data
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size === 0) {
                     console.warn("Empty audio recording discarded.");
                     return;
                }
                
                const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
                
                setIsUploading(true);
                try {
                     let targetChatId = activeChat;
                     // Handle temp chat creation if needed (Simplified: activeChat must exist for voice for now)
                     
                     const storageRef = ref(storage, `chat_attachments/${targetChatId}/${audioFile.name}`);
                     await uploadBytes(storageRef, audioFile);
                     const url = await getDownloadURL(storageRef);

                     await addDoc(collection(db, `chats/${targetChatId}/messages`), {
                        text: 'Voice Message',
                        fileUrl: url,
                        fileName: audioFile.name,
                        sender: 'doctor',
                        senderId: currentUser.uid,
                        createdAt: serverTimestamp(),
                        type: 'audio',
                        duration: '0:00' 
                    });

                    await updateDoc(doc(db, 'chats', targetChatId), {
                        lastMsg: '🎤 Voice Message',
                        updatedAt: serverTimestamp(),
                    });

                } catch (err) {
                    console.error("Audio upload failed", err);
                } finally {
                    setIsUploading(false);
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Could not start recording", err);
            // Handling permission error gracefully
            alert("Microphone access denied. Please allow microphone permissions in your browser settings.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat || !currentUser) return;

        setIsUploading(true);
        try {
             let targetChatId = activeChat;
             // If temp, create chat logic (Duplicate of handleSendMessage logic)
             if (activeChat.startsWith('temp_')) {
                 const tempPatientId = activeChat.replace('temp_', '');
                 let targetPatient = patients.find(p => p.id === tempPatientId);
                 if (!targetPatient && initialPatientId?.id === tempPatientId) targetPatient = initialPatientId;
                 
                 if (targetPatient) {
                     const newChatRef = await addDoc(collection(db, 'chats'), {
                        patientId: targetPatient.id,
                        doctorId: currentUser.uid,
                        participants: [currentUser.uid, targetPatient.id], 
                        patientName: targetPatient.name,
                        condition: targetPatient.condition || 'General Care',
                        status: 'offline',
                        lastMsg: 'Sent an attachment', 
                        unread: 0,
                        updatedAt: serverTimestamp(),
                        avatarColor: 'bg-emerald-500'
                     });
                     targetChatId = newChatRef.id;
                     setActiveChat(targetChatId);
                 }
             }

             const storageRef = ref(storage, `chat_attachments/${targetChatId}/${Date.now()}_${file.name}`);
             await uploadBytes(storageRef, file);
             const url = await getDownloadURL(storageRef);

             await addDoc(collection(db, `chats/${targetChatId}/messages`), {
                text: 'Sent an attachment',
                fileUrl: url,
                fileName: file.name,
                sender: 'doctor',
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
                type: 'file'
            });

            await updateDoc(doc(db, 'chats', targetChatId), {
                lastMsg: 'Sent an attachment',
                updatedAt: serverTimestamp(),
            });

        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleVoiceCall = () => {
        if (!activeChat) return;
        console.log("Starting Voice Call Interface...");
        setIsVoiceCallActive(true); // Open in-chat overlay
    };

    const handleVideoCall = () => {
        if (!activeChat) return;
        console.log("Redirecting to Telehealth Video Room...");
        
        // Resolve Patient Details
        const currentChat = chats.find(c => c.id === activeChat);
        let patientName = "Patient";
        let patientId = activeChat;

        if (currentChat) {
            patientName = currentChat.patient || currentChat.patientName || "Patient";
            patientId = currentChat.patientId;
        } else {
            // Try to find in patients list if it's a new/temp chat
            const pId = activeChat.startsWith('temp_') ? activeChat.replace('temp_', '') : activeChat;
            const patient = patients.find(p => p.id === pId);
            if (patient) {
                patientName = patient.name;
                patientId = patient.id;
            }
        }

        navigate('/doctor/telehealth', { 
            state: { 
                incomingCall: true, 
                callType: 'video', 
                chatId: activeChat,
                patientId: patientId,
                patientName: patientName
            } 
        });
    };

    const handleSendMessage = async (e, customType = 'text', customPayload = null) => {
        if (e && e.preventDefault) e.preventDefault();
        
        const text = customPayload ? customPayload.text : messageInput;
        if (!text.trim() && !customPayload) return;
        if (!activeChat || !currentUser) return;

        let targetChatId = activeChat;
        
        // Handle Temp Chat Creation (New Logic)
        if (activeChat.startsWith('temp_')) {
            const tempPatientId = activeChat.replace('temp_', '');
            let targetPatient = patients.find(p => p.id === tempPatientId);
            // Fallback to initialPatientId if not in list yet
            if (!targetPatient && initialPatientId?.id === tempPatientId) targetPatient = initialPatientId;
            
            if (targetPatient) {
                 try {
                     const newChatRef = await addDoc(collection(db, 'chats'), {
                        patientId: targetPatient.id,
                        doctorId: currentUser.uid,
                        participants: [currentUser.uid, targetPatient.id], 
                        patientName: targetPatient.name,
                        condition: targetPatient.condition || 'General Care',
                        status: 'offline',
                        lastMsg: customType === 'text' ? text : `[${customType.toUpperCase()}]`, 
                        unread: 0,
                        updatedAt: serverTimestamp(),
                        avatarColor: 'bg-emerald-500' // Default or random
                     });
                     targetChatId = newChatRef.id;
                     setActiveChat(targetChatId);
                 } catch (err) {
                     console.error("Error creating new chat:", err);
                     return; // specific error handling
                 }
            } else {
                console.error("Patient details not found for sending message");
                return;
            }
        }

        // Only clear input if it was a text message
        if (customType === 'text') setMessageInput(''); 

        try {
            await addDoc(collection(db, `chats/${targetChatId}/messages`), {
                text: text,
                sender: 'doctor',
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
                type: customType,
                ...customPayload
            });

            await updateDoc(doc(db, 'chats', targetChatId), {
                lastMsg: customType === 'text' ? text : `[${customType.toUpperCase()}]`,
                updatedAt: serverTimestamp(),
            });

        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // --- Message Deletion Logic ---
    const handleRightClick = (e, msg) => {
        if (msg.sender !== 'doctor') return; // Only allow deleting own messages
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            messageId: msg.id
        });
    };

    const performDelete = async () => {
        if (!contextMenu || !activeChat) return;
        try {
            await deleteDoc(doc(db, `chats/${activeChat}/messages`, contextMenu.messageId));
            setContextMenu(null);
            
            // Optional: Update lastMsg if the deleted message was the last one (skipped for simplicity, fine for prototype)
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    // --- Quick Actions Handlers ---
    const handleUrgentAlert = () => {
        handleSendMessage(null, 'alert', { text: 'URGENT: Please respond immediately to this clinical alert.' });
    };

    const handleRequestVitals = () => {
        handleSendMessage(null, 'vitals_request', { text: 'Vitals Reading Requested' });
    };

    const handleWriteRx = () => {
        setIsRxModalOpen(true);
    };

    const submitRx = (medication) => {
        handleSendMessage(null, 'prescription', { 
            text: `Prescription Issued: ${medication}`,
            medication: medication
        });
        setIsRxModalOpen(false);
    };

    const openInsightReview = () => {
        console.log("Insight review not integrated with live data yet.");
    };

    const navigateToProfile = (chatData) => {
        if (!onNavigateToPatient || !chatData) return;
        const patientObj = {
            id: chatData.patientId,
            name: chatData.patient,
            condition: chatData.condition,
            status: chatData.status,
        };
        onNavigateToPatient(patientObj);
    };



    // Calculate Unread Chats
    const unreadChatsCount = chats.filter(chat => chat.unread > 0).length;

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500">
            {/* Left: Chat Sidebar (Golden Hour Theme) */}
            <div className="w-80 flex flex-col bg-[#261e12] border border-[#382b18] overflow-hidden rounded-3xl shadow-2xl z-20">
                {/* Header */}
                <div className="p-6 border-b border-[#382b18] bg-transparent">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-amber-50 tracking-tight">Messages</h2>
                        <p className="text-xs text-stone-500 mt-1 font-medium flex items-center gap-2">
                             <span className={`w-1.5 h-1.5 rounded-full ${unreadChatsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-stone-600'}`}></span>
                             {unreadChatsCount > 0 ? `${unreadChatsCount} unread conversations` : 'All conversations read'}
                        </p>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search patients..."
                            className="w-full bg-[#17120a] border border-[#382b18] rounded-2xl py-3 pl-10 pr-4 text-sm text-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-amber-900/40 shadow-inner"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {filteredChats.length > 0 ? (
                        filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChat(chat.id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group/item relative overflow-hidden mb-1 mx-2 ${activeChat === chat.id
                                    ? 'bg-[#382b18] border border-amber-500/10 shadow-lg'
                                    : 'hover:bg-[#382b18]/50 border border-transparent'
                                    }`}
                            >
                                {/* Active Indicator Bar */}
                                {activeChat === chat.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"></div>
                                )}
                                <div className="flex justify-between items-start mb-1 pl-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-11 h-11 rounded-2xl ${chat.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md relative overflow-hidden transition-transform duration-300 group-hover/item:scale-105 z-10 border border-white/10`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToProfile(chat);
                                            }}
                                            title="View Patient Profile"
                                        >
                                            {chat.patient.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${activeChat === chat.id ? 'text-amber-400' : 'text-stone-300 group-hover/item:text-amber-100 transition-colors'}`}>{chat.patient}</h4>
                                            <p className={`text-xs truncate max-w-[120px] ${activeChat === chat.id ? 'text-amber-500/60' : 'text-stone-500'}`}>{chat.lastMsg}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-stone-600 font-mono">{chat.time}</span>
                                        {chat.unread > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center shadow-lg transform scale-100 animate-pulse">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-stone-600 text-xs italic">
                            No patients found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>

            {/* Center: Chat Window */}
            <div className="flex-1 flex flex-col bg-[#17120a] relative overflow-hidden border border-amber-500/10 shadow-2xl z-10 rounded-3xl">
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#261e12] via-[#17120a] to-[#17120a] opacity-80 pointer-events-none"></div>
                
                {/* Chat Header */}
                <div className="p-6 border-b border-[#382b18] flex justify-between items-center bg-[#17120a]/80 backdrop-blur-md relative z-10">
                    {activeChatData ? (
                        <>
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-10 h-10 rounded-full ${activeChatData.avatarColor} shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-110 transition-transform hover:ring-2 hover:ring-white/30`}
                                onClick={() => navigateToProfile(activeChatData)}
                                title="View Patient Profile"
                            >
                                {activeChatData.patient.charAt(0)}
                            </div>
                            <div
                                className="cursor-pointer group"
                                onClick={() => navigateToProfile(activeChatData)}
                            >
                                <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">{activeChatData.patient}</h3>

                            </div>
                            </div>
                            
                            {/* Call Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowPatientDetails(!showPatientDetails)}
                                    className={`p-2.5 rounded-xl border transition-all active:scale-95 ${showPatientDetails 
                                        ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                                        : 'border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10'}`}
                                    title="Toggle Patient Snapshot"
                                >
                                    <ClipboardCheck size={20} />
                                </button>
                                <button 
                                    onClick={handleVoiceCall}
                                    className="p-2.5 rounded-xl border border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all active:scale-95"
                                    title="Voice Call"
                                >
                                    <Phone size={20} />
                                </button>
                                <button 
                                    onClick={handleVideoCall}
                                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    title="Start Telehealth Session"
                                >
                                    <Video size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in duration-700">
                            <div className="w-24 h-24 bg-[#261e12] rounded-full flex items-center justify-center mb-6 shadow-[0_0_80px_rgba(245,158,11,0.5)] ring-1 ring-amber-500/50 animate-pulse">
                                <MessageSquare size={48} className="text-amber-500 animate-pulse-slow" />
                            </div>
                            <h2 className="text-3xl font-bold text-amber-50 mb-3 tracking-tight">Clinical Communication Hub</h2>
                            <p className="text-stone-500 max-w-2xl mb-12 text-sm leading-relaxed px-8">
                                Welcome to your centralized telemedicine command center. From this dashboard, you can securely message patients, instantly request and monitor live vital signs, generate digitally signed e-prescriptions, and issue priority clinical alerts. Use voice notes for detailed care instructions and maintain a comprehensive, real-time record of patient interactions.
                            </p>

                            {/* Feature Grid */}
                            <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                                <div className="p-4 bg-[#261e12]/50 border border-amber-500/10 rounded-2xl flex items-center gap-4 hover:bg-[#261e12] transition-colors group cursor-default">
                                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-black transition-all">
                                        <Activity size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-amber-50 font-bold text-sm">Live Vitals</h4>
                                        <p className="text-stone-500 text-xs">Request health stats</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#261e12]/50 border border-amber-500/10 rounded-2xl flex items-center gap-4 hover:bg-[#261e12] transition-colors group cursor-default">
                                    <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                        <Pill size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-amber-50 font-bold text-sm">e-Prescriptions</h4>
                                        <p className="text-stone-500 text-xs">Instant digital Rx</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#261e12]/50 border border-amber-500/10 rounded-2xl flex items-center gap-4 hover:bg-[#261e12] transition-colors group cursor-default">
                                    <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-black transition-all">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-amber-50 font-bold text-sm">Urgent Alerts</h4>
                                        <p className="text-stone-500 text-xs">Flag critical risks</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#261e12]/50 border border-amber-500/10 rounded-2xl flex items-center gap-4 hover:bg-[#261e12] transition-colors group cursor-default">
                                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-black transition-all">
                                        <Mic size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-amber-50 font-bold text-sm">Voice Notes</h4>
                                        <p className="text-stone-500 text-xs">Record audio updates</p>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="mt-12 text-[10px] text-stone-600 font-mono tracking-widest uppercase opacity-60">
                                Curebird Clinical Workspace v2.0
                            </p>
                        </div>
                    )}

                </div>



                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                onContextMenu={(e) => handleRightClick(e, msg)}
                                className={`max-w-[70%] rounded-2xl p-5 shadow-lg relative group transition-all duration-200 ${msg.sender === 'doctor'
                                ? 'bg-amber-500 text-black rounded-br-sm shadow-[0_5px_20px_-5px_rgba(245,158,11,0.4)] cursor-context-menu'
                                : 'bg-[#382b18] text-amber-50 rounded-bl-sm border border-amber-500/5'
                                }`}
                            >
                                {/* Message Text */}
                                {msg.type === 'file' ? (
                                    <div className="flex items-start gap-3">
                                        <div className={`p-3 rounded-lg ${msg.sender === 'doctor' ? 'bg-black/10 text-black' : 'bg-[#261e12] text-amber-500'}`}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm mb-1 ${msg.sender === 'doctor' ? 'text-black' : 'text-amber-100'}`}>{msg.fileName}</p>
                                            <p className={`text-xs mb-2 ${msg.sender === 'doctor' ? 'text-black/60' : 'text-amber-500/60'}`}>{msg.text}</p>

                                            {/* AI Insight Trigger */}
                                            {msg.hasInsight && (
                                                <button
                                                    onClick={openInsightReview}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold transition-all w-full animate-pulse-slow"
                                                >
                                                    <CheckCircle size={12} /> Review Clinical Analysis
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : msg.type === 'audio' ? (
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                         <div className={`p-2 rounded-full ${msg.sender === 'doctor' ? 'bg-black/20 text-black' : 'bg-amber-500 text-black'}`}>
                                            <Mic size={20} />
                                         </div>
                                         <div className="flex-1">
                                             <audio controls src={msg.fileUrl} className="w-full h-8 max-w-[250px]" />
                                             <p className="text-[10px] mt-1 opacity-70">Voice Message</p>
                                         </div>
                                    </div>
                                ) : msg.type === 'alert' ? (
                                    <div className="flex items-start gap-3 min-w-[250px] border-l-4 border-rose-500 pl-3">
                                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg animate-pulse">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-rose-500 text-sm mb-1 uppercase tracking-wider">Urgent Clinical Alert</p>
                                            <p className="text-black/80 text-xs font-medium">{msg.text}</p>
                                        </div>
                                    </div>
                                ) : msg.type === 'vitals_request' ? (
                                    <div className="flex items-center gap-4 min-w-[220px]">
                                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-black text-sm">Vitals Requested</p>
                                            <button className="mt-2 text-[10px] bg-black text-amber-500 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide">
                                                Awaiting Patient Input...
                                            </button>
                                        </div>
                                    </div>
                                ) : msg.type === 'prescription' ? (
                                    <div className="flex items-start gap-3 min-w-[240px] bg-emerald-50/50 p-2 rounded-lg">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <Pill size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-emerald-700 text-sm mb-1">Prescription Issued</p>
                                            <p className="text-black/70 text-sm italic mb-2">"{msg.medication}"</p>
                                            <div className="h-px bg-emerald-200 my-2"></div>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle size={10} /> Signed Digitally
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm ${msg.sender === 'doctor' ? 'font-medium' : 'font-normal'}`}>{msg.text}</p>
                                )}

                                {/* Timestamp Footer */}
                                <div className={`text-[11px] font-bold mt-1.5 text-right tracking-wide ${msg.sender === 'doctor' ? 'text-black' : 'text-amber-500'}`}>
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area (Golden Hour) */}
                <div className="p-6 bg-transparent relative z-20">
                    
                    {/* Quick Action Chips (New) */}
                    <div className="flex gap-2 mb-3 px-1">
                        {[
                            { l: 'Urgent Alert', i: AlertTriangle, c: 'text-rose-500 bg-rose-500/10 border-rose-500/20', action: handleUrgentAlert },
                            { l: 'Request Vitals', i: Activity, c: 'text-amber-500 bg-amber-500/10 border-amber-500/20', action: handleRequestVitals },
                            { l: 'Write Rx', i: Pill, c: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', action: handleWriteRx }
                        ].map((chip, idx) => (
                            <button 
                                key={idx} 
                                onClick={chip.action}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border hover:brightness-110 hover:scale-105 transition-all ${chip.c}`}
                            >
                                <chip.i size={12} /> {chip.l}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileSelect}
                        />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-3.5 rounded-2xl bg-[#261e12] hover:bg-[#382b18] text-amber-500/50 hover:text-amber-500 border border-amber-500/10 transition-all ${isUploading ? 'animate-pulse text-amber-500' : ''}`}
                        >
                            <Paperclip size={20} />
                        </button>
                        
                        <div className="flex-1 bg-[#0c0a09] border border-[#382b18] rounded-2xl flex items-center px-4 py-1.5 focus-within:border-amber-500/50 focus-within:bg-[#17120a] transition-all shadow-inner">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent border-none text-white focus:ring-0 py-3 text-sm placeholder:text-stone-600 font-medium"
                            />
                            {/* Voice Recording Button */}
                            <button 
                                type="button" 
                                onClick={toggleRecording}
                                className={`ml-2 p-2 rounded-full transition-all ${isRecording ? 'text-red-500 animate-pulse bg-red-500/10 ring-2 ring-red-500/50' : 'text-stone-500 hover:text-white'}`}
                                title={isRecording ? "Click to Stop & Send" : "Click to Record Voice Note"}
                            >
                                {isRecording ? <div className="w-[18px] h-[18px] bg-current rounded-sm" /> : <Mic size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="p-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        >
                            <Send size={22} strokeWidth={2.5} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Feature 1: Patient Snapshot Panel (Collapsible) */}
            <AnimatePresence>
                {showPatientDetails && activeChatData && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                        className="bg-[#17120a] border border-[#382b18] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
                    >
                         {/* Header */}
                        <div className="p-6 border-b border-[#382b18] bg-[#261e12]/50 flex justify-between items-center">
                            <h3 className="text-amber-50 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Activity size={16} className="text-amber-500" />
                                Patient Snapshot
                            </h3>
                            <button onClick={() => setShowPatientDetails(false)} className="text-stone-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            
                            {/* Patient Info Header */}
                            <div className="text-center pb-4 border-b border-white/5">
                                <div className="w-16 h-16 rounded-2xl bg-stone-800 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-stone-500 shadow-inner">
                                    {activeChatData.patient.charAt(0)}
                                </div>
                                <h2 className="text-lg font-bold text-white mb-1">{activeChatData.patient}</h2>
                                <p className="text-xs text-stone-500 font-mono">ID: {activeChatData.patientId}</p>
                            </div>

                            {/* Dynamic Patient Data Lookup */}
                            {(() => {
                                const realPatient = patients.find(p => p.id === activeChatData.patientId);
                                
                                // Source 1: Direct Patient Doc
                                const patientVitals = realPatient?.vitals || {};
                                
                                // Source 2: Derived from Records (Medical Records Sub-collection)
                                const derivedVitals = getSnapshotVitals();
                                const derivedMeds = getSnapshotMeds();

                                // Merge: Derived takes precedence as it scans latest records
                                const vitals = { ...patientVitals, ...derivedVitals };
                                
                                // Safe unwrap for allergies (handle string vs array)
                                let allergies = realPatient?.allergies || [];
                                if (typeof allergies === 'string') {
                                    allergies = allergies.split(',').map(s => s.trim()).filter(Boolean);
                                }
                                if (!Array.isArray(allergies)) allergies = [];

                                // Meds: Use derived if available, else patient doc
                                let meds = derivedMeds.length > 0 ? derivedMeds : (realPatient?.medications || []);
                                if (Array.isArray(meds) === false) meds = []; // Strict array check

                                return (
                                    <>
                                        {/* Vitals Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                                <Activity size={14} /> Recent Vitals
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Heart Rate */}
                                                <div className="p-5 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-amber-500/50 hover:bg-amber-900/5 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_-12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 group flex flex-col justify-between h-32 cursor-default">
                                                    <div className="text-stone-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">Heart Rate</div>
                                                    <div>
                                                        <div className={`font-mono font-bold text-3xl ${vitals.heartRate ? 'text-emerald-500' : 'text-stone-700'}`}>
                                                            {vitals.heartRate || '--'}
                                                        </div>
                                                        <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1 group-hover:text-stone-500 transition-colors">bpm</div>
                                                    </div>
                                                </div>

                                                {/* BP */}
                                                <div className="p-5 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-amber-500/50 hover:bg-amber-900/5 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_-12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 group flex flex-col justify-between h-32 cursor-default">
                                                    <div className="text-stone-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">BP</div>
                                                    <div>
                                                        <div className={`font-mono font-bold text-3xl ${vitals.bp ? 'text-amber-500' : 'text-stone-700'}`}>
                                                            {vitals.bp || '--/--'}
                                                        </div>
                                                        <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1 group-hover:text-stone-500 transition-colors">mmHg</div>
                                                    </div>
                                                </div>

                                                {/* Temp */}
                                                <div className="col-span-2 p-5 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-amber-500/50 hover:bg-amber-900/5 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_-12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 group flex items-center justify-between h-24 cursor-default">
                                                    <div className="flex flex-col justify-between h-full">
                                                        <div className="text-stone-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">Temp</div>
                                                        <div className={`font-mono font-bold text-3xl ${vitals.temperature ? 'text-rose-500' : 'text-stone-700'}`}>
                                                            {vitals.temperature ? `${vitals.temperature}°F` : '--'}
                                                        </div>
                                                    </div>
                                                    <div className="h-full flex items-end">
                                                        <div className="text-[10px] font-bold text-stone-600 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest group-hover:border-amber-500/20 group-hover:text-stone-500 transition-colors">
                                                            {vitals.lastUpdated ? new Date(vitals.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No Data'}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* SpO2 */}
                                                 <div className="col-span-2 p-5 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-amber-500/50 hover:bg-amber-900/5 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_-12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 group flex items-center justify-between h-24 cursor-default">
                                                    <div className="flex flex-col justify-between h-full">
                                                        <div className="text-stone-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">SpO2</div>
                                                        <div className={`font-mono font-bold text-3xl ${vitals.spo2 ? 'text-cyan-500' : 'text-stone-700'}`}>
                                                            {vitals.spo2 ? `${vitals.spo2}%` : '--'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Allergies Section */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <AlertTriangle size={14} /> Allergies
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {allergies.length > 0 ? (
                                                    allergies.map((allergy, idx) => (
                                                        <span key={idx} className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm">
                                                            <Shield size={12} /> {typeof allergy === 'string' ? allergy : allergy.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-4 py-2 bg-stone-900/50 text-stone-600 border border-stone-800 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                                        <Shield size={12} /> No Known Allergies
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Meds Section (Card Style) */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <h4 className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Pill size={14} /> Active Meds
                                            </h4>
                                            <ul className="space-y-3">
                                                {meds.length > 0 ? (
                                                    meds.map((med, idx) => (
                                                        <li key={idx} className="flex items-center gap-4 p-4 bg-stone-900/80 rounded-2xl border border-stone-800 group hover:border-amber-500/50 hover:bg-amber-900/5 transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_-12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 cursor-default">
                                                            <div className="w-10 h-10 rounded-full bg-[#1c1917] flex items-center justify-center text-stone-600 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all duration-300 shadow-inner border border-white/5 group-hover:border-amber-500/30 group-hover:scale-110">
                                                                <Pill size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-center mb-0.5">
                                                                    <div className="text-stone-200 text-sm font-bold truncate pr-2 group-hover:text-amber-100 transition-colors">{med.name}</div>
                                                                    <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-amber-500/40 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">{med.dosage || 'N/A'}</div>
                                                                </div>
                                                                <div className="text-stone-500 text-[10px] font-medium truncate opacity-60 group-hover:opacity-100 group-hover:text-stone-400 transition-all">
                                                                    {med.frequency || med.freq || 'Follow instructions'}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <div className="text-center p-8 border border-stone-800 border-dashed rounded-2xl bg-stone-900/20">
                                                        <span className="text-stone-600 text-xs font-bold uppercase tracking-widest opacity-50">No active medications</span>
                                                    </div>
                                                )}
                                            </ul>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insight Modal Integration */}
            <InsightReviewModal
                isOpen={isInsightModalOpen}
                onClose={() => setIsInsightModalOpen(false)}
                insight={selectedInsight}
                onApprove={(data) => {
                    console.log('Approved Data:', data);
                    setIsInsightModalOpen(false);
                }}
                onReject={() => setIsInsightModalOpen(false)}
            />

            {/* Clinical Action Modals */}
            <GenerateSummaryModal
                isOpen={activeAction === 'summary'}
                onClose={() => setActiveAction(null)}
            />
            <FlagObservationModal
                isOpen={activeAction === 'flag'}
                onClose={() => setActiveAction(null)}
            />
            <UpdateCarePlanModal
                isOpen={activeAction === 'carePlan'}
                onClose={() => setActiveAction(null)}
            />
            <ConsultationStatusModal
                isOpen={activeAction === 'status'}
                onClose={() => setActiveAction(null)}
            />
            <EscalateRiskModal
                isOpen={activeAction === 'escalate'}
                onClose={() => setActiveAction(null)}
            />
            {/* Simple Rx Modal */}
            <AnimatePresence>
                {isRxModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            className="w-full max-w-md bg-[#17120a] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setIsRxModalOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-6 text-emerald-500">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <Pill size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Write Prescription</h3>
                            </div>
                            
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                submitRx(e.target.meds.value);
                            }}>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Medication & Dosage</label>
                                <textarea 
                                    name="meds"
                                    placeholder="e.g. Amoxicillin 500mg, Twice Daily for 7 days..." 
                                    className="w-full h-32 bg-[#0c0a09] border border-stone-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500 mb-6 resize-none"
                                    autoFocus
                                />
                                <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">
                                    Issue Prescription
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Context Menu for Deletion */}
            {contextMenu && (
                <>
                    <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setContextMenu(null)}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                    ></div>
                    <div 
                        className="fixed z-[101] bg-[#261e12] border border-[#382b18] rounded-xl shadow-2xl overflow-hidden py-1 min-w-[160px] animate-in fade-in zoom-in duration-200"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button 
                            onClick={performDelete}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 flex items-center gap-2 transition-colors"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            Delete Message
                        </button>
                    </div>
                </>
            )}

            {/* In-App Voice Call Overlay */}
            <AnimatePresence>
                {isVoiceCallActive && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50 w-80 bg-[#17120a] border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-amber-500/10 p-4 flex items-center justify-between border-b border-amber-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-amber-500 font-bold text-sm tracking-wide">VOICE CALL ACTIVE</span>
                            </div>
                            <span className="text-stone-500 text-xs font-mono">00:00</span>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[#261e12] border-2 border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <span className="text-3xl text-white font-bold">
                                    {activeChatData ? activeChatData.patient.charAt(0) : '?'}
                                </span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">
                                {activeChatData ? activeChatData.patient : 'Patient'}
                            </h3>
                            <p className="text-stone-500 text-xs mb-8">Connecting secure line...</p>

                            {/* Controls */}
                            <div className="flex items-center gap-6 w-full justify-center">
                                <button className="p-3 rounded-full bg-[#261e12] text-stone-400 hover:text-white hover:bg-stone-800 transition-all border border-stone-800">
                                    <Mic size={20} />
                                </button>
                                <button 
                                    onClick={() => setIsVoiceCallActive(false)}
                                    className="p-4 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg transform hover:scale-110"
                                >
                                    <Phone size={24} className="rotate-[135deg]" />
                                </button>
                                <button className="p-3 rounded-full bg-[#261e12] text-stone-400 hover:text-white hover:bg-stone-800 transition-all border border-stone-800">
                                    <Video size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorChat;
