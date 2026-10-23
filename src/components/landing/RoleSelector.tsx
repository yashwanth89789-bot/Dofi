import React from 'react';
import { User, UserPlus, Building2, ShieldCheck, LogOut, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  hoverBorder: string;
}

const NORMAL_ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'user',
    label: 'User',
    description: 'Explore blood requests, discover healthcare facilities, and coordinate donation support.',
    icon: User,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400'
  },
  {
    role: 'donor',
    label: 'Donor',
    description: 'View potential compatible blood requests near you, register your availability, and respond to hospitals in need.',
    icon: UserPlus,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400'
  },
  {
    role: 'hospital',
    label: 'Hospital',
    description: 'Create and manage blood requests for your verified healthcare facility, view potential donor matches.',
    icon: Building2,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-400'
  }
];

export const RoleSelector: React.FC = () => {
  const { firebaseUser, switchUserRole, logoutFirebase, registeredAppUser, setActiveTab } = useApp();
  const isAuthorizedAdmin = Boolean(
    firebaseUser && (
      registeredAppUser?.role === 'admin' ||
      firebaseUser.email === 'mohammedayaan9683@gmail.com'
    )
  );

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'admin' && !isAuthorizedAdmin) return;
    sessionStorage.setItem('dofi_role_chosen', '1');
    localStorage.setItem('dofi_user_role', role);
    switchUserRole(role);
    if (role === 'admin') {
      setActiveTab('admin');
    } else if (role === 'hospital') {
      setActiveTab('hospital');
    } else {
      setActiveTab('dashboard');
    }
  };

  const displayName = firebaseUser?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-lg">DF</div>
            <span className="text-2xl font-black text-slate-900">Dofi</span>
          </div>

          {firebaseUser?.photoURL && (
            <img
              src={firebaseUser.photoURL}
              alt="Your profile photo"
              className="w-16 h-16 rounded-full border-4 border-white shadow-md mx-auto"
              referrerPolicy="no-referrer"
            />
          )}

          <h1 className="text-xl font-bold text-slate-900">
            Welcome, {displayName}!
          </h1>
          <p className="text-sm text-slate-500">
            You're signed in as <span className="font-semibold text-slate-700">{firebaseUser?.email}</span>.<br />
            Choose how you'll use Dofi today.
          </p>
        </div>

        {/* Role cards for normal users: User, Donor, Hospital */}
        <div className="space-y-3">
          {NORMAL_ROLE_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.role}
                onClick={() => handleRoleSelect(option.role)}
                className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 ${option.border} ${option.bg} ${option.hoverBorder} hover:shadow-md text-left transition-all cursor-pointer group`}
              >
                <div className={`h-12 w-12 rounded-xl border ${option.border} bg-white flex items-center justify-center shrink-0`}>
                  <Icon className={`h-6 w-6 ${option.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">{option.label}</span>
                    {option.role === 'donor' && registeredAppUser?.role === 'donor' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 border border-teal-200">
                        Your account role
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{option.description}</p>
                </div>
                <div className={`shrink-0 text-slate-300 group-hover:${option.color} transition-colors mt-1`}>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
            );
          })}

          {/* Admin card: ONLY presented if user is securely authorized as admin */}
          {isAuthorizedAdmin && (
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:border-slate-500 hover:shadow-md text-left transition-all cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-xl border border-slate-300 bg-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-slate-800" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-base">Platform Administrator</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                    Authorized Admin
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Access platform-wide administrative controls, request verifications, and compliance monitoring.
                </p>
              </div>
              <div className="shrink-0 text-slate-400 group-hover:text-slate-800 transition-colors mt-1">
                <ArrowRight className="h-5 w-5" />
              </div>
            </button>
          )}
        </div>

        {/* Informational note for normal users */}
        {!isAuthorizedAdmin && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Administrative Access:</strong> Admin is a privileged role and is not selectable for general users. Administrator privileges are granted only to verified accounts configured in Firebase.
            </p>
          </div>
        )}

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={logoutFirebase}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out of Google
          </button>
        </div>
      </div>
    </div>
  );
};
