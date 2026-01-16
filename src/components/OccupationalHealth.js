import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Briefcase, Activity, Shield, Stethoscope, Pill, Search, AlertTriangle, CheckCircle2  } from './Icons';

// --- DATA: EXTENSIVE PROFESSION LIST (100+) ---
// Mapped to specific risk categories to ensure scalability while maintaining accuracy.
// Categories: Desk/Tech, Manual/Labor, Healthcare, Service, Transport, Education/Arts, Public Safety, etc.

const GENERIC_RISKS = {
    desk_tech: {
        diseases: [
            { name: 'Carpal Tunnel Syndrome', risk: 'High', description: 'Numbness in wrist/hand from repetitive typing.' },
            { name: 'Computer Vision Syndrome', risk: 'High', description: 'Eye strain and headaches from prolonged screen time.' },
            { name: 'Sedentary Lifestyle Risks', risk: 'High', description: 'Increased risk of CV disease and metabolic issues.' }
        ],
        prevention: ['Ergonomic setup', '20-20-20 eye rule', 'Standing desk', 'Regular stretching'],
        medicines: ['Artificial Tears', 'Ibuprofen', 'Vitamin D', 'Omega-3'],
        consult: ['Physiotherapist', 'Ophthalmologist', 'General Physician']
    },
    desk_general: {
        diseases: [
            { name: 'Chronic Lower Back Pain', risk: 'Medium', description: 'Pain from prolonged sitting posture.' },
            { name: 'Tension Headaches', risk: 'Medium', description: 'Stress and posture-related headaches.' },
            { name: 'Vitamin D Deficiency', risk: 'High', description: 'Lack of sun exposure due to indoor work.' }
        ],
        prevention: ['Lumbar support chair', 'Hourly walks', 'Hydration', 'Monitor positioning'],
        medicines: ['Paracetamol', 'Vitamin D3', 'Multivitamins', 'Topical analgesics'],
        consult: ['Orthopedist', 'Physiotherapist', 'General Physician']
    },
    manual_heavy: {
        diseases: [
            { name: 'Musculoskeletal Disorders', risk: 'High', description: 'Joint and muscle damage from heavy lifting.' },
            { name: 'Herniated Disc', risk: 'High', description: 'Spinal injury from improper lifting techniques.' },
            { name: 'Noise-Induced Hearing Loss', risk: 'Medium', description: 'Damage from loud machinery or environment.' }
        ],
        prevention: ['Back support belts', 'Proper lifting training', 'Hearing protection', 'Steel-toe boots'],
        medicines: ['Diclofenac', 'Glucosamine', 'Muscle Relaxants', 'Calcium'],
        consult: ['Orthopedist', 'Physiotherapist', 'Audiologist']
    },
    manual_precision: {
        diseases: [
            { name: 'Repetitive Strain Injury', risk: 'High', description: 'Tissue damage from precise, repeated movements.' },
            { name: 'Eye Strain', risk: 'Medium', description: 'Fatigue from focus on detailed work.' },
            { name: 'Contact Dermatitis', risk: 'Medium', description: 'Skin reaction to materials or chemicals.' }
        ],
        prevention: ['Task lighting', 'Frequent micro-breaks', 'Protective gloves', 'Magnifying tools'],
        medicines: ['Naproxen', 'Cortisone cream', 'Lubricating eye drops', 'Vitamin B-complex'],
        consult: ['Hand Surgeon', 'Dermatologist', 'Ophthalmologist']
    },
    service_standing: {
        diseases: [
            { name: 'Varicose Veins', risk: 'High', description: 'Swollen veins from standing for long shifts.' },
            { name: 'Plantar Fasciitis', risk: 'High', description: 'Heel pain from hard floor surfaces.' },
            { name: 'Physical Fatigue', risk: 'Medium', description: 'General exhaustion from constant movement.' }
        ],
        prevention: ['Compression stockings', 'Orthopedic insoles', 'Leg elevation', 'Anti-fatigue mats'],
        medicines: ['Diosmin', 'Magnesium', 'Foot creams', 'Pain relief gels'],
        consult: ['Vascular Specialist', 'Podiatrist', 'Orthopedist']
    },
    healthcare_clinical: {
        diseases: [
            { name: 'Infectious Diseases', risk: 'High', description: 'Exposure to pathogens in clinical settings.' },
            { name: 'Burnout / Compassion Fatigue', risk: 'High', description: 'Emotional exhaustion from patient care.' },
            { name: 'Needlestick Injuries', risk: 'Medium', description: 'Accidental punctures with contaminated sharps.' }
        ],
        prevention: ['Full PPE compliance', 'Vaccination boosters', 'Mental health support', 'Safe sharps disposal'],
        medicines: ['Antiseptics', 'Probiotics', 'Sleep aids (Melatonin)', 'Immunity boosters'],
        consult: ['Infectious Disease Specialist', 'Psychiatrist', 'Occupational Health']
    },
    driver: {
        diseases: [
            { name: 'Deep Vein Thrombosis', risk: 'Medium', description: 'Clotting risk from prolonged immobility.' },
            { name: 'Lower Back Pain', risk: 'High', description: 'Vibration and posture issues from driving.' },
            { name: 'Obesity', risk: 'High', description: 'Metabolic issues from sedentary nature and diet.' }
        ],
        prevention: ['Seat lumbar support', 'Stretching at stops', 'Healthy snacking', 'Hydration'],
        medicines: ['Aspirin (consult doctor)', 'Antacids', 'Topical pain relief', 'Multivitamins'],
        consult: ['Cardiologist', 'Orthopedist', 'Dietitian']
    },
    education: {
        diseases: [
            { name: 'Vocal Cord Nodules', risk: 'High', description: 'Strain from constant speaking/teaching.' },
            { name: 'Stress/Burnout', risk: 'High', description: 'Mental load from classroom management.' },
            { name: 'Viral Infections', risk: 'Medium', description: 'Frequent exposure to sick students.' }
        ],
        prevention: ['Voice amplification', 'Hydration (warm water)', 'Hand hygiene', 'Stress management'],
        medicines: ['Throat lozenges', 'Vitamin C', 'Zinc', 'Salt water gargle'],
        consult: ['ENT Specialist', 'Psychologist', 'General Physician']
    }
};

