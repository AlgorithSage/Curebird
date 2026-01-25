# Core Feature Architecture

This document maps the primary user - facing features to their underlying technical implementation.

## 1. Feature: AI Health Assistant (CureAI)

| Component | Functionality | Technical Flow |
| :--- | :--- | :--- |
| **UI** | Chat Interface | `CureAI.js` manages message list state and typing indicators. |
| **Backend** | Response Generation | `POST /api/health-assistant/chat` -> `groq_service.py` |
| **Logic** | Context Injection | System Prompt adds "Bird/Doctor" dual persona based on query type. |

## 2. Feature: Medical Report Analyzer

| Component | Functionality | Technical Flow |
| :--- | :--- | :--- |
| **UI** | File Upload | User drags & drops PDF/Image. Image converted to Base64 client-side. |
| **Backend** | VLM Analysis | `POST /api/analyzer/process` -> Two-Phase Analysis (Extraction + Summary). |
| **AI Model** | Vision Intelligence | **Phase 1**: Llama-4-Scout extracts structured keys (Medicines, Vitals). <br> **Phase 2**: Llama-3 generates patient-friendly summary. |

## 3. Feature: CureStat Dashboard

| Component | Functionality | Technical Flow |
| :--- | :--- | :--- |
| **UI** | Visualization | `CureStat.js` renders Recharts graphs and Google Maps Layer. |
| **Data** | LIVE Air Quality | Fetches `api.waqi.info` directly from client (React). |
| **Data** | Disease Trends | Fetches `/api/disease-trends` (Backend feeds static JSON). |

## 4. Feature: Doctor Portal

| Component | Functionality | Technical Flow |
| :--- | :--- | :--- |
| **Auth** | Secure Login | Firebase Auth (Google Provider) -> Verify "Doctor" role in Firestore `users`. |
| **Dashboard** | Patient Management | `DoctorDashboard.js` reads `appointments` collection from Firestore. |
