import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Loader, ServerCrash, Info, Pill, TrendingUp, X, Download, Users, Brain, Search, MapPin, AlertTriangle, Map, Calendar, ShieldCheck, Clock, Layers, HeartPulse, Wind, Droplets, Database, ArrowLeft } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Header from './Header';
import OccupationalHealth from './OccupationalHealth';
import SocialDeterminants from './SocialDeterminants';
import EnvironmentalHealth from './EnvironmentalHealth';
import RareDisease from './RareDisease';
import StateHealthProfile from './StateHealthProfile';
import { API_BASE_URL } from '../config';


// Add Google Maps Script
const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
};

// Geographic coordinates for Indian states
// Geographic coordinates for Indian states and UTs
const STATE_COORDINATES = {
    'Andaman and Nicobar Islands': { lat: 11.7401, lng: 92.6586 },
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
    'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
    'Assam': { lat: 26.2006, lng: 92.9376 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
    'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.1809, lng: 73.0169 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Goa': { lat: 15.2993, lng: 74.1240 },
    'Gujarat': { lat: 22.2587, lng: 71.1924 },
    'Haryana': { lat: 29.0588, lng: 76.0856 },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
    'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762 },
    'Jharkhand': { lat: 23.6102, lng: 85.2799 },
    'Karnataka': { lat: 15.3173, lng: 75.7139 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
    'Ladakh': { lat: 34.1526, lng: 77.5770 },
    'Lakshadweep': { lat: 10.5667, lng: 72.6417 },
    'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
    'Maharashtra': { lat: 19.7515, lng: 75.7139 },
    'Manipur': { lat: 24.6637, lng: 93.9063 },
    'Meghalaya': { lat: 25.4670, lng: 91.3662 },
    'Mizoram': { lat: 23.1645, lng: 92.9376 },
    'Nagaland': { lat: 26.1584, lng: 94.5624 },
    'Odisha': { lat: 20.9517, lng: 85.0985 },
    'Puducherry': { lat: 11.9416, lng: 79.8083 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179 },
    'Sikkim': { lat: 27.5330, lng: 88.5122 },
    'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
    'Telangana': { lat: 18.1124, lng: 79.0193 },
    'Tripura': { lat: 23.9408, lng: 91.9882 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
    'West Bengal': { lat: 22.9868, lng: 87.8550 }
};

const LOADING_FACTS = [
    "Use our 'Cure Analyzer' to instantly interpret complex medical prescriptions.",
    "CureBird uses advanced AI to track disease outbreaks in real-time.",
    "Securely store and organize your entire family's medical history in one place.",
    "Our heatmaps visualize regional health trends to help you stay informed.",
    "Upload lab reports (PDF/Image) and let our OCR engine digitize the data for you."
];

const HeatmapModal = ({ isOpen, onClose, regionalData }) => {
    const mapRef = React.useRef(null);
    const [mapError, setMapError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

        if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
            setMapError('Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env.local file.');
            return;
        }

        loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
            .then(() => {
                if (!mapRef.current) return;

                const map = new window.google.maps.Map(mapRef.current, {
                    zoom: 5,
                    center: { lat: 20.5937, lng: 78.9629 },
                    mapTypeId: 'roadmap',
                    styles: [
                        { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
                    ]
                });

                const heatmapData = [];
                regionalData.forEach(region => {
                    const coords = STATE_COORDINATES[region.name];
                    if (coords) {
                        const intensity = Math.ceil(region.value / 10);
                        for (let i = 0; i < intensity; i++) {
                            heatmapData.push(
                                new window.google.maps.LatLng(
                                    coords.lat + (Math.random() - 0.5) * 0.5,
                                    coords.lng + (Math.random() - 0.5) * 0.5
                                )
                            );
                        }

                        const marker = new window.google.maps.Marker({
                            position: coords,
                            map: map,
                            title: region.name,
                            icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 8,
                                fillColor: '#38bdf8',
                                fillOpacity: 0.8,
                                strokeColor: '#0ea5e9',
                                strokeWeight: 2
                            }
                        });

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `<div style="color: #1e293b; padding: 8px;"><h3 style="margin: 0 0 4px 0; font-weight: bold;">${region.name}</h3><p style="margin: 0; font-size: 14px;">${region.value} cases</p></div>`
                        });

                        marker.addListener('click', () => {
                            infoWindow.open(map, marker);
                        });
                    }
                });

                new window.google.maps.visualization.HeatmapLayer({
                    data: heatmapData,
                    map: map,
                    radius: 50,
                    gradient: ['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 1)', 'rgba(0, 191, 255, 1)', 'rgba(0, 127, 255, 1)', 'rgba(0, 63, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(63, 0, 91, 1)', 'rgba(127, 0, 63, 1)', 'rgba(191, 0, 31, 1)', 'rgba(255, 0, 0, 1)']
                });
            })
            .catch(err => {
                console.error('Error loading Google Maps:', err);
                setMapError('Failed to load Google Maps.');
            });
    }, [isOpen, regionalData]);

    if (!isOpen) return null;

    return createPortal(
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900 w-full max-w-6xl h-[80vh] rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors group"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Map className="text-sky-400" size={28} />Disease Heatmap - India</h2>
                            <div className="mt-2 space-y-1">
                                <p className="text-slate-300 text-sm font-medium">
                                    Visualize the intensity of disease outbreaks across regions.
                                    <span className="text-red-400 font-bold ml-1">Red zones</span> indicate high-density clusters, while
                                    <span className="text-sky-400 font-bold ml-1">Blue zones</span> show lower activity.
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                    Use this interactive tool to identify regional hotspots and track epidemiological spread in real-time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative h-[calc(100%-88px)]">
                    {mapError ? (
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
                                <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
                                <h3 className="text-xl font-bold text-red-400 mb-2">Map Loading Error</h3>
                                <p className="text-slate-300 text-sm mb-4">{mapError}</p>
                            </div>
                        </div>
                    ) : (
                        <div ref={mapRef} className="w-full h-full" />
                    )}
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};

