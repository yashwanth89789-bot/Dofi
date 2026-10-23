import React from 'react';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest } from '../../types';

export const DeadlinesWidget: React.FC = () => {
  const { requests, setSelectedRequest } = useApp();

  // Blood requests only, active, sorted by deadline
  const activeRequests = requests
    .filter(r =>
      r.category === 'blood' &&
      r.status !== 'completed' &&
      r.status !== 'cancelled'
    )
    // deduplicate by id
    .filter((r, idx, arr) => arr.findIndex(x => x.id === r.id) === idx)
    .sort((a, b) => a.deadlineHoursRemaining - b.deadlineHoursRemaining);

  const getUrgencyColor = (urgency: DonationRequest['urgency'], hours: number) => {
    if (urgency === 'emergency' || hours <= 6) {
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        bar: 'bg-rose-600',
        text: 'text-rose-700',
        border: 'border-l-4 border-l-rose-600'
      };
    }
    if (urgency === 'urgent' || hours <= 24) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        bar: 'bg-amber-500',
        text: 'text-amber-700',
        border: 'border-l-4 border-l-amber-500'
      };
    }
    return {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      bar: 'bg-teal-600',
      text: 'text-teal-700',
      border: 'border-l-4 border-l-teal-600'
    };
  };

  // Safe percentage — avoids division-by-zero and impossible values like "1/333%"
  const calcPercent = (fulfilled: number | undefined, needed: number | undefined): number | null => {
    if (!needed || needed <= 0) return null;           // no units data
    const pct = Math.round(((fulfilled ?? 0) / needed) * 100);
    return Math.min(100, Math.max(0, pct));            // clamp 0–100
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Blood Donation Deadline Queue
            </h3>
            <span className="bg-rose-50 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-200 tabular-nums">
              {activeRequests.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time deadline tracking for urgent blood requests and transfusion deadlines.
          </p>
        </div>
      </div>

      {activeRequests.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No active blood requests with deadlines right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeRequests.slice(0, 3).map(req => {
            const style = getUrgencyColor(req.urgency, req.deadlineHoursRemaining);
            const pct = calcPercent(req.unitsFulfilled, req.unitsNeeded);
            const hasFulfillmentData = pct !== null;

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-lg bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between ${style.border}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="font-semibold text-slate-900">Blood</span>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">{req.hospitalName.split(' ')[0]}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}>
                      {req.urgency}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">
                    {req.title?.trim() || (req.bloodRequirements?.targetBloodGroup
                      ? `Blood request — ${req.bloodRequirements.targetBloodGroup}`
                      : 'Blood donation request')}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums font-medium text-slate-700">
                      {req.deadlineHoursRemaining}h remaining
                    </span>
                    {req.patientAlias && (
                      <>
                        <span>·</span>
                        <span className="truncate">{req.patientAlias}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {hasFulfillmentData ? (
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                        <span>
                          Units: {req.unitsFulfilled ?? 0} / {req.unitsNeeded} ({pct}%)
                        </span>
                        <span className={style.text}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${style.bar} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 mb-3">Units data not available</div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-teal-700 font-semibold text-[11px]">
                      {req.matchedDonorIds.length} candidate donor{req.matchedDonorIds.length !== 1 ? 's' : ''} ready
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-slate-700 font-medium">
                      Review <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
