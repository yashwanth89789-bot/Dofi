/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, X, Lock, FileText, UserCheck, Stethoscope, AlertCircle, RefreshCw } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="privacy-notice-title" className="text-base font-bold text-slate-900">
                Dofi Privacy Notice
              </h2>
              <p className="text-[11px] text-slate-500">
                Transparency regarding personal data handling for blood donation coordination
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Privacy Notice"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          
          {/* Tagline / Standard note */}
          <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-900 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Designed with privacy and applicable data-protection principles in mind.</strong> Dofi is committed to protecting your personal information and handling your pre-screening answers responsibly.
            </div>
          </div>

          {/* Section 1: Information Collected */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>1. What Information Dofi Collects</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li><strong>Profile Information:</strong> Name, chosen display alias, and general city or region.</li>
              <li><strong>Blood Group:</strong> ABO and Rh blood group (e.g., O+, A-) for donation coordination.</li>
              <li><strong>Coordination Details:</strong> Voluntary donation availability status and past donation date.</li>
              <li><strong>Screening Form Inputs:</strong> Clinical parameters (age, weight, vitals, health screening answers) entered voluntarily to generate the preliminary screening report.</li>
              <li><strong>Authentication Data:</strong> Secure account identifier via Firebase Authentication.</li>
            </ul>
          </div>

          {/* Section 2: Why We Use It */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>2. Why Dofi Uses Your Information</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li><strong>Donor Coordination:</strong> Matching donors with active hospital and community blood requests.</li>
              <li><strong>Pre-Screening Decision Support:</strong> Evaluating basic donor eligibility parameters against standard blood-banking guidelines.</li>
              <li><strong>Platform Operations:</strong> Maintaining platform functionality, session state, and security audit logs.</li>
            </ul>
          </div>

          {/* Section 3: Who May See Donor Information */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-teal-600" />
              <span>3. Who May See Your Information &amp; Privacy Protection</span>
            </h3>
            <p>
              Dofi exposes only the information strictly necessary for blood donation coordination.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
              <strong>Direct Contact Protection:</strong> Dofi does not expose donor phone numbers, email addresses, or precise residential addresses to hospitals or other users through donor responses unless an explicitly authorized workflow is initiated by you.
            </div>
          </div>

          {/* Section 4: Medical Screening Limitation */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
              <span>4. Medical Screening Limitations</span>
            </h3>
            <p>
              The AI screening assessment in Dofi is strictly preliminary educational decision-support. It does <strong>not</strong> substitute for certified in-person medical evaluation, vital signs check, or hemoglobin confirmation performed by qualified blood-centre staff.
            </p>
          </div>

          {/* Section 5: Consent & Withdrawal */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
              <span>5. Consent &amp; Withdrawal of Consent</span>
            </h3>
            <p>
              Where processing is based on your consent, you have the right to withdraw your consent at any time, subject to applicable law and technical account retention requirements. You may clear your session data or discontinue use of the tool at your discretion.
            </p>
          </div>

          {/* Section 6: Data Security */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>6. Data Security</span>
            </h3>
            <p>
              Dofi applies modern security measures, including Google Firebase authentication, encrypted HTTPS transport, and role-based data access rules. While we implement robust safeguards to protect your data, no internet transmission or electronic storage method can guarantee absolute security.
            </p>
          </div>

          {/* Section 7: Contact Information */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-teal-600" />
              <span>7. Contact &amp; Questions</span>
            </h3>
            <p>
              If you have any questions about this Privacy Notice or your personal data handling on Dofi, please contact the platform coordination team via your donor account dashboard or in-app support channels.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-500 italic">
            Privacy information is provided for transparency and does not constitute legal advice.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs transition cursor-pointer self-end sm:self-auto"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
