import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, TrendingUp, MessageSquare, Brain, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Header from './Header';
import { API_BASE_URL } from '../config';

const ChatMessage = ({ message, isUser }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
        >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl ${isUser
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black'
                    : 'glass-card text-slate-100'
                    }`}>
                    {isUser ? (
                        <p className="text-sm font-medium">{message.text}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                    )}
                </div>
                <span className="text-xs text-slate-500 px-2">
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

const CureAI = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [diseaseContext, setDiseaseContext] = useState([]);
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

        // Add welcome message
        setMessages([{
            text: "Welcome to **Cure AI**. I provide secure, expert-level medical insights and health guidance powered by advanced intelligence. How can I support your wellness today?",
            isUser: false,
            timestamp: new Date().toISOString()
        }]);
    }, []);

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

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

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
                    conversation_id: conversationId
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
            <Header
                title="Cure AI"
                description="Powered by Llama 3.3 - Ask me about diseases, symptoms, treatments, and health trends in India"
                user={user}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
                onNavigate={onNavigate}
            />

            {/* Premium Hero Section - Compact AI Console Look */}
            {/* MATCHING CURE ANALYZER HERO STYLE EXACTLY but keeping compact height */}
            {/* Premium Hero Section - Expanded Dimensions */}
            {/* Premium Hero Section - Exact Match to CureAnalyzer */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-8 mb-12 text-center mt-6">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6 animate-pulse">
                    <Bot size={16} /> NEURAL INTERFACE
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                    Cure Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI</span>
                </h1>

                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Advanced diagnostics support and health queries. Our <span className="text-amber-400 font-semibold">Dual-Core AI</span> will instantly answer your questions and provide personalized health guidance effectively.
                </p>

                <div className="flex justify-center gap-8 mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400"><Bot /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Ask</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><Brain /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Reason</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400"><ShieldCheck /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Verify</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-2 min-h-0 relative z-10 pb-2">
                {/* Main Chat Area - Premium Glass Console */}
                <div className="flex-1 flex flex-col bg-[#090e1a] backdrop-blur-xl rounded-[23px] border border-slate-700 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] relative h-[800px]">
                    {/* Subtle Grid - Professional */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

                    {/* Premium Glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} isUser={message.isUser} />
                            ))}
                        </AnimatePresence>

                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Integrated Control Panel */}
                    <div className="p-6 bg-[#090e1a]/95 border-t border-slate-800 backdrop-blur-xl relative z-20">
                        <div className="flex gap-4 items-end max-w-5xl mx-auto">
                            <div className="flex-1 relative group/input">
                                <div className="absolute inset-0 bg-sky-500/5 blur-lg rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500"></div>
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Access Neural Health Database..."
                                    rows={1}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/30 focus:bg-slate-900/80 transition-all resize-none font-medium relative z-10 shadow-inner"
                                    disabled={isLoading}
                                    style={{ minHeight: '60px', maxHeight: '120px' }}
                                />
                                <div className="absolute right-3 bottom-3 flex gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700/50 text-[10px] font-mono">CMD+ENTER</div>
                                </div>
                            </div>

                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className="px-6 h-[60px] bg-sky-600 text-white rounded-xl hover:bg-sky-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center shadow-lg"
                            >
                                <Send size={20} />
                            </button>

                            <button
                                onClick={clearChat}
                                className="px-4 h-[60px] bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 transition-all text-slate-500 flex items-center justify-center group/clear"
                                title="Reset Session"
                            >
                                <Trash2 size={18} className="group-hover/clear:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disease Trends Sidebar - Data Stream Style */}
                <div className="hidden lg:block w-80 bg-[#090e1a] backdrop-blur-xl rounded-[23px] p-0 overflow-hidden border border-slate-700 shadow-2xl flex flex-col relative">
                    {/* Subtle Grid - Professional */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

                    <div className="p-6 border-b border-slate-800 bg-[#090e1a]/90 relative z-10">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-amber-500" size={18} />
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Epidemic Data Stream</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 relative z-10">
                        {diseaseContext.slice(0, 10).map((disease, index) => (
                            <div key={index} className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-3 transition-all hover:bg-slate-800/80">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 group-hover:bg-amber-500 transition-colors rounded-l-xl"></div>
                                <div className="flex items-start justify-between gap-2 pl-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-300 group-hover:text-white truncate transition-colors">{disease.name}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1 group-hover:text-amber-500/70 transition-colors">
                                            DETECTED: {disease.cases?.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${disease.risk_level === 'High' ? 'bg-rose-950/30 border-rose-500/20 text-rose-400' :
                                        disease.risk_level === 'Medium' ? 'bg-amber-950/30 border-amber-500/20 text-amber-400' :
                                            'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {disease.risk_level?.toUpperCase().slice(0, 3)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CureAI;
