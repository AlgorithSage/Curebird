import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {  X, CheckCircle, AlertCircle, Info, AlertTriangle  } from '../components/Icons';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Top Right */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const variants = {
        initial: { opacity: 0, x: 50, scale: 0.9 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    // Style configs based on type
    const styles = {
        success: {
            bg: 'bg-emerald-950/80',
            border: 'border-emerald-500/30',
            icon: <CheckCircle size={18} className="text-emerald-400" />,
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        },
        error: {
            bg: 'bg-rose-950/80',
            border: 'border-rose-500/30',
            icon: <AlertCircle size={18} className="text-rose-400" />,
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        },
        warning: {
            bg: 'bg-amber-950/80',
            border: 'border-amber-500/30',
            icon: <AlertTriangle size={18} className="text-amber-400" />,
            glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        },
        info: {
            bg: 'bg-slate-900/80',
            border: 'border-slate-500/30',
            icon: <Info size={18} className="text-blue-400" />,
            glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
        }
    };

    const style = styles[toast.type] || styles.info;

    return (
        <motion.div
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className={`pointer-events-auto min-w-[300px] max-w-sm rounded-xl p-4 flex items-start gap-3 backdrop-blur-md border ${style.bg} ${style.border} ${style.glow} shadow-xl`}
        >
            <div className="mt-0.5 shrink-0">
                {style.icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-100 leading-tight">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="shrink-0 text-slate-500 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};
