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

// Expanded Health Metrics
Object.assign(DISEASE_CONFIG, {
    lipid_profile: {
        id: 'lipid_profile',
        label: 'Lipid Profile',
        color: 'yellow',
        metrics: {
            total_cholesterol: {
                id: 'total_cholesterol',
                label: 'Total Cholesterol',
                unit: 'mg/dL',
                ranges: { normal: { max: 200 }, warning: { min: 200, max: 239 }, critical_high: { min: 240 } },
                description: 'Combined measure of LDL, HDL, and other lipids.'
            },
            triglycerides: {
                id: 'triglycerides',
                label: 'Triglycerides',
                unit: 'mg/dL',
                ranges: { normal: { max: 150 }, warning: { min: 150, max: 199 }, critical_high: { min: 200 } },
                description: 'Type of fat found in your blood.'
            },
            hdl: {
                id: 'hdl',
                label: 'HDL (Good)',
                unit: 'mg/dL',
                ranges: { normal: { min: 60 }, warning: { min: 40, max: 59 }, critical_low: { max: 40 } },
                description: 'High-Density Lipoprotein - precise "good" cholesterol.'
            },
            ldl: {
                id: 'ldl',
                label: 'LDL (Bad)',
                unit: 'mg/dL',
                ranges: { normal: { max: 100 }, warning: { min: 100, max: 129 }, critical_high: { min: 130 } },
                description: 'Low-Density Lipoprotein - "bad" cholesterol.'
            }
        }
    },
    thyroid: {
        id: 'thyroid',
        label: 'Thyroid Profile',
        color: 'purple',
        metrics: {
            tsh: {
                id: 'tsh',
                label: 'TSH',
                unit: 'mIU/L',
                ranges: { normal: { min: 0.4, max: 4.0 }, warning: { min: 4.0, max: 10.0 }, critical_high: { min: 10.0 }, critical_low: { max: 0.4 } },
                description: 'Thyroid Stimulating Hormone.'
            },
            t3: {
                id: 't3',
                label: 'T3 (Total)',
                unit: 'ng/dL',
                ranges: { normal: { min: 80, max: 200 } },
                description: 'Triiodothyronine.'
            },
            t4: {
                id: 't4',
                label: 'T4 (Total)',
                unit: 'µg/dL',
                ranges: { normal: { min: 5.0, max: 12.0 } },
                description: 'Thyroxine.'
            }
        }
    },
    blood_pressure: {
        id: 'blood_pressure',
        label: 'Blood Pressure',
        color: 'red',
        metrics: {
            systolic_bp: {
                id: 'systolic_bp',
                label: 'Systolic',
                unit: 'mmHg',
                ranges: { normal: { max: 120 }, warning: { min: 120, max: 139 }, critical_high: { min: 140 } },
                description: 'Top number - pressure during heart beats.'
            },
            diastolic_bp: {
                id: 'diastolic_bp',
                label: 'Diastolic',
                unit: 'mmHg',
                ranges: { normal: { max: 80 }, warning: { min: 80, max: 89 }, critical_high: { min: 90 } },
                description: 'Bottom number - pressure between beats.'
            }
        }
    },
    weight_management: {
        id: 'weight_management',
        label: 'Weight Tracker',
        color: 'emerald',
        metrics: {
            weight: {
                id: 'weight',
                label: 'Body Weight',
                unit: 'kg',
                description: 'Overall body weight.'
            },
            bmi: {
                id: 'bmi',
                label: 'BMI',
                unit: 'kg/m²',
                ranges: { normal: { min: 18.5, max: 24.9 }, warning: { min: 25.0, max: 29.9 }, critical_high: { min: 30.0 } },
                description: 'Body Mass Index.'
            }
        }
    },
    uric_acid: {
        id: 'uric_acid',
        label: 'Uric Acid',
        color: 'orange',
        metrics: {
            uric_acid: {
                id: 'uric_acid',
                label: 'Uric Acid',
                unit: 'mg/dL',
                ranges: { normal: { min: 3.5, max: 7.2 }, warning: { min: 7.2, max: 8.5 }, critical_high: { min: 8.6 } },
                description: 'High levels can cause gout.'
            }
        }
    },
    hemoglobin: {
        id: 'hemoglobin',
        label: 'Hemoglobin',
        color: 'pink',
        metrics: {
            hemoglobin: {
                id: 'hemoglobin',
                label: 'Hemoglobin',
                unit: 'g/dL',
                ranges: { normal: { min: 12.0, max: 17.5 }, warning: { min: 10.0, max: 11.9 }, critical_low: { max: 10.0 } },
                description: 'Oxygen-carrying protein in red blood cells.'
            }
        }
    }
});

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
