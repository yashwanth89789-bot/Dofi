import React, { useEffect, useState } from 'react';
import { Globe2, AlertTriangle, ExternalLink, FlaskConical } from 'lucide-react';

interface EraktkoshResponse {
  source: string;
  integrationStatus: string;
  reason: string;
  officialPortal: string;
  contactForIntegration: string;
  phone: string;
  lastChecked: string;
}

export const ExternalStatsWidget: React.FC = () => {
  const [eraktkoshData, setEraktkoshData] = useState<EraktkoshResponse | null>(null);
  const [eraktkoshStatus, setEraktkoshStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    fetch('/api/external/eraktkosh')
      .then(r => r.json())
      .then((data: EraktkoshResponse) => {
        setEraktkoshData(data);
        setEraktkoshStatus('loaded');
      })
      .catch(() => setEraktkoshStatus('error'));
  }, []);

  return (
    <section className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">External Blood Bank Integration</h3>
            <p className="text-[11px] text-slate-400">Official government blood bank platform — integration status</p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Reference Only
        </span>
      </div>

      {/* e-RaktKosh Panel */}
      <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">e-RaktKosh</div>
            <div className="text-[10px] text-slate-400">MoHFW Blood Bank Platform — India</div>
          </div>
          <span className="text-[9px] font-bold uppercase bg-amber-900/40 text-amber-400 border border-amber-700/50 px-1.5 py-0.5 rounded">
            Integration Pending
          </span>
        </div>

        {eraktkoshStatus === 'loading' && (
          <div className="text-xs text-slate-500 animate-pulse">Checking integration status...</div>
        )}
        {eraktkoshStatus === 'error' && (
          <div className="text-xs text-rose-400">Could not reach backend. Run the server to see status.</div>
        )}
        {eraktkoshStatus === 'loaded' && (
          <>
            <div className="flex items-start gap-2.5 bg-amber-950/30 border border-amber-800/30 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/80 leading-relaxed">
                <strong className="text-amber-300">No Public API Available.</strong> e-RaktKosh does not expose a public REST API. Integration requires institutional credentials from MoHFW, issued only to licensed blood banks.
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <FlaskConical className="h-3 w-3 text-slate-500" />
                <span>Adapter architecture: <span className="text-teal-400">Ready</span> — awaiting MoHFW credentials</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FlaskConical className="h-3 w-3 text-slate-500" />
                <span>Required env var: <code className="text-slate-300 bg-slate-900/60 px-1 rounded text-[10px]">ERAKTKOSH_INSTITUTION_TOKEN</code></span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-700/50 pt-2">
              To integrate: contact{' '}
              <a href="mailto:mraktkosh@gmail.com" className="text-teal-500 hover:text-teal-400">mraktkosh@gmail.com</a>
              {' '}or visit{' '}
              <a href="https://eraktkosh.mohfw.gov.in" target="_blank" rel="noopener noreferrer"
                className="text-teal-500 hover:text-teal-400 inline-flex items-center gap-0.5">
                eraktkosh.mohfw.gov.in <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-slate-600 leading-relaxed border-t border-slate-800 pt-3">
        Dofi — Blood Donation Coordination Platform connecting eligible donors with verified blood requests and hospitals. e-RaktKosh data is not real-time; integration requires institutional authorization from the Ministry of Health &amp; Family Welfare, Government of India.
      </p>
    </section>
  );
};
