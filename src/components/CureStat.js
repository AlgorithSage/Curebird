import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Loader, ServerCrash, Info, Pill, TrendingUp, X, Sparkles, Download, Users, Brain, Search, MapPin, AlertTriangle, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';

const API_BASE_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://127.0.0.1:5001';

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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900 w-full max-w-6xl h-[80vh] rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Map className="text-sky-400" size={28} />Disease Heatmap - India</h2>
                        <p className="text-slate-400 text-sm mt-1">Regional distribution of reported cases</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
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
        </motion.div>
    );
};

const CureStat = ({ user, onLogout, onLoginClick, onToggleSidebar }) => {
    const [trends, setTrends] = useState([]);
    const [filteredTrends, setFilteredTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [showHeatmap, setShowHeatmap] = useState(false);

    useEffect(() => {
        const fetchDiseaseTrends = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/disease-trends`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTrends(data);
                setFilteredTrends(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch disease trends:", err);
                setError("Could not connect to the AI analysis server.");
            } finally {
                setLoading(false);
            }
        };
        fetchDiseaseTrends();
    }, []);

    const getRiskLevel = (count) => {
        if (count > 300) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
        if (count > 100) return { level: 'Medium', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
        return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    };

    const applyFilters = useCallback(() => {
        let result = [...trends];
        if (searchTerm.trim()) {
            result = result.filter(item => item.disease.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (riskFilter !== 'all') {
            result = result.filter(item => getRiskLevel(item.outbreaks).level.toLowerCase() === riskFilter);
        }
        setFilteredTrends(result);
    }, [trends, searchTerm, riskFilter]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const COLORS = ['#f59e0b', '#fbbf24', '#d97706', '#fcd34d', '#b45309', '#78350f'];
    const GENDER_COLORS = ['#f59e0b', '#fbbf24'];

    const getRegionalData = (disease) => {
        const seed = disease.disease ? disease.disease.length : 10;
        return [
            { name: 'Maharashtra', value: 120 + (seed * 5) },
            { name: 'Delhi', value: 90 + (seed * 3) },
            { name: 'Kerala', value: 80 + (seed * 4) },
            { name: 'Karnataka', value: 70 + (seed * 2) },
            { name: 'Tamil Nadu', value: 60 + (seed * 3) },
        ].sort((a, b) => b.value - a.value);
    };

    const getResearchData = (disease) => {
        const seed = disease.disease.length;
        return {
            demographics: [
                { name: '0-18', value: 15 + (seed % 10) },
                { name: '19-35', value: 30 + (seed % 5) },
                { name: '36-50', value: 25 - (seed % 5) },
                { name: '51+', value: 30 - (seed % 10) },
            ],
            gender: [
                { name: 'Male', value: 50 + (seed % 10) },
                { name: 'Female', value: 50 - (seed % 10) },
            ],
            recoveryRate: 85 + (seed % 10),
            avgRecoveryDays: 5 + (seed % 7)
        };
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
                <div className="bg-black/90 backdrop-blur-md border border-yellow-500/30 p-4 rounded-xl">
                    <p className="text-slate-200 font-semibold mb-1">{label}</p>
                    <p className="text-amber-500 text-sm">{payload[0].name}: <span className="font-bold">{payload[0].value}</span></p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Loader size={64} className="text-amber-500" /></motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-xl font-light tracking-wide text-slate-400">Analyzing Health Data...</motion.p>
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
        <div className="min-h-screen text-white overflow-y-auto relative selection:bg-sky-500/30">
            <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <Header title="Cure Stat" description="Real-time disease intelligence, medication insights, and predictive analytics for a healthier India." user={user} onLogout={onLogout} onLoginClick={onLoginClick} onToggleSidebar={onToggleSidebar} />

                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
                        <input type="text" placeholder="Search diseases, symptoms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {['all', 'high', 'medium', 'low'].map((level) => (
                            <button key={level} onClick={() => setRiskFilter(level)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap border ${riskFilter === level ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border-sky-400' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}>
                                {level === 'all' ? 'All Risks' : `${level} Risk`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Regional Impact</h2>
                            <button onClick={() => setShowHeatmap(true)} className="group relative overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-sky-500/25 flex items-center gap-2 border border-white/10">
                                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                <div className="relative flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400 border border-white"></span>
                                    </span>
                                    <span className="font-semibold text-white tracking-wide text-sm">Live Heatmap</span>
                                    <MapPin size={16} className="text-white" />
                                </div>
                            </button>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={getRegionalData(trends[0] || { disease: 'Default' })} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                                    <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20}>
                                        {getRegionalData(trends[0] || { disease: 'Default' }).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Disease Distribution</h2>
                            <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30"><Sparkles size={20} className="text-purple-400" /></div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={filteredTrends.slice(0, 5)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="outbreaks" nameKey="disease" stroke="none">
                                        {filteredTrends.slice(0, 5).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={undefined}
                                        iconType="circle"
                                        layout="vertical"
                                        align="center"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        formatter={(value) => <span className="text-slate-300 text-sm ml-2 font-medium">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-gradient-to-b from-sky-400 to-purple-500 rounded-full block shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Detailed Insights</span>
                        {searchTerm && (<span className="text-sm text-slate-400 font-normal">({filteredTrends.length} {filteredTrends.length === 1 ? 'result' : 'results'})</span>)}
                    </h2>

                    {filteredTrends.length === 0 ? (
                        <div className="glass text-center py-16 text-slate-400 rounded-3xl border-dashed border-2 border-white/10">
                            <Search size={48} className="mx-auto mb-4 opacity-50 text-sky-400" />
                            <p className="text-lg font-medium text-white">No diseases found matching your criteria.</p>
                            <button onClick={() => { setSearchTerm(''); setRiskFilter('all'); }} className="mt-4 px-6 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl transition-colors font-medium border border-sky-500/20">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTrends.map((disease, index) => {
                                const risk = getRiskLevel(disease.outbreaks);
                                return (
                                    <motion.div key={index} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedDisease(disease)} className="glass-card p-6 rounded-2xl group cursor-pointer border-l-4 border-l-transparent hover:border-l-sky-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Activity size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-emerald-400 transition-all duration-300">{disease.disease}</h3>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${risk.bg} ${risk.color} ${risk.border} flex items-center gap-1 shadow-sm`}>
                                                {risk.level === 'High' && <AlertTriangle size={10} />}
                                                {risk.level} Risk
                                            </span>
                                        </div>
                                        <div className="mb-4 relative z-10">
                                            <span className="text-3xl font-bold text-white tracking-tight">{disease.outbreaks.toLocaleString()}</span>
                                            <span className="text-slate-400 text-sm ml-2 font-medium">cases reported</span>
                                        </div>
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">{disease.description}</p>
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-sky-400 transition-colors mt-auto pt-4 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-2"><Info size={14} /> <span>Tap to explore details</span></div>
                                            {disease.source && <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5 text-slate-400">{disease.source}</span>}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {showHeatmap && (<HeatmapModal isOpen={showHeatmap} onClose={() => setShowHeatmap(false)} regionalData={getRegionalData(trends[0] || { disease: 'Default' })} />)}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedDisease && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setSelectedDisease(null)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 100 }} onClick={(e) => e.stopPropagation()} className="glass w-full sm:w-[95%] max-w-6xl h-[90vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl relative">
                                <div className="p-6 sm:p-8 border-b border-white/10 sticky top-0 bg-slate-900/80 backdrop-blur-xl z-20 flex flex-col-reverse sm:flex-row justify-between items-start gap-4 shadow-sm">
                                    <div className="w-full sm:w-auto">
                                        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{selectedDisease.disease}</motion.h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-sky-400 text-lg font-medium flex items-center gap-2"><Activity size={18} /> {selectedDisease.outbreaks.toLocaleString()} reported cases</p>
                                            {(() => {
                                                const risk = getRiskLevel(selectedDisease.outbreaks);
                                                return (<span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${risk.bg} ${risk.color} ${risk.border} flex items-center gap-1`}>{risk.level} Risk</span>);
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => downloadCSV(selectedDisease)} className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl transition-colors font-medium border border-sky-500/20">
                                            <Download size={18} /> Export Data
                                        </button>
                                        <button onClick={() => setSelectedDisease(null)} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5"><X size={24} /></button>
                                    </div>
                                </div>

                                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-5 space-y-8">
                                        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-slate-200"><Info size={20} className="text-sky-400" /> About</h3>
                                            <p className="text-slate-400 leading-relaxed text-base">{selectedDisease.description}</p>
                                        </div>
                                        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Brain size={20} className="text-pink-400" /> Research Metrics</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Recovery Rate</p>
                                                    <p className="text-2xl font-bold text-green-400">{getResearchData(selectedDisease).recoveryRate}%</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Avg. Recovery</p>
                                                    <p className="text-2xl font-bold text-sky-400">{getResearchData(selectedDisease).avgRecoveryDays} days</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200"><Pill size={20} className="text-green-400" /> Top Medicines</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDisease.top_medicines && selectedDisease.top_medicines.map((med, i) => (
                                                    <span key={i} className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-medium border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-default">{med}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-200"><TrendingUp size={20} className="text-orange-400" /> 5-Year Trend Analysis</h3>
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={selectedDisease.history}>
                                                        <defs>
                                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
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
                                                        <BarChart data={getResearchData(selectedDisease).demographics}>
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
                                                            <Pie data={getResearchData(selectedDisease).gender} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                                                {getResearchData(selectedDisease).gender.map((entry, index) => (<Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />))}
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
                </AnimatePresence>
            </div >
        </div >
    );
};

export default CureStat;
