/**
 * Mock Data Service for Advanced Data Explorer
 * Generates realistic-looking aggregated health data with privacy preservation.
 */

import { API_BASE_URL } from '../config';

// Simulation Constants
const DISTRICTS = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Shahdara'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Palakkad', 'Malappuram'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Vellore'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Noida'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'],
    'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna']
};

const getDistrictsForState = (state) => {
    if (DISTRICTS[state]) return DISTRICTS[state];
    // Fallback generator for other states to avoid huge file size
    // Generates 5-8 generic districts prefixed with the state name
    return Array.from({ length: 6 }, (_, i) => `${state} District ${i + 1}`);
};

const DISEASES = [
    'Diabetes Type 2', 'Hypertension', 'Asthma', 'COPD',
    'Dengue', 'Malaria', 'Tuberculosis', 'Covid-19'
];

const AGE_BANDS = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '60+'];
const GENDERS = ['Male', 'Female', 'Other'];

/**
 * Enforces privacy by suppressing small counts.
 * Standard research protocol: count < 10 is risky for re-identification.
 */
const applyPrivacy = (count) => {
    if (count < 10) return null; // Suppressed
    return count;
};

// Gaussian random for smoother data
const randomGaussian = (mean, stdev) => {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
};

// Seeded Random Helper
const createSeededRandom = (seedString) => {
    // Simple hash function for seed
    let h = 0x811c9dc5;
    for (let i = 0; i < seedString.length; i++) {
        h ^= seedString.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    let seed = h;

    // Mulberry32 generator
    return () => {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export const fetchAggregatedData = async (filters) => {
    // 1. Fetch Real Baseline Data from Cure Stat API
    let baselineTotal = 4000; // Default fallback if API fails
    let isChronic = false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/disease-trends`);
        if (response.ok) {
            const data = await response.json();
            // Find matching disease (case insensitive)
            const matchedDisease = data.find(item =>
                item.disease.toLowerCase() === filters.disease.toLowerCase() ||
                item.disease.toLowerCase().includes(filters.disease.toLowerCase())
            );

            if (matchedDisease) {
                // Parse outbreaks/cases
                let val = matchedDisease.outbreaks;
                if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));

                // Handle Chronic/Percentage-based data like CureStat does
                if (matchedDisease.segment === 'Chronic') {
                    isChronic = true;
                    if (val < 100) {
                        // Project percentage to a sample population (e.g., per 100k)
                        // If 11% diabetes -> 11,000 cases in 100k sample
                        baselineTotal = val * 1000;
                    } else {
                        baselineTotal = val;
                    }
                } else {
                    baselineTotal = val;
                }
            }
        }
    } catch (err) {
        console.warn("Advanced Data Explorer: Failed to fetch real baseline, using mock defaults.", err);
    }

    // Adjust baseline for selected time range (API usually gives Annual/Total)
    const timeMultiplier = filters.timeRange === '1y' ? 1
        : filters.timeRange === '6m' ? 0.5
            : filters.timeRange === '1m' ? 0.08
                : 5;

    // Adjust baseline for Demographics (Approximate weights)
    let demogMultiplier = 1.0;
    if (filters.ageGroup !== 'All') {
        if (filters.ageGroup === '0_18') demogMultiplier = 0.15; // ~15% population
        else if (filters.ageGroup === '18_60') demogMultiplier = 0.60;
        else if (filters.ageGroup === '60_PLUS') demogMultiplier = 0.25;
    }

    // Target total for the visualisation (Simulate 4 years of cumulative data)
    const targetTotal = Math.round(baselineTotal * 4 * demogMultiplier);

    // Initialize Seeding
    // 1. Environment Seed: Depends ONLY on State (AQI shouldn't change if you query Age)
    const {
        state = 'Maharashtra',
        disease = 'Diabetes Type 2'
    } = filters;

    const envSeedKey = JSON.stringify({ state });
    const envRng = createSeededRandom(envSeedKey);
    const envRand = () => envRng();
    const envGaussian = (mean, stdev) => {
        const u = 1 - envRand();
        const v = envRand();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    };

    // 2. Case Data Seed: Depends on ALL filters
    const caseSeedKey = JSON.stringify(filters);
    const caseRng = createSeededRandom(caseSeedKey);
    const caseRand = () => caseRng();
    const caseGaussian = (mean, stdev) => {
        const u = 1 - caseRand();
        const v = caseRand();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    };
    
    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Generate Trend Data (Time Series) based on Target Total
    const trends = [];
    const now = new Date();
    const days = 365 * 4; // Fixed 4 Year Window for historical context
    
    const dailyMean = targetTotal / days;

    // Seasonal bias
    const isRespiratory = ['Asthma', 'COPD', 'Covid-19', 'Tuberculosis'].some(d => disease.includes(d));
    const isVectorBorne = ['Dengue', 'Malaria'].some(d => disease.includes(d));

    let runningTotal = 0;

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        let baseCases = dailyMean;

        // Add Seasonality (simplified for short window)
        const month = date.getMonth();
        if (isRespiratory && (month < 2 || month > 10)) baseCases *= 1.5;
        if (isVectorBorne && (month > 5 && month < 9)) baseCases *= 1.8;

        // Add Noise (Seeded Gaussian - Case Specific)
        let cases = Math.max(0, Math.round(caseGaussian(baseCases, baseCases * 0.3)));

        // Outbreaks
        if (caseRand() > 0.98) cases += Math.round(baseCases * 2);

        // Env Factors (Seeded Gaussian - Environment Specific)
        let aqi = Math.max(50, Math.round(envGaussian(120, 40)));

        // Interaction: High AQI exacerbates respiratory cases
        if (isRespiratory && aqi > 200) cases = Math.round(cases * 1.2);

        runningTotal += cases;

        trends.push({
            date: date.toISOString().split('T')[0],
            cases: applyPrivacy(cases),
            aqi: aqi,
            temp: Math.round(envGaussian(30, 5)),
            humidity: Math.round(envGaussian(60, 15))
        });
    }

    // 3. Geographic Heatmap (Distribute Total)
    const relevantDistricts = getDistrictsForState(state);
    const geoMap = relevantDistricts.map(dist => {
        // Distribute approx portion of total cases
        const share = caseRand();
        const distVal = Math.round((targetTotal / relevantDistricts.length) * (0.5 + share));
        return {
            region: dist,
            value: applyPrivacy(distVal) || 0,
            intensity: Math.min(1, distVal / (targetTotal / relevantDistricts.length * 2)) // Normalize intensity
        };
    });

    // 4. Demographics (Distribute Total)
    const ageDist = AGE_BANDS.map(band => ({
        name: band,
        value: applyPrivacy(Math.round(targetTotal * (caseRand() * 0.3)))
    })).filter(d => d.value !== null);

    const genderDist = GENDERS.map(g => ({
        name: g,
        value: applyPrivacy(Math.round(targetTotal * (g === 'Other' ? 0.05 : 0.47)))
    })).filter(g => g.value !== null);

    // 5. Correlation Data
    const correlations = Array.from({ length: 50 }, () => {
        const aqi = Math.round(envRand() * 300 + 50); // Environment is independent of logic
        const base = isRespiratory ? (aqi * (dailyMean / 10)) : (caseRand() * dailyMean * 2);
        const c = Math.round(base + caseRand() * dailyMean);
        return { x: aqi, y: c, z: caseRand() * 10 };
    });

    return {
        trends,
        geoMap,
        demographics: { age: ageDist, gender: genderDist },
        correlations,
        meta: {
            totalRecords: runningTotal, // Use actual sum of trends
            lastUpdated: new Date().toISOString(),
            privacyThreshold: 10,
            dataSource: "Cure Stat Live API"
        }
    };
};
