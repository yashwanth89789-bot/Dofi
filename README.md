# Dofi — Blood Donation Coordination Platform

> **Academic / Hackathon Prototype**  
> Dofi is a full-stack blood donation coordination platform that helps hospitals create blood requests, identify potentially compatible donors, coordinate donor availability, and track request fulfillment in real time.  
>  
> ⚠️ **Clinical Disclaimer**: Dofi is an academic and hackathon prototype. It is **NOT** a certified medical device, is **NOT** HIPAA/FDA certified, and must **NEVER** be used as a substitute for qualified clinical judgment, certified laboratory immunohematology cross-matching, or professional blood banking protocols.

---

## 📋 Table of Contents

1. [What is Dofi?](#1-what-is-dofi)
2. [Problem](#2-problem)
3. [Solution](#3-solution)
4. [Core Workflow](#4-core-workflow)
5. [User Roles](#5-user-roles)
6. [Main Features](#6-main-features)
7. [Architecture](#7-architecture)
8. [Technology Stack](#8-technology-stack)
9. [Firebase Setup](#9-firebase-setup)
10. [Gemini & AI Setup](#10-gemini--ai-setup)
11. [Environment Variables](#11-environment-variables)
12. [Firestore Collections](#12-firestore-collections)
13. [Firestore Security](#13-firestore-security)
14. [Local Development](#14-local-development)
15. [Testing & Verification](#15-testing--verification)
16. [Production & Deployment](#16-production--deployment)
17. [Demo Flow](#17-demo-flow)
18. [External Integrations](#18-external-integrations)
19. [Limitations](#19-limitations)
20. [Troubleshooting](#20-troubleshooting)
21. [License](#21-license)

---

## 1. What is Dofi?

Dofi is an end-to-end blood donation coordination platform designed to bridge the critical communication gap between licensed healthcare facilities and voluntary blood donors. Built with React 19, TypeScript, Tailwind CSS, Express.js, Firebase Auth & Firestore, and Google Gemini AI, Dofi simplifies emergency blood requisitioning, donor discovery, and response tracking into a secure, real-time workflow.

---

## 2. Problem

Blood shortages in emergency departments, trauma surgeries, and chronic transfusion wards (e.g., thalassemia, oncology) are frequently exacerbated by operational friction:
- **Fragmented Communication**: Hospitals rely on ad-hoc phone calls, broadcast messaging, and social media pleas that lack structure, audit trails, and privacy protection.
- **Delays in Compatibility Matching**: Determining ABO/Rh compatibility and donor availability during STAT emergencies takes valuable clinical minutes.
- **Donor Fatigue & Privacy Concerns**: Donors hesitate to share personal phone numbers and contact details on public message boards.
- **Lack of Real-Time Fulfill Status**: Multiple donors may arrive for an already-fulfilled requisition while other acute shortages go unnoticed.

---

## 3. Solution

Dofi provides a structured, privacy-preserving coordination layer:
- **Direct Hospital Requisitions**: Verified healthcare facilities publish structured blood requests with explicit ABO/Rh groups, components (Whole Blood, Platelets/Apheresis, Packed RBCs, FFP), and urgency tiers.
- **Algorithmic Compatibility Filtering**: Real-time filtering presents donors only with requests medically compatible with their ABO/Rh blood profile.
- **Privacy-First Availability Handshake**: Donors declare availability with a single click ("I'm Available") without exposing private telephone numbers or home addresses to public directories.
- **Real-Time Fulfillment Pipeline**: Requests transition live through structured statuses (`open` → `in_progress` → `fulfilled`) via Firestore listeners, keeping all stakeholders synchronized.

---

## 4. Core Workflow

```
[ Hospital ]
     │
     ▼ Creates blood request (ABO/Rh, component, units, urgency)
[ Firestore: donation_requests ]
     │
     ├─────────────► Real-time push to compatible donors
     │
[ Donor ]
     │
     ▼ Views matching request & clicks "I'm Available"
[ Firestore: donor_responses ]
     │
     ├─────────────► Real-time update in Hospital Portal
     │
[ Hospital ]
     │
     ▼ Confirms donor response & fulfills requisition
[ Firestore: donation_requests status = 'completed' ]
```

---

## 5. User Roles

Dofi implements a strict four-role authorization model:

### 1. User
- General public user exploring blood donation awareness and requirements.
- Can view general blood requests and public blood bank locations.
- Can register to become an active voluntary blood donor.
- Maintains basic account profile settings.
- *Note*: Dofi has no recipient role; patients receive blood through hospital care teams.

### 2. Donor
- Maintains a voluntary blood donor profile (blood group, city, availability status).
- Automatically filtered view showing only **compatible blood requests** based on standard immunohematology compatibility matrices.
- Can respond to multiple independent requests with **"I'm Available"**.
- Retains private history of active and completed responses.
- **Privacy Guarantee**: Donor private contact numbers and street addresses are never exposed to hospital portals or public directories through response coordination records.

### 3. Hospital
- Verified healthcare facility or licensed blood bank staff account.
- Creates multiple independent blood requisition orders, each stamped with an immutable, unique `requestId`.
- Real-time portal monitoring incoming donor responses specific to its facility's requests.
- Coordinates donor availability, confirms matches, and marks requisitions as fulfilled.
- **Security Boundary**: Facility staff can only view and manage donor responses linked to their own hospital's requests.

### 4. Admin
- Dedicated platform governance and compliance monitoring.
- Operational overview: live user registrations, active requisition throughput, and system audit logs.
- Platform-level management governed by Firestore security rules.
- **Role Assignment**: Admin is **NOT** a selectable option during self-service signup. Administrative clearance is restricted by identity verification and hardcoded administrative security rules (`mohammedayaan9683@gmail.com`).

---

## 6. Main Features

- 🩸 **Blood Requisition Hub**: Create, filter, and track requests by Blood Group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), Component Type, and Urgency (`Emergency`, `Urgent`, `Routine`).
- ⚡ **Interactive Donor Handshake**: One-click "I'm Available" response flow with instant Firestore synchronization and deduplication prevention.
- 🏥 **Hospital Command Center**: Dedicated operational portal for managing multiple active requisitions and incoming donor response queues.
- 🔒 **Privacy-Preserving Architecture**: Donor phone numbers, email addresses, and location coordinates are protected by Firestore security rules and omitted from public response payloads.
- 🫀 **Anatomical Circulatory Visualization**: Elegant, scroll-driven vascular network background illustrating human circulatory flow without obscuring clinical content.
- 🤖 **Auxiliary Gemini AI Suite**: Optional AI decision-support micro-services (donor eligibility pre-screening, emergency dispatch logistics, and plain-language lab report translation).

---

## 7. Architecture

Dofi is engineered as a unified full-stack application:

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (BROWSER)                     │
│  React 19 + TypeScript + Tailwind CSS + Lucide Icons  │
│  - Real-time Firestore Listeners (onSnapshot)         │
│  - Firebase Auth Client SDK (Google OAuth)             │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
      Live Data Reads/Writes    API Requests (/api/*)
               │                         │
               ▼                         ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   FIREBASE CLOUD INFRA    │ │      EXPRESS SERVER      │
│  - Firebase Authentication │ │  Node.js + Express 4.21  │
│  - Cloud Firestore DB      │ │  - Gemini Flash 3.1 SDK  │
│  - Security Rules (RBAC)   │ │  - e-RaktKosh Adapter    │
│  - Client Config JSON      │ │  - Static Asset Delivery │
└───────────────────────────┘ └──────────────────────────┘
```

- **Frontend**: React 19 single-page app bundled by Vite, rendering responsive clinical interfaces.
- **Authoritative Database**: Firebase Firestore is the sole source of truth for live users, requisitions, registrations, and donor responses.
- **Backend API**: Express.js server providing secure proxy endpoints to Google Gemini and external adapter services.
- **Authentication**: Firebase Authentication with Google OAuth provider.

---

## 8. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.0.1 | Reactive component architecture |
| **Language** | TypeScript | 7.0.2 | End-to-end static type safety |
| **Styling** | Tailwind CSS | 4.3.3 | High-density clinical UI design |
| **Icons** | Lucide React | 0.546.0 | Semantic medical and interface icons |
| **Build Tool** | Vite | 8.3.2 | Fast HMR dev server & production bundling |
| **Backend Server** | Express | 4.21.2 | API route proxy & production host |
| **TypeScript Runner**| tsx | 4.21.0 | Direct execution of TypeScript server |
| **Database** | Cloud Firestore | 12.19.0 | Real-time NoSQL cloud database |
| **Authentication** | Firebase Auth | 12.19.0 | Secure Google OAuth user identity |
| **Generative AI** | Google GenAI SDK | 2.4.0 | Gemini 3.1 Flash Lite inference |

---

## 9. Firebase Setup

Follow these exact steps to configure Firebase for a clean installation:

### Step 1: Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `dofi-healthcare-platform`).
3. Enable or disable Google Analytics according to your preference and create the project.

### Step 2: Register a Web App
1. Inside your project overview, click the **Web icon (`</>`)** to register a web application.
2. Enter the app nickname: `Dofi Web`.
3. Do **not** check Firebase Hosting setup during initial creation.
4. Copy the generated `firebaseConfig` object values.

### Step 3: Populate `firebase-applet-config.json`
Place your Firebase configuration in `firebase-applet-config.json` in the project root:

```json
{
  "apiKey": "AIzaSyYourWebApiKeyHere",
  "authDomain": "your-project-id.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:abcdef123456",
  "measurementId": "G-XXXXXXXXXX"
}
```

### Step 4: Enable Authentication & Google Sign-In
1. In Firebase Console, go to **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Google**.
4. Toggle **Enable**, configure your project support email, and click **Save**.
5. Under the **Settings** tab → **Authorized domains**, ensure `localhost` is listed.

### Step 5: Create Cloud Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Select **Production mode** and choose your preferred cloud region.
4. Click **Enable**.

### Step 6: Deploy Firestore Security Rules & Indexes
Install the Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
```

Authenticate and select your project:
```bash
firebase login
firebase use your-project-id
```

Deploy the repository's rules and composite indexes:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 10. Gemini & AI Setup

Dofi utilizes the Google GenAI SDK (`@google/genai`) to power decision-support assistants.

### Core vs. Auxiliary Features
- **Core Blood Workflow**: Firebase Authentication, Firestore live database, blood request creation, donor "I'm Available" responses, and hospital fulfillment do **NOT** require Gemini. The platform is completely usable without an AI key.
- **Auxiliary AI Features**: Features under the **AI Suite** tab (Donor Pre-Screening, Emergency Dispatch, Lab Interpretation, Gratitude Letters) make server-side calls to Gemini models.

### How to Configure Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a new key for your Google Cloud project.
3. Open or create `.env` in the repository root:
   ```bash
   GEMINI_API_KEY=AIzaSyYourGeneratedKeyHere
   ```
4. Restart the server (`npm run dev`).

### Gemini API Endpoints in Dofi

| Endpoint | Purpose | Model Used | Required for Core? |
| :--- | :--- | :--- | :--- |
| `POST /api/ai/screen-eligibility` | Evaluates donor pre-screening questionnaires | `gemini-3.1-flash-lite` | No (Auxiliary) |
| `POST /api/ai/emergency-dispatch` | Recommends transport routing and cold-chain logistics | `gemini-3.1-flash-lite` | No (Auxiliary) |
| `POST /api/ai/lab-interpreter` | Translates CBC, serology, and blood typing panels | `gemini-3.1-flash-lite` | No (Auxiliary) |
| `POST /api/ai/gratitude-letter` | Generates anonymized donor thank-you correspondence | `gemini-3.1-flash-lite` | No (Auxiliary) |
| `POST /api/ai/vision-analyzer` | Optical analysis of blood collection specimen tubes | `gemini-3.1-flash-lite` | No (Auxiliary) |
| `GET /api/external/eraktkosh` | Status adapter for national blood bank integration | N/A (Adapter) | No (External) |

*Failure Behavior*: If `GEMINI_API_KEY` is omitted or API quotas are exhausted, endpoints return structured demonstration responses with clear indicators that fallback data is shown.

---

## 11. Environment Variables

The server loads environment variables via `dotenv`. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required? | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | `undefined` | Google AI Studio API key for auxiliary AI endpoints. |
| `PORT` | Optional | `3000` | Port for Express server and Vite development server. |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` or `production`). |
| `ERAKTKOSH_INSTITUTION_TOKEN` | Optional | `undefined` | Institutional MoHFW token (reserved for future licensed blood bank access). |
| `ERAKTKOSH_HOSPITAL_CODE` | Optional | `undefined` | Official blood bank code registered with e-RaktKosh. |

*Note*: Client Firebase credentials are read from `firebase-applet-config.json` and are **never** committed to version control with production secrets.

---

## 12. Firestore Collections

The live Firestore schema consists of the following collections:

### 1. `/users/{userId}`
Stores user identity, role, and verification status linked to Firebase Auth UID:
```typescript
interface RegisteredAppUser {
  id: string;               // Firebase Auth UID
  email: string;            // User email address
  displayName: string;      // Full name or clinical title
  role: 'user' | 'donor' | 'hospital' | 'admin';
  isVerified: boolean;      // Clinical or identity verification flag
  donationsRegisteredCount: number;
  organizationId?: string;  // Hospital affiliation identifier
  createdAt: string;        // ISO timestamp
  lastLoginAt: string;      // ISO timestamp
  provider: string;         // 'google'
}
```

### 2. `/donation_requests/{requestId}`
Authoritative requisitions created by hospitals:
```typescript
interface DonationRequest {
  id: string;               // Unique requisition ID (e.g., req_1790400000_abc)
  requesterId: string;      // UID of hospital coordinator
  hospitalId: string;       // Facility ID
  hospitalName: string;     // Hospital facility name
  title: string;            // Requisition headline
  category: 'blood';        // Donation domain
  urgency: 'emergency' | 'urgent' | 'routine';
  status: 'open' | 'matching' | 'in_progress' | 'completed' | 'cancelled';
  patientAlias: string;     // De-identified alias (e.g., Patient #B-902)
  bloodRequirements: {
    targetBloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    componentType: 'whole_blood' | 'platelets_apheresis' | 'packed_rbc' | 'plasma';
    unitsRequired: number;
  };
  city: string;
  createdAt: string;
  _isDemoData?: boolean;
}
```

### 3. `/donor_responses/{responseId}`
Coordination records created when a donor clicks "I'm Available":
```typescript
interface DonorResponse {
  id: string;               // Formatted: resp_{requestId}_{donorUserId}
  requestId: string;        // Target requisition ID
  donorId: string;          // Donor profile ID
  donorUserId: string;      // Donor Firebase Auth UID
  donorName: string;        // Donor display name
  bloodGroup: string;       // ABO/Rh blood group
  city?: string;            // City (approximate, non-sensitive)
  status: 'available' | 'confirmed' | 'fulfilled' | 'cancelled';
  hospitalId?: string;      // Target hospital facility ID
  requesterId?: string;     // Hospital creator UID
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### 4. `/donation_registrations/{registrationId}`
Voluntary donor registration records for community tracking.

### 5. `/blood_banks/{bankId}`
Public directory of licensed regional blood centers and transfusion facilities.

---

## 13. Firestore Security

Production rules in `firestore.rules` enforce strict access boundaries:

- **Authentication Required**: All application data mutations require `request.auth != null`.
- **Donor Privacy**: Rules enforce `hasNoSensitiveContact(data)`, strictly rejecting documents containing `phone`, `email`, or street `address` fields in `donor_responses`.
- **Hospital Requisition Isolation**: Facilities can only view donor responses corresponding to their own requisitions (`isAssociatedHospital(data)`).
- **Immutable Ownership**: Updates to `donor_responses` cannot alter `donorUserId`, `requestId`, `hospitalId`, or `requesterId`.
- **Admin Privilege Protection**: Role updates to `admin` cannot be self-assigned through the client SDK; admin privileges are validated against explicit administrative credentials.
- **Public Directory Safety**: Reference blood banks are read-only for users and writable solely by verified administrators.

---

## 14. Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/mohammed-ayaan01/Dofi.git
cd Dofi

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY (optional)

# 4. Verify Firebase config
# Ensure firebase-applet-config.json exists with your project credentials

# 5. Start the development server
npm run dev
```

The application starts at: **`http://localhost:3000`**

The server combines Express API routing and Vite development middleware into a single process managed by `tsx server.ts`.

---

## 15. Testing & Verification

### Static Type Checking
Verify all TypeScript interfaces, component props, and API schemas:
```bash
npx tsc --noEmit
```
*Expected output: Exit code 0 with 0 errors.*

### Production Build Verification
Test client bundle minification and server bundling:
```bash
npm run build
```
*Expected output: Generates `dist/` client assets and bundles `server.js` via esbuild with exit code 0.*

---

## 16. Production & Deployment

Because Dofi incorporates an Express server for Gemini API endpoints and adapter proxying, deployment requires a Node.js runtime environment:

### Recommended: Google Cloud Run / Docker
1. Build container image:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY dist ./dist
   COPY server.js ./server.js
   COPY firebase-applet-config.json ./
   ENV NODE_ENV=production PORT=8080
   EXPOSE 8080
   CMD ["node", "server.js"]
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy dofi --source . --port 8080 --allow-unauthenticated
   ```

### Static Hosting Alternative (Firebase Hosting + Cloud Functions)
If deploying the frontend to static Firebase Hosting:
1. Deploy `dist/` via `firebase deploy --only hosting`.
2. Rewrite `/api/**` in `firebase.json` to an Express Cloud Function running `server.ts`.

---

## 17. Demo Flow

A standard 3-minute evaluation walkthrough demonstrating real Firebase synchronization:

1. **Open Application**: Navigate to `http://localhost:3000`. Observe the anatomical circulatory visualization and operational stats.
2. **Sign In**: Click **Sign in with Google**. Authenticate via Google OAuth popup.
3. **Select Hospital Perspective**: Choose **Hospital** role.
4. **Create Blood Request**: Click **Create Request**. Submit a requisition for `O-` Packed RBCs (Urgency: `Emergency`).
5. **Observe Unique Request**: The request appears instantly in the Hospital Requisitions list with a unique `requestId`.
6. **Switch to Donor Perspective**: Change role to **Donor** (Profile: `O-` Universal Donor).
7. **Find Matching Requisition**: The newly created request appears in the compatible requests feed.
8. **Click "I'm Available"**: Submit availability response.
9. **Return to Hospital Portal**: Switch back to **Hospital**. Observe the donor response appears in real time.
10. **Fulfill Requisition**: Hospital confirms and fulfills the request, moving status to `completed`.

---

## 18. External Integrations

### e-RaktKosh (MoHFW Blood Bank Platform)
- **Status**: `Pending Institutional Authorization`
- **Notice**: e-RaktKosh does **not** offer an open public REST API. Institutional integration credentials are provided exclusively by the Ministry of Health & Family Welfare to licensed, registered blood banks.
- **Adapter**: Dofi includes an architecturally complete adapter endpoint (`/api/external/eraktkosh`) ready to proxy live BBMS stock calls once institutional credentials are configured.
- **Official Portal**: [https://eraktkosh.mohfw.gov.in](https://eraktkosh.mohfw.gov.in)

---

## 19. Limitations

- **Prototype Classification**: Dofi is an academic and hackathon prototype designed to demonstrate coordination architecture; it is not approved for clinical diagnostic or acute emergency dispatch in live clinical facilities.
- **Regulatory Certification**: Dofi is not certified under HIPAA, FDA, CE-mark, or CDSCO medical device regulations.
- **Clinical Immunohematology**: ABO/Rh compatibility filters in software provide informational triage only; certified physical serological cross-matching in a licensed laboratory is legally and medically mandatory before any blood transfusion.
- **AI Output Review**: All outputs from Google Gemini assistants require review by qualified clinical personnel before operational use.

---

## 20. Troubleshooting

| Issue | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **`auth/unauthorized-domain`** | `localhost` is missing from Firebase Auth settings. | In Firebase Console → Authentication → Settings → Authorized Domains, add `localhost`. |
| **`auth/operation-not-allowed`** | Google provider is disabled. | In Firebase Console → Authentication → Sign-in method, enable Google. |
| **Firebase permission denied** | Firestore security rules blocking read/write. | Run `firebase deploy --only firestore:rules` to deploy the project rules. |
| **Missing `GEMINI_API_KEY`** | `.env` file does not exist or key is empty. | Copy `.env.example` to `.env` and set `GEMINI_API_KEY=your_key`. Restart server. |
| **Gemini `429 Too Many Requests`** | Free tier quota rate limit reached. | Wait 60 seconds; the server automatically falls back to `gemini-3.8-flash` or demonstration mode. |
| **Port 3000 already in use** | Another Node process is running. | Run `npx kill-port 3000` or specify a different port: `PORT=3001 npm run dev`. |
| **Missing Firestore composite index** | Complex queries require an index. | Click the URL generated in browser console or run `firebase deploy --only firestore:indexes`. |
| **Donor response not visible** | Viewing with an unaffiliated hospital account. | Verify that the hospital account viewing responses matches the `requesterId` or `hospitalId` of the requisition. |
| **TypeScript build fails** | Outdated or mismatched dependencies. | Run `rm -rf node_modules dist && npm install && npx tsc --noEmit`. |

---

## 21. License

Licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for terms and conditions.
