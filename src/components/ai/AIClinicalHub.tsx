import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Heart,
  Activity,
  ArrowRight,
  Zap,
  Award,
  Layers,
  CheckCircle2,
  Dna,
  Eye,
  Globe2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BioMatchMLView } from './BioMatchMLView';
import { AIVisionLabView } from './AIVisionLabView';
import { AIOncologyTrialView } from './AIOncologyTrialView';
import { AIEligibilityView } from './AIEligibilityView';
import { AIEmergencyDispatchView } from './AIEmergencyDispatchView';
import { AILabScannerView } from './AILabScannerView';
import { AIGratitudeLetterView } from './AIGratitudeLetterView';

export const AIClinicalHub: React.FC = () => {
  const { aiActiveModule, setAiActiveModule, requests, donors } = useApp();

  const modules = [
    {
      id: 'biomatch_ml',
      label: 'BioMatch ML™ Prognostics',
      subtitle: 'Survival & GvHD XAI Simulator',
      icon: Dna,
      badge: 'ML Ensemble v4.2',
      color: 'teal',
      isNew: true,
    },
    {
      id: 'vision_lab',
      label: 'VisionLab™ Biometrics',
      subtitle: 'Specimen Optical Inspection',
      icon: Eye,
      badge: 'Computer Vision',
      color: 'indigo',
      isNew: true,
    },
    {
      id: 'oncology_trials',
      label: 'Global Cancer Trials',
      subtitle: 'Precision Oncology Protocol Match',
      icon: Globe2,
      badge: 'World Centers',
      color: 'blue',
      isNew: true,
    },
    {
      id: 'screener',
      label: 'Eligibility Triage Assistant',
      subtitle: 'Donor Pre-Screening Prototype',
      icon: ShieldCheck,
      badge: 'AI Demo',
      color: 'emerald',
    },
    {
      id: 'dispatch',
      label: 'Emergency Dispatch Assist',
      subtitle: 'Routing Logistics Prototype',
      icon: AlertOctagon,
      badge: 'AI Demo',
      color: 'rose',
    },
    {
      id: 'lab',
      label: 'Lab Report Interpreter',
      subtitle: 'Plain Language Translation',
      icon: Activity,
      badge: 'AI Demo',
      color: 'blue',
    },
    {
      id: 'gratitude',
      label: 'Gratitude Letter Crafter',
      subtitle: 'Anonymized Correspondence',
      icon: Heart,
      badge: 'AI Demo',
      color: 'amber',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Platform Level AI Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-6 px-2.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold inline-flex items-center gap-1.5 border border-indigo-200">
              <BrainCircuit className="h-3 w-3 text-indigo-600 animate-spin" />
              <span>AI-Assisted Decision Support — Prototype</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              8 AI Demonstration Modules
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dofi AI Suite
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Google Gemini-powered decision-support tools for donation coordination. All AI outputs are demonstration results requiring qualified clinical review. Not a certified medical system.
          </p>
        </div>

        {/* Quick Metrics Bar */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-white p-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="px-3 py-1 border-r border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Sample Requests</span>
            <span className="font-mono font-bold text-slate-900">{requests.length} Demo Files</span>
          </div>
          <div className="px-3 py-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Sample Donors</span>
            <span className="font-mono font-bold text-teal-700">{donors.length} Demo Profiles</span>
          </div>
        </div>
      </div>

      {/* 8-Module Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {modules.map(mod => {
          const Icon = mod.icon;
          const isActive = aiActiveModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setAiActiveModule(mod.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 ${
                isActive
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-600/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />
              )}
              <div className="flex items-start justify-between w-full">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  {mod.isNew && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500 text-slate-950">
                      AI/ML
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {mod.badge}
                  </span>
                </div>
              </div>

              <div>
                <div className={`font-bold text-xs truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {mod.label}
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                  {mod.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module View */}
      <div className="transition-all">
        {aiActiveModule === 'biomatch_ml' && <BioMatchMLView />}
        {aiActiveModule === 'vision_lab' && <AIVisionLabView />}
        {aiActiveModule === 'oncology_trials' && <AIOncologyTrialView />}
        {aiActiveModule === 'screener' && <AIEligibilityView />}
        {aiActiveModule === 'dispatch' && <AIEmergencyDispatchView />}
        {aiActiveModule === 'lab' && <AILabScannerView />}
        {aiActiveModule === 'gratitude' && <AIGratitudeLetterView />}
      </div>
    </div>
  );
};

