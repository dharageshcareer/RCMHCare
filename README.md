# Hospital Insurance Portal

## Project Description

The Hospital Insurance Portal is a sophisticated single-page web application (SPA) built with React to streamline and manage patient insurance eligibility checks and pre-authorization submissions. It features an "agentic UI" that simulates real-time interactions with a backend AI service, providing detailed rationale and data for all insurance-related decisions.

The application is designed for hospital administrative staff to efficiently handle the insurance verification process, from adding new patients to tracking the status of their pre-authorization requests. All data is persisted in the browser's local storage, ensuring a seamless and stateful user experience across sessions.

---

## Key Features

- **📊 Interactive Dashboard**: Provides an at-a-glance overview of key performance indicators (KPIs) like total patients, completed eligibility checks, and pending pre-authorizations. Includes a timeline of recent patient activities.
- **👥 Patient Management**: A fully functional patient records page with features for:
    - Searching and filtering patients by name or Member ID.
    - Paginated view for easy navigation.
    - Adding new patients through a comprehensive form that captures demographic, insurance, and medical data.
- **🤖 Agentic Workflow**: A patient-centric detail page that serves as the core of the application:
    - **Eligibility Check**: Run eligibility checks for specific medical procedures by submitting clinical codes.
    - **AI Agent Response**: View detailed, structured responses from a mock AI agent, including plan benefits, coverage details, and the evidence-based rationale for the eligibility decision.
    - **Pre-Authorization Submission**: If required, seamlessly submit pre-authorizations with supporting clinical documents.
- **💾 Data Persistence**: Initial patient and treatment data is loaded from JSON files. All subsequent additions and updates are saved to the browser's `localStorage`, preserving the application's state between sessions.
- **🎨 Modern & Responsive UI**: A clean, professional, and responsive user interface built with Tailwind CSS, ensuring a great user experience on both desktop and tablet devices.

---

## Technology Stack

- **Framework**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## Getting Started

This application is designed to run in a web-based development environment. No local setup is required.

- **Installation**: All dependencies are managed via an `importmap` in `index.html` and are loaded directly from a CDN.
- **Running the App**: The application will automatically load and run when you open the project.

---

## Project Structure

```
.
├── public/
│   ├── patients.json       # Initial mock data for patients
│   └── treatments.json     # Pre-populated treatment histories for some patients
├── src/
│   ├── components/         # Reusable UI components (Layout, Sidebar, KpiCard, etc.)
│   ├── pages/              # Top-level page components (Dashboard, Patients, etc.)
│   ├── services/           # Mock API service for backend simulation (api.ts)
│   ├── utils/              # Utility functions (e.g., file converters)
│   ├── App.tsx             # Main application component with routing logic
│   ├── index.tsx           # Application entry point
│   ├── constants.ts        # Application-wide constants
│   └── types.ts            # TypeScript type definitions and interfaces
├── index.html              # Main HTML file
└── README.md               # This documentation file
```

---

## Mock API Contracts

The application simulates a backend through a mock API service defined in `src/services/api.ts`.

### 1. Eligibility Check

- **Endpoint**: `POST /api/eligibility-check`
- **Description**: Checks a patient's insurance eligibility for a specific procedure.
- **Response**: Returns a detailed object including eligibility status, pre-auth requirements, plan benefits, and the AI agent's rationale.

### 2. Pre-Authorization Submission

- **Endpoint**: `POST /api/preauth-submit`
- **Description**: Submits clinical documents for pre-authorization if required by the eligibility check.
- **Response**: Returns a confirmation with a Pre-Auth ID, submission status, and the AI's assessment of the provided documents.
