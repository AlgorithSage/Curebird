# Telehealth & Consultation Consolidation

## Summary of Changes

To improve user experience and reduce redundancy, we have consolidated the video consultation workflow into the main **Telehealth** dashboard.

### 1. Unified Entry Point

- **Previously**: There were separate sidebar links for "Telehealth" (management) and "Consultations" (video interface).
- **Now**: The **"Consultations" sidebar link has been removed**.
- **New Workflow**: You should access everything through the **Telehealth** page.

### 2. How to Start a Call

The internal `ConsultationWorkflow` component (the video room) still exists but is now treated as a sub-view of the Telehealth experience.

1.  Navigate to **Telehealth** from the sidebar.
2.  Locate an "Upcoming" appointment card (e.g., in the "Overview" tab).
3.  Click the **"ENTER TELEHEALTH ROOM"** button on the appointment card.
4.  This will seamlessly switch your view to the active consultation video interface.

### 3. Benefit

This ensures that doctors always start from a context of their schedule/queue before jumping into a call, preventing them from opening an empty "Consultations" page with no active patient selected.

---

**Technical Note**:

- The `DoctorSidebar.jsx` file was modified to remove the `consultations` route link.
- The underlying route handling in `DoctorDashboard.jsx` remains active to support the programmatic navigation from the Telehealth dashboard.
