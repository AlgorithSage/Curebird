import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Activity, ClipboardList, FilePlus,
    Microscope, Siren, LayoutDashboard, Search, ArrowRight
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import DoctorSidebar from './DoctorSidebar';

// Sub-Feature Components
import PatientManagement from './PatientManagement';
import ConsultationWorkflow from './ConsultationWorkflow';
import DoctorProfile from './DoctorProfile';
import PatientWorkspace from './PatientWorkspace';
import AppointmentManager from './AppointmentManager';
import MedicalRecordManager from './MedicalRecordManager';
import DoctorAnalytics from './DoctorAnalytics';
import DoctorChat from './chat/DoctorChat';
import DoctorNotifications from './DoctorNotifications';
import DoctorSecurity from './DoctorSecurity';
import DoctorHelp from './DoctorHelp';
import AddClinicalRecordModal from './AddClinicalRecordModal';
import NewPrescriptionModal from './NewPrescriptionModal';
import LabRequestModal from './LabRequestModal';
import VitalsMonitorModal from './VitalsMonitorModal';
import EmergencyAlertModal from './EmergencyAlertModal';
import PatientRosterModal from './PatientRosterModal';
import ScheduleQueueModal from './ScheduleQueueModal';
import ActionInboxModal from './ActionInboxModal';
import VitalsWatchlistModal from './VitalsWatchlistModal';
import AddPatientModal from './AddPatientModal';

