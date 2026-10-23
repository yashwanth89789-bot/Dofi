import React, { useState } from 'react';
import { Building2, Droplet, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BLOOD_COMPATIBILITY_MAP } from '../../data/mockData';
import { BloodComponent, BloodGroup, UrgencyLevel } from '../../types';

export const CreateRequestModal: React.FC = () => {
  const { isCreateRequestModalOpen, setIsCreateRequestModalOpen, createRequest, organizations, currentUser } = useApp();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [component, setComponent] = useState<BloodComponent>('whole_blood');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgent');
  const [requiredAt, setRequiredAt] = useState('');
  const [hospitalId, setHospitalId] = useState(organizations.find(item => !/(organ|bone|tissue|hair|cancer|oncology|transplant)/i.test(item.name))?.id || currentUser.organizationId || '');
  const [location, setLocation] = useState(`${currentUser.city || ''}${currentUser.state ? `, ${currentUser.state}` : ''}`);
  const [notes, setNotes] = useState('');

  if (!isCreateRequestModalOpen) return null;
  const bloodHospitals = organizations.filter(item => !/(organ|bone|tissue|hair|cancer|oncology|transplant)/i.test(item.name));
  const selectedHospital = bloodHospitals.find(item => item.id === hospitalId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const date = requiredAt ? new Date(requiredAt) : null;
    const hours = date ? Math.max(1, Math.ceil((date.getTime() - Date.now()) / 3600000)) : urgency === 'emergency' ? 6 : urgency === 'urgent' ? 24 : 72;
    const [city = currentUser.city || 'Location pending', state = currentUser.state || ''] = location.split(',').map(value => value.trim());
    createRequest({
      category: 'blood',
      title: `${urgency === 'emergency' ? 'Emergency' : 'Blood'} request — ${bloodGroup}`,
      patientAlias: 'Patient confidential',
      urgency,
      deadlineHoursRemaining: hours,
      deadlineDate: date ? date.toLocaleString() : `Within ${hours} hours`,
      unitsNeeded: Math.max(1, units),
      hospitalId: selectedHospital?.id || hospitalId || 'hospital_pending',
      hospitalName: selectedHospital?.name || currentUser.hospitalAffiliation || 'Hospital verification pending',
      city,
      state,
      medicalNotes: notes.trim() || 'Blood request submitted by hospital coordinator.',
      bloodRequirements: { targetBloodGroup: bloodGroup, compatibleBloodGroups: BLOOD_COMPATIBILITY_MAP[bloodGroup], component, isStatCrossmatchRequired: urgency === 'emergency' },
    });
    setIsCreateRequestModalOpen(false);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-teal-600 p-2 text-white"><Droplet className="h-5 w-5" /></div><div><h2 className="font-bold text-slate-900">Create Blood Request</h2><p className="text-xs text-slate-500">Blood donation coordination only.</p></div></div><button type="button" onClick={() => setIsCreateRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X /></button></header><div className="grid gap-4 p-6 text-sm sm:grid-cols-2"><label className="font-medium">Blood group<select value={bloodGroup} onChange={event => setBloodGroup(event.target.value as BloodGroup)} className="mt-1.5 w-full rounded-lg border p-2.5">{(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(group => <option key={group}>{group}</option>)}</select></label><label className="font-medium">Component<select value={component} onChange={event => setComponent(event.target.value as BloodComponent)} className="mt-1.5 w-full rounded-lg border p-2.5"><option value="whole_blood">Whole blood</option><option value="platelets">Platelets</option><option value="plasma">Plasma</option><option value="red_blood_cells">Red blood cells</option></select></label><label className="font-medium">Units required<input type="number" min="1" value={units} onChange={event => setUnits(Number(event.target.value))} className="mt-1.5 w-full rounded-lg border p-2.5" /></label><label className="font-medium">Urgency<select value={urgency} onChange={event => setUrgency(event.target.value as UrgencyLevel)} className="mt-1.5 w-full rounded-lg border p-2.5"><option value="emergency">Emergency</option><option value="urgent">Urgent</option><option value="standard">Standard</option></select></label><label className="font-medium">Required date / time<input type="datetime-local" value={requiredAt} onChange={event => setRequiredAt(event.target.value)} className="mt-1.5 w-full rounded-lg border p-2.5" /></label><label className="font-medium">Hospital<select value={hospitalId} onChange={event => setHospitalId(event.target.value)} className="mt-1.5 w-full rounded-lg border p-2.5">{bloodHospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}</select></label><label className="font-medium sm:col-span-2">Approximate location<input value={location} onChange={event => setLocation(event.target.value)} placeholder="City, State" className="mt-1.5 w-full rounded-lg border p-2.5" /></label><label className="font-medium sm:col-span-2">Non-sensitive additional information<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Do not include direct patient identifiers." className="mt-1.5 min-h-24 w-full rounded-lg border p-2.5" /></label><div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><ShieldCheck className="mr-1 inline h-4 w-4" />Potential donor matches only. Final eligibility must be confirmed by the hospital.</div></div><footer className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4"><button type="button" onClick={() => setIsCreateRequestModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">Cancel</button><button className="rounded-lg bg-teal-600 px-4 py-2 font-bold text-white">Create Blood Request</button></footer></form></div>;
};
