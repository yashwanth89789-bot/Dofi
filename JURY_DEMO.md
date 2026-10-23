# Dofi — Jury Demonstration Guide

> **Live Demonstration Script (3–5 Minutes)**  
> **Platform**: Dofi — Blood Donation Coordination Platform  
> **Tech Stack**: React 19, TypeScript, Tailwind CSS, Firebase Auth & Firestore, Express.js, Google Gemini 3.1 Flash Lite.

---

## ⏱️ Pre-Demo Checklist (30 Seconds Before Demo)

Ensure the following before presenting:
- [ ] Development server is running: `npm run dev`
- [ ] Browser window open at: `http://localhost:3000`
- [ ] Google account ready for one-click authentication
- [ ] `.env` has valid `GEMINI_API_KEY` (optional — demonstration fallbacks active if omitted)
- [ ] Firebase project active: `dofi-healthcare-platform`

---

## 🎬 3–5 Minute Live Walkthrough

### Step 1: Landing Page & Human Circulatory Concept (30 Seconds)
- **Action**: Open `http://localhost:3000`. Scroll slowly through the landing page.
- **Visual**: Point out the subtle human silhouette and scroll-driven circulatory background animation. Notice how it flows gently through visual whitespace without obscuring text, cards, or call-to-action elements.
- **Narrative**:
  > *"This is Dofi — a blood donation coordination platform designed to eliminate communication delays between hospitals and voluntary donors. The landing page illustrates the journey of blood circulation through human donors to clinical fulfillment."*

---

### Step 2: Real Google Authentication (30 Seconds)
- **Action**: Click **Sign in with Google** in the top navigation bar. Complete the Google OAuth popup.
- **Visual**: The avatar and real Google profile name appear in the top-right navbar.
- **Narrative**:
  > *"Dofi uses live Firebase Authentication. Users log in with standard Google OAuth. This establishes an authenticated Firebase UID which enforces strict security rules in our cloud database."*

---

### Step 3: Four Structured Roles (20 Seconds)
- **Action**: Click the **Demo Perspective** switcher dropdown in the navbar or landing selector.
- **Visual**: Show the 4 available roles: **User**, **Donor**, **Hospital**, and **Admin**. (Note: There is **no Recipient role**; patients receive transfusions under hospital supervision).
- **Narrative**:
  > *"Dofi enforces strict role boundaries: general Users, voluntary Donors, licensed Hospitals, and platform Administrators. Admin access is restricted by cryptographic security rules."*

---

### Step 4: Hospital Portal — Creating an Emergency Requisition (45 Seconds)
- **Action**:
  1. Switch role to **Hospital**.
  2. Click **Create Request**.
  3. Enter requisition details:
     - **Title**: `STAT Trauma Surgery — Massive Transfusion Requisition`
     - **Blood Group**: `O-` (Universal Donor)
     - **Component**: `Packed Red Blood Cells (RBC)`
     - **Units Needed**: `4 Units`
     - **Urgency**: `Emergency`
     - **Patient Alias**: `Trauma Case #B-409`
  4. Click **Publish Blood Requisition**.
- **Visual**: The request is created with an immutable, unique `requestId` (e.g., `req_1790401823_94f`) and instantly appears in the active requisitions table.
- **Narrative**:
  > *"When an emergency occurs, hospital coordinators publish a structured requisition directly to Cloud Firestore. Each request receives a unique ID and timestamp, preventing duplication."*

---

### Step 5: Donor Discovery & One-Click Availability Response (45 Seconds)
- **Action**:
  1. Switch role to **Donor** (Profile: `O-` Universal Donor).
  2. Navigate to **Donor Dashboard** / **Find Blood Requests**.
  3. Locate the `O-` emergency requisition just created in Step 4.
  4. Click the green **"I'm Available"** button.
- **Visual**: The button immediately updates to `Availability Confirmed`. The response history tab updates.
- **Narrative**:
  > *"On the donor side, Dofi's compatibility engine matches donors based on standard immunohematology rules. The donor sees only requests they can safely fulfill. With a single click, they commit availability without exposing private phone numbers or addresses."*

---

### Step 6: Hospital Real-Time Coordination & Fulfillment (30 Seconds)
- **Action**:
  1. Switch back to **Hospital** role.
  2. Locate the active requisition.
  3. Point to the **Active Donor Responses** badge (showing `1 Donor Ready`).
  4. Click **Fulfill Requisition**.
- **Visual**: The requisition status live-updates to `completed` across the system via Firestore real-time listeners.
- **Narrative**:
  > *"Hospital coordinators immediately see incoming responses in real time. Once sufficient units are coordinated, the hospital marks the request as fulfilled. The status updates across all connected devices in milliseconds."*

---

### Step 7: Platform Governance & Admin Database (30 Seconds)
- **Action**:
  1. Switch to **Admin** role (or open **Admin Dashboard**).
  2. View verified registrations, operational metrics, and system audit logs.
- **Visual**: Point to the live registration counts and donor response audit logs.
- **Narrative**:
  > *"The Admin Dashboard provides healthcare compliance officers with operational visibility, registration tracking, and security monitoring — with sensitive contact data shielded by Firestore security rules."*

---

### Step 8: Auxiliary AI Clinical Suite (Optional — 30 Seconds)
- **Action**: Click the **AI Suite** tab in the navigation bar. Select **Lab Report Interpreter** or **Eligibility Triage Assistant**. Run a quick sample scan.
- **Visual**: Fast, structured analysis generated by Google Gemini 3.1 Flash Lite (`@google/genai`).
- **Narrative**:
  > *"Dofi includes optional decision-support micro-services powered by Google Gemini 3.1 Flash Lite. These assist with donor questionnaire triage and plain-language lab report translation. We explicitly disclose that AI is auxiliary and never replaces qualified clinical judgment."*

---

## 💬 Frequently Asked Jury Questions & Clear Answers

#### Q: "Is Dofi a certified medical system or HIPAA compliant?"
> **A**: *"No. Dofi is an academic and hackathon prototype. We explicitly disclose in our banner, modals, and documentation that Dofi is not a certified medical device and does not replace certified laboratory cross-matching or HIPAA-certified EHRs."*

#### Q: "Does the AI make final blood matching or donor eligibility decisions?"
> **A**: *"Never. Immunohematology matching is handled by deterministic ABO/Rh compatibility logic. The Gemini AI models serve solely as educational and administrative decision-support assistants (e.g., explaining lab values or drafting gratitude notes)."*

#### Q: "Is the data live or mocked?"
> **A**: *"Firebase Authentication and Cloud Firestore are completely real and live. Users, blood requests, donor responses, and fulfillment status are written directly to Firestore in real time. We do not use mock fallbacks to fake live database operations."*

#### Q: "Does Dofi connect to government platforms like e-RaktKosh?"
> **A**: *"e-RaktKosh does not offer an open public REST API. Institutional credentials require formal MoHFW authorization issued only to licensed blood banks. Dofi features an architecturally prepared adapter ready for institutional keys, and we transparently disclose this status in our dashboard."*
