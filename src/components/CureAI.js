import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Brain, ShieldCheck } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { API_BASE_URL } from '../config';

// ... (ChatMessage and TypingIndicator components remain unchanged)

const ChatMessage = ({ message, isUser }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 sm:mb-4`}
        >
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                {isUser ? <User size={16} className="text-white sm:w-5 sm:h-5" /> : <Bot size={16} className="text-white sm:w-5 sm:h-5" />}
            </div>

            <div className={`max-w-[90%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${isUser
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black'
                    : 'bg-slate-900/50 border border-slate-700/50 shadow-none text-slate-100'
                    }`}>
                    {isUser ? (
                        <p className="text-xs sm:text-sm font-medium">{message.text}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                    )}
                </div>
                <span className="text-[10px] sm:text-xs text-white px-2">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </motion.div>
    );
};

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3 mb-4"
    >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
        </div>
        <div className="glass-card px-4 py-3 rounded-2xl">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </motion.div>
);

const CureAI = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate, db, appId, initialContext }) => {
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [diseaseContext, setDiseaseContext] = useState([]);
    // New state for Cerebras Summary
    const [medicalSummary, setMedicalSummary] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);



    // ... (existing imports)

    useEffect(() => {
        // Load disease context
        fetchDiseaseContext();

        const contextToUse = location.state || initialContext;

        if (contextToUse) {
            // Case 1: Context injected from Analyzer
            setMedicalSummary(contextToUse);
            setMessages([{
                text: `**Analysis Loaded.** I have the context of your uploaded document. Ask me anything about the medicines, diagnosis, or side effects mentioned in it.`,
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        } else {
            // Case 2: Default Load (Fetch recent records)
            fetchAndSummarizeRecords();
            // Add welcome message
            setMessages([{
                text: `Hello ${user?.firstName ? `**${user.firstName}**` : 'there'}! Welcome to **Cure AI**. I provide secure, expert-level medical insights and health guidance powered by advanced intelligence. How can I support your wellness today?`,
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [initialContext, location.state]);

    const fetchDiseaseContext = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health-assistant/context`);
            const data = await response.json();
            if (data.success) {
                setDiseaseContext(data.diseases);
            }
        } catch (error) {
            console.error('Error fetching disease context:', error);
        }
    };

    const fetchAndSummarizeRecords = async () => {
        if (!user || !db || !appId) return;
        setIsSummaryLoading(true);
        try {
            const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');

            const recordsRef = collection(db, `artifacts/${appId}/users/${user.uid}/medical_records`);
            const q = query(recordsRef, orderBy('date', 'desc'), limit(5));
            const querySnapshot = await getDocs(q);

            const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (records.length > 0) {
                // Extract text and file URLs for summary
                const textsToSummarize = records.map(r => {
                    const type = r.type || 'Medical Record';
                    const date = r.date?.toDate ? r.date.toDate().toLocaleDateString() : 'Unknown Date';
                    const content = r.summary || r.digital_copy || r.diagnosis || 'No text content available.';
                    return `Date: ${date}\nType: ${type}\nMetadata Content: ${content}`;
                });

                const fileUrls = records.map(r => r.fileUrl).filter(url => url);

                // Call Backend to Summarize using Cerebras + Deep Analysis
                const response = await fetch(`${API_BASE_URL}/api/generate-summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: textsToSummarize,
                        file_urls: fileUrls
                    })
                });

                const data = await response.json();
                if (data.summary) {
                    setMedicalSummary(data.summary);
                }
            }
        } catch (error) {
            console.error("Error generating medical summary:", error);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // FREE TIER LIMIT CHECK (50 messages/day)
        try {
            // We need to check daily count from Firestore
            const { doc, getDoc, updateDoc, setDoc, increment } = await import('firebase/firestore');
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const subscriptionTier = userData?.subscriptionTier || 'Free';

            if (subscriptionTier === 'Free') {
                const today = new Date().toISOString().split('T')[0];
                const usageRef = doc(db, `users/${user.uid}/usage`, `ai_${today}`);
                const usageSnap = await getDoc(usageRef);

                let currentCount = 0;
                if (usageSnap.exists()) {
                    currentCount = usageSnap.data().count || 0;
                }

                if (currentCount >= 50) {
                    const limitMessage = {
                        text: "**Daily Limit Reached.**\n\nYou have used your 50 free messages for today. Upgrade to **Premium** for unlimited AI health guidance.",
                        isUser: false,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, limitMessage]);
                    return;
                }

                // Increment Usage (Optimistic or after success? Let's do optimistic for speed/UX)
                if (usageSnap.exists()) {
                    await updateDoc(usageRef, { count: increment(1) });
                } else {
                    await setDoc(usageRef, { count: 1 });
                }
            }
        } catch (err) {
            console.error("AI Limit Check Failed:", err);
            // Non-blocking but good to log
        }

        const userMessage = {
            text: inputMessage,
            isUser: true,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/health-assistant/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversation_id: conversationId,
                    medicalContext: medicalSummary // Pass the summary context to the chat
                })
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage = {
                    text: data.response,
                    isUser: false,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, aiMessage]);
                setConversationId(prev => prev || data.conversation_id);

            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                text: "I apologize, but I'm having trouble connecting. Please check if the backend server is running and try again.",
                isUser: false,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        if (conversationId) {
            try {
                await fetch(`${API_BASE_URL}/api/health-assistant/clear`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ conversation_id: conversationId })
                });
            } catch (error) {
                console.error('Error clearing conversation:', error);
            }
        }

        setMessages([{
            text: "Conversation cleared. How can I help you today?",
            isUser: false,
            timestamp: new Date().toISOString()
        }]);
        setConversationId(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white scroll-smooth relative z-0">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    title="Cure AI"
                    description="Powered by Llama 3.3 - Ask me about diseases, symptoms, treatments, and health trends in India"
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            {/* Premium Hero Section - Compact AI Console Look */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-4 sm:p-8 mb-6 sm:mb-12 text-center mt-4 sm:mt-6">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                    <Bot size={14} className="sm:w-4 sm:h-4" /> NEURAL INTERFACE
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-100 mb-3 sm:mb-4 tracking-tight drop-shadow-lg">
                    Cure Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI</span>
                </h1>

                <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Advanced diagnostics support and health queries. Our <span className="text-amber-400 font-semibold">Dual-Core AI</span> will instantly answer your questions and provide personalized health guidance effectively.
                </p>

                <div className="flex justify-center gap-6 sm:gap-8 mt-6 sm:mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400"><Bot size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Ask</span>
                    </div>
                    <div className="w-12 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><Brain size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Reason</span>
                    </div>
                    <div className="w-12 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400"><ShieldCheck size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Verify</span>
                    </div>
                </div>
            </div>

            {/* Recent Medical Context Section (Cerebras AI Powered) */}
            {(medicalSummary || isSummaryLoading) && (
                <div className="mb-6 px-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border border-amber-500/20 p-6 relative overflow-hidden shadow-xl"
                    >
                        <div className="flex items-start gap-4">

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
                                    Recent Medical Context
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">AI Generated</span>
                                </h3>

                                {isSummaryLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                                        <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
                                    </div>
                                ) : (
                                    <div className="text-slate-300 text-sm leading-relaxed">
                                        {medicalSummary}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mt-2 min-h-0 relative z-10 pb-2">
                {/* Main Chat Area - Premium Glass Console */}
                <div className="flex-1 flex flex-col glass-card p-0 h-[600px] sm:h-[800px]">
                    {/* Subtle Grid - Professional */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

                    {/* Premium Glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} isUser={message.isUser} />
                            ))}
                        </AnimatePresence>

                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Responsive Control Panel */}
                    <div className="p-3 sm:p-6 bg-[#090e1a]/95 border-t border-slate-800 backdrop-blur-xl relative z-20 rounded-b-[2rem]">
                        <div className="flex items-center gap-2 sm:gap-3 max-w-5xl mx-auto">

                            {/* Text Input */}
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Speak your heart out..."
                                    rows={1}
                                    disabled={isLoading}
                                    className="
                                        w-full
                                        h-[52px] sm:h-[60px]
                                        px-4 sm:px-5
                                        py-3
                                        bg-slate-900
                                        border border-amber-500/30
                                        rounded-xl
                                        text-sm sm:text-base
                                        text-slate-100
                                        placeholder:text-slate-500
                                        focus:outline-none
                                        focus:border-amber-400
                                        resize-none
                                        flex items-center
                                    "
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className="
                                    h-[52px] sm:h-[60px]
                                    w-[52px] sm:w-[60px]
                                    flex items-center justify-center
                                    bg-amber-400
                                    text-slate-950
                                    rounded-xl
                                    hover:bg-amber-300
                                    disabled:opacity-50
                                    transition-all
                                    font-bold
                                    shadow-lg
                                "
                            >
                                <Send size={20} />
                            </button>

                            {/* Clear Button */}
                            <button
                                onClick={clearChat}
                                title="Reset Session"
                                className="
                                    h-[52px] sm:h-[60px]
                                    w-[52px] sm:w-[60px]
                                    flex items-center justify-center
                                    bg-slate-800
                                    border border-amber-500
                                    rounded-xl
                                    text-amber-500
                                    hover:bg-amber-500
                                    hover:text-slate-950
                                    transition-all
                                "
                            >
                                <Trash2 size={20} />
                            </button>

                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default CureAI;
