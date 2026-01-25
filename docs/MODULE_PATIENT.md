# Patient Module

The "Patient Module" focuses on accessibility, education, and self-management. It is the default view for unauthenticated or "Patient" role users.

## 1. Key Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Landing Page** | First touchpoint; explains value proposition and services. | ✅ Live |
| **CureStat Dashboard** | Visualizes public health data (Disease trends, AQI, Risks). | ✅ Live |
| **CureAI Assistant** | "Bird-persona" chatbot for empathetic health guidance. | ✅ Live |
| **Medical Analyzer** | Upload tool for decoding lab reports into plain English. | ✅ Live |
| **Appointment Booking** | Interface to schedule consultations with doctors. | 🚧 In Progress |

## 2. User Journey Flow
1.  **Entry**: User lands on `home`.
2.  **Education**: User explores `CureStat` to understand local health risks.
3.  **Action**: User utilizes `CureAI` or `Analyzer` for personal health queries.
4.  **Conversion**: User signs up (Firebase Auth) to save history or book a doctor.

## 3. Component Architecture

### A. CureAI (`src/components/CureAI.js`)
*   **State**: Manages `messages[]` array.
*   **Props**: `onSendMessage` (function to call backend).
*   **UI**: Floating chat widget availability.

### B. Medical Record Manager
*   **Function**: Allows storage and retrieval of health documents.
*   **Integration**: Connects to Firebase Storage (for PDFs/Images) and Firestore (for metadata tags).

## 4. Design Guidelines
*   **Tone**: Empathetic, calm, assuring (Blue/Green palettes).
*   **Accessibility**: High contrast text, clear "Call to Action" buttons.
