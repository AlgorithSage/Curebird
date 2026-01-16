# Curebird - Intelligent Doctor Portal

A next-generation healthcare platform featuring a comprehensive Doctor Portal with real-time clinical workflows, AI-powered automation, and telehealth capabilities.

## 🛠️ Technology Stack

### Frontend (Client-Side)

Building a premium, responsive, and animated user interface.

- **Core**: `React` (v19)
- **Routing**: `react-router-dom`
- **Styling**: `Tailwind CSS`, `postcss`, `autoprefixer`
- **Animations**: `framer-motion`, `lottie-react`, `@lottiefiles/dotlottie-react`
- **Icons**: `lucide-react`
- **Charts & Visualization**: `recharts`
- **Backend Integration**: `firebase` (Auth, Firestore, Storage)
- **Utilities**: `react-markdown`, `remark-gfm` (Markdown Rendering), `jspdf` (PDF Generation), `react-helmet-async` (SEO/Meta)

### Backend (Server-Side)

Powering AI analysis and data processing services.

- **Framework**: `Flask`, `flask-cors`
- **AI & LLM Integration**:
  - `google-generativeai` (Gemini)
  - `groq` (Llama/Groq Models)
  - `cerebras_cloud_sdk` (Inference)
- **Data Processing**: `pandas`
- **Image & OCR**: `Pillow`, `pytesseract`
- **Document Handling**: `pymupdf` (PDF Parsing)
- **Utilities**: `python-dotenv`, `requests`, `gunicorn`

## 🚀 All-In-One Healthcare Platform

The project uses a **Unified Tech Stack** (React + Firebase + Flask) to power both the Doctor and Patient experiences.

### 🏥 Doctor Portal

- **Secure Authentication**: Isolated Doctor Login/Signup.
- **Clinical Workspace**: Real-time patient roster, vital monitoring, and collaborative care.
- **Smart Clinical AI**:
  - **Autofill**: Extracts data from Lab Reports & Vitals.
  - **Intelligence**: Summarizes clinical notes and flags risks.
- **Telehealth**: Integrated video consultations.
- **Messaging**: Secure doctor-patient chat.

### 👤 Patient Portal

- **Personal Health Dashboard**: Overview of vitals, upcoming appointments, and daily wellness.
- **Medical Portfolio**:
  - **Smart Records**: Store Lab results, prescriptions, and reports.
  - **Actionable Insights**: Buttons to **View Digital Copy** (OCR text), **View Summary** (AI simplified), and download PDFs.
  - **Vitals History**: Interactive charts for BP, Heart Rate, and Weight trends.
- **Cure AI Assistant**:
  - **Context-Aware Chat**: "Ask Cure AI" specific questions based on your uploaded documents.
  - **Medical Context**: Automatically generates and maintains a summary of your recent medical history to provide accurate AI responses.
- **Connectivity & Sharing**:
  - **1-Hour Access Link**: Generate a secure, temporary link for doctors to view your portfolio during emergencies.
  - **Doctor Messaging**: Integrated secure chat for direct follow-ups with your assigned physician.
- **Self-Scanning Tools**:
  - **CureAnalyzer**: Upload reports for instant AI explanation & **Auto-Digitization**.
  - **CureStat**: Track environmental and occupational health risks.
- **Telehealth**: Join video sessions directly from the portal.
- **Enhanced Navigation**: Full browser history support (Back/Forward) and Deep Linking for all major views.
- **Emergency**: Quick access to emergency contacts and alerts.
