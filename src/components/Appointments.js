import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';

import Header from './Header';
import { AppointmentFormModal, DeleteConfirmModal } from './Modals';
import { SkeletonCard } from './SkeletonLoaders';

const AppointmentCard = ({ appointment, onEdit, onDelete, formatDate }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    // Using thick left borders to indicate status against the yellow glass background
    const statusConfig = {
        upcoming: { border: 'border-l-yellow-400', badge: 'bg-yellow-400 text-black' },
        completed: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' },
        cancelled: { border: 'border-l-rose-500', badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/50' }
    };

    const config = statusConfig[appointment.status] || statusConfig['upcoming'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`glass-card !p-5 !border-l-[6px] ${config.border} flex flex-col gap-4 group hover:-translate-y-1 relative`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xl font-bold text-white mb-1">{appointment.reason || 'General Checkup'}</p>
                    <p className="text-sm font-semibold text-yellow-100/80">Dr. {appointment.doctorName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{appointment.hospitalName}</p>
                </div>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-32 bg-[#0B1121] border border-white/20 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-xl">
                                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 hover:text-yellow-400 transition-colors">
                                    <Edit size={14} /> Edit
                                </button>
                                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-sm text-white font-bold tracking-wide">
                    {formatDate(appointment.date)}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${config.badge}`}>
                    {appointment.status}
                </span>
            </div>
        </motion.div>
    )
};


const Appointments = ({ user, db, appId, onLogout, onLoginClick, onToggleSidebar, onNavigate, formatDate }) => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [editingAppointment, setEditingAppointment] = useState(null);

    const userId = user ? user.uid : null;

    const appointmentsCollectionRef = useMemo(() => {
        if (userId) return collection(db, `artifacts/${appId}/users/${userId}/appointments`);
        return null;
    }, [userId, db, appId]);

    useEffect(() => {
        if (appointmentsCollectionRef) {
            const q = query(appointmentsCollectionRef, orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAppointments(data);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching appointments: ", error);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setAppointments([]);
        }
    }, [appointmentsCollectionRef]);

    const handleDelete = async () => {
        if (!appointmentToDelete || !userId) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/appointments`, appointmentToDelete));
        } catch (error) {
            console.error("Error deleting appointment: ", error);
        } finally {
            setIsDeleteModalOpen(false);
            setAppointmentToDelete(null);
        }
    };

    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
    const pastAppointments = appointments.filter(a => a.status !== 'upcoming');

    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <Header
                    title="Appointments"
                    description="Log in to manage your appointments."
                    user={null}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
                <div className="text-center py-20">
                    <p className="text-slate-400">Please log in to view your appointments.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <Header
                title="Appointments"
                description="Manage your upcoming and past medical appointments."
                user={user}
                onLogout={onLogout}
                onToggleSidebar={onToggleSidebar}
                onNavigate={onNavigate}
            />

            <main className="mt-8">
                <button
                    onClick={() => { setEditingAppointment(null); setIsFormModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg shadow-sm hover:bg-amber-400 transition-colors text-sm font-semibold mb-8"
                >
                    <Plus size={16} />
                    Add New Appointment
                </button>

                {isLoading ? (
                    <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
                ) : (
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-white">Upcoming Appointments</h2>
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {upcomingAppointments.map(app => (
                                            <AppointmentCard key={app.id} appointment={app} formatDate={formatDate}
                                                onEdit={() => { setEditingAppointment(app); setIsFormModalOpen(true); }}
                                                onDelete={() => { setAppointmentToDelete(app.id); setIsDeleteModalOpen(true); }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : <p className="text-slate-400">You have no upcoming appointments.</p>}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-white">Past Appointments</h2>
                            {pastAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {pastAppointments.map(app => (
                                            <AppointmentCard key={app.id} appointment={app} formatDate={formatDate}
                                                onEdit={() => { setEditingAppointment(app); setIsFormModalOpen(true); }}
                                                onDelete={() => { setAppointmentToDelete(app.id); setIsDeleteModalOpen(true); }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : <p className="text-slate-400">You have no past appointments.</p>}
                        </div>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {isFormModalOpen && <AppointmentFormModal onClose={() => setIsFormModalOpen(false)} appointment={editingAppointment} userId={userId} appId={appId} db={db} />}
                {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} />}
            </AnimatePresence>
        </div>
    );
};

export default Appointments;

