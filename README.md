# Curebird 🏥🐦

**Curebird** is an advanced digital health platform designed to bridge the gap between patients and healthcare providers. It leverages cutting-edge **Generative AI** and **Real-time Data Visualization** to provide actionable health insights, digitize medical records, and monitor epidemiological trends across India.

---

## 🏗️ Project Architecture & Organization

### 1. CureStat 📊
**Purpose**: A comprehensive public health dashboard that visualizes epidemiological data to help users stay informed about disease outbreaks and environmental risks.

*   **National Health Indices**: Displays critical health metrics (Diabetes, Cardiac, Respiratory, Renal, Mental) derived from national surveys (ICMR, IDSP), giving a quick snapshot of the country's health burden.
*   **Regional Impact (Bar Chart)**: Visualizes the top affected states for current outbreaks, allowing users to identify high-risk zones.
*   **Disease Distribution (Pie Chart)**: Break down of reported cases by disease type, helping to identify dominant health threats.
*   **Live Heatmap**: An interactive Google Maps layer showing the density of disease clusters across the Indian subcontinent.
*   **Environmental Health**: Tracks Air Quality Index (AQI) and other environmental factors that directly correlate with respiratory and cardiovascular health.
*   **Resource Disparity**: Analyzes the gap between urban and rural healthcare infrastructure (bed density, doctor availability).

### 2. Cure Analyzer 🔬
**Purpose**: A tool to digitize and interpret complex medical documents (prescriptions, lab reports).

**The Two-Step AI Process**:
1.  **Step 1: Visual Language Model (VLM) Extraction**
    *   The uploaded image is processed by **Groq's Vision Model** (Model: `meta-llama/llama-4-scout-17b-16e-instruct`).
    *   It performs OCR (Optical Character Recognition) and Structure Extraction simultaneously to identify medications, dosages, and clinical conditions in strict JSON format.
2.  **Step 2: Intelligent Summarization**
    *   The raw JSON data is fed into a **Llama 3.1 8B** model via Groq.
    *   A specialized System Prompt acts as a "Medical Interpreter," translating technical jargon into a customized, empathetic summary for the patient (e.g., explaining that "Hypertension" means "High Blood Pressure").

### 3. Cure Tracker 📈
**Purpose**: A longitudinal health tracking system that visualizes disease progression markers over time.

*   **Pathology Trend Analysis**: Upload multiple lab reports (dates apart) to automatically plot graphs for key biomarkers (e.g., HbA1c, Thyroid T3/T4, Lipid Profile).
*   **Disease-Specific Modules**:
    *   **Diabetes Tracker**: Plots Fasting/PP Glucose and HbA1c trends.
    *   **Thyroid Tracker**: Monitors TSH, T3, and T4 fluctuations.
    *   **Liver/Kidney Panels**: Tracks liver enzymes and creatinine levels for chronic patients.
*   **Clinical Efficacy**: Helps doctors visualize whether a current treatment plan is working by showing the 'slope' of improvement or decline.

### 4. Cure AI 🤖
**Purpose**: An intelligent, context-aware health assistant.

*   **Context Injection**: The AI is fed real-time disease trend data (cached from CureStat) via a System Prompt. This allows it to give advice relevant to current outbreaks (e.g., advising on Dengue prevention during monsoon season if cases are high).
*   **Hybrid Model Routing**:
    *   **Llama 3.1 8B**: Handles casual greetings and simple interactions for low latency.
    *   **Llama 3.3 70B**: Handles complex clinical queries to ensure high accuracy and reasoning capabilities.

---

## 🚀 Key Features

### 🧑‍⚕️ For Patients (Active Module)
*   **Medical Portfolio**: A central hub for health stats (BP, BMI, Heart Rate), upcoming appointments, and active prescriptions.
*   **Digital Health Locker**: Securely upload, store, and categorize medical records (Lab Reports, Prescriptions, Imaging).
*   **Cure Analyzer**: Instantly convert physical reports into digital, understandable summaries using the dual-core AI pipeline.
*   **Cure AI Chatbot**: 24/7 access to a health assistant that knows the current disease landscape of India.
*   **Medication Tracker**: Visual tracking of active medicines with dosage and frequency details extracted from your records.
*   **Doctor Discovery**: Browse specialist profiles and book appointments.

