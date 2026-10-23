/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { RoleSelector } from './components/landing/RoleSelector';
import { EthicsBanner } from './components/common/EthicsBanner';
import { EmergencyTicker } from './components/common/EmergencyTicker';
import { Navbar } from './components/common/Navbar';
import { EthicsModal } from './components/common/EthicsModal';
import { ReportModal } from './components/common/ReportModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { DonorFinder } from './components/discovery/DonorFinder';
import { RequestsHub } from './components/requests/RequestsHub';
import { CreateRequestModal } from './components/requests/CreateRequestModal';
import { RequestDetailModal } from './components/requests/RequestDetailModal';
import { DonorRegistrationModal } from './components/donate/DonorRegistrationModal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AIClinicalHub } from './components/ai/AIClinicalHub';
import { RegistrationsDatabaseView } from './components/database/RegistrationsDatabaseView';
import { RegistrationsAuthWrapper } from './components/database/RegistrationsAuthWrapper';
import { DonorDetailModal } from './components/discovery/DonorDetailModal';
import { DonorAIToolsView } from './components/donor/DonorAIToolsView';
import { ShieldCheck } from 'lucide-react';

/**
 * Authenticated app shell — shown after login + role selection.
 * Preserves all existing tab routing and modals exactly.
 */
const AuthenticatedApp: React.FC = () => {
  const {
    activeTab,
    currentUser,
    setActiveTab,
    selectedRequest,
    setSelectedRequest,
    selectedDonor,
    setSelectedDonor,
    setIsEthicsModalOpen
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Legal & Safety Ethics Banner */}
      <EthicsBanner />

      {/* 2. Emergency Active Ticker */}
      <EmergencyTicker />

      {/* 3. Top Navigation Bar */}
      <Navbar />

      {/* 4. Active Content Tab View */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          currentUser.role === 'donor'
            ? <DonorDashboard />
            : currentUser.role === 'hospital'
              ? <HospitalPortal />
              : currentUser.role === 'admin'
                ? <AdminDashboard />
                : <DashboardView />
        )}
        {activeTab === 'find-donors' && (
          currentUser.role === 'donor' ? <DonorDashboard /> : <DonorFinder />
        )}
        {activeTab === 'requests' && <RequestsHub />}
        {activeTab === 'hospital' && <HospitalPortal />}
        {activeTab === 'ai-suite' && <AIClinicalHub />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'registrations' && (
          <RegistrationsAuthWrapper>
            <RegistrationsDatabaseView />
          </RegistrationsAuthWrapper>
        )}
        {activeTab === 'ai-clinical-tools' && (
          currentUser.role === 'donor' ? <DonorAIToolsView /> : <DashboardView />
        )}
      </main>

      {/* Modals & Dialogs */}
      <CreateRequestModal />
      <DonorRegistrationModal />
      <EthicsModal />
      <ReportModal />
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {selectedDonor && (
        <DonorDetailModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="h-6 w-6 rounded bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                  DF
                </div>
                <span>Dofi</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Dofi — Blood Donation Coordination Platform connecting eligible donors with verified blood requests and hospitals.
              </p>
              <button
                onClick={() => {
                  if (currentUser.role === 'donor') {
                    setActiveTab('dashboard');
                    setTimeout(() => {
                      document.getElementById('potential-requests')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  } else {
                    setActiveTab('find-donors');
                  }
                }}
                className="text-teal-400 hover:text-teal-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{currentUser.role === 'donor' ? 'Find Blood Requests →' : 'Find Available Donors →'}</span>
              </button>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">Coordination Programs</div>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => setActiveTab('requests')} className="hover:text-white transition-colors">Whole Blood Coordination</button></li>
                <li><button onClick={() => setActiveTab('requests')} className="hover:text-white transition-colors">Platelet &amp; Apheresis Demands</button></li>
                <li><button onClick={() => currentUser.role === 'donor' ? setActiveTab('dashboard') : setActiveTab('find-donors')} className="hover:text-white transition-colors">Universal &amp; Rare Donors</button></li>
                <li><button onClick={() => setActiveTab('hospital')} className="hover:text-white transition-colors">Hospital Blood Bank Portal</button></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">Clinical Governance</div>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">Blood Banking &amp; Serology Guidelines</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">Voluntary Non-Remunerated Donation</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">Zero-Commercialization Mandate</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">Strict Anti-Trafficking Protocols</button></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">About This Project</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dofi is a healthcare donation coordination <strong className="text-slate-300">prototype</strong>. AI outputs are decision-support demonstrations requiring qualified clinical review. Not a certified medical system.
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Firebase · Express · Gemini AI · React 19
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>© 2026 Dofi. Prototype project — not a production medical platform.</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                <span>Non-Commercial Platform</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * Root content router:
 * - No Firebase user   → LandingPage (public)
 * - Firebase user, no role chosen (needsRoleSelection) → RoleSelector
 * - Firebase user + role chosen → AuthenticatedApp
 *
 * "Role chosen" is tracked in sessionStorage so it resets on new tab/session,
 * requiring the user to pick a role again (better demo UX).
 */
const RootRouter: React.FC = () => {
  const { firebaseUser, currentUser, registeredAppUser, isFirebaseLoading, isAuthReady } = useApp();

  // Loading state while Firebase resolves auth on initial load or during auth transitions
  if (!isAuthReady || isFirebaseLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Connecting to Dofi…</p>
        </div>
      </div>
    );
  }

  // Not signed in → show public landing page
  if (!firebaseUser) {
    return <LandingPage />;
  }

  const isAuthorizedAdmin = Boolean(
    firebaseUser && (
      registeredAppUser?.role === 'admin' ||
      firebaseUser.email === 'mohammedayaan9683@gmail.com'
    )
  );

  // If user is authorized admin, enter directly
  if (isAuthorizedAdmin) {
    return <AuthenticatedApp />;
  }

  // Never use browser/session state alone to render administrator tools.
  if (currentUser.role === 'admin' && !isAuthorizedAdmin) {
    return <RoleSelector />;
  }

  // Check if role is chosen in current session or remembered from previous choice
  const hasChosenRole = sessionStorage.getItem('dofi_role_chosen') === '1' || Boolean(localStorage.getItem('dofi_user_role'));

  if (!hasChosenRole) {
    return <RoleSelector />;
  }

  // Fully authenticated + role known → main app
  return <AuthenticatedApp />;
};

export default function App() {
  return (
    <AppProvider>
      <RoleRouterWrapper />
    </AppProvider>
  );
}

/**
 * Wrapper so we can use useApp() inside RootRouter
 * while keeping AppProvider at the top level.
 */
const RoleRouterWrapper: React.FC = () => <RootRouter />;
