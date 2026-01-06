# Doctor Module

The Doctor Module is a secure, role-gated environment designed for efficiency and patient management.

## 1. Access Control
*   **Route**: `/doctor-login`
*   **Security**: Requires Firebase Authentication **AND** a `role: 'doctor'` field in the user's Firestore profile.
*   **Redirect**: Unauthorized users are bounced back to the main login.

## 2. Key Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Doctor Dashboard** | Central command center for appointments and stats. | ✅ Live |
| **Patient Chat** | Direct messaging interface with active patients. | ✅ Live |
| **Appointment Board** | Kanban-style or List view of daily schedule. | 🚧 Beta |
| **Consultation Notes** | Digital prescription and note-taking tools. | 🚧 Planned |

## 3. Architecture

### A. Dashboard (`src/Doctor/DoctorDashboard.js`)
*   **Data Source**: `db.collection('appointments').where('doctorId', '==', currentUser.uid)`
*   **Layout**: Sidebar navigation (Patients, Schedule, Settings) + Main Content Area.

### B. Doctor Chat (`src/Doctor/chat/DoctorChat.jsx`)
*   **Real-time**: Uses Firestore listeners (`onSnapshot`) to reflect new messages instantly.
*   **Context**: Displays patient's basic medical history alongside chat.

## 4. Directory Structure
All doctor-related files are encapsulated in **`src/Doctor/`** to maintain separation of concerns.

```
src/Doctor/
├── DoctorLogin.js          # Authentication Entry
├── DoctorDashboard.js      # Main Shell
├── chat/                   # Messaging Sub-module
│   ├── DoctorChat.jsx
│   └── actions/            # Modal Actions (Prescribe/End Chat)
└── components/             # Dashboard-specific widgets
```
