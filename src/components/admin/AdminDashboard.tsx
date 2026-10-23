import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Droplet,
  Building2,
  Users,
  Eye,
  FileText,
  ArrowLeft,
  LogIn,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest, RequestStatus } from '../../types';

// Keywords to exclude non-blood institutions
const NON_BLOOD_ORG_KEYWORDS = [
  'organ', 'transplant', 'bone', 'tissue', 'hair', 'cranial', 'prosthetic',
  'oncology', 'cancer', 'marrow', 'nmdp', 'histocompatibility'
];

function isBloodRelevantOrg(name: string): boolean {
  const lower = name.toLowerCase();
  return !NON_BLOOD_ORG_KEYWORDS.some(kw => lower.includes(kw));
}

export const AdminDashboard: React.FC = () => {
  const {
    requests,
    updateRequestStatus,
    setSelectedRequest,
    donors,
    setSelectedDonor,
    organizations,
    verificationQueue,
    approveVerification,
    rejectVerification,
    reports,
    resolveReport,
    dismissReport,
    currentUser,
    firebaseUser,
    registeredAppUser,
    loginWithGoogle,
    logoutFirebase,
    setActiveTab: setAppActiveTab,
    donorResponses
  } = useApp();

  // Admin authorization rule:
  // Must be verified via Firestore role === 'admin' OR the authorized admin email.
  // Client-side role selection alone does NOT grant admin access.
  const isAuthorizedAdmin = Boolean(
    firebaseUser && (
      registeredAppUser?.role === 'admin' ||
      firebaseUser.email === 'mohammedayaan9683@gmail.com'
    )
  );

  const [activeSubTab, setActiveSubTab] = useState<
    'emergency' | 'requests' | 'responses' | 'donors' | 'hospitals' | 'activity' | 'verifications'
  >('emergency');

  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');

  // 1. DEDUPLICATED BLOOD REQUESTS ONLY
  const bloodRequests = requests
    .filter(r => r.category === 'blood')
    .filter((r, idx, arr) => arr.findIndex(x => x.id === r.id) === idx);

  const activeBloodRequests = bloodRequests.filter(
    r => r.status !== 'completed' && r.status !== 'cancelled'
  );

  // 2. EMERGENCY QUEUE: Emergency urgency and not resolved, sorted by deadline ascending
  const emergencyQueue = bloodRequests
    .filter(r => r.urgency === 'emergency' && r.status !== 'completed' && r.status !== 'cancelled')
    .sort((a, b) => a.deadlineHoursRemaining - b.deadlineHoursRemaining);

  // 3. FULFILLED REQUESTS
  const fulfilledRequests = bloodRequests.filter(r => r.status === 'completed');

  // 4. BLOOD DONORS ONLY (no organ, bone, tissue, hair, cancer)
  const bloodDonors = donors.filter(d => d.categories.includes('blood'));
  const availableBloodDonors = bloodDonors.filter(
    d => d.availabilityStatus === 'available_now' || d.availabilityStatus === 'available_24h'
  );

  // 5. VERIFIED HOSPITALS ONLY (blood-relevant facilities)
  const bloodHospitals = organizations.filter(o => isBloodRelevantOrg(o.name));
  const verifiedHospitals = bloodHospitals.filter(o => o.isVerified);

  const getHospitalActiveCount = (hospitalName: string, hospitalId: string) => {
    return activeBloodRequests.filter(r =>
      (r.hospitalId && r.hospitalId === hospitalId) ||
      (r.hospitalName && hospitalName && r.hospitalName.toLowerCase().includes(hospitalName.toLowerCase())) ||
      (r.hospitalName && hospitalName && hospitalName.toLowerCase().includes(r.hospitalName.toLowerCase()))
    ).length;
  };

  // 6. REAL ACTIVITY DATA (Derived from request timelines and donor responses — ZERO fake records)
  const realTimelineActivities = [
    ...bloodRequests.flatMap(r =>
      (r.timeline || []).map(t => ({
        id: `${r.id}_${t.timestamp}_${t.status}`,
        timestamp: t.timestamp,
        title: t.title,
        description: t.description,
        actorName: t.actorName,
        actorRole: t.actorRole,
        status: t.status,
        requestId: r.id,
        patientAlias: r.patientAlias,
        hospitalName: r.hospitalName
      }))
    ),
    ...donorResponses.map(r => ({
      id: `resp_${r.id}`,
      timestamp: r.createdAt,
      title: `Donor Responded: "I'm Available"`,
      description: `Donor ${r.donorName} (${r.bloodGroup}) responded to request #${r.requestId}. Status: ${r.status}.`,
      actorName: r.donorName,
      actorRole: 'donor',
      status: r.status,
      requestId: r.requestId,
      patientAlias: 'Blood Requisition',
      hospitalName: requests.find(req => req.id === r.requestId)?.hospitalName || 'Hospital'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filtered requests list
  const filteredRequests = bloodRequests.filter(r => {
    const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
    const matchesSearch =
      requestSearchQuery === '' ||
      r.id.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      (r.bloodRequirements?.targetBloodGroup &&
        r.bloodRequirements.targetBloodGroup.toLowerCase().includes(requestSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // =========================================================================
  // ACCESS DENIED SCREEN IF NOT AN AUTHORIZED ADMIN
  // =========================================================================
  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-rose-600 px-6 py-2.5 flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Dofi Platform Security Gate</span>
            </div>
            <span className="font-mono text-[11px] bg-rose-700/80 px-2 py-0.5 rounded">
              HTTP 403 Forbidden
            </span>
          </div>

          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <Lock className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wide border border-rose-200">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>Restricted Administrator Console</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Admin Clearance Required
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                You do not have administrative clearance to access the <strong>Dofi Operational Control Center</strong>. Selecting &quot;Admin&quot; in client-side role selectors does not grant access. Administrative actions are protected by Firestore security rules.
              </p>
            </div>

            {/* Current Auth Status Details */}
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-700">
                <span className="font-semibold">Firebase Session:</span>
                <span className="font-bold text-slate-900">
                  {firebaseUser ? (firebaseUser.email || firebaseUser.uid) : 'Not Signed In'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Verified Firestore Role:</span>
                <span className="capitalize px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800 text-[11px]">
                  {registeredAppUser?.role || 'unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Authorization Result:</span>
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Access Denied
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <strong>Authorized Admin:</strong> <code className="bg-slate-200/70 px-1 rounded text-slate-700">mohammedayaan9683@gmail.com</code> or Firestore documents with <code className="bg-slate-200/70 px-1 rounded text-slate-700">role == &quot;admin&quot;</code>.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setAppActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Dashboard</span>
              </button>
              {!firebaseUser ? (
                <button
                  onClick={() => loginWithGoogle('admin')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in as Admin</span>
                </button>
              ) : (
                <button
                  onClick={logoutFirebase}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Switch Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHORIZED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Top Header Banner ── */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold uppercase mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Operational Control Center · Admin</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Dofi Blood Coordination Operations
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time management of active blood requests, emergency queues, donor verification, and hospital oversight
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAppActiveTab('registrations')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Registrations Registry →</span>
          </button>
          <div className="text-right hidden sm:block border-l border-slate-700 pl-3">
            <div className="text-[10px] text-slate-400 font-mono">Authorized Officer</div>
            <div className="text-xs font-bold text-white truncate max-w-[180px]">
              {firebaseUser?.displayName || firebaseUser?.email || currentUser.name}
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. STAT CARDS (Derived directly from existing data, never 0 when data exists) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Active Blood Requests */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Requests</span>
            <Droplet className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {activeBloodRequests.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Blood requisitions active</div>
        </div>

        {/* Card 2: Emergency Requests */}
        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-semibold">Emergency Queue</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono mt-1">
            {emergencyQueue.length}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">STAT critical blood priority</div>
        </div>

        {/* Card 3: Available Blood Donors */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Available Donors</span>
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 font-mono mt-1">
            {availableBloodDonors.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for donation</div>
        </div>

        {/* Card 4: Verified Hospitals */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Verified Hospitals</span>
            <Building2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700 font-mono mt-1">
            {verifiedHospitals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Licensed partner facilities</div>
        </div>

        {/* Card 5: Fulfilled Requests */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Fulfilled Requests</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {fulfilledRequests.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Completed transfusions</div>
        </div>
      </div>

      {/* ── 7. e-RAKTKOSH INTEGRATION NOTICE (Honest, strictly no fake live API) ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              e-RaktKosh Integration Status
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-800">
              Pending Authorization
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            e-RaktKosh integration pending institutional authorization. MoHFW blood bank platform integration requires institutional credentials issued directly to licensed blood banks. Dofi does not fabricate live government inventory.
          </p>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('emergency')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'emergency'
              ? 'border-rose-600 text-rose-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🚨 Emergency Queue ({emergencyQueue.length})
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'requests'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Blood Requests ({bloodRequests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('responses')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'responses'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Donor Responses ({donorResponses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('donors')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'donors'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Blood Donors ({bloodDonors.length})
        </button>
        <button
          onClick={() => setActiveSubTab('hospitals')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'hospitals'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Partner Hospitals ({bloodHospitals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('activity')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'activity'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit & Activity ({realTimelineActivities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('verifications')}
          className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'verifications'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verifications ({verificationQueue.filter(v => v.status === 'pending').length})
        </button>
      </div>

      {/* ── TAB 1: EMERGENCY QUEUE (Item 3: Ordered by urgency/deadline) ── */}
      {activeSubTab === 'emergency' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Priority Emergency Queue</h2>
              <p className="text-xs text-slate-500">
                Sorted by shortest deadline remaining. Requires immediate donor coordination.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
              {emergencyQueue.length} STAT Emergencies
            </span>
          </div>

          {emergencyQueue.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No active emergency blood requests at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emergencyQueue.map(req => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border-2 border-rose-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                      EMERGENCY STAT
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {req.deadlineHoursRemaining}h remaining
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center font-black text-rose-800 text-lg">
                      {req.bloodRequirements?.targetBloodGroup || 'O-'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono text-slate-400">ID: {req.id}</div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {req.hospitalName}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Units: <strong className="text-slate-800">{req.unitsNeeded || 1} units required</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    <span>Patient Ref: <strong>{req.patientAlias || 'Emergency Patient'}</strong></span>
                    <span className="mx-2">·</span>
                    <span>Deadline: {req.deadlineDate || 'ASAP'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'completed', 'Administrative resolution via Emergency Queue.')}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-2xs"
                      >
                        Mark Fulfilled
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'cancelled', 'Administrative cancellation via Emergency Queue.')}
                        className="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ALL BLOOD REQUESTS (Item 2: ID, group, units, hospital, urgency, deadline, status, actions) ── */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by ID, hospital, blood group..."
                value={requestSearchQuery}
                onChange={e => setRequestSearchQuery(e.target.value)}
                className="text-xs w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All ({bloodRequests.length})</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="matched">Matched</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-3">Units</th>
                    <th className="py-3 px-4">Hospital</th>
                    <th className="py-3 px-3">Urgency</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No blood requests matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => {
                      const group = req.bloodRequirements?.targetBloodGroup || 'O-';
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {req.id}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-50 border border-rose-200">
                              {group}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700 font-mono">
                            {req.unitsFulfilled || 0} / {req.unitsNeeded || 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                              {req.hospitalName}
                            </div>
                            <div className="text-[10px] text-slate-400">{req.city}, {req.state}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.urgency === 'emergency'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : req.urgency === 'urgent'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {req.urgency}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {req.deadlineHoursRemaining}h remaining
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'cancelled'
                                  ? 'bg-slate-100 text-slate-600'
                                  : req.status === 'verified'
                                  ? 'bg-sky-100 text-sky-800'
                                  : req.status === 'matched'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : req.status === 'in_progress'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition cursor-pointer"
                                title="View full details"
                              >
                                View
                              </button>
                              {req.status !== 'completed' && req.status !== 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => updateRequestStatus(req.id, 'completed', 'Administrative fulfill action.')}
                                    className="px-2 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded font-semibold transition cursor-pointer"
                                    title="Mark fulfilled"
                                  >
                                    Fulfill
                                  </button>
                                  <button
                                    onClick={() => updateRequestStatus(req.id, 'cancelled', 'Administrative cancellation action.')}
                                    className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded font-semibold transition cursor-pointer"
                                    title="Cancel request"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* ── TAB 2B: DONOR RESPONSES (Phase 5: Request -> Potential Donor -> Response -> Current Status) ── */}
      {activeSubTab === 'responses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Donor Responses</h2>
              <p className="text-xs text-slate-500">
                Live coordination records of donors who responded &quot;I&apos;m Available&quot; to active requests.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              {donorResponses.length} Responses Logged
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Request / Facility</th>
                    <th className="py-3 px-3">Potential Donor</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-4">Response Time</th>
                    <th className="py-3 px-3">Response Status</th>
                    <th className="py-3 px-3">Request Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donorResponses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No donor responses yet.
                      </td>
                    </tr>
                  ) : (
                    donorResponses.map(resp => {
                      const req = bloodRequests.find(r => r.id === resp.requestId);
                      return (
                        <tr key={resp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                              {req?.hospitalName || resp.requestId}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">ID: {resp.requestId}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {resp.donorName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-50 border border-rose-200">
                              {resp.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(resp.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              resp.status === 'confirmed'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : resp.status === 'fulfilled'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                              {resp.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {req ? req.status.replace(/_/g, ' ') : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req && (
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition cursor-pointer"
                              >
                                View Request
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

      {/* ── TAB 3: BLOOD DONORS (Item 4: Name, Group, Location, Availability, Verification - NO contact info) ── */}
      {activeSubTab === 'donors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registered Blood Donors</h2>
              <p className="text-xs text-slate-500">
                Filtered strictly to blood donors. Private contact numbers and street addresses are shielded.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
              {bloodDonors.length} Blood Donors Registered
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-4">Approximate Location</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">Verification Status</th>
                    <th className="py-3 px-3">Lifetime Donations</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bloodDonors.map(donor => {
                    const group = donor.bloodDetails?.bloodGroup || 'Blood Donor';
                    return (
                      <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {donor.donorName}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-50 border border-rose-200">
                            {group}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {donor.city}, {donor.state}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              donor.availabilityStatus === 'available_now'
                                ? 'bg-emerald-100 text-emerald-800'
                                : donor.availabilityStatus === 'available_24h'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {donor.availabilityStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              donor.isVerified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {donor.isVerified ? 'Verified Donor' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {donor.totalDonationsCount} donations
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedDonor(donor)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition cursor-pointer"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VERIFIED HOSPITALS (Item 5: Name, Location, Status, Active request count) ── */}
      {activeSubTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Partner Healthcare Facilities</h2>
              <p className="text-xs text-slate-500">
                Authorized hospitals and clinical blood transfusion centers.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
              {bloodHospitals.length} Healthcare Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bloodHospitals.map(hospital => {
              const activeCount = getHospitalActiveCount(hospital.name, hospital.id);
              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        hospital.isVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hospital.isVerified ? 'Verified Hospital' : 'Pending Verification'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {activeCount} Active Request{activeCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{hospital.name}</h3>
                    <p className="text-xs text-slate-500">{hospital.city}, {hospital.state}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                    <div>Lic: <code className="text-slate-800 font-mono">{hospital.licenseNumber}</code></div>
                    <div className="text-slate-500 mt-0.5">{hospital.regulatoryBody}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 5: AUDIT & ACTIVITY (Item 6: Real timeline events, ZERO fabricated mock entries) ── */}
      {activeSubTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Real Platform Event Audit Log</h2>
              <p className="text-xs text-slate-500">
                Generated strictly from verified request timeline state transitions. No fabricated records.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {realTimelineActivities.length} Logged Events
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            {realTimelineActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No activity logs recorded yet. Create or transition requests to see events.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {realTimelineActivities.slice(0, 15).map(event => (
                  <div key={event.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{event.title}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>Actor: <strong className="text-slate-600">{event.actorName}</strong> ({event.actorRole})</span>
                        <span>·</span>
                        <span>Request: <code className="text-slate-600">{event.requestId}</code></span>
                        <span>·</span>
                        <span>Facility: {event.hospitalName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: CLINICAL VERIFICATIONS & REPORTS (Preserved existing verification queue) ── */}
      {activeSubTab === 'verifications' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Clinical Verification Queue</h2>
            {verificationQueue.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
                No clinical credentials in queue.
              </div>
            ) : (
              <div className="space-y-3">
                {verificationQueue.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="font-bold text-slate-900">{item.entityName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono text-[11px]">{item.documentRef}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Document Type: <strong className="text-slate-800">{item.documentType}</strong>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded">
                          &quot;{item.notes}&quot;
                        </p>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => rejectVerification(item.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveVerification(item.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ethics Moderation Reports */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Ethics Moderation Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
                No active moderation reports.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            report.status === 'pending'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="font-bold text-rose-700">
                          {report.reason.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 bg-rose-50/50 p-2 rounded border border-rose-100">
                        {report.details}
                      </p>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => dismissReport(report.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
