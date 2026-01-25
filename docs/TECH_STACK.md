# Technology Stack

This document outlines the core technologies, frameworks, and libraries used in the CureBird project.

## 1. Frontend (Client-Side)

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | **React 19** | Component-based UI library. |
| **Logic/Effects** | **React Hooks** | Managing state (`useState`, `useEffect`) and side effects. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid UI development. |
| **Animations** | **Framer Motion** | Complex UI transitions and component animations. |
| **Routing** | **React Router 7** | Client-side navigation and route management. |
| **Icons** | **Lucide React** | Consistent, lightweight icon set. |
| **Lottie** | **@lottiefiles/renderer** | Rendering JSON-based animations. |
| **Build Tool** | **CRACO** | Customizing Create React App config without ejecting. |

## 2. Backend (Server-Side)

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Flask** (Python) | Lightweight WSGI web application framework. |
| **API Interface** | **REST** | Standard HTTP methods for Client-Server communication. |
| **AI Integration** | **Groq API** | High-performance inference for LLMs (Llama-3). |
| **Image Processing** | **Pillow / Base64** | Handling and encoding image data for VLM analysis. |
| **WSGI Server** | **Gunicorn** / **Cloud Run** | Managed containerized deployment. |

## 3. Cloud & Infrastructure

| Service | Technology | Purpose |
| :--- | :--- | :--- |
| **Database** | **Firebase Firestore** | NoSQL cloud database for user/patient data. |
| **Authentication** | **Firebase Auth** | Google Sign-in and Phone authentication. |
| **Storage** | **Firebase Storage** | Cloud storage for medical reports/images. |
| **Hosting (Frontend)** | **Vercel** | Optimized frontend hosting & Analytics. |
| **Hosting (Backend)** | **Google Cloud Run** | Auto-scaling containerized deployment. |

## 4. Key APIs

| API Name | Usage |
| :--- | :--- |
| **EmailJS** | Processing contact form submissions directly from the browser. |
| **Groq (Llama-3)** | Generating medical insights and chat responses. |
| **WAQI** | Fetching real-time Air Quality Index data. |
| **Google Maps SDK** | Rendering disease heatmaps. |

