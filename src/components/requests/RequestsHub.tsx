import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Clock,
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Droplet,
  HeartHandshake,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequestStatus } from '../../types';
import { RequestDetailModal } from './RequestDetailModal';

export const RequestsHub: React.FC = () => {
  const {
    requests,
    firestoreRequests,
    selectedRequest,
    setSelectedRequest,
    setIsCreateRequestModalOpen,
    donorResponses,
    respondToRequest,
    currentUser,
    firebaseUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);

  // Blood requests only, deduplicated strictly by unique request ID
  const bloodRequests = useMemo(() => {
    const combined = [...requests, ...(firestoreRequests as any[])];
    const uniqueMap = new Map<string, any>();
    for (const r of combined) {
      if (!r) continue;
      const id = (r.id || '').trim();
      if (!id || r.category !== 'blood') continue;
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, { ...r, id });
      }
    }
    return Array.from(uniqueMap.values());
  }, [requests, firestoreRequests]);

  const filteredRequests = useMemo(() => {
    return bloodRequests.filter(req => {
      if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) {
        return false;
      }

      if (statusFilter === 'active') {
        if (req.status === 'completed' || req.status === 'cancelled') return false;
      } else if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesHospital = req.hospitalName.toLowerCase().includes(q);
        const matchesPatient = req.patientAlias.toLowerCase().includes(q);
        const matchesNotes = req.medicalNotes.toLowerCase().includes(q);
        const matchesGroup = req.bloodRequirements?.targetBloodGroup?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesHospital && !matchesPatient && !matchesNotes && !matchesGroup) {
          return false;
        }
      }

      return true;
    });
  }, [bloodRequests, urgencyFilter, statusFilter, searchQuery]);

  const handleRespond = async (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation();
    setRespondingReqId(reqId);
    try {
      await respondToRequest(reqId);
    } finally {
      setRespondingReqId(null);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    const styles: Record<RequestStatus, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      verified: 'bg-sky-50 text-sky-700 border-sky-200',
      matched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
      completed: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      cancelled: 'bg-slate-100 text-slate-500 border-slate-200'
    };

    const labels: Record<RequestStatus, string> = {
      pending: 'Pending Verification',
      verified: 'Active / Verified',
      matched: 'Matching Donors',
      in_progress: 'Donor Responded',
      completed: 'Fulfilled',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Blood Donation Requisitions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified hospital blood requests, check urgency deadlines, and respond as a donor
          </p>
        </div>

        <button
          onClick={() => setIsCreateRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Blood Requisition</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-start gap-3">
        <HeartHandshake className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <p className="text-xs text-teal-800 leading-relaxed">
          <strong>Donor Coordination:</strong> When you click <em>&quot;I&apos;m Available&quot;</em>, the attending hospital is alerted immediately. <em>Potential match — final clinical eligibility must be confirmed by the hospital.</em>
        </p>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Blood Requisitions ({bloodRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Pipeline ({bloodRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Fulfilled ({bloodRequests.filter(r => r.status === 'completed').length})</span>
          </button>
        </div>

        {statusFilter === 'completed' ? (
          <span className="text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Viewing {filteredRequests.length} completed blood donation records</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">
            Click <strong>Fulfilled</strong> to see completed transfusions.
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blood group (e.g. O-, A+), hospital, or patient..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="all">All Urgency Levels</option>
              <option value="emergency">Emergency STAT Only</option>
              <option value="urgent">Urgent (&lt; 24h)</option>
              <option value="standard">Standard Transfusion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No blood requisitions found matching current filters</h3>
            <p className="text-xs text-slate-500">Try broadening your urgency or status filters.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const hasResponded = donorResponses.some(
              r => r.requestId === req.id && (
                r.donorUserId === currentUser.id ||
                (firebaseUser && r.donorUserId === firebaseUser.uid)
              )
            );

            const isResolved = req.status === 'completed' || req.status === 'cancelled';
            const responsesCount = donorResponses.filter(r => r.requestId === req.id).length;

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-50 border border-rose-200 text-xs">
                      {req.bloodRequirements?.targetBloodGroup || 'Blood'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {req.hospitalName}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      Patient: {req.patientAlias || 'Patient'} ({req.patientAge}yo)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {req.medicalNotes}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-rose-600 font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{req.deadlineHoursRemaining}h remaining</span>
                    </div>
                    <span>·</span>
                    <span className="font-mono font-semibold text-slate-700">
                      Units: {req.unitsFulfilled || 0}/{req.unitsNeeded || 1} required
                    </span>
                    {responsesCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-teal-700 font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {responsesCount} donor response{responsesCount !== 1 ? 's' : ''} logged
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status & CTA zone */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      req.urgency === 'emergency'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : req.urgency === 'urgent'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {req.urgency}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Donor response button / badge */}
                  <div className="flex items-center gap-2">
                    {hasResponded ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Response Sent</span>
                      </span>
                    ) : !isResolved ? (
                      <button
                        onClick={e => handleRespond(e, req.id)}
                        disabled={respondingReqId === req.id}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Droplet className="h-3.5 w-3.5" />
                        <span>{respondingReqId === req.id ? 'Sending...' : "I'm Available"}</span>
                      </button>
                    ) : null}

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800">
                      <span>Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
