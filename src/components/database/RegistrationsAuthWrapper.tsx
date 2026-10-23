import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RegistrationsDatabaseView } from './RegistrationsDatabaseView';

interface RegistrationsAuthWrapperProps {
  children?: React.ReactNode;
}

/**
 * Authorization wrapper for the RegistrationsDatabaseView component.
 * Checks the current user's role and conditionally renders content if the user
 * is an authorized Doctor or Admin, or displays an authoritative 'Access Denied' message.
 */
export const RegistrationsAuthWrapper: React.FC<RegistrationsAuthWrapperProps> = ({ children }) => {
  const {
    currentUser,
    registeredAppUser,
    setActiveTab
  } = useApp();

  // Role authorization logic:
  // Authorized only if user is a Doctor (hospital/clinical staff) or Platform Admin
  const isAdmin = currentUser.role === 'admin' || registeredAppUser?.role === 'admin';
  const isDoctor = !isAdmin && (
    currentUser.role === 'hospital' ||
    currentUser.name.toLowerCase().includes('dr.') ||
    currentUser.hospitalAffiliation !== undefined ||
    registeredAppUser?.role === 'hospital_staff'
  );

  const isAuthorized = isDoctor || isAdmin;

  // If authorized (Doctor or Admin), render protected registrations content
  if (isAuthorized) {
    return <>{children || <RegistrationsDatabaseView />}</>;
  }

  // If NOT a doctor or admin, render the 'Access Denied' message
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xl overflow-hidden">
        {/* Top Warning Stripe */}
        <div className="bg-rose-600 px-6 py-2.5 flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Healthcare Privacy & Security Gate</span>
          </div>
          <span className="font-mono text-[11px] bg-rose-700/80 px-2 py-0.5 rounded">
            HTTP 403 Forbidden
          </span>
        </div>

        <div className="p-6 sm:p-10 text-center space-y-6">
          {/* Access Denied Icon Emblem */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <Lock className="w-10 h-10 stroke-[2.2]" />
          </div>

          {/* Heading & Notice */}
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wide border border-rose-200">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>Restricted Confidential Directory</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Access Denied
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              You do not have permission to view the <strong>Registrations Database</strong>. In compliance with healthcare confidentiality governance and clinical directory protection standards, blood donor registration logs can be accessed only by verified <strong>Healthcare Staff</strong> and authorized <strong>Admins</strong>.
            </p>
          </div>

          {/* Current Role Inspection Box */}
          <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-700">
              <span className="font-semibold">Current Authenticated Account:</span>
              <span className="font-bold text-slate-900">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Active Role:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 text-[11px]">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Clearance Status:</span>
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                Non-Physician (Restricted)
              </span>
            </div>
          </div>

          {/* Return Action */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
