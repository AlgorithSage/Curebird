export const DISEASE_CONFIG = {
    diabetes: {
        id: 'diabetes',
        label: 'Diabetes Mellitus',
        color: 'blue',
        metrics: {
            fasting_sugar: {
                id: 'fasting_sugar',
                label: 'Fasting Blood Sugar',
                unit: 'mg/dL',
                ranges: {
                    normal: { min: 70, max: 100 },
                    warning: { min: 100, max: 125 },
                    critical_low: { max: 70 },
                    critical_high: { min: 126 }
                },
                description: 'Blood sugar level after at least 8 hours of fasting.'
            },
            post_prandial: {
                id: 'post_prandial',
                label: 'Post-Prandial Sugar',
                unit: 'mg/dL',
                ranges: {
                    normal: { max: 140 },
                    warning: { min: 140, max: 199 },
                    critical_high: { min: 200 }
                },
                description: 'Blood sugar level 2 hours after a meal.'
            },
            hba1c: {
                id: 'hba1c',
                label: 'HbA1c',
                unit: '%',
                ranges: {
                    normal: { max: 5.7 },
                    warning: { min: 5.7, max: 6.4 },
                    critical_high: { min: 6.5 }
                },
                description: 'Average blood sugar over the last 2-3 months.'
            }
        }
    },
    cardiac: {
        id: 'cardiac',
        label: 'Cardiac / Hypertension',
        color: 'red',
        metrics: {
            systolic_bp: {
                id: 'systolic_bp',
                label: 'Systolic BP',
                unit: 'mmHg',
                ranges: {
                    normal: { max: 120 },
                    warning: { min: 120, max: 139 },
                    critical_high: { min: 140 }
                },
                description: 'Pressure in allowed arteries when the heart beats.'
            },
            diastolic_bp: {
                id: 'diastolic_bp',
                label: 'Diastolic BP',
                unit: 'mmHg',
                ranges: {
                    normal: { max: 80 },
                    warning: { min: 80, max: 89 },
                    critical_high: { min: 90 }
                },
                description: 'Pressure in arteries between heartbeats.'
            },
            heart_rate: {
                id: 'heart_rate',
                label: 'Heart Rate',
                unit: 'bpm',
                ranges: {
                    normal: { min: 60, max: 100 },
                    warning: { min: 100, max: 120 }, // Tachycardia warning
                    critical_high: { min: 120 },
                    critical_low: { max: 50 } // Bradycardia
                },
                description: 'Number of heartbeats per minute.'
            }
        }
    }
};

export const getMetricStatus = (diseaseId, metricId, value) => {
    const config = DISEASE_CONFIG[diseaseId]?.metrics[metricId];
    if (!config) return 'unknown';

    const { ranges } = config;

    if (ranges.critical_high && value >= ranges.critical_high.min) return 'critical';
    if (ranges.critical_low && value <= ranges.critical_low.max) return 'critical';
    if (ranges.warning) {
        if (ranges.warning.min !== undefined && value < ranges.warning.min) return 'normal';
        if (ranges.warning.max !== undefined && value > ranges.warning.max) return 'critical'; // Should fall through to critical if overlaps, but simplistic check
        if (value >= ranges.warning.min && value <= ranges.warning.max) return 'warning';
    }
    return 'normal';
};
