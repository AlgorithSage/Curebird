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

const CureAI = ({ user, onLogout, onLoginClick, onToggleSidebar }) => {
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
        <div className="flex flex-col h-screen overflow-hidden p-4 sm:p-6 lg:p-8">
            <Header
                title="Cure AI"
                description="Powered by Llama 3.3 - Ask me about diseases, symptoms, treatments, and health trends in India"
                user={user}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
                onToggleSidebar={onToggleSidebar}
            />

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-8 mb-8 text-center mt-6 flex-shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6 animate-pulse">
                    <Bot size={16} /> AI POWERED ASSISTANT
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                    Cure Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI</span>
                </h1>

                <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Your 24/7 medical companion. Ask about symptoms, get second opinions, and decode complex health queries with expert-level precision.
                </p>

                <div className="flex justify-center gap-8 mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><MessageSquare /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Inquire</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-orange-400"><Brain /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Reason</span>
                    </div>
                    <div className="w-16 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><ShieldCheck /></div>
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Resolve</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 mt-6 overflow-hidden">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} isUser={message.isUser} />
                            ))}
                        </AnimatePresence>

                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-yellow-500/20 p-4 bg-black/20">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me about health, diseases, or symptoms..."
                                className="flex-1 bg-black/30 border border-yellow-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black rounded-xl hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
                            >
                                <Send size={18} />
                                Send
                            </button>
                            <button
                                onClick={clearChat}
                                className="px-4 py-3 glass-card rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-amber-400"
                                title="Clear conversation"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disease Trends Sidebar */}
                <div className="hidden lg:block w-80 glass-card rounded-2xl p-6 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-amber-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Current Trends</h3>
                    </div>

                    <div className="space-y-3">
                        {diseaseContext.slice(0, 10).map((disease, index) => (
                            <div key={index} className="bg-black/30 border border-yellow-500/20 rounded-lg p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{disease.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {disease.cases?.toLocaleString()} cases
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${disease.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                                        disease.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                        {disease.risk_level}
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
