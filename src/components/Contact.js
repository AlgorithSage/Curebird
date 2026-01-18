import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {  Mail, Send, Phone  } from './Icons';
import Header from './Header';

const Contact = ({ user, db, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const form = useRef();
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            // 1. Send Email via EmailJS
            // using .send() allows us to explicitly map our state specific variables
            await emailjs.send(
                'service_20dvlcn',
                'template_p8u4esr',
                {
                    user_name: formState.name,
                    user_email: formState.email,
                    subject: formState.subject,
                    message: formState.message
                },
                'xm8CaQSx54BOc3zyc'
            );

            // 2. Save to Firestore (Backup/Log)
            if (db) {
                await addDoc(collection(db, "contact_messages"), {
                    ...formState,
                    createdAt: serverTimestamp()
                });
            }

            setStatus('success');
            setFormState({ name: '', email: '', subject: '', message: '' });

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Email send failed: " + (error.text || error.message || "Unknown error")); // Helpful for debugging
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    title="Contact Us"
                    description="We'd love to hear from you."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            <div className="relative w-full max-w-5xl mx-auto bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-slate-300 flex flex-col md:flex-row overflow-hidden">

                {/* Left Side: Info */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-amber-600 to-amber-800 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
                            <p className="text-amber-100 mb-8">We'd love to hear from you. Our team is always here to chat.</p>

                            <div className="space-y-6">
                                <a href="mailto:carchisman2@gmail.com" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                                    <Mail className="mt-1 opacity-80" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Chat to us</h4>
                                        <p className="text-amber-100 text-sm">carchisman2@gmail.com</p>
                                    </div>
                                </a>
                                <div className="flex items-start gap-4">
                                    <Phone className="mt-1 opacity-80" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Phone</h4>
                                        <p className="text-amber-100 text-sm">XXXXX</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <p className="text-xs text-amber-200/60">© 2025 CureBird Inc.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-2/3 p-8 sm:p-12 bg-slate-900">
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Send size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                            <p className="text-slate-400">Thanks for reaching out. We'll be in touch shortly.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : status === 'error' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                                <Send size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Error Sending</h3>
                            <p className="text-slate-400">Something went wrong. Please try again later.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-6 md:hidden">Send a Message</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="user_name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="John Doe"
                                        value={formState.name}
                                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                    <input
                                        required
                                        type="email"
                                        name="user_email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="john@example.com"
                                        value={formState.email}
                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                                <input
                                    required
                                    type="text"
                                    name="subject"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="How can we help?"
                                    value={formState.subject}
                                    onChange={e => setFormState({ ...formState, subject: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    name="message"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                    value={formState.message}
                                    onChange={e => setFormState({ ...formState, message: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? 'Sending...' : (
                                    <>Send Message <Send size={20} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
