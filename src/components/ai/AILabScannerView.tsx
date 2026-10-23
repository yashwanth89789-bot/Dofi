import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { AILabInterpretationResult } from '../../types';

export const AILabScannerView: React.FC = () => {
  const labPresets = [
    {
      title: 'Complete Blood Count (CBC) with Ferritin',
      category: 'CBC & Red Cell Panel',
      text: `LABORATORY DIAGNOSTIC SERVICES - TRANSFUSION WORKUP
Specimen: Venous Whole Blood | Collection: 08:30 AM
- Hemoglobin (HGB): 14.1 g/dL (Ref: 12.0 - 16.0 g/dL)
- Hematocrit (HCT): 42.5% (Ref: 36.0 - 48.0%)
- Platelet Count (PLT): 285,000 /uL (Ref: 150,000 - 450,000 /uL)
- White Blood Cells (WBC): 6.8 x10^3/uL (Ref: 4.5 - 11.0 x10^3/uL)
- Serum Ferritin: 58 ng/mL (Ref: 24 - 336 ng/mL)
- Total Protein: 7.2 g/dL (Ref: 6.0 - 8.3 g/dL)`,
    },
    {
      title: 'Transfusion Infectious Disease Serology (NAT)',
      category: 'Viral Serology Screen',
      text: `INFECTIOUS DISEASE SAFETY PANEL - DONOR CLEARANCE
Method: Nucleic Acid Amplification Testing (NAT) & Chemiluminescent Immunoassay
- Anti-HIV 1/2 Plus O: Non-Reactive
- Hepatitis B Surface Antigen (HBsAg): Non-Reactive
- Hepatitis C Virus RNA (HCV NAT): Non-Reactive / Negative
- Treponema pallidum (Syphilis): Non-Reactive
- HTLV I/II Antibody: Non-Reactive
- West Nile Virus (WNV NAT): Non-Reactive
- CMV IgG Antibody: Positive (Convalescent Titers) | CMV IgM: Negative`,
    },
    {
      title: 'ABO/Rh Blood Typing & Irregular Antibody Screen',
      category: 'Blood Group & Antibody Screen',
      text: `TRANSFUSION SERVICE - IMMUNOHEMATOLOGY REPORT
Specimen: EDTA Anticoagulated Whole Blood | Testing Method: Column Agglutination (Gel Card)
- ABO Grouping: Forward: Anti-A (+4), Anti-B (0) | Reverse: A1 Cells (0), B Cells (+4) → Confirmed Group A
- Rh (D) Typing: Anti-D (+4) → Rh Positive
- Weak D / Du Variant Testing: Not Required (Strong Immediate Reaction)
- Direct Antiglobulin Test (DAT / Coombs): Negative
- Unexpected Antibody Screen (3-Cell Panel): Negative (No clinically significant red cell alloantibodies detected)
- Autocontrol: Negative`,
    },
    {
      title: 'Coagulation Profile & Platelet Function Test',
      category: 'Coagulation & Hemostasis Panel',
      text: `HEMOSTASIS & THROMBOSIS LABORATORY - PRE-APHERESIS EVALUATION
Specimen: 3.2% Sodium Citrate Plasma & Whole Blood
- Prothrombin Time (PT): 11.8 sec (Ref: 11.0 - 13.5 sec)
- International Normalized Ratio (INR): 1.02 (Ref: 0.8 - 1.2)
- Activated Partial Thromboplastin Time (aPTT): 28.4 sec (Ref: 25.0 - 36.0 sec)
- Fibrinogen Activity (Clauss): 310 mg/dL (Ref: 200 - 400 mg/dL)
- Platelet Count: 260,000 /uL (Ref: 150,000 - 450,000 /uL)
- Multiplate Platelet Aggregometry: Normal Aggregation Response to ADP and Arachidonic Acid`,
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [labText, setLabText] = useState<string>(labPresets[0].text);
  const [panelCategory, setPanelCategory] = useState<string>(labPresets[0].category);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AILabInterpretationResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunScan = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/ai/lab-interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labReportText: labText,
          reportCategory: panelCategory,
        }),
      });

      if (!response.ok) throw new Error('Lab report parsing failed');
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setModelUsed(resJson.modelUsed || 'Gemini 3.1 Flash Lite');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing lab report');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL_ELIGIBLE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'REVIEW_RECOMMENDED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CRITICAL_INELIGIBLE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getMarkerBadge = (status: string) => {
    switch (status) {
      case 'normal':
      case 'negative_clear':
        return 'bg-emerald-100 text-emerald-800';
      case 'low':
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-blue-800/40">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Activity className="h-3.5 w-3.5 text-blue-300" />
            <span>DonorLab Scanner & Serology AI</span>
            <span className="text-blue-400/60">•</span>
            <span>Demystifying Clinical Numbers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Clinical Document & Lab Report Interpreter
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Paste diagnostic lab numbers or choose verified clinical templates. Our AI explains complex serology, CBC indices, HLA typing, and keratin health in clear, supportive language with donation suitability flags.
          </p>
        </div>
      </div>

      {/* Preset Selector & Text Editor */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Choose Diagnostic Lab Panel Preset:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {labPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  setLabText(preset.text);
                  setPanelCategory(preset.category);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                  selectedPresetIndex === idx
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs font-bold text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold">{preset.title}</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              Laboratory Document Text / Diagnostic Biomarkers:
            </span>
            <span className="text-slate-400 text-[11px]">
              You can edit or paste your own lab results freely
            </span>
          </div>
          <textarea
            rows={7}
            value={labText}
            onChange={e => setLabText(e.target.value)}
            className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600 transition leading-relaxed text-slate-800"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Translated against FDA, CLIA & AABB reference ranges</span>
          </span>

          <button
            onClick={handleRunScan}
            disabled={isLoading || !labText.trim()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Translating Biomarkers...' : 'Interpret Lab Report'}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 animate-pulse">
            <Activity className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Translating Clinical Biomarkers...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Synthesizing medical reference ranges, donor clearance criteria, and patient education advice.
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider inline-block ${getStatusColor(result.overallStatus)}`}>
                {result.overallStatus.replace('_', ' ')}
              </span>
              <h3 className="text-xl font-bold text-slate-900">{result.statusHeadline}</h3>
              <p className="text-xs text-slate-500 font-mono">Panel: {result.testPanelTitle}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 text-xs sm:max-w-sm">
              <span className="font-bold text-slate-900 block mb-1">Patient-Friendly Summary:</span>
              <p className="leading-relaxed text-[11px] text-slate-600">{result.patientFriendlySummary}</p>
            </div>
          </div>

          {/* Biomarkers Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Analyzed Biomarkers ({result.analyzedBiomarkers.length})
            </h4>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {result.analyzedBiomarkers.map((bm, i) => (
                <div key={i} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 sm:max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{bm.markerName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getMarkerBadge(bm.status)}`}>
                        {bm.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{bm.clinicalMeaning}</p>
                    <p className="text-[11px] text-teal-700 font-medium">Impact: {bm.donationImpact}</p>
                  </div>

                  <div className="flex items-center gap-6 sm:text-right shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Your Value</div>
                      <div className="font-mono font-bold text-slate-900">{bm.userValue}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Clinical Range</div>
                      <div className="font-mono text-slate-600">{bm.standardReferenceRange}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Questions */}
          {result.doctorConsultationQuestions?.length > 0 && (
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-blue-700" />
                <span>Recommended Questions to Ask Your Doctor or Coordinator</span>
              </div>
              <ul className="space-y-1.5 text-xs text-blue-950">
                {result.doctorConsultationQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retest Interval & Disclaimer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              <span>Recommended Retest: </span>
              <strong className="text-slate-800">{result.recommendedRetestInterval}</strong>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Model: {modelUsed}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-400 leading-relaxed border border-slate-200">
            {result.medicalDisclaimer}
          </div>
        </div>
      ) : null}
    </div>
  );
};
