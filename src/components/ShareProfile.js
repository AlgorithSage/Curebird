import React, { useState } from 'react';
import { Share2, Link, QrCode, Clock, Copy, Check, ShieldCheck, UserCog, Timer } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from './Header';

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = React.useState('');

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (!targetDate) return;
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-2 animate-pulse">
            <Timer size={12} className="animate-pulse" />
            Expires in <span className="font-mono text-sm">{timeLeft}</span>
        </span>
    );
};

const ShareProfile = ({ user, db, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [expiryTime, setExpiryTime] = useState(null);
    const [copied, setCopied] = useState(false);

    const generateLink = async () => {
        setLoading(true);
        try {
            // Expire in 1 hour
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            const docRef = await addDoc(collection(db, 'share_links'), {
                userId: user.uid,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                active: true
            });

            const link = `${window.location.origin}?share=${docRef.id}`;
            setShareLink(link);
            setExpiryTime(expiresAt);
        } catch (error) {
            console.error("Error generating link:", error);
            // Handle error (maybe show toast)
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto relative text-white selection:bg-amber-500/30">
            <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                <Header
                    title="Doctor Collaboration"
                    description="Securely share your medical history with specialists without them needing an app."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">

                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-2xl mb-6 ring-1 ring-amber-500/20 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-500">
                            <UserCog size={40} className="text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Temporary Doctor Access</h2>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                            Generate a secure, read-only link for your doctor.
                            This link gives them access to your <span className="text-slate-200 font-semibold">Summarized History</span> and <span className="text-slate-200 font-semibold">Latest Vitals</span>.
                        </p>
                    </div>

                    {!shareLink ? (
                        <div className="flex justify-center relative z-10">
                            <button
                                onClick={generateLink}
                                disabled={loading}
                                className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center gap-3">
                                    {loading ? (
                                        <>Generating Secure Token...</>
                                    ) : (
                                        <>
                                            <Share2 size={20} />
                                            Generate 1-Hour Access Link
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                            <div className="bg-black/40 rounded-2xl p-6 border border-amber-500/30 relative">
                                <div className="absolute top-3 right-3">
                                    <CountdownTimer targetDate={expiryTime} />
                                </div>

                                <div className="flex flex-col items-center gap-6 mt-4">
                                    {/* Link Display */}
                                    <div className="w-full">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Share Link</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-300 font-mono text-sm truncate flex items-center select-all">
                                                <Link size={14} className="mr-2 text-slate-500 shrink-0" />
                                                {shareLink}
                                            </div>
                                            <button
                                                onClick={copyToClipboard}
                                                className={`px-4 rounded-xl font-bold transition-all flex items-center justify-center border ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="flex flex-col items-center">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Or Scan QR Code</label>
                                        <div className="p-4 bg-white rounded-2xl shadow-xl">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareLink)}&bgcolor=ffffff&color=000000&margin=0`}
                                                alt="QR Code"
                                                className="w-40 h-40"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => setShareLink(null)}
                                    className="text-slate-500 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Generate New Link
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <strong className="text-slate-300">Security Note:</strong> This link is public but random. Anyone with the link can view your snapshot. It automatically self-destructs in 1 hour. You do not need to share your password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareProfile;