const DiseaseCard = ({ disease, onClick, getRiskLevel }) => {
    const risk = getRiskLevel(disease);
    const isChronic = disease.segment === 'Chronic';

    return (
        <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="glass-card p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full"
        >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={80} />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-emerald-400 transition-all duration-300 leading-tight">
                        {disease.disease}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${risk.bg} ${risk.color} border ${risk.border}`}>
                            {disease.severity || 'Moderate Severity'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <ShieldCheck size={10} className={disease.confidence === 'High' ? 'text-emerald-400' : 'text-orange-400'} />
                        {disease.confidence} Confidence
                    </span>
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                        {isChronic ? (disease.outbreaks) : disease.outbreaks.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        {isChronic ? 'National Prevalence' : 'Reported Cases'}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                    <Calendar size={10} /> {disease.timeframe}
                </div>
            </div>

            <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed relative z-10 group-hover:text-slate-200 transition-colors">
                {disease.description}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} className="text-sky-400" />
                        {disease.seasonality}
                    </span>
                    <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[120px]">
                        {disease.sources && disease.sources[0]}
                    </span>
                </div>

                {disease.segment === 'Seasonal' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold bg-orange-400/5 p-1.5 rounded border border-orange-400/10">
                        <TrendingUp size={12} /> Seasonal Surveillance Active
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const HealthIndexCard = ({ title, value, status, trend, icon: Icon, color, source, description, utility, isMobile }) => (
    <div className="glass-card p-4 sm:p-5 relative group hover:-translate-y-1 transition-all duration-300 hover:z-[45]">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon size={isMobile ? 48 : 64} className={color} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 ${color}`}>
                        <Icon size={isMobile ? 16 : 20} />
                    </div>
                    <h3 className="text-[10px] sm:text-sm font-bold text-slate-300 uppercase tracking-wide">{title}</h3>
                </div>
                ...

                {/* Info Icon with Tooltip */}
                <div className="relative group/info">
                    <Info size={16} className="text-slate-500 hover:text-sky-400 cursor-help transition-colors" />
                    <div className="absolute right-0 top-6 w-64 p-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[100] translate-y-2 group-hover/info:translate-y-0 pointer-events-none group-hover/info:pointer-events-auto">
                        <div className="mb-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">What is this?</h4>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">{description}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Why it matters?</h4>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">{utility}</p>
                        </div>
                        <div className="absolute -top-1.5 right-1 w-3 h-3 bg-slate-900 border-l border-t border-white/10 transform rotate-45"></div>
                    </div>
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs text-slate-400 font-medium">Index</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${status === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                <Activity size={10} /> {status} Risk
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed font-medium">
                {trend}
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source</span>
                <span className="text-[10px] text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">{source || 'MoHFW'}</span>
            </div>
        </div>
    </div>
);

