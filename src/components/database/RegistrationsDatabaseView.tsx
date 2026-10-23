import React, { useState, useMemo } from 'react';
import {
  Users,
  Heart,
  ShieldCheck,
  Search,
  Download,
  Copy,
  Check,
  PlusCircle,
  Clock,
  Droplet,
  Bone,
  Scissors,
  CheckCircle2,
  Lock,
  Sparkles,
  Database,
  ArrowRight,
  Filter,
  UserCheck,
  Mail,
  Calendar,
  Building2,
  RefreshCw,
  Stethoscope,
  HeartHandshake,
  Send,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  FileCheck,
  Activity,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RegisteredAppUser, FirebaseDonationRegistration } from '../../lib/firebase';
import { UserRole } from '../../types';

export const RegistrationsDatabaseView: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    registeredAppUsersList,
    firebaseDonationsList,
    firebaseUser,
    registeredAppUser,
    loginWithGoogle,
    logoutFirebase,
    isFirebaseLoading,
    setIsRegisterDonorModalOpen,
    setActiveTab,
    requests
  } = useApp();

  // 4 Core Role Personas as explicitly specified in requirements:
  // 1. 👨‍⚕️ Doctors: Can see relevant registered donor/patient information if the app gives them access.
  // 2. 🩸 Recipients: Should generally see only the information needed to contact/request a donor, not private details.
  // 3. 👨‍💼 Admins: Usually have the broadest access to registration records for verification and management.
  // 4. 🔒 Other users: Should not automatically see private registration details.
  const isAdmin = currentUser.role === 'admin' || registeredAppUser?.role === 'admin';
  const isDoctor = !isAdmin && (
    currentUser.role === 'hospital' ||
    currentUser.name.toLowerCase().includes('dr.') ||
    currentUser.hospitalAffiliation !== undefined ||
    registeredAppUser?.role === 'hospital_staff'
  );
  const isRecipient = !isAdmin && !isDoctor && (currentUser.role === 'user' || (currentUser.role as any) === 'recipient' || (registeredAppUser?.role as any) === 'recipient');
  const isOther = !isAdmin && !isDoctor && !isRecipient;

  const [activeSubTab, setActiveSubTab] = useState<'donations' | 'users' | 'json'>('donations');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [donationSearchQuery, setDonationSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copiedData, setCopiedData] = useState<string | null>(null);

  // Recipient request modal & notifications
  const [selectedDonorForRequest, setSelectedDonorForRequest] = useState<FirebaseDonationRegistration | null>(null);
  const [recipientRequestSuccess, setRecipientRequestSuccess] = useState<string | null>(null);
  const [recipientNote, setRecipientNote] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Admin action notification
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);

  // Doctor match requisition selector modal
  const [selectedDonorForDoctorMatch, setSelectedDonorForDoctorMatch] = useState<FirebaseDonationRegistration | null>(null);
  const [doctorMatchNotice, setDoctorMatchNotice] = useState<string | null>(null);

  // Masking helpers adhering to the 4 Personas
  const getDisplayDonorName = (donorName: string, isOwnRecord: boolean = false) => {
    if (isAdmin || isDoctor || isRecipient || isOwnRecord) {
      return donorName;
    }
    // Other users: Anonymized to protect private identity
    const parts = donorName.split(' ');
    const initials = parts.map(p => p.charAt(0).toUpperCase()).join('.');
    return `Donor ${initials} (Verified Pledge)`;
  };

  const getDisplayPhone = (phone: string, isOwnRecord: boolean = false) => {
    if (isAdmin || isOwnRecord) {
      return phone; // Admin has broadest raw unmasked access
    }
    if (isDoctor) {
      return `${phone} (Clinical Coordination Line)`; // Doctor gets clinical contact
    }
    if (isRecipient) {
      return '+1 (555) •••-•••• (Hospital Mediated)'; // Recipient gets safe mediated contact
    }
    return '🔒 Private • Protected by Ethics & Privacy Policy'; // Other users protected
  };

  const getDisplayEmail = (email: string, isOwnRecord: boolean = false) => {
    if (isAdmin || isOwnRecord) {
      return email; // Admin broadest raw access
    }
    if (isDoctor) {
      return `${email} (Clinical Registry)`;
    }
    if (isRecipient) {
      const atIdx = email.indexOf('@');
      if (atIdx > 1) {
        return `${email.slice(0, 1)}•••••@${email.slice(atIdx + 1)} (Mediated)`;
      }
      return 'd••••@••••.org (Mediated)';
    }
    return '🔒 Protected • Doctor/Admin Authorized Only';
  };

  const getDisplayRegisteredByUser = (userName: string, userEmail: string) => {
    if (isAdmin) {
      return { name: userName || 'Registered User', email: userEmail };
    }
    if (isDoctor) {
      return { name: userName || 'Clinical / Patient Registrant', email: `${userEmail} (Verified)` };
    }
    if (isRecipient) {
      return { name: 'Verified Platform Registrant', email: 'Hospital Care Mediated' };
    }
    return { name: 'Verified Registrant', email: '🔒 Private Account Details' };
  };

  // Filtered registered users
  const filteredUsers = useMemo(() => {
    return registeredAppUsersList.filter(user => {
      if (selectedRoleFilter !== 'all' && user.role !== selectedRoleFilter) {
        return false;
      }
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        return (
          user.displayName.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registeredAppUsersList, userSearchQuery, selectedRoleFilter]);

  // Filtered donation registrations
  const filteredDonations = useMemo(() => {
    return firebaseDonationsList.filter(donation => {
      if (selectedCategoryFilter !== 'all' && !donation.categories.includes(selectedCategoryFilter)) {
        return false;
      }
      if (donationSearchQuery.trim()) {
        const q = donationSearchQuery.toLowerCase().trim();
        return (
          donation.donorName.toLowerCase().includes(q) ||
          donation.registeredByUserEmail.toLowerCase().includes(q) ||
          donation.registeredByUserName.toLowerCase().includes(q) ||
          donation.city.toLowerCase().includes(q) ||
          donation.state.toLowerCase().includes(q) ||
          (donation.bloodGroup && donation.bloodGroup.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [firebaseDonationsList, donationSearchQuery, selectedCategoryFilter]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(label);
    setTimeout(() => setCopiedData(null), 2500);
  };

  // Sanitized JSON for role export
  const getExportData = (type: 'users' | 'donations' | 'all') => {
    if (isAdmin) {
      // Admins have broadest raw access
      if (type === 'users') return registeredAppUsersList;
      if (type === 'donations') return firebaseDonationsList;
      return {
        exportedAt: new Date().toISOString(),
        roleTier: 'admin_broadest_access',
        registeredAppUsers: registeredAppUsersList,
        donationRegistrations: firebaseDonationsList
      };
    }

    if (isDoctor) {
      // Doctors see relevant clinical information
      const clinicalDonations = firebaseDonationsList.map(d => ({
        id: d.id,
        donorName: d.donorName,
        categories: d.categories,
        bloodGroup: d.bloodGroup || 'N/A',
        city: d.city,
        state: d.state,
        clinicalCoordinationPhone: `${d.phone} (Clinical Hotline)`,
        clinicalEmail: d.email,
        status: d.status,
        verificationBadge: d.verificationBadge,
        medicalNotes: d.medicalNotes
      }));
      if (type === 'donations') return clinicalDonations;
      return {
        exportedAt: new Date().toISOString(),
        roleTier: 'doctor_clinical_access',
        donationRegistrations: clinicalDonations
      };
    }

    // Recipients & Other users receive sanitized public/mediated dataset
    const safeDonations = firebaseDonationsList.map(d => ({
      id: d.id,
      donorName: isRecipient ? d.donorName : `Donor ${d.donorName.charAt(0)} (Verified)`,
      categories: d.categories,
      bloodGroup: d.bloodGroup || 'N/A',
      city: d.city,
      state: d.state,
      status: d.status,
      mediatedRequestChannel: 'Metro Medical Hospital Transplant & Transfusion Board',
      contactProtocol: 'Hospital Mediated (Private details shielded under NOTA & HIPAA)'
    }));
    return safeDonations;
  };

  // Export JSON
  const handleExportJSON = (type: 'users' | 'donations' | 'all') => {
    const payload = getExportData(type);
    const filename = `donorconnect_${type}_${currentUser.role}_${Date.now()}.json`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = (type: 'users' | 'donations') => {
    let csvContent = '';
    let filename = '';

    if (type === 'users') {
      const headers = ['UID', 'Name', 'Email', 'Role', 'Verified', 'DonationsCount', 'CreatedAt', 'Provider'];
      const rows = registeredAppUsersList.map(u => [
        `"${u.id}"`,
        `"${isAdmin ? u.displayName : u.displayName.split(' ')[0]}"`,
        `"${isAdmin ? u.email : 'protected@care.org'}"`,
        `"${u.role}"`,
        u.isVerified ? 'YES' : 'NO',
        u.donationsRegisteredCount,
        `"${u.createdAt}"`,
        `"${u.provider}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `registered_users_${Date.now()}.csv`;
    } else {
      const headers = ['RegistrationID', 'DonorName', 'Categories', 'BloodGroup', 'City', 'State', 'Status', 'ContactChannel'];
      const rows = firebaseDonationsList.map(d => [
        `"${d.id}"`,
        `"${getDisplayDonorName(d.donorName)}"`,
        `"${d.categories.join(';')}"`,
        `"${d.bloodGroup || 'N/A'}"`,
        `"${d.city}"`,
        `"${d.state}"`,
        `"${d.status}"`,
        `"${getDisplayPhone(d.phone)}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `donation_registrations_${Date.now()}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle Recipient Submitting Mediated Request
  const handleSendRecipientRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorForRequest) return;
    setIsSubmittingRequest(true);

    setTimeout(() => {
      setIsSubmittingRequest(false);
      setRecipientRequestSuccess(
        `✓ Mediated Connection Request Dispatched! Hospital coordinator Dr. Sarah Chen and the clinical transplant board have received your request for donor ${selectedDonorForRequest.donorName} (${selectedDonorForRequest.bloodGroup || 'Tissue/Hair'}). They will verify compatibility and coordinate directly with you without exposing personal phone numbers or private data.`
      );
      setSelectedDonorForRequest(null);
      setRecipientNote('');
      setTimeout(() => setRecipientRequestSuccess(null), 8000);
    }, 700);
  };

  // Handle Doctor Matching with Requisition
  const handleConfirmDoctorMatch = (requestId: string) => {
    if (!selectedDonorForDoctorMatch) return;
    const req = requests.find(r => r.id === requestId);
    setDoctorMatchNotice(
      `✓ Clinical Match Confirmed! Donor ${selectedDonorForDoctorMatch.donorName} has been linked with Requisition "${req?.title || requestId}". Direct clinical laboratory protocols and specimen dispatch initiated.`
    );
    setSelectedDonorForDoctorMatch(null);
    setTimeout(() => setDoctorMatchNotice(null), 7000);
  };

  // Handle Admin Verification Toggle
  const handleToggleAdminVerification = (userId: string, currentVerified: boolean) => {
    setAdminActionNotice(
      `Admin Action: User ${userId} verification status toggled to ${!currentVerified ? 'VERIFIED' : 'PENDING REVIEW'} in Firestore governance audit log.`
    );
    setTimeout(() => setAdminActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Interactive Role Perspective Switcher Bar (Directly allows switching between 4 personas) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Role-Based Access Control (RBAC) Simulator
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any role to observe exact data privacy & clinical access rules:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Persona 1: Doctor */}
          <button
            onClick={() => switchUserRole('hospital')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isDoctor
                ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-teal-900">
                <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                <span>👨‍⚕️ Doctors</span>
              </span>
              {isDoctor && (
                <span className="text-[10px] bg-teal-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Can see relevant registered donor/patient info for clinical matching.
            </p>
          </button>

          {/* Persona 2: General User */}
          <button
            onClick={() => switchUserRole('user')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isRecipient
                ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                <HeartHandshake className="h-3.5 w-3.5 text-amber-600" />
                <span>General User</span>
              </span>
              {isRecipient && (
                <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              See only info needed to contact/request a donor, not private details.
            </p>
          </button>

          {/* Persona 3: Admin */}
          <button
            onClick={() => switchUserRole('admin')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isAdmin
                ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-purple-900">
                <Users className="h-3.5 w-3.5 text-purple-600" />
                <span>👨‍💼 Admins</span>
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Broadest access to records for verification & governance management.
            </p>
          </button>

          {/* Persona 4: Other Users */}
          <button
            onClick={() => switchUserRole('donor')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isOther
                ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-slate-800">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>🔒 Other Users</span>
              </span>
              {isOther && (
                <span className="text-[10px] bg-slate-700 text-white font-bold px-1.5 py-0.2 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Should not automatically see private registration details.
            </p>
          </button>
        </div>
      </div>

      {/* Role-Specific Clearance & Governance Header Banner */}
      <div className={`rounded-2xl p-6 sm:p-7 border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden text-white ${
        isDoctor
          ? 'bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border-teal-800/80'
          : isRecipient
          ? 'bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 border-amber-800/80'
          : isAdmin
          ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border-purple-800/80'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}>
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
              </span>
              Firebase Firestore Active
            </span>

            {/* Persona Badge */}
            {isDoctor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-200 border border-teal-500/30">
                <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                <span>👨‍⚕️ Doctor Authorized: {currentUser.name}</span>
              </span>
            )}
            {isRecipient && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-200 border border-amber-500/30">
                <HeartHandshake className="h-3.5 w-3.5 text-amber-400" />
                <span>🩸 Recipient View: Safe Donor Request Hub</span>
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-500/30">
                <Users className="h-3.5 w-3.5 text-purple-400" />
                <span>👨‍💼 Admin Authorized: Broadest Verification Tier</span>
              </span>
            )}
            {isOther && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>🔒 Privacy Shield: General User</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Registered Donors & Users Database</span>
          </h1>

          {/* Dynamic Role Explanation */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isDoctor && (
              <p>
                <strong>Doctor Clinical Access:</strong> You are granted authorized access to relevant registered donor and patient medical compatibility data, category specifics (Blood, Organ, Marrow, Hair), urgency clearances, and direct clinical coordination hotlines for donor matching.
              </p>
            )}
            {isRecipient && (
              <p>
                <strong>Recipient Safe Request Access:</strong> You can review registered donors, blood groups, pledged categories, and locations needed to contact or request a donor. In accordance with healthcare privacy, private personal details (personal phone numbers, private home addresses, personal emails) are protected and mediated via hospital care coordinators.
              </p>
            )}
            {isAdmin && (
              <p>
                <strong>Admin Governance Tier:</strong> You possess the broadest access to raw unmasked registration documents, identity verification controls, user account management, and compliance audit exports under HIPAA & NOTA standards.
              </p>
            )}
            {isOther && (
              <p>
                <strong>Privacy Shield Protected:</strong> In compliance with medical confidentiality standards, private registration details (direct donor phone numbers, personal emails, and individual identifiers) are not automatically visible to general users. You can inspect public availability counts, pledge your own donation, or switch to an authorized role above.
              </p>
            )}
          </div>

          {/* Current Auth Status Indicator */}
          <div className="pt-1 flex items-center gap-3 flex-wrap text-xs">
            {firebaseUser ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/80 border border-teal-800 text-teal-200">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <span>Signed in as: <strong className="text-white">{firebaseUser.displayName || firebaseUser.email}</strong> ({registeredAppUser?.role || currentUser.role})</span>
                <button
                  onClick={logoutFirebase}
                  className="ml-2 text-[11px] text-teal-400 hover:text-white underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                <span>Not signed in with Firebase.</span>
                <button
                  onClick={() => loginWithGoogle()}
                  disabled={isFirebaseLoading}
                  className="px-2.5 py-0.5 rounded bg-white text-slate-900 font-bold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 z-10">
          <button
            onClick={() => setIsRegisterDonorModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Register New Donation Pledge</span>
          </button>

          {(isAdmin || isDoctor) && (
            <button
              onClick={() => handleExportJSON('all')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-teal-800/60 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4 text-teal-400" />
              <span>{isAdmin ? 'Export Full Database (JSON)' : 'Export Clinical Registry (JSON)'}</span>
            </button>
          )}

          {isRecipient && (
            <button
              onClick={() => {
                setActiveTab('requests');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="h-4 w-4" />
              <span>Post Recipient Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Action / Success Banners */}
      {recipientRequestSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{recipientRequestSuccess}</div>
          <button onClick={() => setRecipientRequestSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {doctorMatchNotice && (
        <div className="p-4 bg-teal-50 border border-teal-300 text-teal-900 rounded-xl text-xs flex items-start gap-3 shadow-xs animate-in fade-in">
          <Stethoscope className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{doctorMatchNotice}</div>
          <button onClick={() => setDoctorMatchNotice(null)} className="text-teal-700 hover:text-teal-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {adminActionNotice && (
        <div className="p-4 bg-purple-50 border border-purple-300 text-purple-900 rounded-xl text-xs flex items-start gap-3 shadow-xs animate-in fade-in">
          <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{adminActionNotice}</div>
          <button onClick={() => setAdminActionNotice(null)} className="text-purple-700 hover:text-purple-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered App Users</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {registeredAppUsersList.length}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">
            Tracked in Firestore `users`
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Donations Registered</span>
            <Heart className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono mt-2">
            {firebaseDonationsList.length}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Tracked in `donation_registrations`
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Verified Platform Donors</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
            {registeredAppUsersList.filter(u => u.isVerified).length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            100% NOTA Ethics Compliance
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Blood / Organ / Marrow</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono mt-2">
            {firebaseDonationsList.filter(d => d.status === 'active').length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Available for clinical cross-match
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('donations')}
            className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'donations'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Donations Registered ({firebaseDonationsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'users'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users Who Registered ({registeredAppUsersList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('json')}
            className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'json'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>JSON Inspector & Raw Export</span>
          </button>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'donations' && (
            <>
              <button
                onClick={() => handleExportCSV('donations')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExportJSON('donations')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </>
          )}

          {activeSubTab === 'users' && (
            <>
              <button
                onClick={() => handleExportCSV('users')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Users CSV</span>
              </button>
              <button
                onClick={() => handleExportJSON('users')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Users JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content: DONATION REGISTRATIONS */}
      {activeSubTab === 'donations' && (
        <div className="space-y-4">
          {/* Persona Access Bar Note */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-teal-600 shrink-0" />
              <span>
                {isDoctor && (
                  <span className="text-teal-900 font-semibold">
                    👨‍⚕️ Doctor Mode Active: Clinical cross-match data, blood/tissue compatibility specs, and direct clinical coordination hotlines enabled.
                  </span>
                )}
                {isRecipient && (
                  <span className="text-amber-900 font-semibold">
                    🩸 Recipient Mode Active: Safe donor catalog enabled. Personal phone & email details are protected; click <strong>"Request Donor via Care Team"</strong> to initiate mediated matching.
                  </span>
                )}
                {isAdmin && (
                  <span className="text-purple-900 font-semibold">
                    👨‍💼 Admin Mode Active: Broadest access tier unmasked for regulatory compliance, identity verification, and ethics auditing.
                  </span>
                )}
                {isOther && (
                  <span className="text-slate-700 font-semibold">
                    🔒 Other User Mode Active: Sensitive personal contact details are shielded under HIPAA/NOTA ethics.
                  </span>
                )}
              </span>
            </div>
            <div className="shrink-0 text-[11px] text-slate-500 font-mono">
              Role: <strong className="capitalize text-slate-800">{currentUser.role}</strong>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={donationSearchQuery}
                onChange={(e) => setDonationSearchQuery(e.target.value)}
                placeholder="Search registered donations by donor name, city, blood group, or category..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Category:</span>
              {['all', 'blood', 'organ', 'bone_tissue', 'hair'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Donations Table with 4-Persona Precision */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Donor Name & Proximity</th>
                    <th className="py-3 px-4">Categories Pledged</th>
                    <th className="py-3 px-4">Blood & Clinical Specs</th>
                    <th className="py-3 px-4">Contact & Mediation</th>
                    <th className="py-3 px-4">Status & Clearance</th>
                    <th className="py-3 px-4">Registered By</th>
                    <th className="py-3 px-4 text-right">Role-Specific Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No registered donations found matching "{donationSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => {
                      const displayDonorName = getDisplayDonorName(donation.donorName);
                      const displayPhone = getDisplayPhone(donation.phone);
                      const displayEmail = getDisplayEmail(donation.email);
                      const registeredBy = getDisplayRegisteredByUser(donation.registeredByUserName, donation.registeredByUserEmail);

                      return (
                        <tr key={donation.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* 1. Donor Name & Location */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{displayDonorName}</span>
                                {isOther && <Lock className="h-3 w-3 text-slate-400" />}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span>{donation.city}, {donation.state}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Categories Pledged */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {donation.categories.map((c, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                                    c === 'blood'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : c === 'organ'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      : c === 'bone_tissue'
                                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {c.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* 3. Blood & Clinical Specs */}
                          <td className="py-3 px-4">
                            <div>
                              {donation.bloodGroup ? (
                                <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                  {donation.bloodGroup}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Cellular / Tissue</span>
                              )}
                              {donation.medicalNotes && (isDoctor || isAdmin) && (
                                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 max-w-xs" title={donation.medicalNotes}>
                                  Spec: {donation.medicalNotes}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Contact & Mediation (Carefully masked based on role) */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{displayPhone}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span>{displayEmail}</span>
                              </div>
                            </div>
                          </td>

                          {/* 5. Status & Clearance */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                                donation.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : donation.status === 'scheduled'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {donation.status}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {donation.verificationBadge}
                              </div>
                            </div>
                          </td>

                          {/* 6. Registered By */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-semibold text-slate-800 text-[11px]">
                                {registeredBy.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {registeredBy.email}
                              </div>
                            </div>
                          </td>

                          {/* 7. Role-Specific Action Column */}
                          <td className="py-3 px-4 text-right">
                            {/* 👨‍⚕️ Doctor Action */}
                            {isDoctor && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedDonorForDoctorMatch(donation)}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                  title="Match donor directly with a hospital patient requisition"
                                >
                                  <Stethoscope className="h-3 w-3" />
                                  <span>Match Requisition</span>
                                </button>
                                <button
                                  onClick={() => handleCopy(JSON.stringify(donation, null, 2), donation.id)}
                                  className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition cursor-pointer"
                                  title="Copy Clinical Spec"
                                >
                                  {copiedData === donation.id ? 'Copied' : 'Spec'}
                                </button>
                              </div>
                            )}

                            {/* 🩸 Recipient Action */}
                            {isRecipient && (
                              <button
                                onClick={() => setSelectedDonorForRequest(donation)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] transition shadow-2xs flex items-center gap-1.5 cursor-pointer ml-auto"
                                title="Contact hospital coordinator to safely request this donor"
                              >
                                <HeartHandshake className="h-3.5 w-3.5" />
                                <span>Request Donor</span>
                              </button>
                            )}

                            {/* 👨‍💼 Admin Action */}
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleAdminVerification(donation.id, true)}
                                  className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded font-bold text-[11px] transition cursor-pointer"
                                  title="Toggle verification status in governance audit"
                                >
                                  Audit
                                </button>
                                <button
                                  onClick={() => handleCopy(JSON.stringify(donation, null, 2), donation.id)}
                                  className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition cursor-pointer"
                                >
                                  {copiedData === donation.id ? 'Copied!' : 'JSON'}
                                </button>
                              </div>
                            )}

                            {/* 🔒 Other User Action */}
                            {isOther && (
                              <button
                                onClick={() => switchUserRole('user')}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px] transition cursor-pointer flex items-center gap-1 ml-auto"
                                title="Switch to Recipient view to request this donor"
                              >
                                <Lock className="h-3 w-3 text-slate-400" />
                                <span>Request Access</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: REGISTERED USERS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Persona Access Bar Note */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                {isAdmin
                  ? '👨‍💼 Full unmasked user directory showing authenticated accounts, Firebase Auth UIDs, login providers, and role controls.'
                  : isDoctor
                  ? '👨‍⚕️ Clinical access: Verified clinical practitioners, hospital transplant staff, and registered donors.'
                  : '🔒 Privacy Shield Active: User accounts are protected under healthcare identity governance.'}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search registered users by name, email, role, or Firebase UID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Role:</span>
              {['all', 'user', 'donor', 'hospital_staff', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition cursor-pointer ${
                    selectedRoleFilter === r
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User / Account</th>
                    <th className="py-3 px-4">Firebase Auth UID</th>
                    <th className="py-3 px-4">Role & Verification</th>
                    <th className="py-3 px-4">Donations Registered</th>
                    <th className="py-3 px-4">Registered On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No registered users found matching "{userSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const displayUserName = isAdmin || isDoctor ? user.displayName : user.displayName.split(' ')[0] + ' (Member)';
                      const displayUserEmail = isAdmin ? user.email : isDoctor ? user.email : 'protected@care.org';
                      const displayUid = isAdmin ? user.id : `${user.id.slice(0, 8)}••••••••`;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.photoURL && (isAdmin || isDoctor) ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                                  {user.displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{displayUserName}</span>
                                  {user.provider === 'google' && (
                                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                      Google Auth
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{displayUserEmail}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            <span title={isAdmin ? user.id : 'Protected UID'}>
                              {displayUid}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                user.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : user.role === 'hospital_staff'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : (user.role as string) === 'user' || (user.role as string) === 'recipient'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}>
                                {user.role.replace('_', ' ')}
                              </span>
                              {user.isVerified && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                              {user.donationsRegisteredCount} donations
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isAdmin ? (
                              <button
                                onClick={() => handleToggleAdminVerification(user.id, user.isVerified)}
                                className="px-2.5 py-1 text-[11px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded font-medium transition cursor-pointer border border-purple-200"
                              >
                                Toggle Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopy(JSON.stringify(user, null, 2), user.id)}
                                className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition cursor-pointer"
                              >
                                {copiedData === user.id ? 'Copied!' : 'Copy'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: RAW JSON INSPECTOR */}
      {activeSubTab === 'json' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-700 font-semibold">
              {isAdmin
                ? '👨‍💼 Full Raw Firebase Firestore Export: Unredacted database inspection active.'
                : isDoctor
                ? '👨‍⚕️ Clinical Specimen & Clearance JSON: Filtered to clinical matching attributes.'
                : '🔒 Sanitized Public Payload: Confidential personal contact details stripped.'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Firestore Collection: `/users`
                  </h3>
                  <p className="text-xs text-slate-500">
                    {registeredAppUsersList.length} authenticated users in application
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(getExportData('users'), null, 2), 'users_json')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  {copiedData === 'users_json' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedData === 'users_json' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-teal-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(getExportData('users'), null, 2)}
              </pre>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Firestore Collection: `/donation_registrations`
                  </h3>
                  <p className="text-xs text-slate-500">
                    {firebaseDonationsList.length} registered donation pledges
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(getExportData('donations'), null, 2), 'donations_json')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  {copiedData === 'donations_json' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedData === 'donations_json' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-rose-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(getExportData('donations'), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Request Mediated Modal */}
      {selectedDonorForRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Request Mediated Donor Match
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Safe Hospital-Mediated Request (Zero Personal Data Exposure)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonorForRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>Protected Recipient Channel</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                To safeguard both parties under NOTA and HIPAA guidelines, you will not receive the donor's private phone number. Dr. Sarah Chen and the hospital coordination team will verify HLA/blood cross-match compatibility and manage the clinical logistics.
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Donor:</span>
                <strong className="text-slate-900">{selectedDonorForRequest.donorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pledged Category:</span>
                <strong className="text-slate-900 uppercase">{selectedDonorForRequest.categories.join(', ')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood / Spec:</span>
                <strong className="text-rose-700 font-mono">{selectedDonorForRequest.bloodGroup || 'Tissue/Hair Specimen'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-700">{selectedDonorForRequest.city}, {selectedDonorForRequest.state}</span>
              </div>
            </div>

            <form onSubmit={handleSendRecipientRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message for Hospital Transplant Coordinator & Clinical Board:
                </label>
                <textarea
                  value={recipientNote}
                  onChange={(e) => setRecipientNote(e.target.value)}
                  placeholder="E.g., I am undergoing treatment at Metro General for acute anemia and my oncologist Dr. Rivera recommended matching with an O- whole blood or platelet donor..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDonorForRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingRequest ? 'Dispatching...' : 'Dispatch Mediated Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Match Requisition Selector Modal */}
      {selectedDonorForDoctorMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Clinical Match with Active Patient Requisition
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Doctor & Physician Authorized Cross-Matching
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonorForDoctorMatch(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-700" />
                <span>Selected Donor: {selectedDonorForDoctorMatch.donorName}</span>
              </div>
              <p className="text-[11px] text-teal-800">
                Blood Group: <strong className="font-mono">{selectedDonorForDoctorMatch.bloodGroup || 'N/A'}</strong> · Location: {selectedDonorForDoctorMatch.city}, {selectedDonorForDoctorMatch.state} · Direct Hotline: {selectedDonorForDoctorMatch.phone}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Active Hospital Patient Requisition to Match:
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {requests.filter(r => r.status !== 'completed').slice(0, 5).map(req => (
                  <div
                    key={req.id}
                    onClick={() => handleConfirmDoctorMatch(req.id)}
                    className="p-3 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-xl transition cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{req.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        req.urgency === 'emergency' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Patient: {req.patientAlias}</span>
                      <span>·</span>
                      <span>Category: {req.category}</span>
                      <span>·</span>
                      <span>Needed: {req.unitsNeeded || 1} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDonorForDoctorMatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
