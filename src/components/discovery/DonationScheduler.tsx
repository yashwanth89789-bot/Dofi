import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Sparkles,
  Droplet,
  Heart,
  Bone,
  Scissors,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';
import { DonorProfile, DonationCategory, ScheduledSlot } from '../../types';
import { useApp } from '../../context/AppContext';

interface DonationSchedulerProps {
  donor: DonorProfile;
}

export const DonationScheduler: React.FC<DonationSchedulerProps> = ({ donor }) => {
  const { addDonorScheduledSlot, removeDonorScheduledSlot, organizations, currentUser } = useApp();

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);

  // Form state
  // Default to 2 days ahead
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [slotDate, setSlotDate] = useState(defaultDateStr);
  const [timePreset, setTimePreset] = useState<'morning' | 'afternoon' | 'evening' | 'custom'>('morning');
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('12:00');
  const [procedureType, setProcedureType] = useState<DonationCategory>(donor.categories[0] || 'blood');
  const [hospitalPreference, setHospitalPreference] = useState(organizations[0]?.name || 'Hyderabad Blood Centre & Transfusion Hospital');
  const [notes, setNotes] = useState('');
  const [justAddedToast, setJustAddedToast] = useState(false);

  const categoryIcons: Record<DonationCategory, React.ReactNode> = {
    blood: <Droplet className="h-3.5 w-3.5 text-rose-600" />,
    organ: <Heart className="h-3.5 w-3.5 text-teal-600" />,
    bone_tissue: <Bone className="h-3.5 w-3.5 text-indigo-600" />,
    hair: <Scissors className="h-3.5 w-3.5 text-amber-600" />
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();

    let start = '08:30';
    let end = '11:30';

    if (timePreset === 'afternoon') {
      start = '13:00';
      end = '16:00';
    } else if (timePreset === 'evening') {
      start = '17:00';
      end = '20:00';
    } else if (timePreset === 'custom') {
      start = customStartTime;
      end = customEndTime;
    }

    addDonorScheduledSlot(donor.id, {
      date: slotDate,
      startTime: start,
      endTime: end,
      procedureType,
      hospitalPreference,
      notes: notes.trim() || undefined,
      status: 'available'
    });

    setNotes('');
    setIsAddingSlot(false);
    setJustAddedToast(true);
    setTimeout(() => setJustAddedToast(false), 3000);
  };

  const handleBookSlot = (slotId: string) => {
    setBookedSlotId(slotId);
    setTimeout(() => {
      setBookedSlotId(null);
    }, 3000);
  };

  const scheduledSlots = donor.scheduledSlots || [];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
            <Calendar className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Donation Procedure Scheduler</span>
              <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {scheduledSlots.length} Slots Available
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Future availability for clinical matching and hospital triage appointments
            </p>
          </div>
        </div>

        {!isAddingSlot && (
          <button
            type="button"
            onClick={() => setIsAddingSlot(true)}
            className="px-3 py-1.5 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Available Time</span>
          </button>
        )}
      </div>

      {/* Confirmation notification banner */}
      {justAddedToast && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>New availability slot saved! Integrated into real-time clinical matching engine.</span>
        </div>
      )}

      {/* Form: Add New Slot */}
      {isAddingSlot && (
        <form onSubmit={handleCreateSlot} className="p-3.5 bg-white border border-teal-200 rounded-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>Add Future Availability Window</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingSlot(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Procedure Date
              </label>
              <input
                type="date"
                required
                value={slotDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSlotDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Procedure Category
              </label>
              <select
                value={procedureType}
                onChange={e => setProcedureType(e.target.value as DonationCategory)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white capitalize"
              >
                {donor.categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')} Donation
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Time Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {[
                { id: 'morning', label: 'Morning (08:30 - 11:30)' },
                { id: 'afternoon', label: 'Afternoon (13:00 - 16:00)' },
                { id: 'evening', label: 'Evening (17:00 - 20:00)' },
                { id: 'custom', label: 'Custom Time' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTimePreset(preset.id as any)}
                  className={`p-1.5 text-[10px] font-semibold rounded-md border text-center transition-colors ${
                    timePreset === preset.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {timePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">Start Time</span>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={e => setCustomStartTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">End Time</span>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={e => setCustomEndTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Preferred Hospital / Clinical Center
            </label>
            <select
              value={hospitalPreference}
              onChange={e => setHospitalPreference(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.name}>
                  {org.name} ({org.city})
                </option>
              ))}
              <option value="Any Verified Accredited Facility">
                Any Verified Regional Hospital / Blood Bank
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Availability Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Fasting ready, available for emergency recall, near Downtown"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddingSlot(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              Save Scheduled Availability
            </button>
          </div>
        </form>
      )}

      {/* Slots List */}
      <div className="space-y-2">
        {scheduledSlots.length === 0 ? (
          <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300 text-center space-y-1">
            <Calendar className="h-5 w-5 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-600">
              No future procedure slots scheduled yet
            </p>
            <p className="text-[11px] text-slate-400">
              Scheduling available dates increases compatibility matching index by +15 points!
            </p>
          </div>
        ) : (
          scheduledSlots.map(slot => (
            <div
              key={slot.id}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="p-1 rounded bg-slate-50 border border-slate-200">
                    {categoryIcons[slot.procedureType]}
                  </span>
                  <span className="font-bold text-slate-900 capitalize">
                    {slot.procedureType.replace('_', ' ')}
                  </span>
                  <span>·</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {new Date(slot.date + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-600 text-[11px] flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {slot.hospitalPreference || 'Regional Center'}
                  </span>
                  {slot.notes && (
                    <>
                      <span>·</span>
                      <span className="italic text-slate-600">"{slot.notes}"</span>
                    </>
                  )}
                </div>
              </div>

              {/* Slot Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {bookedSlotId === slot.id ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Slot Requested!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBookSlot(slot.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors"
                  >
                    Request Slot
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeDonorScheduledSlot(donor.id, slot.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove this slot"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
