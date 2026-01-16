import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
    Settings, Shield, Wifi, Clock, Activity, FileText, User
 } from './Icons';
import { doc, onSnapshot, updateDoc, addDoc, collection, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PatientTelehealthSession = ({ user }) => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // Media State
    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Call State
    const [pc, setPc] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('initializing'); // initializing, searching, connecting, connected, ended
    const [duration, setDuration] = useState(0);
    const [showChat, setShowChat] = useState(false);

    // Mock Doctor Data (In real app, fetch from appointment/user)
    const doctorInfo = {
        name: "Dr. Sarah Bloom",
        specialty: "Cardiologist",
        hospital: "Apollo Heart Center"
    };

    // 1. Initialize Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setConnectionStatus('error_camera');
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. WebRTC Join Logic
    useEffect(() => {
        if (!stream || !appointmentId) return;

        const joinCall = async () => {
            setConnectionStatus('searching');
            const callDocRef = doc(db, 'calls', appointmentId);
            const callSnapshot = await getDoc(callDocRef);

            if (!callSnapshot.exists()) {
                // If call doesn't exist yet, we wait (listener below will handle updates or we retry)
                // For MVP, we'll assume doctor creates it locally sharing ID, 
                // but effectively we listen for the offer.
                console.log("Waiting for doctor to start session...");
                return;
            }

            setConnectionStatus('connecting');

            const servers = {
                iceServers: [
                    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
                ],
            };

            const newPc = new RTCPeerConnection(servers);
            setPc(newPc);

            // Add local tracks
            stream.getTracks().forEach(track => newPc.addTrack(track, stream));

            // Handle remote track
            newPc.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                });
            };

            // ICE Candidates handling
            const answerCandidates = collection(callDocRef, 'answerCandidates');
            const offerCandidates = collection(callDocRef, 'offerCandidates');

            newPc.onicecandidate = (event) => {
                event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
            };

            // Process Offer & Create Answer
            const callData = callSnapshot.data();
            const offer = callData.offer;

            await newPc.setRemoteDescription(new RTCSessionDescription(offer));
            const answerDescription = await newPc.createAnswer();
            await newPc.setLocalDescription(answerDescription);

            const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
            };

            await updateDoc(callDocRef, { answer });

            // Listen for Remote ICE Candidates
            onSnapshot(offerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        newPc.addIceCandidate(candidate);
                    }
                });
            });

            // Monitor Connection State
            newPc.onconnectionstatechange = () => {
                if (newPc.connectionState === 'connected') {
                    setConnectionStatus('connected');
                }
                if (newPc.connectionState === 'disconnected') {
                    setConnectionStatus('ended');
                }
            };
        };

        joinCall();

        // Cleanup
        return () => {
            if (pc) pc.close();
        };

    }, [stream, appointmentId]);


    // Timer
    useEffect(() => {
        let timer;
        if (connectionStatus === 'connected') {
            timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [connectionStatus]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    const endCall = () => {
        if (pc) pc.close();
        if (stream) stream.getTracks().forEach(t => t.stop());
        navigate('/appointments'); // Or wherever appropriate
    };

    return (
        <div className="min-h-screen bg-[#0c0a05] text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center font-sans overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="w-full max-w-[1600px] h-[85vh] flex gap-6 z-10">

                {/* --- A. MAIN VIDEO STAGE (70%) --- */}
                <div className={`flex-1 relative rounded-[2.5rem] bg-black/40 border border-amber-500/20 shadow-[0_0_50px_-12px_rgba(245,158,11,0.1)] overflow-hidden transition-all duration-500 group ${connectionStatus !== 'connected' ? 'animate-pulse-slow' : ''}`}>

                    {/* Remote Video (Full) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
                        {connectionStatus === 'connected' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="inline-block p-6 rounded-full bg-amber-500/10 text-amber-500 mb-2 animate-pulse">
                                    <Wifi size={40} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-white/90">
                                    {connectionStatus === 'searching' ? 'Looking for Doctor...' : 'Secure Signal Established'}
                                </h2>
                                <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">
                                    Waiting Room • ID: {appointmentId?.slice(0, 6)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (PiP) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-28 right-8 w-48 h-64 rounded-2xl border-2 border-white/10 shadow-2xl bg-black overflow-hidden z-20 hover:scale-105 transition-transform"
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover mirror-mode ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
                                <span className="text-xs font-bold text-stone-500 uppercase">Video Possible</span>
                            </div>
                        )}
                    </motion.div>

                    {/* HUD Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md">
                            <Shield size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Secure Encryption Active</span>
                        </div>

                        <div className="flex flex-col items-end">
                            <h3 className="text-lg font-bold text-white/90">{doctorInfo.name}</h3>
                            <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">{doctorInfo.specialty}</span>
                            <div className="mt-2 text-3xl font-mono font-light text-white/80 tabular-nums">
                                {formatTime(duration)}
                            </div>
                        </div>
                    </div>

                    {/* Controls Island */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 p-5 rounded-full bg-stone-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl transition-all hover:border-amber-500/30">
                        <button onClick={toggleAudio} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-stone-800/50 text-white hover:bg-stone-700'}`}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-stone-800/50 text-white hover:bg-stone-700'}`}>
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                        <button onClick={() => setShowChat(!showChat)} className={`p-4 rounded-full transition-all ${showChat ? 'bg-amber-500 text-black' : 'bg-stone-800/50 text-white hover:bg-stone-700'}`}>
                            <MessageSquare size={24} />
                        </button>
                        <div className="w-px h-10 bg-white/10 mx-2"></div>
                        <button onClick={endCall} className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-600/20">
                            End Call
                        </button>
                    </div>

                </div>

                {/* --- B. 'MY HEALTH' SIDEBAR (30%) --- */}
                <div className="w-[400px] flex flex-col gap-6">

                    {/* 1. Doctor Profile & Status */}
                    <div className="glass-card p-6 border-l-4 border-l-amber-500 flex items-center gap-4 bg-stone-900/40">
                        <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-white/10 flex items-center justify-center text-stone-500">
                            <User size={32} />
                        </div>
                        <div>
                            <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">In Consultation With</p>
                            <h2 className="text-lg font-bold text-white leading-tight">{doctorInfo.name}</h2>
                            <p className="text-sm text-stone-400">{doctorInfo.hospital}</p>
                        </div>
                    </div>

                    {/* 2. Live Vitals Share */}
                    <div className="glass-card p-6 flex flex-col gap-4 bg-stone-900/40 relative overflow-hidden">
                        <div className="flex justify-between items-center z-10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" /> Live Vitals Share
                            </h3>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 z-10">
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Heart Rate</p>
                                <p className="text-xl font-mono text-white">72 <span className="text-xs text-stone-600">bpm</span></p>
                            </div>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">BP</p>
                                <p className="text-xl font-mono text-white">120/80</p>
                            </div>
                        </div>

                        {/* Background Deco */}
                        <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-500">
                            <Activity size={100} />
                        </div>
                    </div>

                    {/* 3. Notes / Chat Area */}
                    <div className="flex-1 glass-card p-1 rounded-3xl bg-stone-900/40 border border-white/5 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                            <FileText size={16} className="text-amber-500" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Session Notes</span>
                        </div>
                        <div className="flex-1 p-5 text-sm text-stone-400 leading-relaxed italic">
                            <p>Notes shared by the doctor will appear here automatically...</p>
                        </div>

                        {/* Fake Prescription Pop-up Animation Placeholder */}
                        <AnimatePresence>
                            {/* Logic to show prescription would go here */}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PatientTelehealthSession;
