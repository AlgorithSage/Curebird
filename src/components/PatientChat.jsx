import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Paperclip, MoreVertical, Search, Bot,
    ArrowLeft, Plus, QrCode, ShieldCheck, FileText,
    Download, CheckCircle, AlertCircle, Loader2, X
} from './Icons';
import {
    collection, query, where, orderBy, onSnapshot,
    addDoc, serverTimestamp, doc, updateDoc, getDocs, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PatientChat = ({ user, db, storage, appId, onNavigate }) => {
    // Premium Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const fadeSlideUp = {
        hidden: { opacity: 0, y: 50, filter: "blur(4px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const blurReveal = {
        hidden: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration: 1, ease: "easeOut" }
        }
    };

    // State
    const [view, setView] = useState('list'); // 'list' | 'chat' | 'connect'
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connectId, setConnectId] = useState('');
    const [connectError, setConnectError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // Saving Record State
    const [savingFile, setSavingFile] = useState(null); // Message ID being saved
    const [saveSuccess, setSaveSuccess] = useState(null); // Message ID saved successfully

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1. Fetch My Chats
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.uid)
            // orderBy('updatedAt', 'desc') // Commented out to prevent missing index error
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                doctorName: doc.data().doctorName || 'Dr. CureBird', // Fallback
                time: doc.data().updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            // Client-side sort
            fetchedChats.sort((a, b) => {
                const timeA = a.updatedAt?.seconds || 0;
                const timeB = b.updatedAt?.seconds || 0;
                return timeB - timeA;
            });

            setChats(fetchedChats);
        });

        return () => unsubscribe();
    }, [user, db]);

    // 2. Fetch Messages for Active Chat
    useEffect(() => {
        if (!activeChat) return;

        const q = query(
            collection(db, `chats/${activeChat.id}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [activeChat, db]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 3. Connect to Doctor
    const handleConnect = async (e) => {
        e.preventDefault();
        setConnectError('');
        setIsConnecting(true);

        let targetId = connectId.trim();
        if (!targetId) {
            setIsConnecting(false);
            return;
        }

        try {
            // A. Resolve Connection Code to Doctor UID (New Short Code Logic)
            // If the ID looks like a short code (e.g. DOC-XXXX or just length < 20), try to find the user by connectionCode
            if (targetId.length < 20 || targetId.startsWith('DOC-')) {
                const codeQuery = query(collection(db, 'users'), where('connectionCode', '==', targetId));
                const codeSnap = await getDocs(codeQuery);

                if (!codeSnap.empty) {
                    targetId = codeSnap.docs[0].id; // Resolved to real UID
                } else {
                    // If it looked like a short code but wasn't found, it might be an invalid code.
                    // But we'll let it fall through to the UID check just in case.
                }
            }

            // B. Check Local State First (Fastest) with resolved UID
            const existingChat = chats.find(c => c.doctorId === targetId || (c.participants && c.participants.includes(targetId)));
            if (existingChat) {
                setActiveChat(existingChat);
                setView('chat');
                setIsConnecting(false);
                return;
            }

            // C. Check Firestore (Safety Net)
            const q = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const existingFirestoreChat = querySnapshot.docs.find(doc => {
                const data = doc.data();
                return data.doctorId === targetId || (data.participants && data.participants.includes(targetId));
            });

            if (existingFirestoreChat) {
                const chatData = { id: existingFirestoreChat.id, ...existingFirestoreChat.data() };
                setActiveChat(chatData);
                setView('chat');
                setIsConnecting(false);
                return;
            }

            // D. Validate Doctor ID (Check if user exists)
            let doctorName = 'Dr. Unknown';
            const doctorRef = doc(db, 'users', targetId);
            const doctorSnap = await getDoc(doctorRef);

            if (doctorSnap.exists()) {
                const docData = doctorSnap.data();
                doctorName = `Dr. ${docData.lastName || docData.firstName || 'CureBird'}`;
            } else {
                setConnectError('Doctor not found. Please check the ID or Code.');
                setIsConnecting(false);
                return;
            }

            // E. Create New Chat
            const newChatRef = await addDoc(collection(db, 'chats'), {
                patientId: user.uid,
                patientName: user.displayName || user.firstName || 'Patient',
                doctorId: targetId,
                doctorName: doctorName,
                participants: [user.uid, targetId],
                updatedAt: serverTimestamp(),
                lastMsg: 'Connection established',
                unread: 0,
                status: 'online'
            });

            const newChatData = { id: newChatRef.id, doctorName, doctorId: targetId };
            setActiveChat(newChatData);
            setView('chat');

        } catch (err) {
            console.error(err);
            setConnectError('Failed to connect. Please check the ID.');
        } finally {
            setIsConnecting(false);
        }
    };

    // 4. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !fileInputRef.current?.files?.length) return;

        const text = input;
        setInput('');

        try {
            await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
                text,
                sender: 'patient',
                senderId: user.uid,
                createdAt: serverTimestamp(),
                type: 'text'
            });

            await updateDoc(doc(db, 'chats', activeChat.id), {
                lastMsg: text,
                updatedAt: serverTimestamp()
            });

        } catch (err) {
            console.error("Send failed", err);
        }
    };

    // 5. Save Attachment to Records
    const handleSaveToRecords = async (msg) => {
        if (!msg.fileUrl || savingFile) return;
        setSavingFile(msg.id);

        try {
            // Create Record in Artifacts
            const recordData = {
                type: 'prescription', // Defaulting to prescription as per user flow
                title: `Rx from ${activeChat.doctorName}`,
                doctorName: activeChat.doctorName,
                doctorId: activeChat.doctorId,
                date: new Date().toISOString(),
                fileUrl: msg.fileUrl,
                fileName: msg.fileName || 'prescription.jpg',
                digital_copy: msg.text || '', // Use message text as notes
                createdAt: serverTimestamp(),
                status: 'verified' // Since it came from a doctor chat
            };

            await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/medical_records`), recordData);

            setSaveSuccess(msg.id);
            setTimeout(() => setSaveSuccess(null), 3000);

        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save record.");
        } finally {
            setSavingFile(null);
        }
    };


    // ... (Keep existing hooks up to handleSaveToRecords)

    return (
        <div className="h-screen flex flex-col bg-[#0F172A] text-white overflow-hidden relative font-sans selection:bg-amber-500/30">
            {/* AMBER THEME BACKGROUND LAYERS - More subtle and premium */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.05),_transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {/* MAIN SPLIT LAYOUT */}
            <div className="flex-1 flex overflow-hidden z-10">

                {/* --- LEFT SIDEBAR (Doctor List) --- */}
                <div className={`${view === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-[26rem] border-r border-white/5 bg-[#0a0f1c]/80 backdrop-blur-xl transition-all duration-300`}>
                    {/* Sidebar Header */}
                    <div className="p-6 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                Messages <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            </h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 pl-0.5">
                                Patient Portal
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setView('connect'); if (window.innerWidth < 768) { } }}
                                className="group p-2.5 bg-white/5 hover:bg-amber-500 rounded-xl border border-white/5 hover:border-amber-500 text-slate-300 hover:text-black transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                title="Add New Doctor"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={() => onNavigate('Dashboard')}
                                className="md:hidden p-2.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Chat List - Refined Cards */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar"
                    >
                        {chats.length === 0 ? (
                            <div className="text-center py-20 opacity-60 px-4 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                    <Bot size={32} className="text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-300">No conversations yet</p>
                                <p className="text-xs text-slate-500 mt-1 mb-4 max-w-[150px]">Your medical charts and doctor chats will appear here.</p>

                                <button onPress={() => setView('connect')} className="px-4 py-2 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all">
                                    Connect Doctor
                                </button>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <motion.div
                                    key={chat.id}
                                    layoutId={chat.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => { setActiveChat(chat); setView('chat'); }}
                                    className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-lg ${activeChat?.id === chat.id
                                            ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                        }`}
                                >
                                    {/* Active Indicator Line */}
                                    {activeChat?.id === chat.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-amber-500 rounded-r-full shadow-[0_0_10px_2px_rgba(245,158,11,0.5)]" />
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner ${activeChat?.id === chat.id
                                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-amber-900/20'
                                                    : 'bg-slate-800 text-slate-400 border border-white/5'
                                                }`}>
                                                {chat.doctorName.charAt(0)}
                                            </div>
                                            {/* Online Status Dot */}
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#0F172A] rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold text-sm ${activeChat?.id === chat.id ? 'text-white' : 'text-slate-300'} truncate group-hover:text-amber-400 transition-colors`}>
                                                    {chat.doctorName}
                                                </h4>
                                                <span className={`text-[10px] font-mono tracking-tighter ${activeChat?.id === chat.id ? 'text-amber-500/70' : 'text-slate-600'}`}>
                                                    {chat.time}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate font-medium ${activeChat?.id === chat.id ? 'text-amber-500/60' : 'text-slate-500'}`}>
                                                {chat.lastMsg}
                                            </p>
                                        </div>

                                        {chat.unread > 0 && (
                                            <div className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>

                    {/* Desktop Footer */}
                    <div className="hidden md:block p-4 border-t border-white/5 bg-black/20">
                        <button
                            onClick={() => onNavigate('Dashboard')}
                            className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
                        </button>
                    </div>
                </div>


                {/* --- RIGHT MAIN AREA --- */}
                <div className={`${view === 'list' ? 'hidden' : 'flex'} md:flex flex-col flex-1 bg-black/60 relative`}>

                    {/* Header - Floating Glass */}
                    {view !== 'connect' && activeChat && (
                        <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-20 bg-gradient-to-b from-[#0F172A] to-transparent pointer-events-none">
                            <div className="flex items-center gap-4 pointer-events-auto mt-2">
                                <button onClick={() => setView('list')} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white bg-black/40 rounded-full backdrop-blur-md">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black shadow-lg">
                                        {activeChat.doctorName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm leading-none">{activeChat.doctorName}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold">Encrypted</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="flex-1 overflow-hidden relative">
                        {view === 'connect' ? (
                            /* --- CONNECT VIEW - Redesigned --- */
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200 contrast-125" />

                                <div className="w-full max-w-lg relative">
                                    {/* Decorative Elements */}
                                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-[80px]" />
                                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-[80px]" />

                                    <div className="relative bg-[#0d121f] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                                        <div className="text-center mb-10">
                                            <div className="relative w-20 h-20 mx-auto mb-6">
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl rotate-6 animate-pulse" />
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl -rotate-6 animate-pulse delay-75" />
                                                <div className="relative w-full h-full bg-[#1c1605] border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                                    <QrCode size={32} />
                                                </div>
                                            </div>
                                            <h2 className="text-3xl font-black text-white tracking-tight">Connect with Doctor</h2>
                                            <p className="text-slate-400 text-sm mt-3 leading-relaxed">Enter the secure connection ID provided by your physician to establish an encrypted channel.</p>
                                        </div>

                                        <form onSubmit={handleConnect} className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={connectId}
                                                        onChange={(e) => setConnectId(e.target.value)}
                                                        placeholder="DOC-####-####"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-600 focus:border-amber-500/50 focus:bg-black/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-center tracking-[0.2em] text-lg uppercase outline-none shadow-inner"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-white/10 transition-all" />
                                                </div>
                                            </div>

                                            {connectError && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold"
                                                >
                                                    <AlertCircle size={16} /> {connectError}
                                                </motion.div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={isConnecting || !connectId}
                                                className="w-full py-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform active:scale-[0.98]"
                                            >
                                                {isConnecting ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={20} /> Establish Connection</>}
                                            </button>

                                            <button type="button" onClick={() => setView('list')} className="w-full py-2 text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
                                                Cancel
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : activeChat ? (
                            /* --- CHAT VIEW - Redesigned --- */
                            <div className="h-full flex flex-col pt-20"> {/* PT-20 for floating header */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-8 space-y-8 custom-scrollbar pb-6">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender === 'patient';
                                        const isFile = msg.type === 'file';
                                        return (
                                            <motion.div
                                                variants={fadeSlideUp}
                                                key={msg.id || idx}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] sm:max-w-[65%] rounded-3xl p-5 relative group shadow-lg ${isMe
                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black rounded-tr-md shadow-amber-900/10'
                                                        : 'bg-[#182030] text-slate-200 border border-white/5 rounded-tl-md shadow-black/20'
                                                    }`}>
                                                    {isFile ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-start gap-4 pb-4 border-b border-black/10">
                                                                <div className={`p-3 rounded-xl ${isMe ? 'bg-black/20 text-black' : 'bg-black/20 text-amber-400'}`}>
                                                                    <FileText size={24} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className={`font-bold text-sm truncate ${isMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</p>
                                                                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isMe ? 'text-black/60' : 'text-slate-500'}`}>Medical Document</p>
                                                                </div>
                                                            </div>

                                                            {!isMe && (
                                                                <button
                                                                    onClick={() => handleSaveToRecords(msg)}
                                                                    disabled={saveSuccess === msg.id || savingFile === msg.id}
                                                                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${saveSuccess === msg.id
                                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                                                                        }`}
                                                                >
                                                                    {savingFile === msg.id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : saveSuccess === msg.id ? (
                                                                        <><CheckCircle size={14} /> Saved to Records</>
                                                                    ) : (
                                                                        <><Download size={14} /> Save to Health Records</>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-[15px] leading-relaxed whitespace-pre-wrap font-medium ${isMe ? 'text-black' : 'text-slate-300'}`}>{msg.text}</p>
                                                    )}

                                                    <span className={`text-[10px] absolute -bottom-6 ${isMe ? 'right-2' : 'left-2'} text-slate-500 opacity-60 font-mono tracking-tight`}>
                                                        {msg.time}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area - Floating sleek design */}
                                <div className="p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A] to-transparent">
                                    <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4 items-end">
                                        <div className="flex-1 bg-[#182030]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center px-6 shadow-2xl focus-within:border-amber-500/50 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-5 text-[15px] font-medium"
                                                placeholder="Type your message..."
                                            />
                                            {/* Optional Attachment Icon (Visual only for now if file input is hidden) */}
                                            <button type="button" className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <Paperclip size={20} />
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className="h-[64px] w-[64px] bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black rounded-full transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-90 flex items-center justify-center"
                                        >
                                            <Send size={24} className={input.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
                                        </button>
                                    </form>
                                    <div className="text-center mt-3">
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                            <ShieldCheck size={12} /> End-to-End Encrypted
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- EMPTY STATE - Enhanced --- */
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-100">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                                    <Bot size={80} className="text-slate-700 relative z-10 mb-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Secure Messaging</h3>
                                <p className="text-slate-500 font-medium max-w-sm text-center">Select a doctor from the list to view your encrypted conversation history.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientChat;
