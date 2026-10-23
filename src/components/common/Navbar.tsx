import React, { useState } from 'react';
import {
  PlusCircle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Database,
  Lock,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    activeTab,
    setActiveTab,
    setIsCreateRequestModalOpen,
    setIsRegisterDonorModalOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedRequest,
    setSelectedDonor,
    donors,
    requests,
    firebaseUser,
    registeredAppUser,
    loginWithGoogle,
    logoutFirebase,
    isFirebaseLoading
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isAuthorizedAdmin = Boolean(
    firebaseUser && (
      registeredAppUser?.role === 'admin' ||
      firebaseUser.email === 'mohammedayaan9683@gmail.com'
    )
  );
  const isAdmin = currentUser.role === 'admin' || isAuthorizedAdmin;
  const isDoctor = !isAdmin && (currentUser.role === 'hospital' || currentUser.name.toLowerCase().includes('dr.') || currentUser.hospitalAffiliation !== undefined || registeredAppUser?.role === 'hospital_staff');
  const isDonorExperience = currentUser.role === 'donor';

  // Show admin/doctor-only nav items only when appropriate role is active
  const showAdminNav = isAuthorizedAdmin || isDoctor;
  const showRegistrationsNav = Boolean(isAuthorizedAdmin && currentUser.role === 'admin');

  const demoRoleOptions: { role: UserRole; label: string; desc: string; shortLabel: string }[] = [
    {
      role: 'hospital',
      label: 'Hospital',
      desc: 'Create/manage blood requests and coordinate donor responses.',
      shortLabel: 'Hospital'
    },
    {
      role: 'donor',
      label: 'Donor',
      desc: 'View compatible blood requests and respond.',
      shortLabel: 'Donor'
    },
    {
      role: 'user',
      label: 'User',
      desc: 'Explore requests and connect with donors and hospitals.',
      shortLabel: 'User'
    },
    ...(isAuthorizedAdmin ? [{
      role: 'admin' as UserRole,
      label: 'Admin',
      desc: 'Platform governance & verification.',
      shortLabel: 'Admin'
    }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                  Dofi
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Blood Donation Coordination
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, 1-2 words) */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5 text-xs font-semibold tracking-wide uppercase">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {isDonorExperience ? 'My Dashboard' : 'Dashboard'}
            </button>
            {isDonorExperience ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setTimeout(() => {
                      document.getElementById('potential-requests')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="transition-colors pb-0.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Find Blood Requests
                </button>
                <button
                  onClick={() => setActiveTab('ai-clinical-tools')}
                  className={`transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ai-clinical-tools'
                      ? 'border-teal-600 text-teal-700 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>AI Clinical Tools</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('find-donors')}
                className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                  activeTab === 'find-donors'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Find Donors
              </button>
            )}
            {!isDonorExperience && (
              <>
            <button
              onClick={() => setActiveTab('requests')}
              className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                activeTab === 'requests'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                activeTab === 'hospital'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital Portal
            </button>
              </>
            )}
            {/* Admin & Ethics — only visible to admin/doctor roles */}
            {showAdminNav && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin &amp; Ethics
              </button>
            )}

            {/* Registrations — only visible to authorized admin */}
            {showRegistrationsNav && (
              <button
                onClick={() => setActiveTab('registrations')}
                className={`transition-colors pb-0.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'registrations'
                    ? 'border-teal-600 text-teal-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
                title="Admin Access: Full unmasked registration database & governance"
              >
                <Database className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>Registrations</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Admin
                </span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Primary Action Button: Create Request */}
            <button
              onClick={() => isDonorExperience ? setIsRegisterDonorModalOpen(true) : setIsCreateRequestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ring-2 ring-teal-500/20"
              title={isDonorExperience ? 'Update blood donor profile' : 'Create new blood donation request'}
            >
              <PlusCircle className="h-4 w-4 text-teal-100" />
              <span>{isDonorExperience ? 'Update Profile' : 'Create Request'}</span>
            </button>
            {/* Google Sign-in with Firebase Auth */}
            {firebaseUser ? (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab(isDonorExperience ? 'dashboard' : (showRegistrationsNav ? 'registrations' : 'dashboard'))}
                  className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-slate-100 rounded text-xs text-slate-800 transition cursor-pointer"
                  title={showRegistrationsNav ? 'View Registered Database' : 'User Profile'}
                >
                  {firebaseUser.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {firebaseUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline font-semibold max-w-[90px] truncate text-slate-800">
                    {firebaseUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded font-mono font-bold">
                    Auth
                  </span>
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('dofi_role_chosen');
                    localStorage.removeItem('dofi_user_role');
                    logoutFirebase();
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded cursor-pointer"
                  title="Sign out of Firebase"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  console.log('[Navbar] Sign in button clicked');
                  loginWithGoogle();
                }}
                disabled={isFirebaseLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign in with Google Firebase Auth"
              >
                {isFirebaseLoading ? (
                  <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-teal-600 rounded-full animate-spin" />
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span className="hidden md:inline">{isFirebaseLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                <span className="md:hidden">{isFirebaseLoading ? '...' : 'Sign In'}</span>
              </button>
            )}

            {/* Quick Role Switcher — Demo Mode */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs text-amber-800 transition-colors cursor-pointer"
                title="Switch Demo Role Perspective"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">Demo</span>
                <span className="font-semibold text-amber-800">
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'hospital' ? 'Hospital' : currentUser.role === 'donor' ? 'Donor' : 'User'}
                </span>
                <span className="text-[10px] text-amber-600">▼</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Role Perspective
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Test multi-role workflows instantly
                    </p>
                  </div>
                  {demoRoleOptions.map(opt => {
                    const isOptionDisabled = opt.role === 'admin' && !isAuthorizedAdmin;
                    const isSelected = currentUser.role === opt.role;
                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          if (isOptionDisabled) return;
                          switchUserRole(opt.role);
                          setShowRoleMenu(false);
                          if (opt.role === 'admin') setActiveTab('admin');
                          else if (opt.role === 'hospital') setActiveTab('hospital');
                          else setActiveTab('dashboard');
                        }}
                        disabled={isOptionDisabled}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                          isOptionDisabled
                            ? 'opacity-50 cursor-not-allowed bg-slate-50'
                            : 'hover:bg-slate-50 cursor-pointer'
                        } ${
                          isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            <span>{opt.label}</span>
                            {isOptionDisabled && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1 rounded uppercase">Protected</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{opt.desc}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />}
                      </button>
                    );
                  })}

                  {/* Quick Profile & Scheduler Launcher */}
                  <div className="pt-2 px-3 pb-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        const myDonorProfile = donors.find(d => d.donorName.includes('Marcus') || d.userId === currentUser.id) || donors[0];
                        setSelectedDonor(myDonorProfile);
                        setShowRoleMenu(false);
                      }}
                      className="w-full py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Open Donor Profile &amp; Scheduler</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Scheduler pill if currentUser is a donor */}
            {false && currentUser.role === 'donor' && (
              <button
                onClick={() => {
                  const myDonorProfile = donors.find(d => d.donorName.includes('Marcus') || d.userId === currentUser.id) || donors[0];
                  setSelectedDonor(myDonorProfile);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                title="Open Donation Scheduler"
              >
                <Calendar className="h-3.5 w-3.5 text-teal-600" />
                <span>My Scheduler</span>
              </button>
            )}

            </div>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-200 py-2 px-3 text-[11px] font-medium text-slate-600 bg-slate-50 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`shrink-0 ${activeTab === 'dashboard' ? 'text-teal-600 font-bold' : ''}`}
        >
          {isDonorExperience ? 'My Dashboard' : 'Dashboard'}
        </button>
        {isDonorExperience ? (
          <>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setTimeout(() => {
                  document.getElementById('potential-requests')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="shrink-0 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Find Blood Requests
            </button>
            <button
              onClick={() => setActiveTab('ai-clinical-tools')}
              className={`shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'ai-clinical-tools' ? 'text-teal-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3 w-3 text-teal-600" />
              <span>AI Clinical Tools</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('find-donors')}
            className={`shrink-0 ${activeTab === 'find-donors' ? 'text-teal-600 font-bold' : ''}`}
          >
            Find Donors
          </button>
        )}
        {!isDonorExperience && <>
        <button
          onClick={() => setActiveTab('requests')}
          className={`shrink-0 ${activeTab === 'requests' ? 'text-teal-600 font-bold' : ''}`}
        >
          Requests
        </button>
        <button
          onClick={() => setIsCreateRequestModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
        >
          <PlusCircle className="h-3 w-3" />
          <span>+ Request</span>
        </button>
        <button
          onClick={() => setActiveTab('hospital')}
          className={`shrink-0 ${activeTab === 'hospital' ? 'text-teal-600 font-bold' : ''}`}
        >
          Hospital
        </button>
        <button
          onClick={() => setActiveTab('ai-suite')}
          className={`shrink-0 flex items-center gap-1 ${activeTab === 'ai-suite' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Sparkles className="h-3 w-3 text-teal-600" />
          <span>AI Hub</span>
        </button>
        </>}

        {/* Admin & Registrations — mobile, only for admin/doctor */}
        {showAdminNav && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`shrink-0 ${activeTab === 'admin' ? 'text-teal-600 font-bold' : ''}`}
          >
            Admin
          </button>
        )}
        {showRegistrationsNav && (
          <button
            onClick={() => setActiveTab('registrations')}
            className={`shrink-0 flex items-center gap-1 ${
              activeTab === 'registrations' ? 'text-teal-600 font-bold' : ''
            }`}
          >
            <Database className="h-3 w-3 text-teal-600 shrink-0" />
            <span>Registrations</span>
            <span className="text-[8px] px-1 py-0.2 rounded font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
              Admin
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
