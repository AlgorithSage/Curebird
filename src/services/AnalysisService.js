
// Logic for Health Score & Predictive Alerts
export const AnalysisService = {

    /**
     * Calculates a 0-100 Health Score based on user data
     * @param {Array} metrics - Flat list of all user metrics
     * @param {Array} diseases - List of active diseases
     */
    calculateHealthScore: (metrics, diseases) => {
        let score = 100;
        const deductions = [];

        // 1. Consistency Check (-5 per disease with no recent logs)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        diseases.forEach(d => {
            const diseaseMetrics = metrics.filter(m => m.diseaseId === d.id);
            const hasRecent = diseaseMetrics.some(m => new Date(m.timestamp.seconds * 1000) > sevenDaysAgo);

            if (!hasRecent && d.status === 'Active') {
                score -= 5;
                deductions.push({ reason: `No recent logs for ${d.name}`, points: 5 });
            }
        });

        // 2. Stability Check (-10 for each "Critical" value in last log)
        // Group by type to find latest
        const latestByType = {};
        metrics.forEach(m => {
            if (!latestByType[m.type] || m.timestamp.seconds > latestByType[m.type].timestamp.seconds) {
                latestByType[m.type] = m;
            }
        });

        Object.values(latestByType).forEach(m => {
            // Simple threshold check (this would normally use DiseaseConfig)
            let isCritical = false;

            // Diabetes Rules
            if (m.type === 'fasting_sugar' && m.value > 130) isCritical = true;
            if (m.type === 'post_prandial' && m.value > 200) isCritical = true;

            // Hypertension Rules
            if (m.type === 'systolic_bp' && m.value > 140) isCritical = true;
            if (m.type === 'diastolic_bp' && m.value > 90) isCritical = true;

            if (isCritical) {
                score -= 10;
                deductions.push({ reason: `Uncontrolled ${m.type.replace('_', ' ')}`, points: 10 });
            }
        });

        return {
            score: Math.max(0, score),
            grade: score > 90 ? 'A' : score > 75 ? 'B' : score > 60 ? 'C' : 'D',
            deductions
        };
    },

    /**
     * Scans metrics for trends to generate Alerts
     */
    generateAlerts: (metrics) => {
        const alerts = [];

        // Group by type
        const byType = {};
        metrics.forEach(m => {
            if (!byType[m.type]) byType[m.type] = [];
            byType[m.type].push(m);
        });

        // 1. Trend Detection (Rising bad things)
        ['fasting_sugar', 'systolic_bp'].forEach(type => {
            const logs = (byType[type] || []).sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            if (logs.length >= 3) {
                const [latest, prev, old] = logs;
                if (latest.value > prev.value && prev.value > old.value) {
                    alerts.push({
                        id: `trend-${type}`,
                        title: `Rising Trend: ${type.replace('_', ' ')}`,
                        message: "Last 3 readings have been increasing. Monitor closely.",
                        severity: 'warning'
                    });
                }
            }
        });

        // 2. Missing Data Gap
        const now = new Date();
        Object.keys(byType).forEach(type => {
            const logs = (byType[type] || []).sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            if (logs.length > 0) {
                const lastDate = new Date(logs[0].timestamp.seconds * 1000);
                const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays > 14) {
                    alerts.push({
                        id: `gap-${type}`,
                        title: `Long Gap: ${type.replace('_', ' ')}`,
                        message: `It has been ${diffDays} days since you logged this.`,
                        severity: 'info'
                    });
                }
            }
        });

        return alerts;
    }
};
