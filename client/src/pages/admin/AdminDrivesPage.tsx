import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api } from '../../lib/api';
import { Button, StatusBadge } from '../../components/ui';
import { PlusCircle, Loader2 } from 'lucide-react';

export function AdminDrivesPage() {
  const store = useCampusStore();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchDrives() {
      try {
        setLoading(true);
        const res = await api.admin.getDrives();
        if (mounted && res?.drives) {
          setDrives(res.drives);
        }
      } catch (err) {
        console.warn('Backend admin drives unavailable, falling back to local store', err);
        if (mounted && store.drives) {
          setDrives(store.drives);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDrives();
    return () => {
      mounted = false;
    };
  }, []);

  const driveList = drives.length > 0 ? drives : store.drives;

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
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2 border border-[#E4E4E1] bg-white">
          <Loader2 className="animate-spin text-[#111111]" size={18} />
          <span>Loading placement recruitment drives...</span>
        </div>
      ) : driveList.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#858585] border border-[#E4E4E1] bg-white">
          No placement drives scheduled yet. Click &quot;Create Placement Drive&quot; to initiate a consortium drive.
        </div>
      ) : (
        <div className="space-y-6">
          {driveList.map(drive => {
            const id = drive.id;
            const name = drive.name;
            const companies = Array.isArray(drive.companies) ? drive.companies : [];
            const regDeadline = drive.registration_deadline || drive.registrationDeadline || 'TBD';
            const startDate = drive.event_start_date || drive.eventStartDate || 'TBD';
            const endDate = drive.event_end_date || drive.eventEndDate || 'TBD';
            const branches = Array.isArray(drive.eligible_branches || drive.eligibleBranches)
              ? (drive.eligible_branches || drive.eligibleBranches)
              : ['All Engineering & Computing'];
            const minCgpa = drive.min_cgpa ?? drive.minCgpa ?? 7.0;
            const rounds = Array.isArray(drive.rounds) ? drive.rounds : ['Technical Assessment', 'HR'];
            const status = drive.status || 'Active';

            const formatDt = (d: string) => (typeof d === 'string' && d.includes('T') ? d.split('T')[0] : d);

            return (
              <div
                key={id}
                className="border border-[#222222] bg-white p-6 sm:p-8 space-y-5 rounded-[2px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E4E4E1] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                      DRIVE REFERENCE: {id.slice(0, 12)}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mt-0.5">
                      {name}
                    </h2>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {drive.description && (
                  <p className="text-sm text-[#444444] leading-relaxed">
                    {drive.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs bg-[#FAFAF9] p-4 border border-[#E4E4E1]">
                  <div>
                    <span className="text-[#858585] block text-[10px]">PARTICIPATING EMPLOYERS</span>
                    <strong className="text-[#111111]">{companies.join(', ')}</strong>
                  </div>
                  <div>
                    <span className="text-[#858585] block text-[10px]">REGISTRATION DEADLINE</span>
                    <strong className="text-[#111111]">{formatDt(regDeadline)}</strong>
                  </div>
                  <div>
                    <span className="text-[#858585] block text-[10px]">EVENT WINDOW</span>
                    <strong className="text-[#111111]">{formatDt(startDate)} to {formatDt(endDate)}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-1">
                  <div className="text-[#666666]">
                    Eligible: {branches.join(', ')} • Min CGPA: {typeof minCgpa === 'number' ? minCgpa.toFixed(2) : minCgpa}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#858585]">{rounds.length} Assessment Rounds</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
