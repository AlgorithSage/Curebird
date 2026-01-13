# Curebird - Intelligent Doctor Portal

A next-generation healthcare platform featuring a comprehensive Doctor Portal with real-time clinical workflows, AI-powered automation, and telehealth capabilities.

## 🛠️ Technology Stack

### Frontend (Client-Side)
Building a premium, responsive, and animated user interface.

*   **Core**: `React` (v19)
*   **Routing**: `react-router-dom`
*   **Styling**: `Tailwind CSS`, `postcss`, `autoprefixer`
*   **Animations**: `framer-motion`, `lottie-react`, `@lottiefiles/dotlottie-react`
*   **Icons**: `lucide-react`
*   **Charts & Visualization**: `recharts`
*   **Backend Integration**: `firebase` (Auth, Firestore, Storage)
*   **Utilities**: `react-markdown`, `remark-gfm` (Markdown Rendering), `jspdf` (PDF Generation), `react-helmet-async` (SEO/Meta)

### Backend (Server-Side)
Powering AI analysis and data processing services.

*   **Framework**: `Flask`, `flask-cors`
*   **AI & LLM Integration**:
    *   `google-generativeai` (Gemini)
    *   `groq` (Llama/Groq Models)
    *   `cerebras_cloud_sdk` (Inference)
*   **Data Processing**: `pandas`
*   **Image & OCR**: `Pillow`, `pytesseract`
*   **Document Handling**: `pymupdf` (PDF Parsing)
*   **Utilities**: `python-dotenv`, `requests`, `gunicorn`

## 🚀 All-In-One Healthcare Platform

The project uses a **Unified Tech Stack** (React + Firebase + Flask) to power both the Doctor and Patient experiences.

### 🏥 Doctor Portal
*   **Secure Authentication**: Isolated Doctor Login/Signup.
*   **Clinical Workspace**: Real-time patient roster, vital monitoring, and collaborative care.
*   **Smart Clinical AI**:
    *   **Autofill**: Extracts data from Lab Reports & Vitals.
    *   **Intelligence**: Summarizes clinical notes and flags risks.
*   **Telehealth**: Integrated video consultations.
*   **Messaging**: Secure doctor-patient chat.

### 👤 Patient Portal
*   **Personal Health Dashboard**: Overview of vitals, upcoming appointments, and daily wellness.
*   **Medical Portfolio**: Centralized access to:
    *   **Records**: Lab results, prescriptions (downloadable PDF).
    *   **Vitals History**: Charts for BP, Heart Rate, and Weight.
*   **Self-Scanning Tools**:
    *   **CureAnalyzer**: Upload reports for instant AI explanation.
    *   **CureStat**: Track environmental and occupational health risks.
*   **Telehealth**: Join video sessions directly from the portal.
*   **Emergency**: Quick access to emergency contacts and alerts.
