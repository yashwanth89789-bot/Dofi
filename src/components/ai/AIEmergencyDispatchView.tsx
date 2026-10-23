import React, { useState } from 'react';
import {
  Sparkles,
  AlertOctagon,
  Truck,
  MessageSquare,
  Bell,
  RefreshCw,
  Send,
  Building2,
  Clock,
  Navigation,
  ShieldCheck,
  Check,
  Copy,
  Zap,
  Activity,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIEmergencyDispatchResult } from '../../types';

export const AIEmergencyDispatchView: React.FC = () => {
  const { requests, donors } = useApp();

  const scenarios = [
    {
      id: 'trauma',
      title: 'Level-1 Trauma Mass Casualty Code 99 (O-Negative & Whole Blood)',
      description: 'Acute emergency requiring immediate transfusion for 3 trauma surgery suites.',
    },
    {
      id: 'pediatric_organ',
      title: 'Pediatric Liver Lobe & Heart STAT Dispatch (< 4h Cold Ischemia)',
      description: 'Critical donor availability window: rapid courier transit and board clearance required.',
    },
    {
      id: 'platelet_shortage',
      title: 'Regional Apheresis Platelet Critical Shortage (< 8 Units in Reserve)',
      description: 'Oncology and bone marrow transplant wards facing acute clotting factor depletion.',
    },
    {
      id: 'rare_blood',
      title: 'Rare Bombay Phenotype / AB-Negative STAT Call',
      description: 'Searching for rare antigen-negative donors within 50 km radius.',
    },
  ];

  const [selectedScenario, setSelectedScenario] = useState<string>(scenarios[0].title);
  const [dispatchRadius, setDispatchRadius] = useState<number>(25);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIEmergencyDispatchResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleRunDispatch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/emergency-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyScenario: selectedScenario,
          radiusKm: dispatchRadius,
          activeRequests: requests.filter(r => r.urgency === 'emergency' || r.urgency === 'urgent'),
          availableDonors: donors.filter(d => d.availabilityStatus === 'available_now' || d.availabilityStatus === 'available_24h'),
        }),
      });

      if (!response.ok) throw new Error('Emergency dispatch planner failed');
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setModelUsed(resJson.modelUsed || 'Gemini 3.1 Flash Lite');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-rose-800/40">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-400/30">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-300 animate-pulse" />
            <span>STAT Emergency Dispatch & Logistics AI Engine</span>
            <span className="text-rose-400/60">•</span>
            <span>Trauma Center Directives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Emergency Shortage Forecasting & Dispatch Planner
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Automates mass casualty donor batch mobilization, calculates cold chain transit boundaries, crafts high-conversion emergency SMS alerts, and rebalances regional blood and organ reserves.
          </p>
        </div>
      </div>

      {/* Scenario Selection Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Active Crisis Scenario or Clinical Shortage Trigger:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.title)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedScenario === sc.title
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>{sc.title}</span>
                  {selectedScenario === sc.title && (
                    <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{sc.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Radius Slider */}
        <div className="space-y-2 max-w-md">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 font-semibold">Logistics Mobilization Radius:</span>
            <span className="font-mono font-bold text-rose-700">{dispatchRadius} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="80"
            value={dispatchRadius}
            onChange={e => setDispatchRadius(Number(e.target.value))}
            className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>5 km (Local Metro)</span>
            <span>25 km (Regional Hub)</span>
            <span>80 km (Inter-City Flight)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Verifies real-time inventory at accredited hospital repositories.
          </span>
          <button
            onClick={handleRunDispatch}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Calculating Logistics...' : 'Generate STAT Dispatch Plan'}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-600 animate-pulse">
            <AlertOctagon className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Generating STAT Tactical Dispatch Plan...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Simulating transit isotherms, cold-chain courier routes, and donor mobilization alerts.
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Urgency Gauge & Priority Assessment */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 inline-block">
                  Priority: {result.priorityLevel}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedScenario}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {result.priorityAssessment}
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center shrink-0">
                <div className="text-3xl font-extrabold font-mono text-rose-700">
                  {result.urgencyIndex} / 10
                </div>
                <div className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                  STAT Shortage Index
                </div>
              </div>
            </div>

            {/* Cold Chain Protocol */}
            <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-teal-400" />
                  <span>Cold Chain Transit & Courier Logistics Directive</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-mono">
                  Transit Limit: {result.coldChainProtocol.maxAllowableTransitMinutes} mins
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                <div className="p-3 bg-slate-800/80 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase">Transport Method</div>
                  <div className="font-semibold text-slate-100 mt-0.5">
                    {result.coldChainProtocol.transportMethod}
                  </div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase">Temperature Control</div>
                  <div className="font-semibold text-slate-100 mt-0.5">
                    {result.coldChainProtocol.temperatureControlSpecs}
                  </div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase">Data Logging Requirement</div>
                  <div className="font-semibold text-slate-100 mt-0.5 text-[11px]">
                    {result.coldChainProtocol.preservationRequirement}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Donors to Dispatch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Top Matched Donors for Priority Mobilization ({result.recommendedDonorsToAlert.length})
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  Radius: {result.optimalDispatchRadiusKm} km
                </span>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {result.recommendedDonorsToAlert.map((dn, i) => (
                  <div key={i} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                        #{dn.priorityRank}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{dn.donorName}</div>
                        <div className="text-[11px] text-slate-500">{dn.matchReason}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right shrink-0">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Blood Group</div>
                        <div className="font-bold text-rose-700">{dn.bloodGroup}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                        <div className="font-semibold text-slate-800">{dn.distanceKm} km</div>
                      </div>
                      <button
                        onClick={() => alert(`STAT SMS notification dispatched to ${dn.donorName}`)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Send Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Multi-Channel Alerts */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Generated Multi-Channel Crisis Communications
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMS Alert */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-teal-600" />
                      <span>SMS Dispatch Copy (&lt; 160 chars)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.generatedAlerts.smsCopy, 'sms')}
                      className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'sms' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedType === 'sms' ? 'Copied' : 'Copy SMS'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-800">
                    "{result.generatedAlerts.smsCopy}"
                  </p>
                </div>

                {/* Mobile Push Notification */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-rose-600" />
                      <span>App Push Notification</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.generatedAlerts.pushNotificationBody, 'push')}
                      className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'push' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedType === 'push' ? 'Copied' : 'Copy Push'}</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {result.generatedAlerts.pushNotificationTitle}
                    </div>
                    <div className="text-xs text-slate-600">
                      {result.generatedAlerts.pushNotificationBody}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Clinical Memo */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-700" />
                  <span>Hospital STAT Clinical Memo</span>
                </span>
                <p className="text-xs text-amber-900 font-mono leading-relaxed">
                  {result.generatedAlerts.hospitalStatDispatchMemo}
                </p>
              </div>
            </div>

            {/* Inventory Rebalancing */}
            {result.inventoryRebalancingPlan?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Regional Blood Bank & Organ Repository Rebalancing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.inventoryRebalancingPlan.map((plan, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{plan.unitType}</span>
                        <span className="text-rose-700">{plan.quantity} Units</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <span>{plan.sourceFacility}</span>
                        <span>→</span>
                        <span className="text-slate-800 font-semibold">{plan.destinationFacility}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Urgency: {plan.urgency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ethics & Legal */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>{result.ethicalCommandGuidance}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">Model: {modelUsed}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
