# Why are all 30 Patients "Stable"?

You are seeing **100% Stable** because the Analytics Dashboard reflects the exact state of your database, and currently, **every patient in your system has their status set to "Stable"** (or has no status set, which defaults to Stable).

## 1. The "Default" Behavior

When you create a new patient (or when the system auto-generated your 30 demo patients), the `status` field is set to **'Stable'** by default.

The code specifically counts them like this:

```javascript
// if p.status is empty/null, count as 'Stable'
const s = p.status || "Stable";
```

## 2. How to "Fix" This (Make the Chart Colorful)

To see "Critical", "Monitoring", or "Recovering" segments in the chart, you must **update your patient records**:

1.  **Go to "Patients" Tab**: Open your patient list.
2.  **Select a Patient**: Click on any patient (e.g., "Patient #5").
3.  **Edit Profile**:
    - Find the **Status** dropdown in their profile header.
    - Change it from "Stable" to **"Critical"** or **"Monitoring"**.
    - Save the changes.
4.  **Return to Analytics**: You will immediately see the Donut Chart update to show that 1 patient is now Critical (e.g., "29 Stable, 1 Critical").

## Summary

The chart is working correctly—it is telling you that **statistically, your entire population is currently marked as Stable**. It is a **Live Data** visualization, not a random demo. To change the chart, you must change the patient data.
