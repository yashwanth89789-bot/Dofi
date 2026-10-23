import React from 'react';
import {
  Droplet,
  Building2,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CirculatorySystem } from './CirculatorySystem';

const STEPS = [
  {
    number: '01',
    title: 'Hospital Creates Request',
    description: 'A verified hospital creates an urgent blood request with the required blood group, units, and deadline.',
    icon: Building2,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  },
  {
    number: '02',
    title: 'Dofi Finds Donors',
    description: 'Dofi identifies potential compatible donors nearby based on blood group, availability and location.',
    icon: Users,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200'
  },
  {
    number: '03',
    title: 'Donor Responds',
    description: 'Potential donor matches receive the request and can choose whether to respond.',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  {
    number: '04',
    title: 'Hospital Coordinates Fulfillment',
    description: 'The hospital confirms final eligibility, coordinates donation, and marks the request fulfilled.',
    icon: HeartHandshake,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  }
];

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

// Demo urgent requests for the landing page — clearly labelled
const DEMO_REQUESTS = [
  {
    id: 'demo-1',
    bloodGroup: 'O−',
    units: 2,
    hospital: 'Demo Hospital 01 · Hyderabad',
    urgency: 'Emergency',
    hoursLeft: 4,
    urgencyColor: 'bg-rose-500'
  },
  {
    id: 'demo-2',
    bloodGroup: 'B+',
    units: 3,
    hospital: 'Demo Hospital 02 · Secunderabad',
    urgency: 'Urgent',
    hoursLeft: 12,
    urgencyColor: 'bg-amber-500'
  },
  {
    id: 'demo-3',
    bloodGroup: 'A+',
    units: 1,
    hospital: 'Demo Hospital 03 · Gachibowli',
    urgency: 'Standard',
    hoursLeft: 48,
    urgencyColor: 'bg-teal-500'
  }
];

export const LandingPage: React.FC = () => {
  const { loginWithGoogle, isFirebaseLoading } = useApp();

  return (
    <div className="min-h-screen bg-white flex flex-col relative">

      {/* Circulatory System — Background vascular animation */}
      <CirculatorySystem />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">Dofi</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Blood Donation Coordination Platform</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#find-blood" className="hover:text-slate-900 transition-colors">Find Blood</a>
              <a href="#become-donor" className="hover:text-slate-900 transition-colors">Become a Donor</a>
              <a href="#hospital-portal" className="hover:text-slate-900 transition-colors">Hospital Portal</a>
            </nav>

            {/* Sign In */}
            <button
              onClick={() => loginWithGoogle()}
              disabled={isFirebaseLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isFirebaseLoading ? (
                <div className="h-4 w-4 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isFirebaseLoading ? 'Signing in…' : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-20 pb-24 px-4">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">

          {/* Urgent signal */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>Blood Donation Coordination Platform · India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            <span className="block text-teal-400 text-2xl sm:text-3xl lg:text-4xl mb-3">Dofi</span>
            <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-slate-200 mb-3">Blood Donation Coordination Platform</span>
            Every Blood Request. <span className="text-teal-400">The Right Donor.</span> In Time.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect verified hospitals with potential nearby blood donors and coordinate urgent blood requirements safely and efficiently.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="become-donor"
              onClick={() => loginWithGoogle('donor')}
              disabled={isFirebaseLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Become a Donor
            </button>
            <button
              id="hospital-portal"
              onClick={() => loginWithGoogle('hospital')}
              disabled={isFirebaseLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Building2 className="h-4 w-4" />
              Hospital Portal
            </button>
            <button
              id="find-blood"
              onClick={() => loginWithGoogle('donor')}
              disabled={isFirebaseLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Droplet className="h-4 w-4" />
              Find Blood
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              Firebase-backed authentication
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-400" />
              Potential-match coordination
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              Real-time request tracking
            </span>
          </div>
        </div>
      </section>

      {/* ── Live Emergency Requests (Demo) ── */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 px-4">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Blood Requests</h2>
              <p className="text-xs text-amber-600 font-medium mt-0.5">⚠ Demonstration data — sign in to see live requests</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Demo Preview</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_REQUESTS.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loginWithGoogle('donor')}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${req.urgencyColor}`}>
                    {req.urgency}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {req.hoursLeft}h left
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-rose-100 border-2 border-rose-200 flex items-center justify-center">
                    <span className="text-base font-black text-rose-700">{req.bloodGroup}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{req.units} unit{req.units !== 1 ? 's' : ''} needed</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {req.hospital}
                    </div>
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); loginWithGoogle(); }}
                  className="w-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  Sign in to respond <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 px-4 bg-white">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">How Dofi Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A simple, transparent four-step process connecting hospitals with potential blood donors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className={`rounded-2xl border ${step.border} ${step.bg} p-6 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-black ${step.color} opacity-30`}>{step.number}</span>
                    <div className={`h-10 w-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Blood Group Section ── */}
      <section className="bg-slate-900 py-12 px-4">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">All Blood Groups Supported</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to find requests matching your blood group or post a requirement for any blood type.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => loginWithGoogle('donor')}
                className="h-14 w-14 rounded-xl bg-slate-800 hover:bg-teal-900 border border-slate-700 hover:border-teal-500 text-white font-black text-base transition-all cursor-pointer"
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role CTA section ── */}
      <section className="py-16 px-4 bg-white">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Join the Platform</h2>
            <p className="text-slate-500">Sign in with Google to access your role-specific dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Donor card */}
            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-6 space-y-4 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-1">Donor</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Register as a blood donor. See potential compatible requests near you and respond to hospitals in need.
                </p>
              </div>
              <button
                onClick={() => loginWithGoogle('donor')}
                disabled={isFirebaseLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Register as Donor
              </button>
            </div>

            {/* Hospital card */}
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-6 space-y-4 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-sky-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-1">Hospital</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Post urgent blood requirements for verified healthcare facilities and coordinate with potential nearby donors.
                </p>
              </div>
              <button
                onClick={() => loginWithGoogle('hospital')}
                disabled={isFirebaseLoading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Hospital Portal
              </button>
            </div>

            {/* User card */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 space-y-4 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-1">User</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Explore urgent blood requirements, connect with verified facilities, and support community donation drives.
                </p>
              </div>
              <button
                onClick={() => loginWithGoogle('user')}
                disabled={isFirebaseLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Sign In as User
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem / Value Prop ── */}
      <section className="bg-slate-50 border-t border-slate-200 py-14 px-4">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" />
                The Problem
              </div>
              <h2 className="text-2xl font-black text-slate-900">Blood emergencies are time-sensitive.</h2>
              <p className="text-slate-600 leading-relaxed">
                Hospitals often need potential donors within hours. Donors rarely know where their blood group is urgently needed nearby. Existing systems are slow, paper-based, or disconnected.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Dofi bridges this gap — connecting verified hospital blood requests with potential compatible donors, transparently and quickly.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Building2, text: 'Hospital creates a verified blood request with urgency, blood group, and deadline', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
                { icon: Users, text: 'Dofi identifies potential compatible donors by blood group, location, and availability', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
                { icon: CheckCircle2, text: 'Donor responds and the hospital coordinates the donation safely', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${item.border} ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color} mt-0.5 shrink-0`} />
                    <p className="text-sm text-slate-700">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety Disclaimer ── */}
      <section className="bg-amber-50 border-t border-amber-200 py-5 px-4">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="text-xs text-amber-700">
            <strong>Potential matches only:</strong> Dofi does not make medical eligibility decisions. Final donor eligibility and donation suitability must be confirmed by the hospital.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="h-6 w-6 rounded bg-teal-500 flex items-center justify-center text-slate-950 text-xs font-black">DF</div>
            <span>Dofi</span>
          </div>
          <p className="text-center">
            Dofi — Blood Donation Coordination Platform connecting potential donors with verified blood requests and hospitals.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
            <span>Non-Commercial Prototype · {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