const CureStat = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate, onAddRecordClick }) => {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.4
            }
        }
    };

    const fadeSlideUp = {
        hidden: { opacity: 0, y: 100, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const staggerScale = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -100, filter: "blur(5px)" },
        visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 100, filter: "blur(5px)" },
        visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const blurReveal = {
        hidden: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration: 1, ease: "easeOut" }
        }
    };

    const [resourceData, setResourceData] = useState([]);
    const [trends, setTrends] = useState([]);
    const [filteredTrends, setFilteredTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = React.useRef(null);

    useEffect(() => {
        const fetchDiseaseTrends = async () => {
            try {
                // Fetch Disease Trends
                const response = await fetch(`${API_BASE_URL}/api/disease-trends`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log("--- SURVEILLANCE DATA RECEIVED ---", data);

                // Safety Check: Ensure data is an array
                const safeData = Array.isArray(data) ? data : [];
                setTrends(safeData);
                setFilteredTrends(safeData);

                // Fetch Resource Distribution
                const resResponse = await fetch(`${API_BASE_URL}/api/resource-distribution`);
                if (resResponse.ok) {
                    const resData = await resResponse.json();
                    setResourceData(resData);
                }

                setError(null);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not connect to the AI analysis server.");
            } finally {
                setLoading(false);
            }
        };
        fetchDiseaseTrends();
    }, []);

    const getRiskLevel = (item) => {
        // If it's a chronic disease with prevalence, use a different logic or just return the severity
        if (item.segment === 'Chronic') {
            return { level: item.severity || 'Moderate', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        }

        const count = typeof item.outbreaks === 'number' ? item.outbreaks : 0;
        if (count > 500000) return { level: 'Massive', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
        if (count > 50000) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
        return { level: 'Moderate', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    };

    const applyFilters = useCallback(() => {
        let result = [...trends];
        if (searchTerm.trim()) {
            result = result.filter(item =>
                item.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (riskFilter !== 'all') {
            result = result.filter(item => getRiskLevel(item).level.toLowerCase().includes(riskFilter));
        }
        setFilteredTrends(result);
    }, [trends, searchTerm, riskFilter]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            // Create a unique list of matches
            const uniqueDiseases = [...new Set(trends.map(t => t.disease))];
            const matches = uniqueDiseases.filter(d =>
                d.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 6); // Limit to 6 suggestions

            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (diseaseName) => {
        setSearchTerm(diseaseName);
        setShowSuggestions(false);
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const COLORS = ['#f59e0b', '#fbbf24', '#d97706', '#fcd34d', '#b45309', '#78350f'];
    const GENDER_COLORS = ['#f59e0b', '#fbbf24'];

    // Weighted distribution based on typical IDSP surveillance reporting volumes (Proxy for state burden)
    const STATE_DISTRIBUTION_WEIGHTS = {
        'Maharashtra': 0.18, // High reporting & density
        'Kerala': 0.15,      // Very high surveillance
        'Karnataka': 0.12,
        'Tamil Nadu': 0.11,
        'Delhi': 0.09,
        'Uttar Pradesh': 0.08, // Lower relative reporting vs population
        'West Bengal': 0.07,
        'Gujarat': 0.06,
        'Rajasthan': 0.05,
        'Andhra Pradesh': 0.04
    };

    const getRegionalData = (disease) => {
        if (!disease || !disease.outbreaks) return [];

        // Ensure we are working with a number
        let totalCases = typeof disease.outbreaks === 'string' ?
            parseFloat(disease.outbreaks.replace(/,/g, '')) :
            disease.outbreaks;

        // If it's a prevalence % (like Diabetes), map differently or skip
        if (disease.segment === 'Chronic' && totalCases < 100) {
            // For percentage based, we project a sample population of 1000 for visualization
            totalCases = 1000 * (totalCases / 100);
        }

        return Object.entries(STATE_DISTRIBUTION_WEIGHTS).map(([state, weight]) => ({
            name: state,
            value: Math.round(totalCases * weight)
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
    };


    const downloadCSV = (data) => {
        const headers = ["Year", "Cases"];
        const rows = data.history.map(item => [item.year, item.count]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${data.disease}_research_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 backdrop-blur-md border border-yellow-500/30 p-4 rounded-xl shadow-2xl z-[99999]">
                    <p className="text-slate-200 font-semibold mb-1 text-sm">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
                            Est. Cases: <span className="font-bold text-base">{entry.value.toLocaleString()}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const ResourceTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-2xl z-[99999]">
                    <p className="text-slate-200 font-semibold mb-1 text-sm">{label}</p>
                    {payload.map((entry, index) => {
                        const isDensity = entry.name.includes('Density');
                        const unit = isDensity ? '/1000' : '%';
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <span className="text-xs text-slate-400">{entry.name}:</span>
                                <span className="font-bold text-sm font-mono" style={{ color: entry.color }}>
                                    {entry.value}{unit}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    // --- Dynamic Loading Screen Logic ---
    const [currentFactIndex, setCurrentFactIndex] = useState(0);



    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setCurrentFactIndex((prev) => (prev + 1) % LOADING_FACTS.length);
        }, 4000); // Change fact every 4 seconds
        return () => clearInterval(interval);
    }, [loading]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
            <div className="w-64 h-64 md:w-80 md:h-80 mb-6">
                <DotLottieReact
                    src="/assets/curestat_loader.lottie"
                    loop
                    autoplay
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md space-y-4"
            >
                <h3 className="text-2xl font-bold text-amber-500 animate-pulse">
                    Analyzing Health Data...
                </h3>

                <p className="text-sm text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded-full border border-white/10 inline-block">
                    ⚠️ This may take 1-2 mins to load
                </p>

                <div className="h-20 flex items-center justify-center mt-4">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentFactIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-slate-300 text-lg font-medium leading-relaxed"
                        >
                            "Did you know? {LOADING_FACTS[currentFactIndex]}"
                        </motion.p>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/10 p-8 rounded-2xl border border-red-500/20 text-center max-w-md">
                <ServerCrash size={64} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">Connection Error</h2>
                <p className="text-slate-400">{error}</p>
            </motion.div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto relative text-white selection:bg-sky-500/30">
            <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                <Header title="Cure Stat" description="Real-time disease intelligence, medication insights, and predictive analytics for a healthier India." user={user} onLogout={onLogout} onLoginClick={onLoginClick} onToggleSidebar={onToggleSidebar} onNavigate={onNavigate} onAddClick={() => onAddRecordClick && onAddRecordClick()} />
            </div>

            {/* FREE TIER LOCK OVERLAY */}
            {(user?.subscriptionTier !== 'Premium' && user?.subscriptionTier !== 'Basic') && (
                <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-3xl border border-amber-500/30 max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
                        <Activity size={64} className="text-amber-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Premium Health Intelligence</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Upgrade to <span className="text-amber-400 font-bold">Premium</span> to access real-time disease tracking, predictive analytics, and national health indices.
                        </p>
                        <button
                            onClick={() => onNavigate('/dashboard')}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                        >
                            Explore Premium Plans
                        </button>
                    </div>
                </div>
            )}

            <div className={`relative z-10 ${(user?.subscriptionTier !== 'Premium' && user?.subscriptionTier !== 'Basic') ? 'blur-sm pointer-events-none' : ''}`}>

                {/* Premium Hero Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={blurReveal}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-6 sm:p-8 mb-8 text-center mt-6"
                >
                    <div className="absolute top-0 left-0 -translate-x-1/4 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                        <Activity size={14} className="sm:w-4 sm:h-4" /> REAL-TIME MONITOR
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight drop-shadow-lg">
                        Medical Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Hub</span>
                    </h1>

                    <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                        Track disease outbreaks, analyze national health trends, and access real-time predictive analytics to stay ahead of challenges.
                    </p>

                    <div className="flex justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 opacity-70 scale-75 sm:scale-100">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><Activity size={18} /></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Monitor</span>
                        </div>
                        <div className="w-8 sm:w-16 h-px bg-slate-700 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-orange-400"><Map size={18} /></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Track</span>
                        </div>
                        <div className="w-8 sm:w-16 h-px bg-slate-700 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><TrendingUp size={18} /></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Predict</span>
                        </div>
                    </div>
                </motion.div>



                {/* --- NEW SECTION: National Health Indices --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={containerVariants}
                    className="mb-12"
                >
                    <motion.h2 variants={fadeSlideUp} className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-amber-400" size={24} />
                        National Health Indices
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* 1. Diabetes Health Index */}
                        <motion.div variants={staggerScale}>
                            <HealthIndexCard
                                isMobile={isMobile}
                                title="Diabetes Index"
                                value="11.4%"
                                status="Critical"
                                trend="Rising prevalence in urban & rural sectors."
                                icon={Database}
                                color="text-rose-400"
                                source="ICMR-INDIAB"
                                description="Tracks the prevalence of high blood sugar levels across the population."
                                utility="Vital for preventing long-term complications like kidney failure, nerve damage, and vision loss."
                            />
                        </motion.div>
                        {/* 2. Cardiac Health Index */}
                        <motion.div variants={staggerScale}>
                            <HealthIndexCard
                                isMobile={isMobile}
                                title="Cardiac Index"
                                value="15.2%"
                                status="Critical"
                                trend="Leading cause of mortality nationwide."
                                icon={HeartPulse}
                                color="text-red-500"
                                source="GBD Study"
                                description="Monitors the rate of heart diseases, including heart attacks and hypertension."
                                utility="Helps identify at-risk populations for early intervention to reduce sudden cardiac deaths."
                            />
                        </motion.div>
                        {/* 3. Respiratory Health Index */}
                        <motion.div variants={staggerScale}>
                            <HealthIndexCard
                                isMobile={isMobile}
                                title="Respiratory Index"
                                value="High"
                                status="Severe"
                                trend="Seasonal spikes due to pollution & viral load."
                                icon={Wind}
                                color="text-sky-400"
                                source="IDSP Network"
                                description="Measures lung health trends, impacted by pollution, asthma, and infections."
                                utility="Crucial for forecasting seasonal outbreaks (like flu) and managing air quality health risks."
                            />
                        </motion.div>
                        {/* 4. Renal Health Index */}
                        <motion.div variants={staggerScale}>
                            <HealthIndexCard
                                isMobile={isMobile}
                                title="Renal Index"
                                value="13.0%"
                                status="High"
                                trend="Correlated with diabetes & hypertension trends."
                                icon={Droplets}
                                color="text-blue-400"
                                source="ISN Registry"
                                description="Tracks chronic kidney disease (CKD) rates and kidney function decline."
                                utility="Essential for planning dialysis infrastructure and detecting early-stage renal failure."
                            />
                        </motion.div>
                        {/* 5. Mental Health Index */}
                        <motion.div variants={staggerScale}>
                            <HealthIndexCard
                                isMobile={isMobile}
                                title="Mental Health"
                                value="10.6%"
                                status="Moderate"
                                trend="Increasing reported anxiety disorders."
                                icon={Brain}
                                color="text-purple-400"
                                source="NMHS Survey"
                                description="Assesses the prevalence of anxiety, depression, and other psychological conditions."
                                utility="Guides the allocation of psychological support services and destigmatization efforts."
                            />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 sm:p-5 relative z-40 mx-2 sm:mx-0">
                    <div className="relative w-full md:w-96 group" ref={searchWrapperRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search diseases, symptoms..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => { if (searchTerm) setShowSuggestions(true); }}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 sm:py-2.5 pl-10 pr-4 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner text-sm"
                        />
                        ...
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                        {['all', 'high', 'medium', 'low'].map((level) => (
                            <button key={level} onClick={() => setRiskFilter(level)} className={`px-4 py-2.5 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold capitalize transition-all whitespace-nowrap border ${riskFilter === level ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border-sky-400' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}>
                                {level === 'all' ? 'All Risks' : `${level} Risk`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 px-2 sm:px-0">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ margin: "-100px" }}
                        variants={slideInLeft}
                        className="glass-card p-5 sm:p-6 relative hover:z-[45] transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-white">Regional Impact</h2>
                                    <div className="group relative">
                                        <Info size={16} className="text-slate-500 hover:text-sky-400 cursor-help transition-colors" />
                                        <div className="absolute left-0 bottom-full mb-2 w-96 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                                            {/* Section 1: The Calculation Formula */}
                                            <p className="text-xs font-bold text-white mb-2 border-b border-white/10 pb-2">Calculation Methodology</p>
                                            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                                                Regional values are projected from <span className="text-sky-400 font-medium">National Confirmed Cases</span> using a surveillance-weighted distribution model.
                                            </p>

                                            {/* Section 2: The Concept Definition */}
                                            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
                                                <p className="text-[11px] font-semibold text-slate-200 mb-2">What is Surveillance-Weighted Distribution?</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                                    A statistical method used to estimate regional case loads based on the strength of each state's reporting system.
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></div>
                                                        <p className="text-[10px] text-slate-400">
                                                            <span className="text-sky-400 font-semibold">Surveillance:</span> Refers to how actively a state monitors, tests, and reports diseases.
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 items-start">
                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                                        <p className="text-[10px] text-slate-400">
                                                            <span className="text-indigo-400 font-semibold">Weighted:</span> Detailed data from strong systems (like Kerala or Maharashtra) is given more weight, as it better represents the true disease spread.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute left-2 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mt-1">States with highest total number of disease cases</p>
                            </div>
                            <button onClick={() => setShowHeatmap(true)} className="group relative overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-sky-500/25 flex items-center gap-2 border border-white/10 ml-4">
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <div className="relative flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400 border border-white"></span>
                                    </span>
                                    <span className="font-semibold text-white tracking-wide text-xs">Live Heatmap</span>
                                    <MapPin size={14} className="text-white" />
                                </div>
                            </button>
                        </div>
                        <div className="h-[250px] sm:h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={getRegionalData(trends[0] || { disease: 'Default' })} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                                    <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} width={isMobile ? 60 : 80} fontWeight="bold" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                                    <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={isMobile ? 12 : 20}>
                                        {getRegionalData(trends[0] || { disease: 'Default' }).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ margin: "-100px" }}
                        variants={slideInRight}
                        className="glass-card p-6 relative hover:z-[45] transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">Disease Distribution</h2>
                                    <div className="group relative">
                                        <Info size={16} className="text-slate-500 hover:text-sky-400 cursor-help transition-colors" />
                                        <div className="absolute right-0 bottom-full mb-2 w-96 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                                            {/* Section 1: The Calculation Formula */}
                                            <p className="text-xs font-bold text-white mb-2 border-b border-white/10 pb-2">Calculation Methodology</p>
                                            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                                                Calculated by aggregating <span className="text-sky-400 font-medium">Total Reported Cases</span> for all monitored conditions to determine the percentage share (morbidity) of each disease.
                                            </p>

                                            {/* Section 2: The Concept Definition */}
                                            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
                                                <p className="text-[11px] font-semibold text-slate-200 mb-2">What is Morbidity Distribution?</p>
                                                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                                    A comparative snapshot showing which diseases are currently dominating the public health burden.
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                                        <p className="text-[10px] text-slate-400">
                                                            <span className="text-orange-400 font-semibold">Proportional Load:</span> Helps identify if a single outbreak (like Dengue) is overwhelming the system compared to baseline illnesses.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute right-4 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mt-1">Proportion of top reported illnesses</p>
                            </div>
                        </div>
                        <div className="h-[300px] sm:h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={filteredTrends.slice(0, 5)} cx="50%" cy="45%" innerRadius={isMobile ? 40 : 60} outerRadius={isMobile ? 60 : 80} paddingAngle={4} dataKey="outbreaks" nameKey="disease" stroke="none">
                                        {filteredTrends.slice(0, 5).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={undefined}
                                        iconType="circle"
                                        layout={isMobile ? "horizontal" : "vertical"}
                                        align="center"
                                        wrapperStyle={{ paddingTop: isMobile ? '10px' : '20px' }}
                                        formatter={(value) => <span className="text-white text-[10px] sm:text-sm ml-2 font-bold">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>



                {/* --- NEW SECTION: Environmental Health (Corrected Position) --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={fadeSlideUp}
                    className="mb-12"
                >
                    <EnvironmentalHealth />
                </motion.div>

                {/* --- NEW SECTION: Resource Disparity (Respectful Presentation) --- */}
                {
                    resourceData.length > 0 && (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ margin: "-100px" }}
                            variants={fadeSlideUp}
                            className="mb-12"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                    <Users size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        Healthcare Access Insights
                                        <div className="group relative ml-1">
                                            <Info size={16} className="text-slate-500 cursor-help hover:text-emerald-400 transition-colors" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                                <strong>Verified Source:</strong> Rural Health Statistics (RHS) 2021-22, MoHFW, Govt of India.
                                                <br /><br />
                                                Displays the gap in health infrastructure between Urban and Rural India.
                                            </div>
                                        </div>
                                    </h2>
                                    <p className="text-white font-bold text-sm">Comparative analysis of resource density and sector distribution across states.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Chart 1: Bed Density Urban vs Rural */}
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span>Infrastructure Density</span>
                                            <div className="group relative">
                                                <Info size={16} className="text-slate-500 hover:text-emerald-400 cursor-help transition-colors" />
                                                <div className="absolute left-0 bottom-full mb-2 w-80 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                    <p className="text-xs font-bold text-white mb-2 border-b border-white/10 pb-2">Metric Methodology</p>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                                                        Ratio of hospital beds available per 1,000 people. Data sourced from Rural Health Statistics (RHS).
                                                    </p>
                                                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3">
                                                        <p className="text-[11px] font-semibold text-emerald-200 mb-1">What is Urban-Rural Disparity?</p>
                                                        <p className="text-[10px] text-emerald-100/70 leading-relaxed">
                                                            The gap in resource availability between cities and villages. A wide gap suggests rural populations struggle to access immediate care during outbreaks.
                                                        </p>
                                                    </div>
                                                    <div className="absolute left-2 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-normal text-slate-500 ml-auto bg-slate-800 px-2 py-1 rounded">Beds per 1000 Population</span>
                                    </h3>
                                    <div className="h-[250px] sm:h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={resourceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="state" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} interval={isMobile ? 1 : 0} angle={-25} textAnchor="end" height={60} fontWeight="bold" />
                                                <YAxis stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                                                <Tooltip content={<ResourceTooltip />} cursor={{ fill: 'transparent' }} />
                                                <Legend iconSize={10} wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} formatter={(value) => <span className="text-white font-bold">{value}</span>} />
                                                <Bar name="Urban Density" dataKey="urban_beds_per_1000" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={isMobile ? 8 : 12} />
                                                <Bar name="Rural Density" dataKey="rural_beds_per_1000" fill="#10b981" radius={[4, 4, 0, 0]} barSize={isMobile ? 8 : 12} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 2: Sector Utilization */}
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span>Sector Participation</span>
                                            <div className="group relative">
                                                <Info size={16} className="text-slate-500 hover:text-emerald-400 cursor-help transition-colors" />
                                                <div className="absolute right-0 bottom-full mb-2 w-80 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                    <p className="text-xs font-bold text-white mb-2 border-b border-white/10 pb-2">Metric Methodology</p>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                                                        Percentage of healthcare services provided by private vs public institutions in the state.
                                                    </p>
                                                    <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
                                                        <p className="text-[11px] font-semibold text-purple-200 mb-1">What is Privatization Reliance?</p>
                                                        <p className="text-[10px] text-purple-100/70 leading-relaxed">
                                                            Higher private share often indicates better advanced care availability but significantly higher out-of-pocket costs for citizens.
                                                        </p>
                                                    </div>
                                                    <div className="absolute right-4 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-normal text-slate-500 ml-auto bg-slate-800 px-2 py-1 rounded">% Share of Healthcare</span>
                                    </h3>
                                    <div className="h-[250px] sm:h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={resourceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorPrivate" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorPublic" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="state" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} interval={isMobile ? 1 : 0} angle={-25} textAnchor="end" height={60} fontWeight="bold" />
                                                <YAxis stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                                                <Tooltip content={<ResourceTooltip />} />
                                                <Legend iconSize={10} wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} formatter={(value) => <span className="text-white font-bold">{value}</span>} />
                                                <Area type="monotone" name="Private Sector" dataKey="private_sector_share" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPrivate)" />
                                                <Area type="monotone" name="Public Sector" dataKey="public_sector_share" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPublic)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* --- NEW SECTION: Occupational Health --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={fadeSlideUp}
                    className="mb-12"
                >
                    <OccupationalHealth />
                </motion.div>

                {/* --- NEW SECTION: SDOH --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={fadeSlideUp}
                    className="mb-12"
                >
                    <SocialDeterminants />
                </motion.div>



                {/* --- NEW SECTION: Rare Diseases --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={fadeSlideUp}
                    className="mb-12"
                >
                    <RareDisease />
                </motion.div>

                {/* --- NEW SECTION: State Health Profile --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={fadeSlideUp}
                    className="mb-12"
                >
                    <StateHealthProfile />
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    variants={containerVariants}
                >
                    <motion.h2 variants={fadeSlideUp} className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-gradient-to-b from-sky-400 to-purple-500 rounded-full block shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">National Disease Burden</span>
                        <div className="group relative ml-2">
                            <Info size={16} className="text-slate-500 cursor-help hover:text-sky-400 transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900/95 backdrop-blur-sm text-xs text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl z-50">
                                Accurate, professional, and meaningful, as it displays real-time high-risk disease data sourced from OGD India.
                            </div>
                        </div>
                        {searchTerm && (<span className="text-sm text-slate-400 font-normal ml-2">({filteredTrends.length} {filteredTrends.length === 1 ? 'result' : 'results'})</span>)}
                    </motion.h2>


                    {filteredTrends.length === 0 ? (
                        <div className="glass text-center py-16 text-slate-400 rounded-3xl border-dashed border-2 border-white/10">
                            <Search size={48} className="mx-auto mb-4 opacity-50 text-sky-400" />
                            <p className="text-lg font-medium text-white">No diseases found matching your criteria.</p>
                            <button onClick={() => { setSearchTerm(''); setRiskFilter('all'); }} className="mt-4 px-6 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl transition-colors font-medium border border-sky-500/20">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="space-y-16">

                            {/* 1. Acute Morbidity & General Clinical Burden */}
                            <motion.section variants={containerVariants}>
                                <motion.div variants={fadeSlideUp} className="flex flex-col items-center text-center mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                            <Activity size={20} className="text-sky-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Acute Morbidity & General Clinical Burden</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">(Highest national case volumes & primary care diagnostics)</p>
                                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent mt-4"></div>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrends.filter(d => d.segment === 'High-Burden').map((disease, index) => (
                                        <motion.div key={index} variants={staggerScale}>
                                            <DiseaseCard disease={disease} onClick={() => setSelectedDisease(disease)} getRiskLevel={getRiskLevel} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* 2. Epidemic-Prone & Outbreak Surveillance */}
                            <motion.section variants={containerVariants}>
                                <motion.div variants={fadeSlideUp} className="flex flex-col items-center text-center mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                            <TrendingUp size={20} className="text-orange-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Epidemic-Prone & Outbreak Surveillance</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">(Post-Monsoon / Winter Peaks & Seasonal Transmission)</p>
                                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mt-4"></div>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrends.filter(d => d.segment === 'Seasonal').map((disease, index) => (
                                        <motion.div key={index} variants={staggerScale}>
                                            <DiseaseCard disease={disease} onClick={() => setSelectedDisease(disease)} getRiskLevel={getRiskLevel} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* 3. Vaccine-Preventable Diseases (VPDs) */}
                            <motion.section variants={containerVariants}>
                                <motion.div variants={fadeSlideUp} className="flex flex-col items-center text-center mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                            <ShieldCheck size={20} className="text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Vaccine-Preventable Diseases (VPDs)</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">(Coverage Dependent Reporting & Immunization Targets)</p>
                                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mt-4"></div>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrends.filter(d => d.segment === 'Vaccine-Preventable').map((disease, index) => (
                                        <motion.div key={index} variants={staggerScale}>
                                            <DiseaseCard disease={disease} onClick={() => setSelectedDisease(disease)} getRiskLevel={getRiskLevel} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* 4. Chronic & Non-Communicable Primary Indicators */}
                            <motion.section variants={containerVariants}>
                                <motion.div variants={fadeSlideUp} className="flex flex-col items-center text-center mb-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <Layers size={20} className="text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Chronic & Non-Communicable Primary Indicators</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">(Long-term Prevalence, Surveillance Notification & NCD Metrics)</p>
                                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent mt-4"></div>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrends.filter(d => d.segment === 'Chronic').map((disease, index) => (
                                        <motion.div key={index} variants={staggerScale}>
                                            <DiseaseCard disease={disease} onClick={() => setSelectedDisease(disease)} getRiskLevel={getRiskLevel} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {showHeatmap && (<HeatmapModal isOpen={showHeatmap} onClose={() => setShowHeatmap(false)} regionalData={getRegionalData(trends[0] || { disease: 'Default' })} />)}
                </AnimatePresence>

                {/* Modal Portal - Always render Portal, let AnimatePresence handle content */}
                {createPortal(
                    <AnimatePresence>
                        {selectedDisease && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]" onClick={() => setSelectedDisease(null)}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 100 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 100 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="glass w-full sm:w-[95%] max-w-6xl h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-3xl border-0 sm:border border-white/10 shadow-2xl relative"
                                >
                                    <div className="p-4 sm:p-8 border-b border-white/10 sticky top-0 bg-slate-900/80 backdrop-blur-xl z-20 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-sm">
                                        <div className="w-full sm:w-auto">
                                            <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{selectedDisease.disease}</motion.h2>

                                            {/* --- DEBUG DIAGNOSTIC OVERLAY (Hidden on tiny screens) --- */}
                                            <div className="hidden sm:flex gap-2 mt-2">
                                                <span className={`text-[8px] px-2 py-0.5 rounded ${selectedDisease.history ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    TRENDS: {selectedDisease.history ? `OK (${selectedDisease.history.length})` : 'MISSING'}
                                                </span>
                                                <span className={`text-[8px] px-2 py-0.5 rounded ${selectedDisease.age_groups ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    AGE: {selectedDisease.age_groups ? `OK (${selectedDisease.age_groups.length})` : 'MISSING'}
                                                </span>
                                                <span className="text-[8px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                    ID: {selectedDisease.id}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                                                <p className="text-sky-400 text-sm sm:text-lg font-medium flex items-center gap-2">
                                                    <Activity size={16} />
                                                    {selectedDisease.segment === 'Chronic' ? selectedDisease.outbreaks : selectedDisease.outbreaks.toLocaleString()}
                                                    <span className="text-slate-500 text-xs sm:text-sm font-normal">
                                                        {selectedDisease.segment === 'Chronic' ? ' Prevalence' : ' cases (weekly)'}
                                                    </span>
                                                </p>
                                                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${getRiskLevel(selectedDisease).bg} ${getRiskLevel(selectedDisease).color} ${getRiskLevel(selectedDisease).border} flex items-center gap-1 uppercase tracking-wider`}>
                                                    {selectedDisease.severity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <button onClick={() => downloadCSV(selectedDisease)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl transition-colors font-medium border border-sky-500/20 text-xs sm:text-base">
                                                <Download size={16} /> <span className="sm:inline">Export</span>
                                            </button>
                                            <button onClick={() => setSelectedDisease(null)} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5"><X size={24} /></button>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                                        <div className="lg:col-span-5 space-y-8">
                                            <div className="bg-slate-800/30 p-4 sm:p-6 rounded-2xl border border-white/5">
                                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Info size={20} className="text-sky-400" /> Public Health Intelligence</h3>
                                                <div className="space-y-4">
                                                    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{selectedDisease.description}</p>

                                                    <div className="grid grid-cols-1 gap-3 pt-2">
                                                        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                                            <Calendar size={18} className="text-slate-500" />
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Timeframe</p>
                                                                <p className="text-xs sm:text-sm text-slate-300 font-medium">{selectedDisease.timeframe}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                                            <Clock size={18} className="text-slate-500" />
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Seasonality</p>
                                                                <p className="text-xs sm:text-sm text-slate-300 font-medium">{selectedDisease.seasonality}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                                            <Layers size={18} className="text-slate-500" />
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Sources</p>
                                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                                    {selectedDisease.sources && selectedDisease.sources.map((src, i) => (
                                                                        <span key={i} className="text-[9px] sm:text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">{src}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Brain size={20} className="text-pink-400" /> Research Metrics</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Recovery Rate</p>
                                                        <p className="text-2xl font-bold text-green-400">{selectedDisease.recovery_rate}</p>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Avg. Recovery</p>
                                                        <p className="text-2xl font-bold text-sky-400">{selectedDisease.avg_recovery}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Pill size={20} className="text-green-400" /> Top Medicines</h3>
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedDisease.top_medicines && selectedDisease.top_medicines.map((med, i) => (
                                                            <span key={i} className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-medium border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-default">{med}</span>
                                                        ))}
                                                    </div>
                                                    <div className="pt-2 border-t border-white/5 space-y-1">
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                                                            <Info size={12} /> Source: {selectedDisease.med_source.split('. Disclaimer:')[0]}
                                                        </div>
                                                        <div className="text-[10px] text-amber-500/80 font-medium">
                                                            Disclaimer: Always consult a healthcare professional before starting any medication or treatment.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-7 space-y-8">
                                            <div className="bg-slate-800/30 p-4 sm:p-6 rounded-2xl border border-white/5">
                                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4 sm:mb-6 text-slate-200"><TrendingUp size={20} className="text-orange-400" /> 5-Year Trend Analysis</h3>
                                                <div className="h-[200px] sm:h-[250px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedDisease.history}>
                                                            <defs>
                                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                                                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                                                            <Tooltip content={<CustomTooltip />} />
                                                            <Area type="monotone" dataKey="count" stroke="#f97316" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Users size={20} className="text-blue-400" /> Age Groups</h3>
                                                    <div className="h-[200px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={selectedDisease.age_groups}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                                                <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Users size={20} className="text-pink-400" /> Gender Split</h3>
                                                    <div className="h-[200px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie data={selectedDisease.gender_split} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                                                    {selectedDisease.gender_split && selectedDisease.gender_split.map((entry, index) => (<Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />))}
                                                                </Pie>
                                                                <Tooltip content={<CustomTooltip />} />
                                                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-slate-400 text-xs ml-1">{value}</span>} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div >
        </div >
    );
};

export default CureStat;
