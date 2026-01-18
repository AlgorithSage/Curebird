import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wind, CloudFog, AlertTriangle, Cigarette, Info,
    Search, RefreshCw, Signal, Hourglass, FlaskConical, Skull, Activity,
    Timer, AlertOctagon, HeartPulse
 } from './Icons';

// Scientific conversion constants
const CIGARETTE_FACTOR = 22; // ~22ug/m3 PM2.5 = 1 Cigarette
const BREATH_VOL_M3 = 15; // Daily air intake in m3
const AQLI_FACTOR = 0.098; // Years lost per 1ug/m3 above WHO guideline (5ug/m3)

const getAQIDescription = (aqi) => {
    if (aqi > 400) return 'Severe';
    if (aqi > 300) return 'Very Poor';
    if (aqi > 200) return 'Poor';
    if (aqi > 100) return 'Moderate';
    if (aqi > 50) return 'Satisfactory';
    return 'Good';
};

const CITIES_DATA = [
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090, aqi: 450, pm25: 290, description: 'Hazardous' },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, aqi: 340, pm25: 210, description: 'Hazardous' },
    { name: 'Patna', lat: 25.5941, lng: 85.1376, aqi: 320, pm25: 180, description: 'Very Poor' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, aqi: 240, pm25: 150, description: 'Poor' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 160, pm25: 75, description: 'Unhealthy' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, aqi: 210, pm25: 120, description: 'Poor' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, aqi: 190, pm25: 105, description: 'Unhealthy' },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126, aqi: 180, pm25: 95, description: 'Unhealthy' },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, aqi: 170, pm25: 85, description: 'Unhealthy' },
    { name: 'Guwahati', lat: 26.1445, lng: 91.7362, aqi: 160, pm25: 80, description: 'Unhealthy' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, aqi: 130, pm25: 65, description: 'Unhealthy' },
    { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, aqi: 140, pm25: 70, description: 'Unhealthy' },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, aqi: 110, pm25: 55, description: 'Moderate' },
    { name: 'Dehradun', lat: 30.3165, lng: 78.0322, aqi: 130, pm25: 68, description: 'Unhealthy' },
    { name: 'Raipur', lat: 21.2514, lng: 81.6296, aqi: 150, pm25: 82, description: 'Unhealthy' },
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096, aqi: 155, pm25: 85, description: 'Unhealthy' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, aqi: 45, pm25: 18, description: 'Good' },
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, aqi: 50, pm25: 20, description: 'Good' },
    { name: 'Srinagar', lat: 34.0837, lng: 74.7973, aqi: 90, pm25: 45, description: 'Moderate' },
    { name: 'Shimla', lat: 31.1048, lng: 77.1734, aqi: 60, pm25: 35, description: 'Satisfactory' },
    { name: 'Panaji', lat: 15.4909, lng: 73.8278, aqi: 55, pm25: 30, description: 'Satisfactory' },
    { name: 'Gangtok', lat: 27.3389, lng: 88.6065, aqi: 35, pm25: 15, description: 'Good' },
    { name: 'Shillong', lat: 25.5788, lng: 91.8933, aqi: 40, pm25: 18, description: 'Good' },
    { name: 'Aizawl', lat: 23.7307, lng: 92.7173, aqi: 25, pm25: 10, description: 'Good' },
    { name: 'Imphal', lat: 24.8170, lng: 93.9368, aqi: 50, pm25: 25, description: 'Good' },
    { name: 'Kohima', lat: 25.6751, lng: 94.1086, aqi: 65, pm25: 32, description: 'Satisfactory' },
    { name: 'Itanagar', lat: 27.0844, lng: 93.6053, aqi: 55, pm25: 28, description: 'Satisfactory' },
    { name: 'Agartala', lat: 23.8315, lng: 91.2868, aqi: 110, pm25: 58, description: 'Moderate' },
];