// --- Background Components (Top Level) ---
const InteractiveHexGrid = () => {
    const canvasRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const updateSize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const hexSize = 35;
        const hexWidth = Math.sqrt(3) * hexSize;
        const hexHeight = 2 * hexSize;
        const baseWidth = dimensions.width * 1.5;
        const baseHeight = dimensions.height * 1.5;
        const cols = Math.ceil(baseWidth / hexWidth) + 6;
        const rows = Math.ceil(baseHeight / (hexHeight * 0.75)) + 6;
        const offsetX = (baseWidth - dimensions.width) / 2;
        const offsetY = (baseHeight - dimensions.height) / 2;

        const grid = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const xOffset = (r % 2 === 0) ? 0 : hexWidth / 2;
                const x = (c * hexWidth + xOffset) - offsetX;
                const y = (r * (hexHeight * 0.75)) - offsetY;
                grid.push({ x, y, intensity: 0, baseOpacity: 0.05 });
            }
        }
        const wavePath = new Path2D("M-18 0 L-10 0 L-7 -4 L-4 0 L-2 14 L2 -16 L6 4 L9 0 L18 0");
        let mouseX = -1000; let mouseY = -1000;
        const angleDeg = -30; const angleRad = angleDeg * (Math.PI / 180);
        const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
        window.addEventListener('mousemove', handleMouseMove);

        const drawHexagon = (ctx, size) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle_deg = 60 * i - 30;
                const angle_rad = Math.PI / 180 * angle_deg;
                ctx.lineTo(size * Math.cos(angle_rad), size * Math.sin(angle_rad));
            }
            ctx.closePath();
        };

        const render = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            const cx = dimensions.width / 2; const cy = dimensions.height / 2;
            const dx = mouseX - cx; const dy = mouseY - cy;
            const invAngle = -angleRad;
            const gridMouseX = dx * Math.cos(invAngle) - dy * Math.sin(invAngle) + cx;
            const gridMouseY = dx * Math.sin(invAngle) + dy * Math.cos(invAngle) + cy;

            ctx.save();
            ctx.translate(cx, cy); ctx.rotate(angleRad); ctx.translate(-cx, -cy);
            grid.forEach(cell => {
                const dist = Math.hypot(cell.x - gridMouseX, cell.y - gridMouseY);
                if (dist < 130) { cell.intensity = Math.min(cell.intensity + (1 - dist / 130) * 0.2, 1.0); }
                cell.intensity *= 0.94;
                const totalAlpha = cell.baseOpacity + cell.intensity;
                if (totalAlpha < 0.02) return;
                ctx.save(); ctx.translate(cell.x, cell.y);
                drawHexagon(ctx, hexSize - 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(cell.intensity * 0.3 + 0.05, 0.3)})`; ctx.lineWidth = 1; ctx.stroke();
                let strokeColor = `rgba(255, 255, 255, ${totalAlpha})`; let lineWidth = 1.5;
                if (cell.intensity > 0.05) {
                    strokeColor = `rgba(16, 185, 129, ${cell.intensity + 0.2})`;
                    lineWidth = 1.5 + (cell.intensity * 1.5);
                    ctx.shadowColor = '#10b981'; ctx.shadowBlur = cell.intensity * 15;
                }
                ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(wavePath);
                ctx.restore();
            });
            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [dimensions]);
    return <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="fixed inset-0 pointer-events-none z-0" />;
};

const ECGLine = () => (
    <div className="absolute bottom-20 left-0 right-0 h-32 overflow-hidden pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
            <defs> <linearGradient id="clinical-fade" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="transparent" /> <stop offset="50%" stopColor="#10b981" /> <stop offset="100%" stopColor="transparent" /> </linearGradient> </defs>
            <motion.path d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50 L110,50 L120,20 L130,80 L140,50 L500,50" fill="none" stroke="url(#clinical-fade)" strokeWidth="1.5" initial={{ pathLength: 0, opacity: 0, x: -50 }} animate={{ pathLength: 1, opacity: 1, x: 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
        </svg>
    </div>
);

// --- Helper Components (Top Level) ---
const ViewHeader = ({ icon: Icon, title, description }) => (
    <div className="mb-6 flex items-center gap-4 animate-in slide-in-from-left duration-500">
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-emerald-400 shadow-lg">
            <Icon size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </div>
);

const DashboardOverview = ({ onAddRecord, onViewOversight }) => (
    <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 relative z-10">
            {[
                { icon: FilePlus, l: "New Prescription", c: "text-amber-400", type: 'prescription', desc: 'Secure clinical shorthand' },
                { icon: Microscope, l: "Lab Request", c: "text-amber-500", type: 'lab', desc: 'Diagnostic requisitions' },
                { icon: Activity, l: "Vitals Monitor", c: "text-amber-400", type: 'vitals', desc: 'Physiological tracking' },
                { icon: Siren, l: "Emergency Alert", c: "text-rose-500", type: 'emergency', desc: 'Critical escalation' }
            ].map((b, i) => (
                <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    onClick={() => onAddRecord(b.type)}
                    className="group relative flex flex-col items-center justify-center p-[3px] rounded-[2.1rem] overflow-hidden shadow-2xl transition-all duration-500 bg-amber-500/10"
                >
                    {/* Persistent & Enhanced Rotating Rim (Border) */}
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.1rem]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,rgba(251,191,36,0.4)_270deg,#fbbf24_360deg)] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                        />
                    </div>

                    {/* Inner Card Body */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 rounded-[2rem] bg-gradient-to-br from-[#2e2a0a] via-[#1c1a05] to-[#0c0a05] overflow-hidden">
                        {/* Subtle Internal Glow */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-30" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.1),_transparent_70%)] pointer-events-none" />

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`p-6 rounded-2xl bg-amber-950/40 border border-amber-500/20 shadow-lg group-hover:border-amber-400/50 group-hover:shadow-amber-500/40 group-hover:scale-110 transition-all duration-300 mb-6 ${b.c}`}>
                                <b.icon size={44} strokeWidth={2.5} />
                            </div>

                            <div className="space-y-3">
                                <span className="block text-base font-black uppercase tracking-[0.25em] text-amber-50/90 group-hover:text-amber-300 transition-colors drop-shadow-lg">
                                    {b.l}
                                </span>
                                <span className="block text-[11px] font-bold text-amber-500/30 uppercase tracking-[0.15em] group-hover:text-amber-500/50 transition-colors">
                                    {b.desc}
                                </span>
                            </div>
                        </div>

                        {/* Interaction Flare */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/5 blur-3xl rounded-full" />
                        </div>
                    </div>
                </motion.button>
            ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
                icon={<Users size={28} />}
                label="Total Patients"
                value="124"
                color="bg-amber-500/10 text-amber-500 border border-amber-500/20"
                change="12% Growth"
                className="!h-full"
                onClick={() => onViewOversight('patients')}
            />
            <StatCard
                icon={<Calendar size={28} />}
                label="Today's Schedule"
                value="8"
                color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                change="On Track"
                className="!h-full"
                onClick={() => onViewOversight('schedule')}
            />
            <div className="relative group !h-full">
                <div className="absolute inset-0 bg-rose-500/20 rounded-[2rem] blur-xl group-hover:bg-rose-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
                <StatCard
                    icon={<ClipboardList size={28} />}
                    label="Action Required"
                    value="5"
                    color="bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    change="Pending Review"
                    className="!h-full relative z-10"
                    onClick={() => onViewOversight('actions')}
                />
            </div>
            <StatCard
                icon={<Activity size={28} />}
                label="Patient Vitals"
                value="Stable"
                color="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                change="Real-time"
                className="!h-full"
                onClick={() => onViewOversight('vitals')}
            />
        </div>
    </>
);



const PatientSearchLanding = ({ onSelectPatient }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const allPatients = [
        { id: 'P-001', name: 'Sarah Connor', age: 34, gender: 'F', lastVisit: '2023-10-24', status: 'Stable', condition: 'Hypertension' },
        { id: 'P-002', name: 'John Smith', age: 45, gender: 'M', lastVisit: '2023-10-22', status: 'Critical', condition: 'Post-Op Recovery' },
        { id: 'P-003', name: 'Ellen Ripley', age: 29, gender: 'F', lastVisit: '2023-10-20', status: 'Active', condition: 'Routine Checkup' },
        { id: 'P-004', name: 'Marty McFly', age: 19, gender: 'M', lastVisit: '2023-10-18', status: 'Stable', condition: 'Sports Injury' },
        { id: 'P-005', name: 'Tony Stark', age: 48, gender: 'M', lastVisit: '2023-10-15', status: 'Stable', condition: 'Cardiac Arrhythmia' },
    ];

    const results = searchTerm
        ? allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <Users size={32} className="text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Patient Workspace Access</h2>
                    <p className="text-slate-400">Search for a patient to open their comprehensive medical file.</p>
                </div>

                <div className="relative w-full group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-slate-900/90 border border-emerald-500/30 rounded-2xl shadow-2xl flex items-center p-2 backdrop-blur-xl">
                        <Search className="ml-4 text-slate-500" size={24} />
                        <input
                            type="text"
                            placeholder="Search by Name or Patient ID..."
                            className="w-full bg-transparent border-none text-lg text-white placeholder:text-slate-600 focus:ring-0 px-4 py-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <AnimatePresence>
                        {searchTerm && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-4 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50 divide-y divide-white/5"
                            >
                                {results.length > 0 ? (
                                    results.map(patient => (
                                        <button
                                            key={patient.id}
                                            onClick={() => onSelectPatient(patient)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-emerald-500/10 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{patient.name}</h4>
                                                    <p className="text-xs text-slate-500">{patient.id} • {patient.condition}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-slate-600 group-hover:text-emerald-400 -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No patients found match your query.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Dashboard Component ---
const DoctorDashboard = ({ user }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspacePatient, setWorkspacePatient] = useState(null);
    const [targetChatPatientId, setTargetChatPatientId] = useState(null); // For Profile -> Chat Nav
    const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isLabRequestModalOpen, setIsLabRequestModalOpen] = useState(false);
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [activeOversightModal, setActiveOversightModal] = useState(null); // 'patients', 'schedule', 'actions', 'vitals'
    const [unreadNotifications, setUnreadNotifications] = useState(3); // Demo: Start with 3 unread

    // Managed Patient State - Synced with Firestore
    const [patients, setPatients] = useState([]);

    // Fetch patients from Firestore
    useEffect(() => {
        const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const patientsList = [];
            querySnapshot.forEach((doc) => {
                patientsList.push({ id: doc.id, ...doc.data() });
            });
            setPatients(patientsList);
        });

        return () => unsubscribe();
    }, []);

    const handleAddPatient = (newPatient) => {
        // Optimistic update not strictly needed with real-time listener, 
        // but can be kept if we want instant feedback before server roundtrip.
        // However, since we are moving to Firestore in the Modal, 
        // this handler might just be for closing the modal or local UI state if needed.
        // For now, we rely on the Firestore listener to update the list.
        setIsAddPatientModalOpen(false);
    };

    const handleLogout = () => {
        auth.signOut();
        window.location.href = '/doctor/login';
    };

    const handleNavigate = (view) => {
        setActiveView(view);
        if (view !== 'patient_workspace') {
            setWorkspacePatient(null);
        }
        if (view === 'notifications') {
            setUnreadNotifications(0);
        }
    };

    // Determine content to render
    const renderContent = () => {
        // 1. Patient Workspace
        if (activeView === 'patient_workspace') {
            if (workspacePatient) {
                return (
                    <PatientWorkspace
                        patient={workspacePatient}
                        onBack={() => setWorkspacePatient(null)}
                        onOpenChat={(patientId) => {
                            console.log('Dashboard: Switching to Chat for ID:', patientId);
                            setTargetChatPatientId(patientId);
                            setActiveView('messages');
                        }}
                        onAddAction={(type) => {
                            if (type === 'prescription') setIsPrescriptionModalOpen(true);
                            else if (type === 'lab') setIsLabRequestModalOpen(true);
                            else if (type === 'vitals') setIsVitalsModalOpen(true);
                            else if (type === 'emergency') setIsEmergencyModalOpen(true);
                            else setIsAddRecordModalOpen(true);
                        }}
                    />
                );
            }
            return <PatientSearchLanding onSelectPatient={setWorkspacePatient} />;
        }

        // 2. Appointment Manager (Sub-views)
        if (activeView.startsWith('appointments_') && activeView !== 'appointments_group') {
            const subView = activeView.split('_')[1]; // overview, requests, schedule
            return <AppointmentManager view={subView} onNavigate={handleNavigate} />;
        }

        // 3. Fallback/Direct views
        switch (activeView) {
            case 'dashboard': return (
                <>
                    <ViewHeader icon={LayoutDashboard} title="Dashboard" description="Overview of clinical activities" />
                    <DashboardOverview
                        onAddRecord={(type) => {
                            if (type === 'prescription') setIsPrescriptionModalOpen(true);
                            if (type === 'lab') setIsLabRequestModalOpen(true);
                            if (type === 'vitals') setIsVitalsModalOpen(true);
                            if (type === 'emergency') setIsEmergencyModalOpen(true);
                        }}
                        onViewOversight={(type) => setActiveOversightModal(type)}
                        onNavigateToHistory={() => handleNavigate('medical_records')}
                    />
                </>
            );
            case 'patients': return <PatientManagement />;
            case 'appointments_group': return <AppointmentManager view="overview" onNavigate={handleNavigate} />;
            case 'consultations': return <ConsultationWorkflow user={user} />;
            case 'medical_records': return <MedicalRecordManager user={user} onAddAction={(type) => {
                if (type === 'prescription') setIsPrescriptionModalOpen(true);
                else if (type === 'lab') setIsLabRequestModalOpen(true);
                else if (type === 'vitals') setIsVitalsModalOpen(true);
                else if (type === 'emergency') setIsEmergencyModalOpen(true);
                else setIsAddRecordModalOpen(true);
            }} />;
            case 'analytics': return <DoctorAnalytics onNavigateToPatient={(p) => { setWorkspacePatient(p); setActiveView('patient_workspace'); }} />;
            case 'messages': return <DoctorChat
                initialPatientId={targetChatPatientId} // Pass target ID
                onNavigateToPatient={(p) => { setWorkspacePatient(p); setActiveView('patient_workspace'); }}
            />;
            case 'notifications': return <DoctorNotifications
                onNavigate={handleNavigate}
                onNavigateToPatient={(p) => { setWorkspacePatient(p); setActiveView('patient_workspace'); }}
            />;
            case 'profile': return <DoctorProfile user={user} />;
            case 'security': return <DoctorSecurity />;
            case 'help': return <DoctorHelp onNavigate={setActiveView} />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 relative text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
            {/* Background Layers */}
            <div className="fixed inset-0 bg-slate-950 pointer-events-none z-[-2]" />
            <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none z-[-1] mix-blend-screen" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none z-[-1] mix-blend-screen" />
            <InteractiveHexGrid />
            {/* NEW: Global Glass Sheet Overlay */}
            <div className="fixed inset-0 backdrop-blur-[2px] bg-slate-900/10 pointer-events-none z-[0]" />
            <ECGLine />

            <DoctorSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeView={activeView}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                unreadCount={unreadNotifications}
            />

            <AddClinicalRecordModal
                isOpen={isAddRecordModalOpen}
                onClose={() => setIsAddRecordModalOpen(false)}
                patients={patients}
                user={user}
            />

            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={() => setIsAddPatientModalOpen(false)}
                onAddPatient={handleAddPatient}
            />

            <NewPrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patients={patients}
                user={user}
            />

            <LabRequestModal
                isOpen={isLabRequestModalOpen}
                onClose={() => setIsLabRequestModalOpen(false)}
                patients={patients}
                user={user}
            />

            <VitalsMonitorModal
                isOpen={isVitalsModalOpen}
                onClose={() => setIsVitalsModalOpen(false)}
                patients={patients}
                user={user}
            />

            <EmergencyAlertModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                patients={patients}
                user={user}
            />

            <PatientRosterModal
                isOpen={activeOversightModal === 'patients'}
                onClose={() => setActiveOversightModal(null)}
                patients={patients}
                onViewPatient={(p) => {
                    setWorkspacePatient(p);
                    setActiveView('patient_workspace');
                    setActiveOversightModal(null);
                }}
                onAddPatient={() => {
                    setIsAddPatientModalOpen(true);
                    // Keep Roster open so user sees the new patient immediately
                }}
            />

            <ScheduleQueueModal
                isOpen={activeOversightModal === 'schedule'}
                onClose={() => setActiveOversightModal(null)}
                onStartConsultation={(appt) => {
                    setWorkspacePatient(patients.find(p => p.name === appt.patient) || patients[0]);
                    setActiveView('patient_workspace');
                    setActiveOversightModal(null);
                }}
                onReschedule={(appt) => {
                    console.log('Rescheduling:', appt);
                }}
            />

            <ActionInboxModal
                isOpen={activeOversightModal === 'actions'}
                onClose={() => setActiveOversightModal(null)}
                onResolve={(type, action) => {
                    console.log(`Action ${type}:`, action);
                    if (type === 'review') {
                        setWorkspacePatient(patients.find(p => p.name === action.patient) || patients[0]);
                        setActiveView('patient_workspace');
                    }
                    setActiveOversightModal(null);
                }}
            />

            <VitalsWatchlistModal
                isOpen={activeOversightModal === 'vitals'}
                onClose={() => setActiveOversightModal(null)}
                onAssess={(patient) => {
                    setWorkspacePatient(patients.find(p => p.id === patient.id) || patients[0]);
                    setActiveView('patient_workspace');
                    setActiveOversightModal(null);
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Header
                    title="DOCTOR PORTAL"
                    description="Clinical Workspace"
                    user={user}
                    onLogout={handleLogout}
                    onAddClick={() => setIsAddRecordModalOpen(true)}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    onNotificationClick={() => setActiveView('notifications')}
                    onNavigate={handleNavigate}
                    navItems={[
                        { name: 'Dashboard', id: 'dashboard', icon: <LayoutDashboard size={20} /> },
                        { name: 'My Patients', id: 'patients', icon: <Users size={20} /> },
                        { name: 'Appointments', id: 'appointments_group', icon: <Calendar size={20} /> },
                        { name: 'Consultations', id: 'consultations', icon: <Stethoscope size={20} /> },
                        { name: 'Medical Records', id: 'medical_records', icon: <FileText size={20} /> },
                        { name: 'Messages', id: 'messages', icon: <Siren size={20} /> },
                        { name: 'Analytics', id: 'analytics', icon: <Activity size={20} /> },
                        { name: 'Profile & Settings', id: 'profile', icon: <Settings size={20} /> },
                        { name: 'Help & Support', id: 'help', icon: <HelpCircle size={20} /> },
                    ]}
                />

                <main className="min-h-[60vh] pb-12 pt-6">
                    <motion.div
                        key={activeView + (workspacePatient ? '_sub' : '')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DoctorDashboard;
