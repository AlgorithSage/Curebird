import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Search, MoreVertical, Paperclip, Send, Mic, FileText, CheckCircle, Clock, Bot, Flag, Pill, AlertTriangle, Activity, ChevronRight, Shield, ClipboardCheck  } from '../../components/Icons';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import InsightReviewModal from './InsightReviewModal';
import GenerateSummaryModal from './actions/GenerateSummaryModal';
import FlagObservationModal from './actions/FlagObservationModal';
import UpdateCarePlanModal from './actions/UpdateCarePlanModal';
import ConsultationStatusModal from './actions/ConsultationStatusModal';
import EscalateRiskModal from './actions/EscalateRiskModal';

const DoctorChat = ({ onNavigateToPatient, initialPatientId }) => {
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

    // Auth Check
    React.useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(user => {
            if (user) setCurrentUser(user);
        });
        return () => unsubAuth();
    }, []);

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

    // 4. Send Message
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat || !currentUser) return;

        setIsUploading(true);
        try {
             // 1. Ensure chat exists (if temp) - Reuse logic or simplified check?
             // For simplicity, we assume chat exists or we replicate creation logic.
             // Ideally we refactor 'ensureChatExists' but for now let's just upload.
             // If activeChat starts with 'temp_', we MUST create it first.
             
             let targetChatId = activeChat;
             if (activeChat.startsWith('temp_')) {
                 // Creating chat logic duplicated for safety (or could be refactored)
                 const tempPatientId = activeChat.replace('temp_', '');
                 let targetPatient = patients.find(p => p.id === tempPatientId);
                 if (!targetPatient && initialPatientId?.id === tempPatientId) targetPatient = initialPatientId;
                 
                 if (targetPatient) {
                     const newChatRef = await addDoc(collection(db, 'chats'), {
                        patientId: targetPatient.id,
                        doctorId: currentUser.uid,
                        participants: [currentUser.uid], // In reality, we must add Patient UID here if we know it.
                        // Wait, if we use temp_ID, we might not have patient UID if "patients" collection doesn't have it?
                        // Actually 'patients' collection usually has 'uid' or we rely on 'patientId' being the uid?
                        // In NewPrescriptionModal user used 'patientId'. Let's assume patient.id IS the uid or we store it.
                        // For the connection to work, patientId MUST match the Patient's UID.
                        // Let's assume the 'patients' list has the correct ID.
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat || !currentUser) return;

        let targetChatId = activeChat;

        // If it's a temp chat, create it first
        if (activeChat.startsWith('temp_')) {
            const tempPatientId = activeChat.replace('temp_', '');

            // Try to find patient details in our list, OR use the initialPatientId if it matches
            let targetPatient = patients.find(p => p.id === tempPatientId);

            // Fallback to initialPatientId if it matches the temp ID (handles race condition where patients aren't loaded)
            if (!targetPatient && initialPatientId && initialPatientId.id === tempPatientId) {
                targetPatient = initialPatientId;
            }

            if (!targetPatient) {
                console.error("Unknown patient for chat creation");
                return;
            }

            try {
                const newChatRef = await addDoc(collection(db, 'chats'), {
                    patientId: targetPatient.id,
                    doctorId: currentUser.uid,
                    participants: [currentUser.uid],
                    patientName: targetPatient.name,
                    condition: targetPatient.condition || 'General Care',
                    status: 'offline',
                    lastMsg: messageInput, // First message
                    unread: 0,
                    updatedAt: serverTimestamp(),
                    avatarColor: 'bg-emerald-500'
                });
                targetChatId = newChatRef.id;
                setActiveChat(targetChatId); // Switch to real ID
            } catch (err) {
                console.error("Error creating chat on send:", err);
                return;
            }
        }

        const text = messageInput;
        setMessageInput(''); // Optimistic clear

        try {
            // Add Message
            await addDoc(collection(db, `chats/${targetChatId}/messages`), {
                text: text,
                sender: 'doctor',
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
                type: 'text'
            });

            // Update Chat Meta (Last Message)
            const chatRef = doc(db, 'chats', targetChatId);
            await updateDoc(chatRef, {
                lastMsg: text,
                updatedAt: serverTimestamp(),
            });

        } catch (err) {
            console.error("Failed to send message:", err);
        }
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

    // Derived State: Combine Active Chats + Potential Chats (Patients)
    const allChats = React.useMemo(() => {
        // 1. Existing Chats
        const combined = [...chats];
        const existingPatientIds = new Set(chats.map(c => c.patientId));

        // 2. Patients without Chats (Potential)
        patients.forEach(p => {
            if (!existingPatientIds.has(p.id)) {
                combined.push({
                    id: `temp_${p.id}`, // Temporary ID
                    patientId: p.id,
                    patient: p.name,
                    patientName: p.name,
                    condition: p.condition || 'General Care',
                    lastMsg: 'Start a conversation...',
                    time: '',
                    unread: 0,
                    status: p.status === 'Active' ? 'online' : 'offline', // simplified mapping
                    avatarColor: 'bg-stone-700', // Default
                    isTemp: true
                });
            }
        });
        return combined;
    }, [chats, patients]);

    const filteredChats = allChats.filter(chat =>
        chat.patient?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Resolving activeChatData with fallback
    let activeChatData = allChats.find(c => c.id === activeChat);

    // Fallback: If activeChat matches initialPatientId's temp ID, but not in allChats (e.g. patients not loaded), construct it
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

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500">
            {/* Left: Chat Sidebar */}
            <div className="w-80 flex flex-col glass-card p-0 overflow-hidden border border-amber-500/10">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-amber-500/5">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search patients..."
                            className="w-full bg-[#0c0a09] border border-stone-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-stone-700"
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
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border group/item ${activeChat === chat.id
                                    ? 'bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full ${chat.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-110 hover:ring-2 hover:ring-white/50 z-10`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToProfile(chat);
                                            }}
                                            title="View Patient Profile"
                                        >
                                            {chat.patient.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${activeChat === chat.id ? 'text-amber-100' : 'text-stone-300 group-hover/item:text-white transition-colors'}`}>{chat.patient}</h4>
                                            <p className="text-xs text-stone-500 truncate max-w-[120px]">{chat.lastMsg}</p>
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

            {/* Right: Main Chat Window */}
            <div className="flex-1 flex flex-col glass-card p-0 overflow-hidden border border-amber-500/10 bg-[#0c0a09] relative animated-border">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-amber-900/10 to-transparent">
                    {activeChatData ? (
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
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${activeChatData.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'}`}></span>
                                    <span className="text-xs text-stone-400">{activeChatData.status === 'online' ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-stone-500 text-sm">Select a chat to start messaging</div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowActionMenu(!showActionMenu)}
                            className={`p-2 rounded-lg transition-colors ${showActionMenu ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/5 text-stone-400 hover:text-white'}`}
                        >
                            <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {showActionMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-2 w-80 bg-[#1c1200] border border-amber-500/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 backdrop-blur-md"
                                >
                                    <div className="p-1.5 bg-gradient-to-b from-amber-500/10 to-transparent">

                                        {/* Section: Intelligence */}
                                        <div className="px-4 py-3 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 uppercase tracking-widest mt-1">Clinical Intelligence</div>
                                        <div className="space-y-1 p-1">
                                            <button
                                                onClick={() => {
                                                    openInsightReview();
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-3.5 py-3 rounded-lg hover:bg-amber-500/10 text-stone-300 hover:text-amber-100 flex items-center gap-4 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    <Activity size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[15px] font-semibold text-amber-50 truncate">Review Extracted Data</div>
                                                    <div className="text-xs text-stone-500 mt-0.5 truncate">Verify AI-detected vitals & diagnoses</div>
                                                </div>
                                                <ChevronRight size={16} className="text-stone-600 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setActiveAction('summary');
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-3.5 py-3 rounded-lg hover:bg-amber-500/10 text-stone-300 hover:text-amber-100 flex items-center gap-4 transition-colors group">
                                                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                                    <Bot size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[15px] font-semibold flex items-center gap-2">
                                                        Generate Summary
                                                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20 uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(245,158,11,0.05)] flex-shrink-0">AI</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="h-px bg-amber-500/10 my-1 mx-3"></div>

                                        {/* Section: Management */}
                                        <div className="px-4 py-2 text-xs font-bold text-amber-500/60 uppercase tracking-widest">Case Management</div>
                                        <div className="space-y-1 p-1">
                                            <button
                                                onClick={() => {
                                                    setActiveAction('flag');
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-3.5 py-3 rounded-lg hover:bg-amber-500/10 text-stone-300 hover:text-amber-100 flex items-center gap-4 transition-colors group">
                                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                                    <Flag size={20} />
                                                </div>
                                                <span className="text-[15px] font-medium flex-1 truncate">Flag Clinical Observation</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setActiveAction('carePlan');
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-3.5 py-3 rounded-lg hover:bg-amber-500/10 text-stone-300 hover:text-amber-100 flex items-center gap-4 transition-colors group">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                                    <Pill size={20} />
                                                </div>
                                                <span className="text-[15px] font-medium flex-1 truncate">Update Care Plan</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setActiveAction('status');
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-3.5 py-3 rounded-lg hover:bg-amber-500/10 text-stone-300 hover:text-amber-100 flex items-center gap-4 transition-colors group">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                                    <ClipboardCheck size={20} />
                                                </div>
                                                <span className="text-[15px] font-medium flex-1 truncate">Consultation Status</span>
                                            </button>
                                        </div>

                                        <div className="h-px bg-amber-500/10 my-1 mx-3"></div>

                                        {/* Section: Critical */}
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    setActiveAction('escalate');
                                                    setShowActionMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 hover:border-red-500/50 text-red-400 hover:text-red-200 flex items-center gap-3.5 transition-all group shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
                                                <AlertTriangle size={20} className="text-red-500" />
                                                <span className="text-[15px] font-bold flex-1 truncate">Escalate Risk Level</span>
                                            </button>
                                        </div>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-[#0c0a09] to-[#0c0a09]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg relative group ${msg.sender === 'doctor'
                                ? 'bg-amber-500 text-black rounded-tr-none'
                                : 'bg-stone-800 text-stone-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {/* Message Text */}
                                {msg.type === 'file' ? (
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 bg-stone-900/50 rounded-lg text-amber-500">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm mb-1">{msg.fileName}</p>
                                            <p className="text-xs text-stone-400 mb-2">{msg.text}</p>

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
                                ) : (
                                    <p className={`text-sm ${msg.sender === 'doctor' ? 'font-medium' : 'font-normal'}`}>{msg.text}</p>
                                )}

                                {/* Timestamp */}
                                <span className={`text-[10px] absolute -bottom-5 ${msg.sender === 'doctor' ? 'right-0 text-stone-500' : 'left-0 text-stone-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    {msg.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-stone-950/50">
                    <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
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
                            className={`p-3 rounded-full hover:bg-white/5 text-stone-400 hover:text-amber-500 transition-colors ${isUploading ? 'animate-pulse text-amber-500' : ''}`}
                        >
                            <Paperclip size={20} />
                        </button>
                        <div className="flex-1 bg-stone-900/50 border border-white/5 rounded-2xl flex items-center px-4 py-1 focus-within:border-amber-500/30 transition-colors">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent border-none text-white focus:ring-0 py-3 text-sm placeholder:text-stone-600"
                            />
                            <button type="button" className="ml-2 text-stone-500 hover:text-white">
                                <Mic size={18} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="p-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>

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
        </div>
    );
};

export default DoctorChat;
