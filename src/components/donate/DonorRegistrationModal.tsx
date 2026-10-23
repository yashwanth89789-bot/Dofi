import React, { useState } from 'react';
import { Droplet, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodComponent, BloodGroup } from '../../types';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: { value: BloodComponent; label: string }[] = [
  { value: 'whole_blood', label: 'Whole blood' },
  { value: 'platelets', label: 'Platelets' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'red_blood_cells', label: 'Red blood cells' },
];

const cleanDisplayLocation = (city?: string, state?: string): string => {
  if (!city || ['chicago', 'evanston', 'cicero', 'skokie', 'naperville'].includes(city.trim().toLowerCase())) {
    return 'Hyderabad, Telangana';
  }
  return `${city}${state ? `, ${state}` : ''}`;
};

export const DonorRegistrationModal: React.FC = () => {
  const { isRegisterDonorModalOpen, setIsRegisterDonorModalOpen, registerDonor, currentUser } = useApp();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [components, setComponents] = useState<BloodComponent[]>(['whole_blood']);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available_now' | 'available_24h' | 'on_call'>('available_now');
  const [privacySetting, setPrivacySetting] = useState<'hospital_mediated' | 'direct_authorized'>('hospital_mediated');
  const [accepted, setAccepted] = useState(false);

  if (!isRegisterDonorModalOpen) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!accepted || components.length === 0) return;
    registerDonor({
      categories: ['blood'],
      availabilityStatus,
      privacySetting,
      bloodDetails: { bloodGroup, components, rhFactor: bloodGroup.includes('-') ? '-' : '+' },
    });
    setIsRegisterDonorModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-teal-600 p-2 text-white"><Droplet className="h-5 w-5" /></div><div><h2 className="font-bold text-slate-900">Blood donor profile</h2><p className="text-xs text-slate-500">Only blood-donation coordination details are collected.</p></div></div>
          <button type="button" onClick={() => setIsRegisterDonorModalOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </header>
        <div className="space-y-5 p-6 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-800">Approximate location</p><p className="mt-1 text-sm text-slate-600">{cleanDisplayLocation(currentUser.city, currentUser.state)}</p><p className="mt-1 text-xs text-slate-500">Only approximate location is used for nearby-request coordination.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="font-medium text-slate-700">Blood group<select value={bloodGroup} onChange={event => setBloodGroup(event.target.value as BloodGroup)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5">{BLOOD_GROUPS.map(group => <option key={group}>{group}</option>)}</select></label><label className="font-medium text-slate-700">Availability<select value={availabilityStatus} onChange={event => setAvailabilityStatus(event.target.value as typeof availabilityStatus)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5"><option value="available_now">Available now</option><option value="available_24h">Available within 24 hours</option><option value="on_call">On call for emergencies</option></select></label></div>
          <fieldset><legend className="font-medium text-slate-700">Donation components</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{COMPONENTS.map(component => <label key={component.value} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3"><input type="checkbox" checked={components.includes(component.value)} onChange={() => setComponents(previous => previous.includes(component.value) ? previous.filter(item => item !== component.value) : [...previous, component.value])} />{component.label}</label>)}</div></fieldset>
          <label className="block font-medium text-slate-700">Contact preference<select value={privacySetting} onChange={event => setPrivacySetting(event.target.value as typeof privacySetting)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5"><option value="hospital_mediated">Hospital-mediated only</option><option value="direct_authorized">Direct contact by verified coordinators</option></select></label>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" />Potential matches only</p><p className="mt-1">Dofi does not make medical eligibility decisions. Final eligibility must be confirmed by the hospital.</p></div>
          <label className="flex gap-2 text-sm text-slate-700"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-0.5" />I understand that registration records availability only and does not confirm medical eligibility.</label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={() => setIsRegisterDonorModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button disabled={!accepted || components.length === 0} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Save blood donor profile</button></footer>
      </form>
    </div>
  );
};
