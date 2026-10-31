import React from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge } from '../../components/ui';
import { PlusCircle, CalendarCheck2, Building, Calendar, Users } from 'lucide-react';

export function AdminDrivesPage() {
  const { navigate } = useRouter();
  const { drives } = useCampusStore();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            CONSORTIUM COORDINATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Placement Recruitment Drives
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Administer multi-employer on-campus and virtual recruitment initiatives for academic year 2026–2027.
          </p>
        </div>

        <Link to="/admin/drives/new">
          <Button variant="primary" size="md" icon={<PlusCircle size={15} />}>
            Create Placement Drive
          </Button>
        </Link>
      </div>

      {/* Drives Grid */}
      <div className="space-y-6">
        {drives.map(drive => (
          <div
            key={drive.id}
            className="border border-[#222222] bg-white p-6 sm:p-8 space-y-5 rounded-[2px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E4E4E1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                  DRIVE REFERENCE: {drive.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mt-0.5">
                  {drive.name}
                </h2>
              </div>
              <StatusBadge status={drive.status} />
            </div>

            {drive.description && (
              <p className="text-sm text-[#444444] leading-relaxed">
                {drive.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs bg-[#FAFAF9] p-4 border border-[#E4E4E1]">
              <div>
                <span className="text-[#858585] block text-[10px]">PARTICIPATING EMPLOYERS</span>
                <strong className="text-[#111111]">{drive.companies.join(', ')}</strong>
              </div>
              <div>
                <span className="text-[#858585] block text-[10px]">REGISTRATION DEADLINE</span>
                <strong className="text-[#111111]">{drive.registrationDeadline}</strong>
              </div>
              <div>
                <span className="text-[#858585] block text-[10px]">EVENT WINDOW</span>
                <strong className="text-[#111111]">{drive.eventStartDate} to {drive.eventEndDate}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-1">
              <div className="text-[#666666]">
                Eligible: {drive.eligibleBranches.join(', ')} • Min CGPA: {drive.minCgpa.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">{drive.rounds.length} Assessment Rounds</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
