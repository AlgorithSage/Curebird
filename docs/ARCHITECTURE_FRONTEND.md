# Frontend Architecture

The CureBird frontend is a Single Page Application (SPA) built with **React 19**, designed for modularity, visual richness, and responsiveness.

## 1. Directory Structure (`src/`)

| Directory | Purpose | Key Components |
| :--- | :--- | :--- |
| **components/** | Shared UI elements and feature-specific modules. | `LandingPage.js`, `Navbar.js`, `CureStat.js`, `CureAI.js` |
| **Doctor/** | Dedicated module for "Doctor Portal" features. | `DoctorDashboard.js`, `DoctorLogin.js` |
| **constants/** | Static configurations and asset imports. | `images.js`, `email.js` |
| **pages/** | Wrapper components for specific routes. | (If applicable) |
| **hooks/** | Custom React hooks for logic reuse. | (If applicable) |

## 2. Core Architectural Patterns

### A. Component Hierarchy
The app uses a layout-based structure where `App.js` defines the routing and global context providers, wrapping feature pages.
*   **Root**: `index.js` (Providers: `HelmetProvider`, `Router`)
*   **Main Router**: `App.js` (Routes: `/`, `/doctor-dashboard`, `/cure-stat`, etc.)
*   **Layout**: `Layout.js` (Common Navbar/Sidebar)

### B. State Management
*   **Local State**: `useState` is used for form inputs, toggle states (modals), and temporary UI feedback.
*   **Context API**: Used for global authentication state (Firebase User object).
*   **Props**: Data is passed down from Page-level components to smaller UI atoms.

### C. Styling Strategy
*   **Tailwind CSS**: Primary styling engine. Utility classes (e.g., `flex`, `p-4`, `bg-blue-500`) are used directly in JSX.
*   **Glassmorphism**: A core design token, implemented via `backdrop-blur` and semi-transparent backgrounds to create a "premium" feel.
*   **Animations**: `framer-motion` is used for page transitions, mounting animations, and micro-interactions.

## 3. Key Modules

| Module Name | Description | Key Files |
| :--- | :--- | :--- |
| **Landing Page** | The public facing marketing & entry page. | `LandingPage.js`, `Hero.js` |
| **CureStat** | Public health dashboard visualizing disease trends. | `CureStat.js`, `EnvironmentalHealth.js` |
| **CureAI** | AI Chat interface for symptoms and health queries. | `CureAI.js` |
| **Doctor Portal** | Protected dashboard for medical professionals. | `Doctor/DoctorLogin.js` |

## 4. Routing Strategy
**React Router 7** handles client-side navigation.
*   **Public Routes**: `/`, `/cure-stat`
*   **Protected Routes**: `/doctor-dashboard` (Redirects to Login, if no Auth token found).

