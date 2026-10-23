import React, { useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock, Droplet, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BLOOD_COMPATIBILITY_MAP } from '../../data/mockData';
import { BloodGroup, DonationRequest } from '../../types';

type LocalResponse = { requestId: string; respondedAt: string };

const urgencyRank = { emergency: 0, urgent: 1, standard: 2 };

function readResponses(): LocalResponse[] {
  try {
    return JSON.parse(localStorage.getItem('dofi_donor_responses') || '[]');
  } catch {
    return [];
  }
}

export const isDonorCompatibleWithRequest = (donorBloodGroup: BloodGroup, request: DonationRequest): boolean => {
  const req = request.bloodRequirements;
  if (!req) return false;
  const target = req.targetBloodGroup;
  if (!target) return false;

  // Strict clinical compatibility: An O+ donor cannot donate whole blood/platelets to an A or B request
  if ((target === 'A+' || target === 'A-') && donorBloodGroup !== 'A+' && donorBloodGroup !== 'A-') {
    return false;
  }
  if ((target === 'B+' || target === 'B-') && donorBloodGroup !== 'B+' && donorBloodGroup !== 'B-') {
    return false;
  }
  if (target === 'O+') {
    return donorBloodGroup === 'O+' || donorBloodGroup === 'O-';
  }
  if (target === 'O-') {
    return donorBloodGroup === 'O-';
  }
  if (target === 'AB+') {
    return donorBloodGroup === 'AB+' || donorBloodGroup === 'AB-';
  }
  if (target === 'AB-') {
    return donorBloodGroup === 'AB-';
  }

  return target === donorBloodGroup;
};

const cleanHospitalName = (name?: string): string => {
  if (!name) return 'Hyderabad Blood Centre & Transfusion Hospital';
  if (name.includes('Metro University') || name.includes('Organ Transplant') || name.includes('Transplant Institute')) {
    return 'Hyderabad Blood Centre & Transfusion Hospital';
  }
  return name;
};

const cleanLocation = (city?: string, state?: string, hospitalName?: string): string => {
  if (!city || city.toLowerCase() === 'chicago' || (hospitalName && hospitalName.includes('Hyderabad'))) {
    return 'Hyderabad, Telangana';
  }
  return `${city}${state ? `, ${state}` : ''}`;
};

const formatDeadline = (deadlineDate?: string): string => {
  if (!deadlineDate) return 'Deadline pending confirmation';
  return deadlineDate.replace(/\bCST\b/g, 'IST').replace(/\bEST\b/g, 'IST').replace(/\bPST\b/g, 'IST');
};

