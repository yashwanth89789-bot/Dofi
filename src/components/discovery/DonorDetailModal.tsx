import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Mail,
  Heart,
  Droplet,
  Bone,
  Scissors,
  Lock,
  Flag,
  X,
  CheckCircle2,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { DonorProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { DonationScheduler } from './DonationScheduler';

const cleanLocation = (city?: string, state?: string): string => {
  if (!city || ['chicago', 'evanston', 'cicero', 'skokie', 'naperville'].includes(city.trim().toLowerCase())) {
    return 'Hyderabad, Telangana';
  }
  return `${city}${state ? `, ${state}` : ''}`;
};

interface DonorDetailModalProps {
  donor: DonorProfile | null;
  onClose: () => void;
}

export const DonorDetailModal: React.FC<DonorDetailModalProps> = ({ donor, onClose }) => {
  const { setReportingTarget, setIsReportModalOpen, currentUser } = useApp();
  const [connectMessageSent, setConnectMessageSent] = useState(false);

  if (!donor) return null;

  const handleReport = () => {
    setReportingTarget({
      id: donor.id,
      name: donor.donorName,
      type: 'donor'
    });
    setIsReportModalOpen(true);
  };

  const handleInitiateReferral = () => {
    setConnectMessageSent(true);
    setTimeout(() => setConnectMessageSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-xs flex items-center justify-center text-slate-500 font-bold text-lg">
              {donor.avatarUrl ? (
                <img
                  src={donor.avatarUrl}
                  alt={donor.donorName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                donor.donorName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{donor.donorName}</h3>
                {donor.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Donor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>{cleanLocation(donor.city, donor.state)}</span>
                <span>·</span>
                <span className="font-mono text-emerald-700 font-medium">{donor.distanceKm} km away</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Availability and Stats Ribbon */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Availability</span>
              <span className="text-xs font-bold text-slate-900 capitalize">
                {donor.availabilityStatus.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Total Donations</span>
              <span className="text-xs font-bold text-teal-700 tabular-nums">
                {donor.totalDonationsCount} Lifesaving Acts
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Last Contribution</span>
              <span className="text-xs font-bold text-slate-700">
                {donor.lastDonationDate || 'Recently Cleared'}
              </span>
            </div>
          </div>

          {/* Verification Badge Details */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-center gap-2.5 text-amber-900">
            <FileCheck2 className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-[11px] text-amber-800">Sample Donor Status (Demo Data)</div>
              <div className="text-[11px] text-amber-700">{donor.verificationBadge}</div>
            </div>
          </div>

          {/* Category Specific Sections */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Category Clearances & Specifications
            </h4>

            {donor.bloodDetails && (
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                    <Droplet className="h-4 w-4 text-rose-600" />
                    <span>Blood Banking Clearance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-bold text-xs">
                    {donor.bloodDetails.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Components Cleared:</span>{' '}
                    <span className="font-medium text-slate-800 capitalize">
                      {donor.bloodDetails.components.map(c => c.replace('_', ' ')).join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Hemoglobin:</span>{' '}
                    <span className="font-medium text-slate-800 font-mono">
                      {donor.bloodDetails.hemoglobinLevel || '14.5 g/dL'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Donation Procedure Scheduler Feature */}
          <DonationScheduler donor={donor} />

          {/* Privacy & Mediation Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-slate-500">
            <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-700">Patient Privacy Protection:</span>{' '}
              This donor uses <strong className="text-slate-800 capitalize">{donor.privacySetting.replace('_', ' ')}</strong> mode. Phone number and full address remain protected until an authorized hospital coordinator approves the clinical donation contact.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReport}
            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Report Concern</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              Close
            </button>

            {connectMessageSent ? (
              <span className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                <span>Referral Request Dispatched!</span>
              </span>
            ) : (
              <button
                onClick={handleInitiateReferral}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Initiate Hospital Coordination</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
