import React, { useState } from 'react';
import {
  Users,
  Activity,
  AlertCircle,
  Building,
  Heart,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Clock,
  Droplet,
  ArrowUp,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeadlinesWidget } from './DeadlinesWidget';
import { ExternalStatsWidget } from './ExternalStatsWidget';

// Keywords that identify non-blood orgs; used to filter the hospital grid
const NON_BLOOD_ORG_KEYWORDS = [
  'organ', 'transplant', 'bone', 'tissue', 'hair', 'cranial', 'prosthetic',
  'oncology', 'cancer', 'marrow', 'nmdp', 'histocompatibility'
];

function isBloodRelevantOrg(name: string): boolean {
  const lower = name.toLowerCase();
  return !NON_BLOOD_ORG_KEYWORDS.some(kw => lower.includes(kw));
}

export const DashboardView: React.FC = () => {
  const {
    requests,
    donors,
    organizations,
    setSelectedRequest,
    setSelectedDonor,
    setActiveTab,
    setIsCreateRequestModalOpen,
    setIsRegisterDonorModalOpen,
    liveRegisteredDonors,
    liveActiveRequests,
    donorResponses,
    respondToRequest,
    currentUser,
    firebaseUser
  } = useApp();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Derived lists — stats are computed from the SAME arrays shown on screen ──
  const bloodRequests = requests
    .filter(r => r.category === 'blood' && r.status !== 'completed' && r.status !== 'cancelled')
    // deduplicate by id
    .filter((r, idx, arr) => arr.findIndex(x => x.id === r.id) === idx)
    .sort((a, b) => {
      const order: Record<string, number> = { emergency: 0, urgent: 1, standard: 2 };
      return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
    });

  const availableBloodDonors = donors.filter(
    d => d.categories.includes('blood') &&
      (d.availabilityStatus === 'available_now' || d.availabilityStatus === 'available_24h')
  );

  const bloodEmergencies = bloodRequests.filter(r => r.urgency === 'emergency');

  const bloodRelevantOrgs = organizations.filter(o => o.isVerified && isBloodRelevantOrg(o.name));

  // Live strip: show if any mock or Firestore data exists
  const hasLiveActivity = liveActiveRequests > 0 || liveRegisteredDonors > 0 || bloodRequests.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-smooth relative">

      {/* Live Activity Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-2.5 border border-slate-800 shadow-xs flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider shrink-0">
          <Radio className="h-3 w-3 animate-ping" />
          <span>Live</span>
        </div>
        <div className="overflow-x-auto scrollbar-none flex items-center gap-6 text-xs whitespace-nowrap py-0.5">
          {!hasLiveActivity ? (
            <span className="text-slate-400 italic text-[11px]">
              No live activity yet — sign in and create a blood request to get started
            </span>
          ) : (
            <>
              {bloodRequests.length > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span className="font-semibold text-white">{bloodRequests.length} blood request{bloodRequests.length !== 1 ? 's' : ''}</span>
                </span>
              )}
              {availableBloodDonors.length > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span className="font-semibold text-white">{availableBloodDonors.length} donor{availableBloodDonors.length !== 1 ? 's' : ''} available</span>
                </span>
              )}
              {bloodEmergencies.length > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span className="font-semibold text-rose-300">{bloodEmergencies.length} emergency{bloodEmergencies.length !== 1 ? 's' : ''}</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg">
        <div className="p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Droplet className="h-3.5 w-3.5" />
            <span>Blood Donation Coordination · Prototype</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connecting Blood Donors with Patients &amp; Hospitals
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Find verified blood requests and connect eligible donors with hospitals when blood is urgently needed.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateRequestModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs tracking-wide transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Blood Request</span>
            </button>
            <button
              onClick={() => setIsRegisterDonorModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide transition-colors inline-flex items-center gap-2"
            >
              <Heart className="h-4 w-4 text-rose-400" />
              <span>Register as Donor</span>
            </button>
            <button
              onClick={() => setActiveTab('find-donors')}
              className="px-4 py-2.5 text-xs text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Find Donors</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Blood Requests</span>
            <Droplet className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{bloodRequests.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Available Donors</span>
            <Users className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{availableBloodDonors.length}</div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">Blood donors ready</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Emergencies</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">{bloodEmergencies.length}</div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">Urgent blood needed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Verified Hospitals</span>
            <Building className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{bloodRelevantOrgs.length}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Registered</div>
        </div>
      </section>

      {/* Urgent Blood Requests — most important section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Droplet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Blood Requests</h2>
              <p className="text-[11px] text-slate-400">
                {bloodRequests.length > 0 ? `${bloodRequests.length} active request${bloodRequests.length !== 1 ? 's' : ''}` : 'No active blood requests'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {bloodRequests.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Droplet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No active blood requests yet.</p>
            <button
              onClick={() => setIsCreateRequestModalOpen(true)}
              className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700 underline"
            >
              Create the first request
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="px-5 py-2 bg-amber-50/60 border-b border-amber-200/50 text-[11px] text-amber-800">
              Potential match — final clinical eligibility must be confirmed by the attending hospital facility.
            </div>
            {bloodRequests.slice(0, 6).map(req => {
              // Build a clean title — never show blank or undefined
              const displayTitle = req.title?.trim() ||
                (req.bloodRequirements?.targetBloodGroup
                  ? `Blood request — ${req.bloodRequirements.targetBloodGroup}`
                  : `Blood donation request`);

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      req.urgency === 'emergency' ? 'bg-rose-500 animate-pulse' :
                      req.urgency === 'urgent' ? 'bg-amber-500' : 'bg-teal-500'
                    }`} />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          req.urgency === 'emergency'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : req.urgency === 'urgent'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {req.urgency}
                        </span>
                        {req.bloodRequirements?.targetBloodGroup && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                            {req.bloodRequirements.targetBloodGroup}
                          </span>
                        )}
                        {req.unitsNeeded != null && req.unitsNeeded > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {req.unitsNeeded} unit{req.unitsNeeded !== 1 ? 's' : ''} needed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{displayTitle}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {req.hospitalName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {req.hospitalName}
                          </span>
                        )}
                        {req.deadlineDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {req.deadlineDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-5 sm:pl-0">
                    <span className="text-xs text-slate-500 capitalize">{req.status.replace('_', ' ')}</span>
                    {donorResponses.some(
                      r => r.requestId === req.id && (
                        r.donorUserId === currentUser.id ||
                        (firebaseUser && r.donorUserId === firebaseUser.uid)
                      )
                    ) ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
                        ✓ Response Sent
                      </span>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setRespondingReqId(req.id);
                          try {
                            await respondToRequest(req.id);
                          } finally {
                            setRespondingReqId(null);
                          }
                        }}
                        disabled={respondingReqId === req.id}
                        className="text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {respondingReqId === req.id ? 'Sending...' : "I'm Available"}
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setActiveTab('find-donors'); }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Find Donors →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STAT Deadline Queue */}
      <DeadlinesWidget />

      {/* Available Blood Donors */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Available Blood Donors</h2>
              <p className="text-[11px] text-slate-400">
                {availableBloodDonors.length > 0
                  ? `${availableBloodDonors.length} blood donor${availableBloodDonors.length !== 1 ? 's' : ''} available — sample data`
                  : 'No blood donors available right now'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('find-donors')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Find All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {availableBloodDonors.slice(0, 4).map(donor => (
            <div
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-slate-900 truncate">{donor.donorName}</div>
                {donor.bloodDetails?.bloodGroup && (
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
                    {donor.bloodDetails.bloodGroup}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mb-1.5">{donor.city}, {donor.state}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-medium">{donor.distanceKm} km away</span>
                <span className="text-teal-700 font-semibold">View →</span>
              </div>
            </div>
          ))}
          {availableBloodDonors.length === 0 && (
            <div className="col-span-4 py-8 text-center text-sm text-slate-400">
              No blood donors available right now.
              <button
                onClick={() => setIsRegisterDonorModalOpen(true)}
                className="ml-2 text-teal-600 underline"
              >
                Register as a donor
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Verified Hospitals — blood-relevant only */}
      {bloodRelevantOrgs.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Verified Hospitals</h2>
                <p className="text-[11px] text-slate-400">{bloodRelevantOrgs.length} registered partner hospitals</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('hospital')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Hospital Portal</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {bloodRelevantOrgs.slice(0, 6).map(org => (
              <div key={org.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50/40">
                <ShieldCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">{org.name}</div>
                  <div className="text-[11px] text-slate-500">{org.city}, {org.state}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* e-RaktKosh Integration Status — blood-relevant external reference */}
      <ExternalStatsWidget />

      {/* Scroll to top */}
      {showScrollTop && (
        <aside className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-11 w-11 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer border-2 border-white"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </aside>
      )}
    </div>
  );
};
