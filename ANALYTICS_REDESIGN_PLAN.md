# Analytics Redesign Plan: Robust & Live Data Metrics

## Objective

Replace the current "Population Risk Stratification" (Radar Chart) and "Clinic Load Intensity" (Heatmap) with metrics that are:

1.  **Immediately Valuable**: Useful even with small datasets.
2.  **Technically Robust**: Rely on structured fields (Status, Priority, Type) rather than text parsing or sparse dates.
3.  **Visually Impactful**: Maintain the "premium" aesthetic while ensuring charts look populated.

---

## Box 1: Replacing "Population Risk Stratification" (Radar Chart)

The current charts rely on regex text scanning, which is fragile if descriptions are empty or unstructured.

### Option A: Patient Status Distribution (Donut Chart)

_Most Recommended_

- **Concept**: A sleek Donut chart showing the breakdown of patient statuses: `Stable`, `Critical`, `Monitoring`, `Recovering`.
- **Data Source**: `patients` collection -> `status` field.
- **Why**: Every patient has a status. The chart will always be 100% accurate and filled.
- **Visual**: Amber (Critical), Emerald (Stable), Blue (Recovering).

### Option B: Demographics Breakdown (Bar/Pie Chart)

- **Concept**: Breakdown by **Age Group** (0-18, 19-40, 40-60, 60+) or **Gender**.
- **Data Source**: `patients` collection -> `age` or `gender` fields.
- **Why**: Standard medical dashboard metric. Extremely reliable.

---

## Box 2: Replacing "Clinic Load Intensity" (Heatmap)

Heatmaps look empty ("broken") unless there is high-volume daily activity.

### Option A: Workload Breakdown (Semi-Circle Gauge or Bar)

_Most Recommended_

- **Concept**: "Clinical Focus" - A breakdown of the _Type_ of work being done.
- **Metrics**: % Consultations vs. Prescriptions vs. Lab Reviews.
- **Data Source**: `medical_records` -> `type` field.
- **Why**: Shows _what_ you are doing, not just _when_. Even 5 records create a beautiful distribution chart.

### Option B: Priority/Triage Tracker (Stacked Bar)

- **Concept**: "Urgency Levels" - Count of `Routine` vs `Urgent` vs `Critical` records created this week.
- **Data Source**: `medical_records` -> `priority` field.
- **Why**: Helps doctors see "Firefighting" volume vs "Routine Care".

### Option C: Recent Activity Feed (List View)

- **Concept**: Instead of a chart, a high-density list of the last 5 actions.
- **Format**: "Dr. X added Prescription for Patient Y - 2m ago".
- **Why**: Zero-latency feedback. "Live" feel is guaranteed.

---

## Recommendation for Next Steps

I recommend implementing **Option A** for both boxes:

1.  **Left Box (Status)**: **"Patient Health Status"** (Donut Chart)
    - _Visual_: 3-segment ring showing accurate ratio of your stable/critical patients.
2.  **Right Box (Workload)**: **"Clinical Record Distribution"** (Horizontal Bar Chart)
    - _Visual_: Bars showing "Consultations", "Prescriptions", "Labs".
    - _Benefit_: Immediate proof of system usage. If you add a "Prescription", the Prescription bar grows. Very satisfying feedback loop.

### Implementation Details

- **Library**: Re-use `recharts` (PieChart, BarChart).
- **Fetch Logic**: Re-use existing `patients` and `clinicalActivity` arrays (no new database calls needed).
