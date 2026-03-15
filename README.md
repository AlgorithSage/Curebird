<p align="center">
  <h1 align="center">🐦 Curebird</h1>
  <p align="center"><strong>AI-Powered Digital Health Platform for India</strong></p>
  <p align="center">
    Bridging the gap between patients, doctors, and public health data — using Generative AI, real-time analytics, and a serverless cloud architecture.
  </p>
</p>

---

## 🧠 The Main Idea

**Curebird** is an advanced digital health ecosystem that combines **Generative AI**, **real-time epidemiological data visualization**, and **cloud-native infrastructure** to make healthcare more accessible, understandable, and data-driven across India.

At its core, Curebird aims to:

- **Empower patients** with AI tools that translate complex medical jargon into simple, actionable insights.
- **Equip doctors** with a modern clinical workspace for efficient patient management and telehealth.
- **Inform the public** with live dashboards tracking disease outbreaks, air quality, and healthcare infrastructure gaps.

---

## 🚨 The Problem We're Solving

India's healthcare system faces several critical challenges:

1.  **Medical Literacy Gap** — Patients receive prescriptions and lab reports filled with complex medical terminology they can't understand, leading to confusion, non-compliance, and poor health outcomes.
2.  **Fragmented Health Records** — Medical documents are scattered across clinics, hospitals, and paper files with no centralized, digital health locker accessible to the patient.
3.  **Lack of Public Health Awareness** — Epidemiological data (disease outbreaks, AQI, resource distribution) exists in government databases but is not presented in a digestible, real-time format for the public.
4.  **Urban-Rural Healthcare Disparity** — Significant gaps exist in healthcare infrastructure (bed density, doctor availability) between urban and rural regions, and this disparity is poorly visualized.
5.  **Limited Access to Specialists** — Booking appointments, consulting doctors remotely, and getting timely health advice remains a friction-heavy process.

---

## ✅ Our Solutions & Services

### 1. 📊 CureStat — Public Health Intelligence Dashboard

A comprehensive epidemiological dashboard that transforms raw government data into interactive, real-time visualizations.

| Feature | Description |
| :--- | :--- |
| **National Health Indices** | Displays key health metrics (Diabetes, Cardiac, Respiratory, Renal, Mental) sourced from ICMR, IDSP, and national surveys. |
| **Regional Outbreak Tracker** | Bar charts showing the top affected states for current outbreaks. |
| **Disease Distribution** | Pie chart breakdowns of reported cases by disease type. |
| **Live Heatmap** | An interactive Google Maps layer showing disease cluster density across India. |
| **Environmental Health** | Real-time Air Quality Index (AQI) via the WAQI API, including cigarette-equivalent exposure and life expectancy impact. |
| **Resource Disparity Analysis** | Urban vs. Rural healthcare infrastructure comparison (beds, doctors). |

> **Data Sources**: IDSP, NTEP, NCVBDC, ICMR-INDIAB, GBD Study, NMHS Survey, NFHS-5, ORDI, AQLI, and WAQI.

---

### 2. 🔬 Cure Analyzer — AI Medical Report Interpreter

Digitizes and interprets complex medical documents (prescriptions, lab reports) using a **dual-core AI pipeline**.

| Step | Model | What It Does |
| :--- | :--- | :--- |
| **Phase 1: Extraction** | Llama-4-Scout (VLM via Groq) | Performs OCR + structured extraction — identifies medications, dosages, and conditions in strict JSON format. |
| **Phase 2: Summarization** | Llama 3.1 8B (via Groq) | Acts as a "Medical Interpreter" — translates technical jargon into an empathetic, patient-friendly summary. |

> *Example*: The term "Hypertension" is explained as "High Blood Pressure — this means your heart is working harder than normal to pump blood."

---

### 3. 🤖 CureAI — Context-Aware Health Assistant

An intelligent chatbot that provides health guidance informed by **real-time disease trends**.

- **Context Injection** — Fed live outbreak data from CureStat, so advice is relevant to current conditions (e.g., dengue prevention during monsoon if cases spike).
- **Hybrid Model Routing**:
  - **Llama 3.1 8B** → Fast responses for casual greetings and simple queries.
  - **Llama 3.3 70B** → Detailed, high-accuracy responses for complex clinical questions.
- **Dual Persona** — Switches between a friendly "Bird" persona and a professional "Doctor" persona based on query complexity.

---

### 4. 🧑‍⚕️ Patient Portal

The default experience for users, focused on accessibility, self-management, and complete health record ownership.

- **Medical Portfolio** — Central hub displaying health stats (BP, BMI, Heart Rate), upcoming appointments, and active prescriptions at a glance.

