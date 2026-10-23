import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  FileText,
  X,
  Flag,
  Sparkles
} from 'lucide-react';
import { DonationRequest, RequestStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface RequestDetailModalProps {
  request: DonationRequest | null;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, onClose }) => {
  const {
    donors,
    computeMatchScore,
    updateRequestStatus,
    setSelectedDonor,
    setReportingTarget,
    setIsReportModalOpen,
    currentUser,
    setActiveTab,
    donorResponses,
    respondToRequest,
    updateDonorResponseStatus,
    firebaseUser
  } = useApp();

  const [transitionNote, setTransitionNote] = useState('');
  const [showStatusAdvance, setShowStatusAdvance] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  if (!request) return null;

  // Status progression stages
  const stages: { key: RequestStatus; label: string }[] = [
    { key: 'pending', label: '1. Pending Review' },
    { key: 'verified', label: '2. Facility Review' },
    { key: 'matched', label: '3. Donor Discovery' },
    { key: 'in_progress', label: '4. In Progress' },
    { key: 'completed', label: '5. Completed' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === request.status);

  // Compute matching candidate donors
  const candidateDonors = donors
    .map(donor => ({
      donor,
      score: computeMatchScore(request, donor)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const handleAdvanceStatus = (nextStatus: RequestStatus) => {
    updateRequestStatus(request.id, nextStatus, transitionNote);
    setTransitionNote('');
    setShowStatusAdvance(false);
  };

  const handleReport = () => {
    setReportingTarget({
      id: request.id,
      name: request.title,
      type: 'request'
    });
    setIsReportModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                request.urgency === 'emergency'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : request.urgency === 'urgent'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-200 text-slate-800 border-slate-300'
              }`}>
                {request.urgency}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category: {request.category.replace('_', ' ')}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-xs text-rose-600 font-bold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {request.deadlineHoursRemaining}h remaining ({request.deadlineDate})
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {request.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Pipeline Visual Tracker */}
        <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between gap-1 overflow-x-auto text-xs py-1">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isCompletedStage = stage.key === 'completed';
              return (
                <div
                  key={stage.key}
                  onClick={() => {
                    if (isCompletedStage && request.status !== 'completed') {
                      setShowStatusAdvance(true);
                      setTransitionNote('Clinical procedure fulfilled and verified by attending board.');
                    } else if (!isCurrent && idx > currentStageIndex) {
                      setShowStatusAdvance(true);
                    }
                  }}
                  title={
                    isCompletedStage
                      ? request.status === 'completed'
                        ? 'Requisition 100% Completed & Verified'
                        : 'Click to mark this requisition as Completed'
                      : stage.label
                  }
                  className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded font-medium transition-all ${
                    isCurrent
                      ? isCompletedStage
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm ring-2 ring-emerald-400/50'
                        : 'bg-teal-500 text-slate-950 font-bold'
                      : isPast
                      ? 'text-teal-400'
                      : isCompletedStage
                      ? 'text-emerald-400/80 hover:text-emerald-200 hover:bg-slate-800/90 cursor-pointer border border-dashed border-emerald-500/40'
                      : 'text-slate-500'
                  }`}
                >
                  {isCurrent && isCompletedStage ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-950 shrink-0" />
                  ) : isPast ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : null}
                  <span>{stage.label}</span>
                  {idx < stages.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-600 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Pipeline Stage:</span>
              <span className={`font-mono font-bold capitalize ${
                request.status === 'completed' ? 'text-emerald-400 flex items-center gap-1' : 'text-teal-300'
              }`}>
                {request.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Completed & Fulfilled</span>
                  </>
                ) : (
                  request.status.replace('_', ' ')
                )}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Where to see completed:</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('requests');
                }}
                className="text-teal-400 hover:text-teal-300 underline font-medium cursor-pointer"
              >
                All Requests → Status: Completed
              </button>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          {/* Completed Requisition Showcase Banner */}
          {request.status === 'completed' && (
            <div className="p-4 bg-emerald-50/95 border border-emerald-300 rounded-xl space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm">
                      Clinical Requisition Successfully Completed & Fulfilled
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      All <strong>{request.unitsFulfilled || request.unitsNeeded} of {request.unitsNeeded || 1} units</strong> have been successfully provided and administered to <strong>{request.patientAlias}</strong> under licensed medical oversight at <strong>{request.hospitalName}</strong>.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 border border-emerald-300 shrink-0">
                  Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-900">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Request Record</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  <span>Units: {request.unitsFulfilled || request.unitsNeeded}/{request.unitsNeeded || 1}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-emerald-700 font-mono">Archived record</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-emerald-800">
                  You can browse all completed requisitions platform-wide under <strong>All Requests</strong> (filter by <strong>Status: Completed</strong>).
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab('requests');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Filter Completed in Hub →</span>
                </button>
              </div>
            </div>
          )}
          {/* Institutional Anchor & Patient Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Patient Alias</span>
              <span className="text-xs font-bold text-slate-900">{request.patientAlias} ({request.patientAge}yo)</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Authorized Hospital</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-indigo-600" />
                {request.hospitalName}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Fulfillment Status</span>
              <span className="text-xs font-mono font-bold text-teal-700">
                {request.unitsFulfilled || 0} of {request.unitsNeeded || 1} Units Fulfilled
              </span>
            </div>
          </div>

          {/* Clinical Specification Notes */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>Clinical Specification & Requisition Notes</span>
            </h4>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-slate-700 leading-relaxed">
              <p>{request.medicalNotes}</p>

              {request.bloodRequirements && (
                <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded text-rose-950 font-mono text-[11px] space-y-1">
                  <div>Target Group: <strong>{request.bloodRequirements.targetBloodGroup}</strong></div>
                  <div>Compatible Groups: <strong>{request.bloodRequirements.compatibleBloodGroups.join(', ')}</strong></div>
                  <div>Component: <strong>{request.bloodRequirements.component.replace('_', ' ')}</strong></div>
                  <div>STAT Crossmatch Required: <strong>{request.bloodRequirements.isStatCrossmatchRequired ? 'YES (Immediate)' : 'Standard'}</strong></div>
                </div>
              )}
            </div>
          </div>


          {/* ── Real Donor Responses Section (Phase 5) ── */}
          <div className="space-y-3 p-4 bg-teal-50/50 border border-teal-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Donor Responses & Availability</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live coordination between eligible blood donors and hospital clinical staff
                </p>
              </div>

              {/* Donor response button / status indicator */}
              <div>
                {donorResponses.some(
                  r => r.requestId === request.id && (
                    r.donorUserId === currentUser.id ||
                    (firebaseUser && r.donorUserId === firebaseUser.uid)
                  )
                ) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Response Sent</span>
                  </span>
                ) : request.status !== 'completed' && request.status !== 'cancelled' ? (
                  <button
                    onClick={async () => {
                      setIsResponding(true);
                      try {
                        await respondToRequest(request.id);
                      } finally {
                        setIsResponding(false);
                      }
                    }}
                    disabled={isResponding}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <span>{isResponding ? 'Sending...' : "I'm Available"}</span>
                  </button>
                ) : null}
              </div>
            </div>

            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 p-2 rounded">
              <strong>Clinical Notice:</strong> Potential match — final eligibility must be confirmed by the hospital. Dofi does not make final medical determinations.
            </p>

            {/* List of responses for this request */}
            {donorResponses.filter(r => r.requestId === request.id).length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                No donor responses yet. When donors respond &quot;I&apos;m Available&quot;, their responses appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {donorResponses
                  .filter(r => r.requestId === request.id)
                  .map(resp => (
                    <div
                      key={resp.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center">
                          {resp.bloodGroup}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{resp.donorName}</div>
                          <div className="text-[10px] text-slate-400">
                            {resp.city} · Responded {new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          resp.status === 'confirmed'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : resp.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {resp.status}
                        </span>

                        {(currentUser.role === 'hospital' || currentUser.role === 'admin') && resp.status === 'available' && (
                          <button
                            onClick={() => updateDonorResponseStatus(resp.id, 'confirmed')}
                            className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded transition cursor-pointer"
                          >
                            Confirm Match
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Compatibility Matching Engine Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Matching Engine Candidates ({candidateDonors.length} Identified)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Sorted by Compatibility, Availability & Proximity
              </span>
            </div>

            {candidateDonors.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                No registered donors currently meet the stringent clinical compatibility criteria.
              </div>
            ) : (
              <div className="space-y-2">
                {candidateDonors.slice(0, 3).map(({ donor, score }) => (
                  <div
                    key={donor.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-400 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {donor.donorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{donor.donorName}</span>
                          <span className="text-[10px] text-slate-500">· {donor.distanceKm} km ({donor.city})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Status: <strong className="text-slate-700 capitalize">{donor.availabilityStatus.replace('_', ' ')}</strong> · {donor.totalDonationsCount} prior donations
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-teal-700">
                          {score}% Match
                        </span>
                        <div className="text-[9px] text-slate-400">Compatibility Index</div>
                      </div>

                      <button
                        onClick={() => setSelectedDonor(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Clinical Timeline */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Verification & Audit Trail
            </h4>
            <div className="border-l-2 border-slate-200 pl-4 space-y-3">
              {request.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-teal-600 border-2 border-white" />
                  <div className="text-xs font-bold text-slate-900">{event.title}</div>
                  <div className="text-[11px] text-slate-500">{event.description}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.actorName} ({event.actorRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions & Pipeline Advancement */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {showStatusAdvance ? (
            <div className="p-3 bg-white border border-teal-300 rounded-lg space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Advance Clinical Workflow:</span>
                <button
                  onClick={() => setShowStatusAdvance(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={transitionNote}
                onChange={e => setTransitionNote(e.target.value)}
                placeholder="Optional clinical notes or laboratory verification reference..."
                className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleAdvanceStatus('verified')}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Verify Requisition (Pass Board)
                  </button>
                )}
                {(request.status === 'pending' || request.status === 'verified') && (
                  <button
                    onClick={() => handleAdvanceStatus('matched')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Confirm Donor Match
                  </button>
                )}
                {(request.status === 'pending' || request.status === 'verified' || request.status === 'matched') && (
                  <button
                    onClick={() => handleAdvanceStatus('in_progress')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Schedule Procedure / Collection
                  </button>
                )}
                {request.status !== 'completed' && (
                  <button
                    onClick={() => handleAdvanceStatus('completed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Donation Complete (Transfusion/Wig Gifted)</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              onClick={handleReport}
              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Report Discrepancy</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Close
              </button>

              {request.status !== 'completed' && request.status !== 'cancelled' && (
                <button
                  onClick={() => setShowStatusAdvance(!showStatusAdvance)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                  <span>Update Clinical Pipeline</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