const EnvironmentalHealth = () => {
    const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [activeView, setActiveView] = useState('smoker');

    useEffect(() => {
        console.log("Debug - Environment Variables Check:");
        console.log("WAQI Token Present:", !!process.env.REACT_APP_WAQI_API_TOKEN);
        console.log("Maps Key Present:", !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
        console.log("Current Origin:", window.location.origin);
        
        if (!process.env.REACT_APP_WAQI_API_TOKEN) {
            console.error("WAQI API Key is missing from process.env");
            console.log("Please ensure REACT_APP_WAQI_API_TOKEN is set in your .env file and you have restarted the development server.");
        }
    }, []);

    const filteredCities = CITIES_DATA.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchAQI = async (city) => {
        const apiKey = process.env.REACT_APP_WAQI_API_TOKEN;
        if (!apiKey) {
            setIsLive(false);
            setLiveData(null);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=${apiKey}`);
            const data = await response.json();

            if (data.status !== 'ok') throw new Error('API Error');

            const result = data.data;
            let aqi = result.aqi;
            let pm25 = 0;

            if (result.iaqi && result.iaqi.pm25) pm25 = result.iaqi.pm25.v;

            if (aqi && !isNaN(aqi)) {
                if (!pm25 || isNaN(pm25)) pm25 = aqi * 0.75;
                setLiveData({
                    aqi: Math.round(aqi),
                    pm25: pm25,
                    description: getAQIDescription(aqi)
                });
                setIsLive(true);
            } else {
                setIsLive(false);
                setLiveData(null);
            }
        } catch (error) {
            console.error("Error:", error);
            setIsLive(false);
            setLiveData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAQI(selectedCity);
    }, [selectedCity]);

    const currentAQI = liveData ? liveData.aqi : selectedCity.aqi;
    const currentPM25 = liveData ? liveData.pm25 : selectedCity.pm25;
    const currentDesc = liveData ? liveData.description : selectedCity.description;

    // --- CALCULATIONS ---
    const cigarettes = (currentPM25 / CIGARETTE_FACTOR).toFixed(1);
    const cigaretteCount = Math.min(50, Math.round(currentPM25 / CIGARETTE_FACTOR));
    const yearsLost = Math.max(0, (currentPM25 - 5) * AQLI_FACTOR).toFixed(1);
    const minutesLostToday = Math.round(cigarettes * 11);
    const dailyInhaleMicrograms = currentPM25 * BREATH_VOL_M3;
    const annualInhaleGrams = (dailyInhaleMicrograms * 365 / 1000000).toFixed(2);
    const teaspoonEquivalent = (annualInhaleGrams / 5).toFixed(1);

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4 pl-4">
                <div className="bg-slate-500/20 p-2 rounded-lg border border-slate-500/30">
                    <CloudFog size={20} className="text-slate-200" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Environmental Health & AQI</h2>
                </div>
            </div>

            {/* MAIN CARD */}
            <div className={`glass-card p-8 lg:p-12 rounded-[2.5rem] border border-white/5 mb-8 relative overflow-hidden min-h-[680px] transition-all duration-500 
                ${activeView === 'life' ? 'shadow-[0_0_50px_rgba(220,38,38,0.1)] border-red-900/20' : ''}
                ${activeView === 'dust' ? 'shadow-[0_0_50px_rgba(16,185,129,0.1)] border-emerald-900/20' : ''}
            `}>

                {/* TAB NAVIGATION */}
                <div className="absolute top-0 left-0 right-0 flex justify-center p-6 z-20">
                    <div className="bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 flex items-center gap-1 shadow-2xl">
                        {[
                            { id: 'smoker', icon: Cigarette, label: "Smoker's Eq." },
                            { id: 'life', icon: HeartPulse, label: 'Time Thief' },
                            { id: 'dust', icon: FlaskConical, label: 'Dust Jar' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeView === tab.id
                                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-black/20 ring-1 ring-white/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={14} className={activeView === tab.id ? 'text-orange-400' : ''} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Backgrounds */}
                <motion.div
                    animate={{
                        opacity: Math.min(currentAQI / 600, 0.8),
                        background: activeView === 'life'
                            ? 'linear-gradient(to bottom right, #2b0404, #000000, #1a0202)'
                            : activeView === 'dust'
                                ? 'linear-gradient(to bottom right, #00120b, #000000, #00171a)'
                                : 'linear-gradient(to bottom right, #0f172a, #020617)'
                    }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ filter: 'blur(40px)' }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 h-full mt-16 px-2">

                    {/* LEFT COLUMN: Narrative & Metrics */}
                    <div className="flex flex-col justify-start h-full gap-12 pt-12 order-2 lg:order-1">

                        {/* Header Dynamic Text */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeView}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeView === 'smoker' && (
                                    <>
                                        <h3 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
                                            <Cigarette size={40} className="text-orange-400" />
                                            "The Smoker's Equivalent"
                                        </h3>
                                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                            Pollution is often abstract. We make it tangible: <strong className="text-white font-semibold">Cigarettes smoked per day.</strong>
                                        </p>
                                    </>
                                )}
                                {activeView === 'life' && (
                                    <>
                                        <h3 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
                                            <HeartPulse size={40} className="text-red-500 animate-pulse" />
                                            "The Time Thief"
                                        </h3>
                                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                            Your body keeps the score. Visualizing the <strong className="text-white font-semibold">actuarial life expectancy</strong> lost to chronic exposure.
                                        </p>
                                    </>
                                )}
                                {activeView === 'dust' && (
                                    <>
                                        <h3 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
                                            <FlaskConical size={40} className="text-emerald-400" />
                                            "The Dust Jar"
                                        </h3>
                                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                            The lungs are a filter. This is the <strong className="text-white font-semibold">accumulated mass</strong> of toxic particulates you capture annually.
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Shared AQI Metric - RESTORED TO ORIGINAL LAYOUT (NO CARD WRAPPER) */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <span className={`font-bold tracking-[0.2em] text-sm mb-4 block uppercase opacity-80 ${activeView === 'life' ? 'text-red-400' : activeView === 'dust' ? 'text-emerald-400' : 'text-slate-400'}`}>Local Air Quality (NAQI)</span>
                                <div className="flex items-end gap-6">
                                    <span className="text-8xl md:text-[8rem] font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                                        {currentAQI}
                                    </span>
                                    <span className={`px-5 py-2 mb-4 rounded-full text-sm font-bold uppercase tracking-wider border-2 shadow-lg ${currentAQI > 400 ? 'bg-red-600/20 text-red-500 border-red-600/30' :
                                        currentAQI > 300 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            currentAQI > 200 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                        {currentDesc}
                                    </span>
                                </div>
                            </div>

                            {/* VARIABLE METRIC BOX (This WAS a card, keeping it themed) */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeView}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-10 rounded-[2rem] border backdrop-blur-md shadow-2xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500 ${activeView === 'life' ? 'bg-red-950/20 border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]' :
                                        activeView === 'dust' ? 'bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                                            'bg-slate-900/60 border-white/10'
                                        }`}
                                >
                                    <div className={`absolute top-0 right-0 w-60 h-60 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-all duration-700 ${activeView === 'life' ? 'bg-red-600/10 group-hover:bg-red-600/20' :
                                        activeView === 'dust' ? 'bg-emerald-600/10 group-hover:bg-emerald-600/20' :
                                            'bg-orange-500/10 group-hover:bg-orange-500/20'
                                        }`}></div>

                                    {activeView === 'smoker' && (
                                        <>
                                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                                <div className="bg-orange-500/20 p-2.5 rounded-xl"><AlertTriangle size={24} className="text-orange-500" /></div>
                                                <span className="text-slate-200 font-bold text-lg tracking-wide">Biological Impact Today</span>
                                            </div>
                                            <div className="flex items-end gap-6 relative z-10">
                                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                    <Cigarette size={48} className="text-white opacity-90" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase opacity-70">Equivalent To:</p>
                                                    <p className="text-5xl md:text-7xl font-black text-white leading-none mt-2">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">{cigarettes}</span> <span className="text-3xl md:text-4xl text-slate-400 font-bold">Cigs</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeView === 'life' && (
                                        <>
                                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                                <div className="bg-red-500/20 p-2.5 rounded-xl"><Activity size={24} className="text-red-500 animate-[pulse_3s_ease-in-out_infinite]" /></div>
                                                <span className="text-slate-200 font-bold text-lg tracking-wide">Actuarial Forecast</span>
                                            </div>
                                            <div className="flex items-end gap-6 relative z-10">
                                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                    <Skull size={48} className="text-red-400 opacity-90" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase opacity-70">Timeline Reduced By:</p>
                                                    <p className="text-5xl md:text-7xl font-black text-white leading-none mt-2">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-600">{yearsLost}</span> <span className="text-3xl md:text-4xl text-slate-400 font-bold">Years</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-red-400/80 text-sm mt-5 font-medium border-l-2 border-red-500/30 pl-3 leading-relaxed">
                                                📉 That's <span className="text-red-300 font-bold">{yearsLost} years</span> potentially cut from your total lifespan if these pollution levels persist.
                                            </p>
                                            <p className="text-red-400/40 text-[10px] uppercase tracking-widest mt-2 font-mono ml-3">System projection: -{minutesLostToday} minutes today</p>
                                        </>
                                    )}

                                    {activeView === 'dust' && (
                                        <>
                                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                                <div className="bg-emerald-500/20 p-2.5 rounded-xl"><AlertOctagon size={24} className="text-emerald-500" /></div>
                                                <span className="text-slate-200 font-bold text-lg tracking-wide">Particulate Load</span>
                                            </div>
                                            <div className="flex items-end gap-6 relative z-10">
                                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                    <FlaskConical size={48} className="text-emerald-400 opacity-90" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase opacity-70">Annual Inhalation:</p>
                                                    <p className="text-5xl md:text-7xl font-black text-white leading-none mt-2">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-600">{annualInhaleGrams}</span> <span className="text-3xl md:text-4xl text-slate-400 font-bold">g</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-emerald-400/60 text-xs mt-4 font-mono pl-1">
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                                Volume ≈ {teaspoonEquivalent} teaspoon(s) of pure toxic dust.
                                            </p>
                                        </>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>


                    {/* RIGHT COLUMN: Selector & Visualization */}
                    <div className="flex flex-col gap-6 h-full order-1 lg:order-2">

                        {/* Selector */}
                        <div className={`w-full p-6 rounded-[2rem] border backdrop-blur-md shadow-xl transition-all duration-500 ${activeView === 'life' ? 'bg-red-950/20 border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]' :
                            activeView === 'dust' ? 'bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                                'bg-slate-900/60 border-white/10'
                            }`}>
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                <div className="flex items-center gap-3">
                                    <h4 className={`text-xs font-bold uppercase tracking-widest ${activeView === 'life' ? 'text-red-400' : activeView === 'dust' ? 'text-emerald-400' : 'text-slate-400'}`}>Select Location</h4>
                                    {isLoading ? (
                                        <RefreshCw size={10} className="text-orange-400 animate-spin" />
                                    ) : isLive ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[0.6rem] font-bold text-emerald-400 tracking-wide uppercase">Live</span>
                                        </div>
                                    ) : (
                                        <span className="text-[0.6rem] text-slate-600 font-medium tracking-wide uppercase border border-slate-700 px-1.5 rounded bg-slate-800/50">Est.</span>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Search size={16} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search city..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 w-40 focus:w-64 transition-all placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => setSelectedCity(city)}
                                        className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left truncate flex items-center gap-3 ${selectedCity.name === city.name
                                            ? (activeView === 'life' ? 'bg-red-900/40 text-white border-red-500/30' : activeView === 'dust' ? 'bg-emerald-900/40 text-white border-emerald-500/30' : 'bg-slate-700/80 text-white border-white/20') + ' shadow-lg border'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${city.aqi > 300 ? 'bg-red-500' : city.aqi > 200 ? 'bg-orange-500' : city.aqi > 100 ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* VISUALIZATION PANEL */}
                        <div className={`p-8 rounded-[2.5rem] border flex-grow min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group shadow-inner transition-all duration-500 ${activeView === 'life' ? 'bg-red-950/20 border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]' :
                            activeView === 'dust' ? 'bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                                'bg-slate-800/40 border-white/10'
                            }`}>
                            <p className="absolute top-6 left-8 text-xs text-slate-500 font-mono z-20 tracking-widest opacity-50 uppercase">{activeView} VISUALIZATION</p>

                            <AnimatePresence mode="wait">

                                {/* 1. CIGARETTE VISUALIZATION (ENHANCED & INTERACTIVE) */}
                                {activeView === 'smoker' && (
                                    <motion.div
                                        key="smoker-vis"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-wrap gap-8 justify-center content-center w-full h-full relative z-10 px-4"
                                    >
                                        {Array.from({ length: cigaretteCount }).map((_, i) => (
                                            <motion.div
                                                key={`cig-${i}`}
                                                initial={{ scale: 0, y: 100, rotate: Math.random() * 10 - 5 }}
                                                animate={{ scale: 1, y: 0, rotate: 0 }}
                                                whileHover={{ scale: 1.15, rotate: Math.random() * 4 - 2, y: -10 }}
                                                transition={{ delay: i * 0.05, type: 'spring' }}
                                                className="relative group cursor-pointer"
                                            >
                                                {/* Interactive Tooltip */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                                    Toxic Load: 22µg
                                                </div>

                                                {/* Smoke Effect (Reacts to Hover) */}
                                                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-16 h-32 pointer-events-none opacity-60 mix-blend-screen">
                                                    {/* Stream 1 */}
                                                    <div className="absolute bottom-0 left-1/2 w-1.5 h-4 bg-slate-400 rounded-full blur-[3px] animate-[smoke-rise_3s_linear_infinite] group-hover:animate-[smoke-rise_1.5s_linear_infinite]"></div>
                                                    {/* Stream 2 */}
                                                    <div className="absolute bottom-4 left-1/2 w-4 h-4 bg-slate-500/50 rounded-full blur-md animate-[smoke-curl_4s_ease-out_infinite] group-hover:animate-[smoke-curl_2s_ease-out_infinite]" style={{ animationDelay: '0.5s' }}></div>
                                                </div>

                                                {/* The Cigarette Body (Larger & Detailed) */}
                                                <div className="w-6 h-32 flex flex-col items-center relative shadow-2xl drop-shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]">

                                                    {/* Cherry (Burning Tip) */}
                                                    <div className="w-full h-3 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 animate-pulse rounded-t-sm relative z-20 overflow-visible group-hover:from-red-500 group-hover:via-orange-400 group-hover:to-white">
                                                        <div className="absolute inset-x-0 -top-2 h-4 bg-orange-500/60 blur-md rounded-full group-hover:bg-orange-400/80 group-hover:blur-lg transition-all"></div>
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 mix-blend-multiply"></div>
                                                    </div>

                                                    {/* Ash Line */}
                                                    <div className="w-full h-1 bg-gray-800 z-20 opacity-50"></div>

                                                    {/* Paper Body */}
                                                    <div className="w-full h-20 bg-gradient-to-r from-gray-200 via-white to-gray-300 border-x border-gray-400/20 relative z-10 flex flex-col justify-evenly">
                                                        <div className="w-full h-[1px] bg-black/5"></div>
                                                        <div className="w-full h-[1px] bg-black/5"></div>
                                                        <div className="w-full h-[1px] bg-black/5"></div>
                                                    </div>

                                                    {/* Gold Ring */}
                                                    <div className="w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 z-10"></div>

                                                    {/* Filter */}
                                                    <div className="w-full h-8 bg-[#dcb26c] border-x border-black/10 rounded-b-sm z-10 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] opacity-30 bg-[length:12px_12px]"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* 2. TIME THIEF VISUALIZATION */}
                                {activeView === 'life' && (
                                    <motion.div
                                        key="life-vis"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center w-full h-full relative z-10 text-center"
                                    >
                                        {/* Bio-Monitor Interface */}
                                        <div className="relative group cursor-crosshair px-16 py-10 rounded-[3rem] bg-black/20 border border-red-500/10 backdrop-blur-sm overflow-hidden">
                                            {/* Background Scanlines */}
                                            <div className="absolute inset-0 bg-red-500/5 z-0" style={{ backgroundSize: '100% 4px', backgroundImage: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(255,0,0,0.1) 50%)' }}></div>

                                            {/* Main Digits */}
                                            <div className="text-[9rem] font-mono font-black text-red-600 leading-none tracking-tighter tabular-nums drop-shadow-[0_0_25px_rgba(220,38,38,0.6)] z-10 relative group-hover:scale-105 transition-transform duration-300 mix-blend-screen">
                                                {yearsLost}<span className="text-4xl text-red-800">yr</span>
                                            </div>

                                            {/* Glitch Overlay */}
                                            <motion.div
                                                animate={{ x: [-2, 3, -1, 0], opacity: [0.3, 0.6, 0.2] }}
                                                transition={{ repeat: Infinity, duration: 0.15, repeatType: 'mirror' }}
                                                className="absolute inset-0 text-[9rem] font-mono font-black text-white/20 mix-blend-overlay leading-none tracking-tighter tabular-nums pointer-events-none flex items-center justify-center"
                                            >
                                                {yearsLost}<span className="text-4xl opacity-0">yr</span>
                                            </motion.div>

                                            {/* Timeline Visualizer */}
                                            <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 mx-auto relative overflow-hidden z-20">
                                                <div className="absolute left-0 top-0 bottom-0 bg-red-600 shadow-[0_0_10px_red]" style={{ width: `${Math.min(100, (yearsLost / 80) * 100)}%` }}></div>
                                                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#000_10px,#000_11px)]"></div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center gap-3">
                                            <Activity className="text-red-500 animate-pulse" size={20} />
                                            <p className="text-red-400 text-sm font-bold tracking-[0.3em] uppercase animate-pulse">Vitality Signal Degrading</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 3. DUST JAR VISUALIZATION (ENHANCED) */}
                                {activeView === 'dust' && (
                                    <motion.div
                                        key="dust-vis"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center w-full h-full relative z-10"
                                    >
                                        <div className="relative flex flex-col items-center w-full max-w-[280px] group cursor-pointer perspective-[1000px]">

                                            {/* The Lab Jar */}
                                            <motion.div
                                                whileHover={{ rotateX: 5, rotateY: 5 }}
                                                className="w-64 h-80 border-x-4 border-b-4 border-white/10 border-t-0 rounded-b-[3rem] relative overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl ring-1 ring-white/10"
                                            >
                                                {/* Top Rim */}
                                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-white/20 via-white/40 to-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>

                                                {/* Measurement Gradients */}
                                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>

                                                {/* The Filth (Soot) */}
                                                <motion.div
                                                    initial={{ height: '0%' }}
                                                    animate={{ height: `${Math.min(100, Math.max(10, annualInhaleGrams * 12))}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-800 to-gray-700 w-full"
                                                >
                                                    {/* Texture Overlay */}
                                                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                                                    {/* "Agitated" Particles on Hover */}
                                                    <div className="absolute inset-0 overflow-hidden">
                                                        {Array.from({ length: 50 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="absolute w-1 h-1 bg-black/60 rounded-full group-hover:animate-ping"
                                                                style={{
                                                                    left: `${Math.random() * 100}%`,
                                                                    top: `${Math.random() * 100}%`,
                                                                    transition: 'all 0.5s',
                                                                    transform: `scale(${Math.random()})`
                                                                }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </motion.div>

                                                {/* Surface Tension / Meniscus */}
                                                <motion.div
                                                    animate={{ bottom: `${Math.min(99, Math.max(10, annualInhaleGrams * 12))}%` }}
                                                    className="absolute left-0 right-0 h-2 bg-gray-600/50 blur-sm brightness-125"
                                                ></motion.div>

                                                {/* Glass Reflections */}
                                                <div className="absolute top-0 left-2 bottom-0 w-8 bg-gradient-to-r from-white/10 to-transparent"></div>
                                                <div className="absolute top-0 right-10 bottom-0 w-2 bg-gradient-to-r from-white/5 to-transparent"></div>

                                                {/* Warning Label */}
                                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-yellow-400/90 text-black text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider rotate-[-2deg] opacity-80 group-hover:opacity-100 transition-opacity">
                                                    Caution: Toxic
                                                </div>
                                            </motion.div>

                                            {/* External Context */}
                                            <div className="mt-8 text-center">
                                                <div className="text-emerald-400/80 font-mono text-xs uppercase tracking-widest mb-1 group-hover:text-emerald-300 transition-colors">
                                                    Particulate Matter 2.5
                                                </div>
                                                <div className="text-white/30 text-[9px] uppercase tracking-[0.2em]">
                                                    Sample ID: {selectedCity.name.substring(0, 3).toUpperCase()}-2024
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center">
                <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
                    <Info size={12} />
                    Methodology: Berkeley Earth (Cigarettes), AQLI (Life Expectancy), Standard Respiratory Volume (Mass). Estimates only.
                </p>
            </div>
        </div>
    );
};

export default EnvironmentalHealth;
