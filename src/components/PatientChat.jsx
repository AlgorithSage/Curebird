import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Paperclip, MoreVertical, Search, Bot, 
    ArrowLeft, Plus, QrCode, ShieldCheck, FileText, 
    Download, CheckCircle, AlertCircle, Loader2, X 
} from 'lucide-react';
import { 
    collection, query, where, orderBy, onSnapshot, 
    addDoc, serverTimestamp, doc, updateDoc, getDocs, getDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PatientChat = ({ user, db, storage, appId, onNavigate }) => {
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
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                doctorName: doc.data().doctorName || 'Dr. Curebird', // Fallback
                time: doc.data().updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
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
                doctorName = `Dr. ${docData.lastName || docData.firstName || 'Curebird'}`;
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


    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
            <div className="flex-1 flex flex-col bg-[#0F172A] text-white overflow-hidden rounded-3xl border border-amber-500/10 shadow-2xl relative">
            
            {/* AMBER THEME BACKGROUND LAYERS */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.05),_transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.05),_transparent_70%)] pointer-events-none" />


            {/* HEADER */}
            <div className="p-5 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    {view !== 'list' && (
                        <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-amber-500" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tight">
                            {view === 'connect' ? 'Connect Doctor' : view === 'chat' ? activeChat?.doctorName : 'Messages'}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {view === 'chat' ? 'Secure Encryption Active' : 'Patient Portal'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {view === 'list' && (
                        <button 
                            onClick={() => setView('connect')}
                            className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                    <button 
                        onClick={() => onNavigate('Dashboard')}
                        className="p-2.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="Close Messages"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative z-0">
                
                {/* VIEW: LIST */}
                {view === 'list' && (
                    <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {chats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <Bot size={48} className="text-amber-500/50 mb-4" />
                                <h3 className="text-lg font-bold text-slate-300">No messages yet</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-xs">Connect with your doctor to start receiving prescriptions and updates.</p>
                                <button onClick={() => setView('connect')} className="mt-6 text-amber-500 text-sm font-bold uppercase tracking-widest hover:underline">Connect Now</button>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => { setActiveChat(chat); setView('chat'); }}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-lg font-bold shadow-lg text-white">
                                            {chat.doctorName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">{chat.doctorName}</h4>
                                                <span className="text-[10px] text-slate-500 font-mono">{chat.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 truncate">{chat.lastMsg}</p>
                                        </div>
                                        {chat.unread > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* VIEW: CONNECT */}
                {view === 'connect' && (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
                             
                             <div className="text-center mb-8">
                                <div className="inline-block p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                    <QrCode size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Link Doctor</h3>
                                <p className="text-slate-400 text-sm">Enter Doctor's ID to establish a secure connection.</p>
                             </div>

                             <form onSubmit={handleConnect} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-amber-500/80 tracking-widest pl-1">Doctor ID / Code</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            value={connectId}
                                            onChange={(e) => setConnectId(e.target.value)}
                                            placeholder="e.g. Doc-12345"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                {connectError && (
                                    <p className="text-xs text-rose-400 flex items-center gap-2 font-bold justify-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                                        <AlertCircle size={14} /> {connectError}
                                    </p>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={!connectId || isConnecting}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_5px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isConnecting ? <Loader2 size={20} className="animate-spin" /> : 'Connect Securely'}
                                </button>
                             </form>
                        </div>
                    </div>
                )}

                {/* VIEW: CHAT */}
                {view === 'chat' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === 'patient';
                                const isFile = msg.type === 'file';
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 relative group ${
                                            isMe 
                                            ? 'bg-amber-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                                        }`}>
                                            {isFile ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                                                        <div className="p-2.5 bg-black/20 rounded-lg">
                                                            <FileText size={24} className={isMe ? 'text-white' : 'text-amber-400'} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm truncate">{msg.fileName}</p>
                                                            <p className="text-[10px] opacity-70">Medical Document</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {!isMe && (
                                                        <button 
                                                            onClick={() => handleSaveToRecords(msg)}
                                                            disabled={saveSuccess === msg.id || savingFile === msg.id}
                                                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                                                                saveSuccess === msg.id 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                                            }`}
                                                        >
                                                            {savingFile === msg.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : saveSuccess === msg.id ? (
                                                                <><CheckCircle size={14} /> Saved</>
                                                            ) : (
                                                                <><Download size={14} /> Save to Records</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                            )}
                                            
                                            <span className={`text-[9px] absolute -bottom-5 ${isMe ? 'right-0' : 'left-0'} text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono`}>
                                                {msg.time}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                            <form onSubmit={handleSend} className="flex gap-3">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 focus-within:border-amber-500/50 focus-within:bg-white/10 transition-all">
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3.5 text-sm"
                                        placeholder="Type your message..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
    );
};

export default PatientChat;
