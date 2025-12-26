import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Paperclip, Send, Mic, FileText, CheckCircle, Clock } from 'lucide-react';
import InsightReviewModal from './InsightReviewModal';

const DoctorChat = ({ onNavigateToPatient, initialPatientId }) => {
    const [activeChat, setActiveChat] = useState('chat_001');
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState(null);

    // Mock Data: Conversations
    const chats = [
        {
            id: 'chat_001',
            patient: 'Sarah Williams',
            patientId: 'P-001',
            condition: 'Hypertension',
            lastMsg: 'Attached my blood report.',
            time: '2m ago',
            unread: 1,
            status: 'online',
            avatarColor: 'bg-emerald-500'
        },
        {
            id: 'chat_002',
            patient: 'John Doe',
            patientId: 'P-002',
            condition: 'Post-Op Recovery',
            lastMsg: 'Thanks doctor, feeling better.',
            time: '1h ago',
            unread: 0,
            status: 'offline',
            avatarColor: 'bg-indigo-500'
        },
        {
            id: 'chat_003',
            patient: 'Robert Chen',
            patientId: 'P-003',
            condition: 'Routine Checkup',
            lastMsg: 'When is my next appointment?',
            time: '1d ago',
            unread: 0,
            status: 'offline',
            avatarColor: 'bg-amber-500'
        },
    ];

    // Handle Profile -> Chat Navigation
    React.useEffect(() => {
        if (initialPatientId) {
            const targetChat = chats.find(c => c.patientId === initialPatientId);
            if (targetChat) {
                setActiveChat(targetChat.id);
            }
        }
    }, [initialPatientId]);

    // Filter Logic
    const filteredChats = chats.filter(chat =>
        chat.patient.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeChatData = chats.find(c => c.id === activeChat);

    // Mock Data: Active Thread Messages
    const [messages, setMessages] = useState([
        { id: 1, sender: 'doctor', text: 'Hello Sarah, how are you feeling today?', time: '10:00 AM' },
        { id: 2, sender: 'patient', text: 'Much better, the fever has gone down.', time: '10:05 AM' },
        { id: 3, sender: 'doctor', text: 'That is great news. Did you get the blood work done?', time: '10:06 AM' },
        {
            id: 4,
            sender: 'patient',
            text: 'Yes, here is the report.',
            type: 'file',
            fileName: 'lab_report_024.pdf',
            hasInsight: true,
            time: '10:10 AM'
        }
    ]);

    // Mock AI Insight Data
    const mockInsight = {
        id: 'insight_88392',
        patientName: 'Sarah Williams',
        confidenceScore: 0.94,
        extractedData: {
            diagnosis: ['Acute Bacterial Infection', 'Dehydration'],
            vitals: [
                { type: 'WBC', value: '14.2', unit: 'K/uL' },
                { type: 'Hemoglobin', value: '13.5', unit: 'g/dL' }
            ],
            medications: [
                { name: 'Amoxicillin', dosage: '500mg', freq: 'BID' }
            ]
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1,
            sender: 'doctor',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessageInput('');
    };

    const openInsightReview = () => {
        setSelectedInsight(mockInsight);
        setIsInsightModalOpen(true);
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
                    <button className="p-2 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
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
                        <button type="button" className="p-3 rounded-full hover:bg-white/5 text-stone-400 hover:text-amber-500 transition-colors">
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
                    // Add success toast logic here
                }}
                onReject={() => setIsInsightModalOpen(false)}
            />
        </div>
    );
};

export default DoctorChat;