### 👨‍⚕️ For Doctors (Active Module - Beta)
*   **Premium Clinical Workspace**: A sophisticated, glassmorphic dashboard designed for high-performance clinical workflows.
*   **Secure Authentication**: Role-based access via Email/Google Sign-In with strict Firestore security rules.
*   **Patient Management**: 
    *   **Live Roster**: Real-time view of assigned patients with status indicators.
    *   **Digital Workspace**: Unified view for vitals monitoring, medical history, and clinical notes.
*   **Telehealth Suite**:
    *   **Smart Scheduler**: "Time Command" modal for rapid availability management.
    *   **Live Consultation**: Integrated video room entry and queue management.
    *   **Chat System**: Secure, real-time messaging with patients.
*   **Clinical Tools**:
    *   **Quick Actions**: Rapidly issue Prescriptions, Lab Requests, and Emergency Alerts.
    *   **Vitals Monitoring**: Track patient health trends with interactive charts.
*   **Dual Access Navigation**: Seamlessly switch between tools via the Sidebar or the Quick Access Header.

---

## �️ Backend Technologies

The backend is built as a modular Flask application optimized for AI inference and data processing.

*   **Framework**: **Flask** (Python) - Lightweight and flexible for microservices.
*   **AI Inference Engine**: **Groq API**
    *   Delivers ultra-low latency inference for Llama 3 models.
    *   Used for both VLM (Vision) and Text generation.
*   **Optical Character Recognition (OCR)**:
    *   **Groq VLM**: Primary tool for structure extraction.
    *   **Tesseract OCR** (`pytesseract`): Fallback engine for raw text extraction.
*   **Data Processing**:
    *   **Pandas**: For manipulating epidemiological datasets.
    *   **NumPy**: For statistical analysis of health trends.
*   **Containerization**: **Docker** - Unified environment for consistent deployment.

---

## 🚀 Deployment Infrastructure (New)

The project utilizes a modern serverless architecture for high scalability and low maintenance.

### 1. Frontend Hosting: **Vercel**
*   **Platform**: Deployed as a React Single Page Application (SPA).
*   **Features**:
    *   Global CDN for sub-second page loads.
    *   **Vercel Analytics**: Real-time visitor tracking and performance metrics.
    *   Automatic deployments from GitHub main branch.

### 2. Backend Hosting: **Google Cloud Run**
*   **Platform**: Fully managed serverless container service.
*   **Configuration**:
    *   **Auto-scaling**: Scales from 1 to 10 instances based on traffic.
    *   **Min Instances**: Set to 1 to eliminate cold starts (always active).
    *   **Memory/CPU**: 1GB RAM / 1 vCPU per instance.
*   **Benefits**:
    *   Handles concurrent requests (AI inference) efficiently with Gunicorn workers.
    *   Integrated logging and monitoring via Google Cloud Console.

---

## 💾 Storage & Database (Firebase)

The project relies on a serverless **Firebase** architecture for security and scalability.

### 1. Authentication (`Firebase Auth`)
*   Handles user sign-up/login via Email/Password and Google OAuth.
*   Manages Identity Tokens for securing API requests.

### 2. Database (`Cloud Firestore`)
*   **Structure**: NoSQL Document-based.
*   **Collections**:
    *   `users/{uid}`: Stores user profile, roles, and health stats.
    *   `users/{uid}/medical_records`: Stores metadata of uploaded files (file URL, doctor name, date).
    *   `users/{uid}/appointments`: Tracks booking history.

### 3. File Storage (`Cloud Storage`)
*   Secure bucket for storing actual medical document files (Images/PDFs).
*   Files are organized by User ID to enforce privacy and access control.

---

## 📡 API Setup & Endpoints

The Flask backend exposes RESTful endpoints for the frontend React application.

### AI Endpoints
*   `POST /api/health-assistant/chat`:
    *   Accepts a message history.
    *   Routes to **Groq Llama 3** (8B or 70B) based on complexity.
    *   Returns a context-aware medical response.
*   `POST /api/analyzer/process`:
    *   Accepts a file upload (`FormData`).
    *   Triggers the **Two-Step AI Pipeline** (VLM -> Summary).
    *   Returns structured JSON (medications, diseases) and a plain-text summary.

### Data Endpoints
*   `GET /api/disease-trends`:
    *   Returns the top 10 outbreak trends from the local cache (`disease_data_cache.json`).
*   `GET /api/resource-distribution`:
    *   Returns comparative health infrastructure data (Urban vs Rural beds) for visualizations.

### Context Management
*   `POST /api/health-assistant/clear`: Resets the conversation context for the AI.
