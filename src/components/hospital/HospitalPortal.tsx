import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Droplet,
  MapPin,
  ShieldCheck,
  Users,
  HeartHandshake,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest, RequestStatus } from '../../types';

const STATUS: Record<RequestStatus, string> = {
  pending: 'PENDING VERIFICATION',
  verified: 'ACTIVE',
  matched: 'MATCHING',
  in_progress: 'DONOR RESPONDED',
  completed: 'FULFILLED',
  cancelled: 'CANCELLED'
};

const rank = { emergency: 0, urgent: 1, standard: 2 };

export const HospitalPortal: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    organizations,
    requests,
    firestoreRequests,
    donors,
    setSelectedRequest,
    setIsCreateRequestModalOpen,
    computeMatchScore,
    updateRequestStatus,
    donorResponses,
    updateDonorResponseStatus
  } = useApp();

  const [requestView, setRequestView] = useState<'active' | 'fulfilled'>('active');

  const bloodHospitals = organizations.filter(item => !/(organ|bone|tissue|hair|cancer|oncology|transplant)/i.test(item.name));
  const hospital = bloodHospitals.find(item => item.id === currentUser.organizationId) || bloodHospitals[0];

  const currentUserId = currentUser.id;
  const firebaseUid = firebaseUser?.uid;

  const hospitalRequests = useMemo(() => {
    const combined = [...requests, ...(firestoreRequests as DonationRequest[])];
    const uniqueMap = new Map<string, DonationRequest>();

    for (const req of combined) {
      if (!req) continue;
      const id = (req.id || '').trim();
      if (!id) continue;
      if (req.category !== 'blood') continue;

      const isForThisHospital =
        req.hospitalId === hospital?.id ||
        req.requesterId === currentUserId ||
        (firebaseUid && req.requesterId === firebaseUid) ||
        (currentUser.role === 'hospital' && (!req.hospitalId || req.hospitalId === 'hospital_pending'));

      if (!isForThisHospital) continue;

      // Deduplicate strictly by unique request ID
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, { ...req, id });
      }
    }

    return Array.from(uniqueMap.values()).sort((a, b) => rank[a.urgency] - rank[b.urgency]);
  }, [currentUserId, firebaseUid, firestoreRequests, hospital?.id, requests, currentUser.role]);

  const active = hospitalRequests.filter(request => !['completed', 'cancelled'].includes(request.status));
  const emergencies = active.filter(request => request.urgency === 'emergency');
  const fulfilled = hospitalRequests.filter(request => request.status === 'completed');

  const matches = active.flatMap(request =>
    donors.map(donor => ({
      request,
      donor,
      score: computeMatchScore(request, donor)
    })).filter(item => item.score > 0)
  ).sort((a, b) => b.score - a.score || rank[a.request.urgency] - rank[b.request.urgency]);

  // Real donor responses for this hospital's requests
  const hospitalResponses = useMemo(() => {
    return donorResponses.filter(r =>
      hospitalRequests.some(req => req.id === r.requestId) ||
      (hospital?.id && r.hospitalId === hospital.id) ||
      r.requesterId === currentUserId ||
      (firebaseUid && r.requesterId === firebaseUid)
    );
  }, [donorResponses, hospitalRequests, hospital?.id, currentUserId, firebaseUid]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Hospital portal</p>
          <h1 className="mt-2 text-2xl font-black">{hospital?.name || currentUser.hospitalAffiliation || 'Hospital profile'}</h1>
          <p className="mt-2 text-sm text-slate-300">
            <MapPin className="mr-1 inline h-4 w-4" />{hospital ? `${hospital.city}, ${hospital.state}` : 'Location pending'} · <ShieldCheck className="mx-1 inline h-4 w-4 text-teal-300" />{hospital?.isVerified ? 'Verified hospital' : 'Verification pending'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateRequestModalOpen(true)}
          className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-400 transition cursor-pointer"
        >
          Create Blood Request
        </button>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="Active blood requests" value={active.length} icon={<Droplet className="text-teal-600" />} />
        <Stat label="Emergency requests" value={emergencies.length} icon={<AlertTriangle className="text-rose-600" />} />
        <Stat label="Donor responses logged" value={hospitalResponses.length} icon={<HeartHandshake className="text-teal-600" />} />
        <Stat label="Fulfilled requests" value={fulfilled.length} icon={<CheckCircle2 className="text-teal-600" />} />
      </section>

      {/* Hospital Blood Requests with Active/Fulfilled Toggle */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b p-5 gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Hospital Blood Requests</h2>
            <p className="text-sm text-slate-500">
              {requestView === 'active'
                ? 'Active requisitions currently undergoing matching or donor response.'
                : 'Fulfilled requisitions completed through coordinated donation.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setRequestView('active')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                requestView === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({active.length})
            </button>
            <button
              onClick={() => setRequestView('fulfilled')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                requestView === 'fulfilled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fulfilled ({fulfilled.length})
            </button>
          </div>
        </div>
        {(requestView === 'active' ? active : fulfilled).length ? (
          <div className="divide-y">
            {(requestView === 'active' ? active : fulfilled).map(request => {
              const reqResponses = donorResponses.filter(r => r.requestId === request.id);
              return (
                <RequestRow
                  key={request.id}
                  request={request}
                  responseCount={reqResponses.length}
                  onOpen={() => setSelectedRequest(request)}
                  onStatus={status => updateRequestStatus(request.id, status)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-500">
            {requestView === 'active'
              ? 'No active blood requests. Click "Create Blood Request" above to initiate a requisition.'
              : 'No fulfilled blood requests yet. Fulfilled requests will appear here after donation completion.'}
          </div>
        )}
      </section>

      {/* 2-Column: Potential Matches vs Real Donor Responses */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Left: Potential Matches */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Users className="h-5 w-5 text-teal-600" />
              Potential donor matches
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by blood-group compatibility, availability, and urgency.
            </p>
          </div>
          <div className="divide-y">
            {matches.length ? (
              matches.slice(0, 6).map((item, index) => (
                <div key={`${item.request.id}-${item.donor.id}`} className="p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Potential donor match {index + 1}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.donor.bloodDetails?.bloodGroup || 'Blood group pending'} · {item.donor.availabilityStatus.replace('_', ' ')} · {item.donor.city}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        For request: {item.request.hospitalName} — {item.request.bloodRequirements?.targetBloodGroup || 'Blood group pending'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-700">Match priority {item.score}</span>
                  </div>
                  <p className="mt-2 text-xs text-amber-800">
                    Potential donor match — final eligibility must be confirmed by the hospital.
                  </p>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500">No potential matches currently available.</p>
            )}
          </div>
        </div>

        {/* Right: REAL DONOR RESPONSES (Phase 5) */}
        <div className="rounded-xl border border-slate-200 bg-white flex flex-col">
          <div className="border-b p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-900">
                  <HeartHandshake className="h-5 w-5 text-teal-600" />
                  Donor responses ({hospitalResponses.length})
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Live responses from donors who clicked &quot;I&apos;m Available&quot; for this facility.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Firestore
              </span>
            </div>
          </div>

          <div className="divide-y flex-1 max-h-[480px] overflow-y-auto">
            {hospitalResponses.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No donor responses yet. When compatible donors click &quot;I&apos;m Available&quot;, their responses appear here.
              </div>
            ) : (
              hospitalResponses.map(resp => {
                const matchingReq = hospitalRequests.find(r => r.id === resp.requestId);
                return (
                  <div key={resp.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 font-black text-xs flex items-center justify-center border border-rose-200">
                          {resp.bloodGroup}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{resp.donorName}</p>
                          <p className="text-xs text-slate-500">
                            {resp.city || 'Location shared'} · Responded {new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        resp.status === 'confirmed'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : resp.status === 'fulfilled'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {resp.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 flex items-center justify-between">
                      <span>Target Request: <strong>{matchingReq?.title || resp.requestId}</strong></span>
                      <span className="text-slate-400 font-mono text-[11px]">{matchingReq?.unitsNeeded || 1} units</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {resp.status === 'available' && (
                        <button
                          onClick={() => updateDonorResponseStatus(resp.id, 'confirmed')}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition cursor-pointer"
                        >
                          Confirm Match
                        </button>
                      )}
                      {(!matchingReq || matchingReq.status !== 'completed') && (
                        <button
                          onClick={() => {
                            updateRequestStatus(resp.requestId, 'completed', `Fulfillment coordinated with donor ${resp.donorName}.`);
                            updateDonorResponseStatus(resp.id, 'fulfilled');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition cursor-pointer shadow-2xs"
                        >
                          Mark Request Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
            No direct donor phone or private email is displayed. Coordination is managed securely through the portal.
          </div>
        </div>
      </section>

      {/* Integration Status Notice */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Integration status</h2>
        <p className="mt-2 text-sm text-slate-600">
          e-RaktKosh integration pending institutional authorization.
        </p>
      </section>
    </div>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{label}</span>
      {icon}
    </div>
    <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const RequestRow = ({
  request,
  responseCount,
  onOpen,
  onStatus
}: {
  request: DonationRequest;
  responseCount: number;
  onOpen: () => void;
  onStatus: (status: RequestStatus) => void;
}) => (
  <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
    <button onClick={onOpen} className="text-left cursor-pointer">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
          {request.bloodRequirements?.targetBloodGroup || 'Blood group pending'}
        </span>
        <span className="text-xs font-bold uppercase text-slate-500">{STATUS[request.status]}</span>
        {request.urgency === 'emergency' && (
          <span className="text-xs font-bold text-rose-600 animate-pulse">EMERGENCY</span>
        )}
        {responseCount > 0 && (
          <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 border border-teal-200 flex items-center gap-1">
            <Check className="h-3 w-3" />
            {responseCount} Donor Responded
          </span>
        )}
      </div>
      <p className="mt-2 font-semibold text-slate-900">
        {request.unitsNeeded || 1} unit{request.unitsNeeded === 1 ? '' : 's'} · {request.hospitalName}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        {request.deadlineDate || 'Deadline pending'}
      </p>
    </button>
    <div className="flex flex-wrap gap-2">
      <button onClick={onOpen} className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition cursor-pointer">
        View details
      </button>
      {request.status !== 'completed' && (
        <button onClick={() => onStatus('completed')} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700 transition cursor-pointer">
          Mark fulfilled
        </button>
      )}
      {request.status !== 'cancelled' && request.status !== 'completed' && (
        <button onClick={() => onStatus('cancelled')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
          Cancel
        </button>
      )}
    </div>
  </div>
);