#### 📂 Medical Record Management
- **Digital Health Locker** — Upload, store, and categorize medical records (Lab Reports, Prescriptions, Imaging scans) securely in Firebase Cloud Storage.
- **Smart Categorization** — Records are organized by type (Lab Reports, Prescriptions, Imaging) with metadata tagging (doctor name, date, category).
- **Secure Cloud Storage** — Files are stored in a Firebase Storage bucket organized by User ID, ensuring strict privacy and access control. Firestore stores the download URL + metadata for instant retrieval.

#### 📅 Appointment Tracking
- **Doctor Discovery** — Browse specialist profiles, view availability, and select preferred consultation slots.
- **Booking System** — Schedule appointments directly through the platform, with booking data persisted to Firestore (`users/{uid}/appointments`).
- **Appointment History** — Full tracking of past and upcoming consultations, so patients never lose sight of their care timeline.

#### 💊 Medication Tracking (CureTracker)
- **Active Medication Dashboard** — Visual tracking of all active medicines with dosage, frequency, and duration details.
- **AI-Extracted Data** — Medication details are automatically extracted from uploaded prescriptions via the Cure Analyzer pipeline — no manual entry required.
- **Adherence Monitoring** — Helps patients stay on top of their treatment plans with clear, organized medication schedules.

---

### 5. 👨‍⚕️ Doctor Portal (Beta)

A premium, role-gated clinical workspace for healthcare professionals.

- **Secure Access** — Requires Firebase Authentication + verified `doctor` role in Firestore.
- **Patient Management** — Live roster of assigned patients with status indicators and a unified workspace for vitals, history, and notes.
- **Telehealth Suite** — Smart scheduler, live video consultation entry, queue management, and real-time chat.
- **Clinical Tools** — Quick-action modals for prescriptions, lab requests, and emergency alerts.
- **Glassmorphic UI** — A modern, premium dashboard design using `backdrop-blur` and semi-transparent layers.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Framer Motion | Component-based SPA with premium animations |
| **Routing** | React Router 7 | Client-side navigation |
| **Backend** | Flask (Python), REST API | Lightweight AI orchestration layer |
| **AI Engine** | Groq API (Llama 3 / Llama 4) | Ultra-low latency LLM inference (text + vision) |
| **Database** | Firebase Cloud Firestore | NoSQL document store for users, records, appointments |
| **Auth** | Firebase Authentication | Google OAuth & Email/Password sign-in |
| **File Storage** | Firebase Cloud Storage | Secure medical document uploads (PDF/Images) |
| **Email** | EmailJS | Serverless contact form submissions |
| **Frontend Hosting** | Vercel | Global CDN, analytics, auto-deploy from GitHub |
| **Backend Hosting** | Google Cloud Run | Auto-scaling serverless containers (1–10 instances) |
| **Maps** | Google Maps JS API | Disease heatmap visualization |
| **Air Quality** | WAQI API | Real-time AQI data feed |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health-assistant/chat` | `POST` | AI health assistant — routes to Llama 3 (8B or 70B) based on complexity |
| `/api/analyzer/process` | `POST` | Dual-phase medical report analysis (VLM extraction → summary) |
| `/api/disease-trends` | `GET` | Top 10 outbreak trends from cached epidemiological data |
| `/api/resource-distribution` | `GET` | Urban vs. Rural healthcare infrastructure comparison |
| `/api/health-assistant/clear` | `POST` | Resets AI conversation context |

---

## 🚀 Deployment Architecture

```
┌─────────────────┐        ┌──────────────────────┐
│   Vercel (CDN)  │        │  Google Cloud Run     │
│   React SPA     │───────▶│  Flask + Gunicorn     │
│   Frontend      │  REST  │  AI Orchestration     │
└─────────────────┘        └──────────┬───────────┘
                                      │
                           ┌──────────▼───────────┐
                           │     Groq API          │
                           │  Llama 3 / Llama 4    │
                           │  (Text + Vision)      │
                           └──────────────────────┘

        ┌──────────────────────────────────────┐
        │           Firebase (BaaS)            │
        │  Auth  │  Firestore  │  Storage      │
        └──────────────────────────────────────┘
```

- **Frontend** → Vercel with global CDN for sub-second loads and automatic GitHub deployments.
- **Backend** → Google Cloud Run with auto-scaling (1–10 instances), 1 GB RAM / 1 vCPU per instance, and zero cold starts.
- **Database & Storage** → Firebase for serverless, real-time data and secure file storage.

---

## 📜 License

This project is proprietary. All rights reserved.
