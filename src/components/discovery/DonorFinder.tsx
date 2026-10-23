import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Droplet,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';

const cleanLocation = (city?: string, state?: string): string => {
  if (!city || ['chicago', 'evanston', 'cicero', 'skokie', 'naperville'].includes(city.trim().toLowerCase())) {
    return 'Hyderabad, Telangana';
  }
  return `${city}${state ? `, ${state}` : ''}`;
};

export const DonorFinder: React.FC = () => {
  const {
    donors,
    setSelectedDonor,
    setIsRegisterDonorModalOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [targetProcedureDate, setTargetProcedureDate] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Filter blood donors
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      // Do not show Admin accounts unless that user explicitly has a valid donor registration/profile.
      // The current "Platform Compliance Officer (Admin)" must not appear as a donor.
      const isAdminOrCompliance =
        donor.userId === 'usr_admin_governance' ||
        donor.donorName.includes('Platform Compliance Officer') ||
        donor.donorName.includes('(Admin)') ||
        donor.email === 'compliance@donorconnect4care.org';

      if (isAdminOrCompliance) {
        return false;
      }

      // If an admin user registered as a donor, they must explicitly have a valid blood group & profile
      if (donor.email === 'mohammedayaan9683@gmail.com' || donor.email === 'yashwanth89789@gmail.com') {
        if (!donor.bloodDetails?.bloodGroup) {
          return false;
        }
      }

      // Must be a blood donor
      if (!donor.categories.includes('blood')) {
        return false;
      }

      // Keyword query (name or city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = donor.donorName.toLowerCase().includes(q);
        const displayLoc = cleanLocation(donor.city, donor.state).toLowerCase();
        const matchesCity = donor.city.toLowerCase().includes(q) || displayLoc.includes(q);
        const matchesBlood = donor.bloodDetails?.bloodGroup.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesBlood) {
          return false;
        }
      }

      // Blood group filter
      if (selectedBloodGroup !== 'all') {
        if (!donor.bloodDetails || donor.bloodDetails.bloodGroup !== selectedBloodGroup) {
          return false;
        }
      }

      // Availability filter
      if (availabilityFilter !== 'all') {
        if (availabilityFilter === 'has_scheduled_slot') {
          const hasAvailableSlot = donor.scheduledSlots && donor.scheduledSlots.some(s => s.status === 'available');
          if (!hasAvailableSlot) return false;
        } else if (donor.availabilityStatus !== availabilityFilter) {
          return false;
        }
      }

      // Target procedure date filter (exact match on scheduled availability)
      if (targetProcedureDate) {
        const matchesDate = donor.scheduledSlots?.some(
          s => s.status === 'available' && s.date === targetProcedureDate
        );
        if (!matchesDate) return false;
      }

      // Distance filter
      if (donor.distanceKm > maxDistance) {
        return false;
      }

      // Verified only
      if (verifiedOnly && !donor.isVerified) {
        return false;
      }

      return true;
    });
  }, [donors, searchQuery, selectedBloodGroup, availabilityFilter, targetProcedureDate, maxDistance, verifiedOnly]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Available Blood Donors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and connect with eligible blood donors by blood group, location, and availability
          </p>
        </div>

        <button
          onClick={() => setIsRegisterDonorModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer shadow-xs"
        >
          + Register as Blood Donor
        </button>
      </div>

      {/* Live Firestore Registry Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800">
        <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
        <span>
          <strong>Live Firestore Registry.</strong> Displaying blood donors registered in Firebase. Register to list your availability in real time.
        </span>
      </div>

      {/* Blood Group Quick Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          onClick={() => setSelectedBloodGroup('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedBloodGroup === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplet className="h-3.5 w-3.5 text-rose-600" />
          <span>All Blood Groups</span>
        </button>
        {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
          <button
            key={bg}
            onClick={() => setSelectedBloodGroup(bg)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedBloodGroup === bg
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search donor name, city, or blood group..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Blood group dropdown filter */}
          <div>
            <select
              value={selectedBloodGroup}
              onChange={e => setSelectedBloodGroup(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Blood Group (All)</option>
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                <option key={bg} value={bg}>
                  Type {bg} {bg === 'O-' ? '(Universal Donor)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Availability (All)</option>
              <option value="has_scheduled_slot">Has Scheduled Slots Ready</option>
              <option value="available_now">Available Immediately</option>
              <option value="available_24h">Available in 24 Hours</option>
              <option value="on_call">On-Call for Emergencies</option>
              <option value="cooldown">In Cooldown Window</option>
            </select>
          </div>

          {/* Target Procedure Date Filter */}
          <div className="relative">
            <Calendar className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="date"
              value={targetProcedureDate}
              onChange={e => setTargetProcedureDate(e.target.value)}
              title="Target Procedure Date Match"
              className="w-full text-xs pl-8 pr-2 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            />
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Max Distance:</span>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxDistance}
              onChange={e => setMaxDistance(Number(e.target.value))}
              className="accent-teal-600 h-1.5 w-28 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="font-mono font-semibold text-slate-700 min-w-[50px]">
              &le; {maxDistance} km
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
            />
            <span className="font-medium text-slate-700">Verified Donors Only</span>
          </label>

          <span className="font-mono text-slate-500 tabular-nums">
            Found {filteredDonors.length} matching blood donor profiles
          </span>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
            <Search className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No registered donors found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try widening your distance radius or changing the blood group filter.
            </p>
            <button
              onClick={() => {
                setSelectedBloodGroup('all');
                setAvailabilityFilter('all');
                setSearchQuery('');
                setTargetProcedureDate('');
                setMaxDistance(50);
                setVerifiedOnly(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDonors.map(donor => (
            <div
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
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
                      <h4 className="text-sm font-bold text-slate-900">
                        {donor.donorName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{cleanLocation(donor.city, donor.state)}</span>
                        <span>·</span>
                        <span className="font-mono text-emerald-700 font-semibold">{donor.distanceKm} km</span>
                      </div>
                    </div>
                  </div>

                  {donor.isVerified && (
                    <span className="p-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200" title="Clinically Verified">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {/* Blood Group Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700">
                    <Droplet className="h-3.5 w-3.5 text-rose-600" />
                    <span>Type {donor.bloodDetails?.bloodGroup || 'Blood'}</span>
                  </span>
                  {donor.bloodDetails?.bloodGroup === 'O-' && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      Universal Donor
                    </span>
                  )}
                </div>

                {/* Specific Blood Details */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                  {donor.bloodDetails && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Components:</span>
                      <span className="font-medium text-slate-800 capitalize">
                        {donor.bloodDetails.components.map(c => c.replace('_', ' ')).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Total Donations:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {donor.totalDonationsCount} completed
                    </span>
                  </div>

                  {/* Scheduled Slots */}
                  {donor.scheduledSlots && donor.scheduledSlots.length > 0 && (
                    <div className="flex items-center justify-between text-[11px] bg-teal-50 border border-teal-200/80 rounded-md px-2 py-1 text-teal-900 mt-2">
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3 text-teal-600 shrink-0" />
                        <span>{donor.scheduledSlots.length} Slot{donor.scheduledSlots.length > 1 ? 's' : ''} Ready</span>
                      </div>
                      <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded text-teal-800 font-bold border border-teal-200 shrink-0">
                        {donor.scheduledSlots[0].date}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="capitalize">{donor.availabilityStatus.replace('_', ' ')}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-teal-700 font-bold hover:text-teal-800 text-[11px]">
                  <span>Inspect Profile</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