// Map specific professions to data or custom overrides
const PROFESSION_DATABASE = {
    // --- TECH & OFFICE ---
    'software engineer': GENERIC_RISKS.desk_tech,
    'web developer': GENERIC_RISKS.desk_tech,
    'data scientist': GENERIC_RISKS.desk_tech,
    'systems administrator': GENERIC_RISKS.desk_tech,
    'graphic designer': GENERIC_RISKS.desk_tech,
    'ui/ux designer': GENERIC_RISKS.desk_tech,
    'product manager': GENERIC_RISKS.desk_general,
    'project manager': GENERIC_RISKS.desk_general,
    'accountant': GENERIC_RISKS.desk_general,
    'auditor': GENERIC_RISKS.desk_general,
    'financial analyst': GENERIC_RISKS.desk_general,
    'human resources manager': GENERIC_RISKS.desk_general,
    'lawyer': { ...GENERIC_RISKS.desk_general, diseases: [...GENERIC_RISKS.desk_general.diseases, { name: 'High Stress/Anxiety', risk: 'High', description: 'Severe pressure from deadlines and cases.' }] },
    'paralegal': GENERIC_RISKS.desk_general,
    'administrative assistant': GENERIC_RISKS.desk_general,
    'receptionist': GENERIC_RISKS.desk_general,
    'marketing manager': GENERIC_RISKS.desk_general,
    'content writer': GENERIC_RISKS.desk_tech,
    'sales representative': { ...GENERIC_RISKS.desk_general, diseases: [...GENERIC_RISKS.desk_general.diseases, { name: 'Voice Strain', risk: 'Medium', description: 'Frequent client calls.' }] },
    'customer service agent': {
        diseases: [{ name: 'Acoustic Shock', risk: 'Medium', description: 'Hearing injury from headset noise.' }, { name: 'Burnout', risk: 'High', description: 'Emotional labor.' }, { name: 'Sedentary Strain', risk: 'High', description: 'Sitting all day.' }],
        prevention: ['Noise-canceling headset', 'Micro-breaks', 'Mental health days'], medicines: ['Lozenges', 'Eye drops'], consult: ['Audiologist', 'Psychologist']
    },
    'architect': { ...GENERIC_RISKS.desk_tech, diseases: [...GENERIC_RISKS.desk_tech.diseases, { name: 'Neck Strain', risk: 'High', description: 'Leaning over drafts/plans.' }] },
    'researcher': GENERIC_RISKS.desk_tech,

    // --- HEALTHCARE ---
    'doctor': GENERIC_RISKS.healthcare_clinical,
    'nurse': { ...GENERIC_RISKS.healthcare_clinical, diseases: [...GENERIC_RISKS.healthcare_clinical.diseases, { name: 'Back Injury', risk: 'High', description: 'Lifting patients.' }] },
    'surgeon': { ...GENERIC_RISKS.healthcare_clinical, diseases: [...GENERIC_RISKS.healthcare_clinical.diseases, { name: 'Varicose Veins', risk: 'Medium', description: 'Long standing surgeries.' }] },
    'dentist': { ...GENERIC_RISKS.healthcare_clinical, diseases: [{ name: 'Spinal Issues', risk: 'High', description: 'Chronic hunching over patients.' }, ...GENERIC_RISKS.manual_precision.diseases] },
    'pharmacist': GENERIC_RISKS.service_standing,
    'physiotherapist': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Joint Strain', risk: 'Medium', description: 'Physical manipulation of patients.' }] },
    'veterinarian': { ...GENERIC_RISKS.healthcare_clinical, diseases: [...GENERIC_RISKS.healthcare_clinical.diseases, { name: 'Animal Bites/Scratches', risk: 'Medium', description: 'Handling stressed animals.' }] },
    'paramedic': { ...GENERIC_RISKS.manual_heavy, diseases: [...GENERIC_RISKS.healthcare_clinical.diseases, { name: 'Trauma/PTSD', risk: 'High', description: 'Exposure to accident scenes.' }] },
    'dental hygienist': GENERIC_RISKS.manual_precision,
    'lab technician': GENERIC_RISKS.manual_precision,
    'radiologist': GENERIC_RISKS.desk_tech,
    'psychologist': GENERIC_RISKS.desk_general,

    // --- CONSTRUCTION & TRADES ---
    'construction worker': GENERIC_RISKS.manual_heavy,
    'carpenter': { ...GENERIC_RISKS.manual_heavy, diseases: [...GENERIC_RISKS.manual_heavy.diseases, { name: 'Wood Dust Inhalation', risk: 'High', description: 'Respiratory risk.' }] },
    'electrician': { ...GENERIC_RISKS.manual_precision, diseases: [{ name: 'Electrical Burns', risk: 'Medium', description: 'Accidental shock.' }, ...GENERIC_RISKS.manual_precision.diseases] },
    'plumber': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Infection Risk', risk: 'Medium', description: 'Sewage/waste exposure.' }, ...GENERIC_RISKS.manual_heavy.diseases] },
    'welder': { diseases: [{ name: 'Welder\'s Flash', risk: 'High', description: 'UV eye burns.' }, { name: 'Metal Fume Fever', risk: 'Medium', description: 'Toxic inhalation.' }, { name: 'Burns', risk: 'High', description: 'Sparks/slag.' }], prevention: ['Auto-darkening helmet', 'Respirator', 'Leathers'], medicines: ['Eye drops', 'Burn cream'], consult: ['Ophthalmologist', 'Pulmonologist'] },
    'mechanic': { ...GENERIC_RISKS.manual_heavy, diseases: [...GENERIC_RISKS.manual_heavy.diseases, { name: 'Chemical Dermatitis', risk: 'Medium', description: 'Oil/grease contact.' }] },
    'painter': { diseases: [{ name: 'Solvent Toxicity', risk: 'Medium', description: 'Fume inhalation.' }, { name: 'Rotator Cuff Tear', risk: 'Medium', description: 'Overhead rolling.' }], prevention: ['Respirator', 'Ventilation'], medicines: ['Ibuprofen'], consult: ['Neurologist'] },
    'bricklayer': GENERIC_RISKS.manual_heavy,
    'roofer': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Heat Stroke', risk: 'High', description: 'Direct sun exposure.' }] },
    'crane operator': GENERIC_RISKS.desk_general, // Sedentary but alert
    'landscaper': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Sun Damage', risk: 'High', description: 'UV exposure.' }, { name: 'Allergies', risk: 'Medium', description: 'Pollen/Plant exposure.' }] },

    // --- SERVICE & HOSPITALITY ---
    'chef': { diseases: [{ name: 'Thermal Burns', risk: 'High', description: 'Stove/Oven contact.' }, { name: 'Cuts/Lacerations', risk: 'Medium', description: 'Knife work.' }, { name: 'Heat Stress', risk: 'Medium', description: 'Hot kitchen environment.' }], prevention: ['Cut-resistant gloves', 'Burn sleeves', 'Hydration'], medicines: ['Burn gel', 'Bandages'], consult: ['Dermatologist'] },
    'cook': { diseases: [{ name: 'Thermal Burns', risk: 'High', description: 'Stove/Oven contact.' }, { name: 'Cuts/Lacerations', risk: 'Medium', description: 'Knife work.' }, { name: 'Heat Stress', risk: 'Medium', description: 'Hot kitchen environment.' }], prevention: ['Cut-resistant gloves', 'Burn sleeves', 'Hydration'], medicines: ['Burn gel', 'Bandages'], consult: ['Dermatologist'] },
    'waiter': GENERIC_RISKS.service_standing,
    'waitress': GENERIC_RISKS.service_standing,
    'bartender': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Tinnitus', risk: 'Low', description: 'Loud club environments.' }] },
    'barista': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Repetitive Wrist Strain', risk: 'Medium', description: 'Tamping espresso.' }] },
    'hotel manager': GENERIC_RISKS.service_standing,
    'housekeeper': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Chemical Irritation', risk: 'Medium', description: 'Cleaning agents.' }] },
    'janitor': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Chemical Irritation', risk: 'Medium', description: 'Cleaning agents.' }] },
    'cleaner': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Chemical Irritation', risk: 'Medium', description: 'Cleaning agents.' }] },
    'hairdresser': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Contact Dermatitis', risk: 'High', description: 'Hair dyes/bleach.' }, { name: 'Asthma', risk: 'Medium', description: 'Chemical fumes.' }] },
    'beautician': GENERIC_RISKS.service_standing,
    'flight attendant': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Jet Lag', risk: 'High', description: 'Time zone shifts.' }, { name: 'Cosmic Radiation', risk: 'Low', description: 'High altitude exposure.' }] },
    'tour guide': GENERIC_RISKS.service_standing,

    // --- TRANSPORT & LOGISTICS ---
    'truck driver': GENERIC_RISKS.driver,
    'taxi driver': GENERIC_RISKS.driver,
    'bus driver': GENERIC_RISKS.driver,
    'delivery driver': { ...GENERIC_RISKS.driver, diseases: [...GENERIC_RISKS.driver.diseases, { name: 'Lifting Strain', risk: 'Medium', description: 'Package handling.' }] },
    'pilot': { diseases: [{ name: 'Circadian Disruption', risk: 'High', description: 'Shift work/Jet lag.' }, { name: 'Hearing Loss', risk: 'Medium', description: 'Cockpit noise.' }, { name: 'Cosmic Radiation', risk: 'Low', description: 'Altitude.' }], prevention: ['Noise-canceling headset', 'Sleep schedule'], medicines: ['Melatonin'], consult: ['Aviation Med Examiner'] },
    'warehouse worker': GENERIC_RISKS.manual_heavy,
    'postal worker': GENERIC_RISKS.service_standing,
    'sailor': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Seasickness', risk: 'Medium', description: 'Motion sickness.' }] },

    // --- EDUCATION & ARTS ---
    'teacher': GENERIC_RISKS.education,
    'professor': GENERIC_RISKS.education,
    'librarian': { ...GENERIC_RISKS.desk_general, diseases: [{ name: 'Dust Allergy', risk: 'Medium', description: 'Old books/archives.' }] },
    'musician': { diseases: [{ name: 'Hearing Loss', risk: 'High', description: 'Loud instruments.' }, { name: 'Focal Dystonia', risk: 'Low', description: 'Motor control loss.' }], prevention: ['Musician earplugs'], medicines: [], consult: ['Audiologist', 'Neurologist'] },
    'artist': GENERIC_RISKS.manual_precision,
    'photographer': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Back/Neck Pain', risk: 'Medium', description: 'Carrying gear.' }] },
    'actor': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Performance Anxiety', risk: 'Medium', description: 'Stage stress.' }] },
    'writer': GENERIC_RISKS.desk_tech,
    'journalist': { ...GENERIC_RISKS.desk_tech, diseases: [{ name: 'High Stress', risk: 'High', description: 'Deadlines/Field work.' }] },

    // --- PUBLIC SAFETY & OTHERS ---
    'police officer': { ...GENERIC_RISKS.driver, diseases: [{ name: 'PTSD', risk: 'High', description: 'Traumatic events.' }, { name: 'Cardiovascular Risk', risk: 'High', description: 'High stress + bursts of activity.' }] },
    'firefighter': { diseases: [{ name: 'Smoke Inhalation', risk: 'High', description: 'Lung damage.' }, { name: 'Heat Stress', risk: 'High', description: 'Fire proximity.' }, { name: 'Cancer Risk', risk: 'Medium', description: 'Carcinogen exposure.' }], prevention: ['SCBA gear', 'Decon protocols'], medicines: [], consult: ['Pulmonologist', 'Oncologist'] },
    'security guard': GENERIC_RISKS.service_standing,
    'soldier': { diseases: [{ name: 'PTSD', risk: 'High', description: 'Combat stress.' }, { name: 'Traumatic Brain Injury', risk: 'Medium', description: 'Explosions/Impact.' }, { name: 'Joint Injuries', risk: 'High', description: 'Heavy loads.' }], prevention: ['Mental resilience training', 'PPE'], medicines: [], consult: ['Psychiatrist', 'Trauma Surgeon'] },
    'miner': { diseases: [{ name: 'Black Lung', risk: 'High', description: 'Coal dust.' }, { name: 'Hearing Loss', risk: 'High', description: 'Explosions/Drills.' }], prevention: ['Respirators', 'Ear defense'], medicines: [], consult: ['Pulmonologist'] },
    'farmer': { diseases: [{ name: 'Pesticide Toxicity', risk: 'Medium', description: 'Chemical exposure.' }, { name: 'Farmer\'s Lung', risk: 'Medium', description: 'Mold/Dust.' }, { name: 'Skin Cancer', risk: 'High', description: 'Sun exposure.' }], prevention: ['Masks', 'Sunscreen'], medicines: [], consult: ['Pulmonologist', 'Dermatologist'] },
    'fisherman': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Drowning Risk', risk: 'High', description: 'Water hazards.' }, { name: 'UV Exposure', risk: 'High', description: 'Reflection off water.' }] },
    'fitness trainer': { ...GENERIC_RISKS.service_standing, diseases: [{ name: 'Overuse Injury', risk: 'High', description: 'Excessive exercise.' }] },
    'athlete': { ...GENERIC_RISKS.manual_heavy, diseases: [{ name: 'Ligament Tears', risk: 'High', description: 'ACL/MCL injuries.' }, { name: 'Concussion', risk: 'Medium', description: 'Contact sports.' }] },
    'yoga instructor': GENERIC_RISKS.service_standing
};

