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
            text: `Hello ${user?.firstName ? `**${user.firstName}**` : 'there'}! Welcome to **Cure AI**. I provide secure, expert-level medical insights and health guidance powered by advanced intelligence. How can I support your wellness today?`,
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