export const DonorDashboard: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    donors,
    requests,
    firestoreRequests,
    firebaseDonationsList,
    notifications,
    setIsRegisterDonorModalOpen,
    donorResponses,
    respondToRequest,
  } = useApp();
  const [responses, setResponses] = useState<LocalResponse[]>(readResponses);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const currentDonorUserId = firebaseUser?.uid || currentUser.id;
  const currentDonorName = (firebaseUser?.displayName || currentUser.name || '').toLowerCase();

  const donorProfile = donors.find(donor => donor.userId === currentUser.id) || (currentUser.role === 'donor' ? donors.find(donor => donor.id === 'dnr_001') : undefined);
  const latestRegistration = firebaseDonationsList
    .filter(registration => registration.registeredByUserId === firebaseUser?.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const bloodGroup = (donorProfile?.bloodDetails?.bloodGroup || latestRegistration?.bloodGroup) as BloodGroup | undefined;
  const availability = donorProfile?.availabilityStatus || latestRegistration?.availabilityStatus;
  const location = donorProfile
    ? cleanLocation(donorProfile.city, donorProfile.state)
    : latestRegistration
    ? cleanLocation(latestRegistration.city, latestRegistration.state)
    : 'Hyderabad, Telangana';
  const verified = donorProfile?.isVerified ?? false;

  const bloodRequests = useMemo(() => {
    const combined = [...requests, ...(firestoreRequests as DonationRequest[])];
    const uniqueMap = new Map<string, DonationRequest>();

    for (const req of combined) {
      if (!req) continue;
      const id = (req.id || '').trim();
      if (!id) continue;
      if (req.category !== 'blood') continue;
      if (req.status === 'completed' || req.status === 'cancelled') continue;

      // Deduplicate ONLY by unique request ID.
      // Multiple requests from the same hospital with different IDs are preserved.
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, { ...req, id });
      }
    }

    return Array.from(uniqueMap.values());
  }, [requests, firestoreRequests]);

  const compatibleRequests = useMemo(() => {
    if (!bloodGroup || availability === 'cooldown') return [];
    const seen = new Set<string>();
    const list: DonationRequest[] = [];

    for (const request of bloodRequests) {
      const id = request.id.trim();
      if (seen.has(id)) continue;
      if (isDonorCompatibleWithRequest(bloodGroup, request)) {
        seen.add(id);
        list.push(request);
      }
    }

    return list.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);
  }, [availability, bloodGroup, bloodRequests]);

  const respondedRequestIds = useMemo(() => {
    const ids = new Set(responses.map(response => response.requestId));
    donorResponses.forEach(r => {
      if (
        r.donorUserId === currentDonorUserId ||
        (r.donorName && r.donorName.toLowerCase() === currentDonorName)
      ) {
        ids.add(r.requestId);
      }
    });
    return ids;
  }, [responses, donorResponses, currentDonorUserId, currentDonorName]);

  const userResponses = useMemo(() => {
    const list: { requestId: string; date?: string; request?: DonationRequest }[] = [];
    const seenRequestIds = new Set<string>();
    const candidateResponses: { requestId: string; date?: string }[] = [];

    // 1. Process live Firestore donorResponses for current donor (deduplicated by requestId)
    donorResponses
      .filter(
        r => r.donorUserId === currentDonorUserId || (r.donorName && r.donorName.toLowerCase() === currentDonorName)
      )
      .forEach(r => {
        if (!seenRequestIds.has(r.requestId)) {
          seenRequestIds.add(r.requestId);
          candidateResponses.push({ requestId: r.requestId, date: r.createdAt });
        }
      });

    // 2. Process local responses (deduplicated by requestId)
    responses.forEach(r => {
      if (!seenRequestIds.has(r.requestId)) {
        seenRequestIds.add(r.requestId);
        candidateResponses.push({ requestId: r.requestId, date: r.respondedAt });
      }
    });

    const allKnownRequests = [...requests, ...(firestoreRequests as DonationRequest[])];
    const uniqueKnownRequests = new Map<string, DonationRequest>();
    for (const r of allKnownRequests) {
      if (r && r.id && !uniqueKnownRequests.has(r.id.trim())) {
        uniqueKnownRequests.set(r.id.trim(), r);
      }
    }

    for (const item of candidateResponses) {
      const req = uniqueKnownRequests.get(item.requestId.trim());
      // In blood donor dashboard, only show responses to existing blood requests
      if (!req || req.category !== 'blood') continue;
      // Clinical compatibility check: If donor has recorded bloodGroup, request must be compatible
      if (bloodGroup && !isDonorCompatibleWithRequest(bloodGroup, req)) {
        continue;
      }
      list.push({ requestId: item.requestId, date: item.date, request: req });
    }

    return list;
  }, [donorResponses, responses, currentDonorUserId, currentDonorName, requests, firestoreRequests, bloodGroup]);

  const urgentRequests = compatibleRequests.filter(request => request.urgency === 'emergency' || request.urgency === 'urgent');

  // Scope notifications strictly to the current authenticated user and deduplicate
  const donorNotifications = useMemo(() => {
    const activeUserId = firebaseUser?.uid || currentUser.id;
    const seenContent = new Set<string>();
    const uniqueNotifications: typeof notifications = [];

    for (const notification of notifications) {
      if (notification.category !== 'blood') continue;
      // If notification has userId, it MUST match active user
      if (notification.userId && notification.userId !== activeUserId) {
        continue;
      }
      // If notification is an auth/sign-in notification, it must strictly belong to current firebaseUser
      if (
        notification.title.toLowerCase().includes('sign-in') ||
        notification.title.toLowerCase().includes('google') ||
        notification.title.toLowerCase().includes('welcome')
      ) {
        if (!firebaseUser || notification.userId !== firebaseUser.uid) {
          continue;
        }
      }

      // Deduplicate identical notifications by stable identifier (title + message)
      const contentKey = `${notification.title.trim().toLowerCase()}:::${notification.message.trim().toLowerCase()}`;
      if (seenContent.has(contentKey)) {
        continue;
      }
      seenContent.add(contentKey);
      uniqueNotifications.push(notification);
    }

    return uniqueNotifications.slice(0, 4);
  }, [notifications, firebaseUser, currentUser.id]);

  const respond = async (request: DonationRequest) => {
    if (respondedRequestIds.has(request.id) || isSubmitting) return;
    setIsSubmitting(request.id);
    try {
      await respondToRequest(request.id);
      const next = [{ requestId: request.id, respondedAt: new Date().toISOString() }, ...responses];
      setResponses(next);
      localStorage.setItem('dofi_donor_responses', JSON.stringify(next));
    } catch (err) {
      console.warn('Error responding to request:', err);
    } finally {
      setIsSubmitting(null);
    }
  };

  const requestCard = (request: DonationRequest) => {
    const hasResponded = respondedRequestIds.has(request.id);
    const bloodRequirement = request.bloodRequirements?.targetBloodGroup || 'Blood group not specified';
    const status = request.status?.replace('_', ' ') || 'Pending';
    return (
      <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-700">{bloodRequirement}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              request.urgency === 'emergency' ? 'bg-rose-100 text-rose-700' : request.urgency === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
            }`}>{request.urgency}</span>
          </div>
          <span className="text-[11px] capitalize text-slate-500">{status}</span>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{request.unitsNeeded || 1} unit{request.unitsNeeded === 1 ? '' : 's'} needed</h3>
          <p className="mt-1 text-sm text-slate-600">{cleanHospitalName(request.hospitalName)}</p>
        </div>
        <div className="grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{cleanLocation(request.city, request.state, request.hospitalName)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDeadline(request.deadlineDate)}</span>
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Potential match — final eligibility must be confirmed by the hospital.</p>
        <button
          onClick={() => respond(request)}
          disabled={hasResponded || isSubmitting === request.id}
          className="w-full rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-default disabled:bg-teal-100 disabled:text-teal-800"
        >
          {hasResponded ? 'Response Sent' : isSubmitting === request.id ? 'Recording...' : "I'm Available"}
        </button>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Donor dashboard</p>
          <h1 className="mt-2 text-2xl font-black">Blood Donor Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Review potential blood-group-compatible requests near your approximate location. Hospital teams confirm final eligibility.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Your donor profile</h2><UserRound className="h-5 w-5 text-teal-600" /></div>
          {bloodGroup ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-slate-500">Blood group</p><p className="mt-1 text-lg font-black text-rose-700">{bloodGroup}</p></div>
            <div><p className="text-xs text-slate-500">Availability</p><p className="mt-1 text-sm font-semibold capitalize text-slate-800">{availability?.replace('_', ' ') || 'Not set'}</p></div>
            <div><p className="text-xs text-slate-500">Approximate location</p><p className="mt-1 text-sm font-semibold text-slate-800">{location}</p></div>
            <div><p className="text-xs text-slate-500">Verification</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800"><ShieldCheck className="h-4 w-4 text-teal-600" />{verified ? 'Verified' : 'Pending confirmation'}</p></div>
          </div> : <div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-600">Complete your blood donor profile to see potential compatible requests.</p><button onClick={() => setIsRegisterDonorModalOpen(true)} className="mt-3 text-sm font-bold text-teal-700">Complete profile →</button></div>}
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-rose-700">Nearby urgent requests</p><p className="mt-2 text-3xl font-black text-rose-700">{urgentRequests.length}</p><p className="mt-1 text-sm text-rose-800">Potential matches with emergency or urgent status.</p></div>
      </section>

      <section id="potential-requests" className="space-y-4">
        <div><h2 className="text-lg font-bold text-slate-900">Potential compatible blood requests</h2><p className="text-sm text-slate-500">Only blood requests compatible with your recorded blood group are shown.</p></div>
        {!bloodGroup ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Your profile is needed to calculate potential blood-group compatibility.</div> : compatibleRequests.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{compatibleRequests.map(requestCard)}</div> : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No active potential matches are available for your profile right now.</div>}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-900">My responses / history</h2>
          {userResponses.length ? (
            <div className="mt-3 space-y-2.5">
              {userResponses.map(response => {
                const request = response.request
                  || bloodRequests.find(item => item.id === response.requestId)
                  || requests.find(item => item.id === response.requestId)
                  || (firestoreRequests as DonationRequest[]).find(item => item.id === response.requestId);
                const hospitalName = cleanHospitalName(request?.hospitalName);
                const bloodTarget = request?.bloodRequirements?.targetBloodGroup;
                const component = request?.bloodRequirements?.component?.replace('_', ' ');
                const units = request?.unitsNeeded ? `${request.unitsNeeded} unit${request.unitsNeeded === 1 ? '' : 's'}` : null;
                const formattedDate = response.date ? new Date(response.date).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently';

                return (
                  <div key={response.requestId} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {bloodTarget && (
                          <span className="rounded bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-xs font-bold text-rose-700">
                            {bloodTarget}
                          </span>
                        )}
                        <span className="font-semibold text-slate-800">{hospitalName}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-teal-700 font-semibold text-xs shrink-0 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Response Sent
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {units && <span>{units}{component ? ` (${component})` : ''}</span>}
                      <span>📍 {cleanLocation(request?.city, request?.state, hospitalName)}</span>
                      <span className="text-slate-400">Responded: {formattedDate}</span>
                      {request?.id && <span className="font-mono text-[10px] text-slate-400">#{request.id}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">You have not responded to a request yet.</p>
          )}
          <p className="mt-3 text-xs text-slate-400">Responses are coordinated in real-time with the attending hospital via Firestore.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="flex items-center gap-2 font-bold text-slate-900"><Bell className="h-4 w-4 text-teal-600" />Notifications</h2>{donorNotifications.length ? <div className="mt-3 space-y-2">{donorNotifications.map(notification => <div key={notification.id} className="rounded-lg bg-slate-50 p-3"><p className="text-sm font-medium text-slate-800">{notification.title}</p><p className="mt-1 text-xs text-slate-500">{notification.message}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No donor notifications yet.</p>}</div>
      </section>
    </div>
  );
};