const OccupationalHealth = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const wrapperRef = useRef(null);

    // Filter professions for autocomplete
    useEffect(() => {
        if (searchTerm.length > 0) {
            const matches = Object.keys(PROFESSION_DATABASE).filter(job =>
                job.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(matches.slice(0, 8)); // Limit to top 8 results
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelectProfession = (job) => {
        setSearchTerm(job); // Set input to the clicked job
        setShowSuggestions(false); // Hide dropdown
        const data = PROFESSION_DATABASE[job.toLowerCase()];
        setSelectedData(data); // Show data
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const term = searchTerm.toLowerCase();

        // Exact match
        if (PROFESSION_DATABASE[term]) {
            setSelectedData(PROFESSION_DATABASE[term]);
            return;
        }

        // Fuzzy/Best Match attempt
        const bestMatch = Object.keys(PROFESSION_DATABASE).find(job => job.includes(term));
        if (bestMatch) {
            setSearchTerm(bestMatch); // Auto-correct the input
            setSelectedData(PROFESSION_DATABASE[bestMatch]);
        }
    };

    return (
        <div className="w-full" ref={wrapperRef}>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                    <Briefcase size={24} className="text-amber-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Occupational Wellness</h2>
                    <p className="text-white font-bold text-sm">Discover health risks, preventive measures, and medical advice tailored to your profession.</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 mb-8 overflow-visible relative">
                <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mb-8 z-50">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => { if (searchTerm) setShowSuggestions(true); }}
                        placeholder="Enter your profession (e.g., Teacher, Engineer)..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-28 sm:pr-4 text-base sm:text-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 sm:px-6 py-2 rounded-xl transition-colors text-sm sm:text-base">
                        Analyze
                    </button>

                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute w-full bg-slate-900/95 border border-white/10 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-2xl backdrop-blur-md z-[100]"
                            >
                                {suggestions.map((job, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleSelectProfession(job)}
                                        className="px-6 py-3 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer border-b border-white/5 last:border-0 capitalize flex items-center gap-3 transition-colors"
                                    >
                                        <Search size={14} className="opacity-50" />
                                        {job}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </form>

                <AnimatePresence mode="wait">
                    {selectedData ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Risks Column */}
                            <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                    <Activity className="text-red-400" size={20} />
                                    Occupational Risks
                                </h3>
                                <div className="space-y-4">
                                    {selectedData.diseases.map((disease, idx) => (
                                        <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-slate-200">{disease.name}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${disease.risk === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {disease.risk} Risk
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">{disease.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prevention Column */}
                            <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                    <Shield className="text-emerald-400" size={20} />
                                    Preventive Measures
                                </h3>
                                <ul className="space-y-3">
                                    {selectedData.prevention.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                            <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                                            <span className="text-sm text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Consult Column */}
                            <div className="space-y-6">
                                <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                        <Stethoscope className="text-blue-400" size={20} />
                                        Recommended Specialists
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedData.consult.map((doc, idx) => (
                                            <span key={idx} className="bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-lg text-sm border border-blue-500/20">
                                                {doc}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                        <Pill className="text-purple-400" size={20} />
                                        Common Medicines
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedData.medicines.map((med, idx) => (
                                            <span key={idx} className="bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-lg text-sm border border-purple-500/20">
                                                {med}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 p-3 rounded-lg border border-white/5">
                                        <AlertTriangle size={12} className="text-yellow-500 shrink-0" />
                                        <span>Consult a doctor before taking any medication.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12 text-slate-400 border border-white/5 rounded-2xl bg-slate-900/20"
                        >
                            <Briefcase size={40} className="mx-auto mb-4 opacity-50 text-amber-500" />
                            <p>Try searching for <span className="text-amber-400">Software Engineer</span>, <span className="text-amber-400">Teacher</span>, or <span className="text-amber-400">Construction Worker</span> to see a demo.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OccupationalHealth;
