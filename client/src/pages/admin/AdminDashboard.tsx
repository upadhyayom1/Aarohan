import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge, MetricSummary } from '../../components/ui';
import api from '../../lib/api';
import {
  GraduationCap,
  Briefcase,
  Building2,
  CalendarCheck2,
  ShieldCheck,
  PlusCircle,
  BarChart3,
  Loader2,
} from 'lucide-react';

export function AdminDashboard() {
  const { navigate } = useRouter();
  const { currentUser } = useCampusStore();

  const [stats, setStats] = useState<{
    total_students: number;
    students_placed: number;
    total_jobs: number;
    open_jobs: number;
    total_applications: number;
    shortlisted: number;
    interviews_scheduled: number;
  } | null>(null);

  const [recruitersCount, setRecruitersCount] = useState<number>(0);
  const [drives, setDrives] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }
    Promise.all([
      api.admin.getStats().catch((err) => {
        console.warn('Failed to load admin stats:', err);
        return null;
      }),
      api.admin.getRecruiters().catch((err) => {
        console.warn('Failed to load recruiters:', err);
        return null;
      }),
      api.admin.getDrives().catch((err) => {
        console.warn('Failed to load drives:', err);
        return null;
      }),
      api.admin.getAuditLogs({ limit: 5 }).catch((err) => {
        console.warn('Failed to load audit logs:', err);
        return null;
      }),
    ]).then(([statsRes, recruitersRes, drivesRes, logsRes]) => {
      if (!isMounted) return;
      if (statsRes) setStats(statsRes);
      if (recruitersRes?.total !== undefined) setRecruitersCount(recruitersRes.total);
      if (drivesRes?.drives) setDrives(drivesRes.drives);
      if (logsRes?.logs) setAuditLogs(logsRes.logs);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeDrives = drives.filter(d => (d.status || '').toLowerCase() === 'active');

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
              DIRECTORATE OF CAREER ADVANCEMENT & CORPORATE RELATIONS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Placement Directorate Desk
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Live institutional governance console for placement drives, partner recruiters, and student outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/drives/new">
            <Button variant="primary" size="md" icon={<PlusCircle size={15} />}>
              Create Placement Drive
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2 border border-[#E4E4E1] bg-white">
          <Loader2 className="animate-spin text-[#111111]" size={20} />
          <span>Synchronizing with Directorate backend services...</span>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              <MetricSummary
                label="Registered Students"
                value={stats?.total_students ?? 0}
                sublabel="Active student profiles"
              />
              <MetricSummary
                label="Recruiters"
                value={recruitersCount}
                sublabel="Approved partner recruiters"
              />
              <MetricSummary
                label="Active Vacancies"
                value={stats?.open_jobs ?? 0}
                sublabel="Open corporate listings"
              />
              <MetricSummary
                label="Total Applications"
                value={stats?.total_applications ?? 0}
                sublabel="Candidate submissions"
              />
              <MetricSummary
                label="Interviews Booked"
                value={stats?.interviews_scheduled ?? 0}
                sublabel="Scheduled rounds"
              />
              <MetricSummary
                label="Placement Offers"
                value={stats?.students_placed ?? 0}
                sublabel="Confirmed selections"
              />
            </div>
          </div>

          {/* Quick Administrative Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <Link
              to="/admin/drives"
              className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">Placement Drives</span>
                <CalendarCheck2 size={15} className="text-[#858585]" />
              </div>
              <span className="text-[#666666] text-[11px] block">
                {drives.length} drives registered ({activeDrives.length} active)
              </span>
            </Link>

            <Link
              to="/admin/students"
              className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">Student Roster</span>
                <GraduationCap size={15} className="text-[#858585]" />
              </div>
              <span className="text-[#666666] text-[11px] block">
                {stats?.total_students ?? 0} registered candidates
              </span>
            </Link>

            <Link
              to="/admin/analytics"
              className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">Placement Analytics</span>
                <BarChart3 size={15} className="text-[#858585]" />
              </div>
              <span className="text-[#666666] text-[11px] block">Branch & hiring funnel</span>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">Audit Registry</span>
                <ShieldCheck size={15} className="text-[#858585]" />
              </div>
              <span className="text-[#666666] text-[11px] block">
                {auditLogs.length} recent system events
              </span>
            </Link>
          </div>

          {/* Two Column: Active Drives & Recent Audit Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Active Placement Drives */}
            <div className="lg:col-span-7 border border-[#E4E4E1] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                    RECRUITMENT CONSORTIA
                  </span>
                  <h2 className="text-base font-bold text-[#111111]">
                    Active Campus Placement Drives
                  </h2>
                </div>
                <Link to="/admin/drives" className="text-xs font-mono font-bold text-[#111111] hover:underline">
                  All Drives →
                </Link>
              </div>

              {drives.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#858585]">
                  No placement drives currently registered in backend database.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {drives.map(drive => {
                    const companies = Array.isArray(drive.companies) ? drive.companies : [];
                    const regDeadline = drive.registration_deadline || drive.registrationDeadline || 'TBD';
                    const minCgpa = drive.min_cgpa ?? drive.minCgpa ?? 0;
                    const formatDt = (d: string) => (typeof d === 'string' && d.includes('T') ? d.split('T')[0] : d);

                    return (
                      <div key={drive.id} className="p-4 border border-[#E4E4E1] bg-[#FAFAF9] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#111111]">{drive.name}</h3>
                          <StatusBadge status={drive.status || 'Active'} />
                        </div>
                        <div className="text-[11px] text-[#666666]">
                          Participating: {companies.length > 0 ? companies.join(', ') : 'Direct Consortium'}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#858585] pt-1 border-t border-[#E4E4E1]">
                          <span>Registration Closes: {formatDt(regDeadline)}</span>
                          <span>Min CGPA: {typeof minCgpa === 'number' ? minCgpa.toFixed(2) : minCgpa}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Governance Audit Feed */}
            <div className="lg:col-span-5 border border-[#222222] bg-[#FAFAF9] p-6 space-y-4 rounded-[2px]">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                    GOVERNANCE LOG
                  </span>
                  <h3 className="text-sm font-bold text-[#111111]">
                    Recent Institutional Events
                  </h3>
                </div>
                <Link to="/admin/audit-logs" className="text-xs font-mono font-bold text-[#111111] hover:underline">
                  Full Registry →
                </Link>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#858585]">
                  No governance events recorded yet.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs divide-y divide-[#E4E4E1]">
                  {auditLogs.slice(0, 5).map(log => {
                    const ts = log.timestamp || 'Recent';
                    const actor = log.actor || 'System';
                    const role = log.actor_role || log.actorRole || 'admin';
                    const action = log.action || 'LOG';
                    const entity = log.entity || 'Policy';
                    const summary = log.summary || log.details || 'System event';

                    return (
                      <div key={log.id} className="pt-2 first:pt-0 space-y-1">
                        <div className="flex justify-between text-[10px] text-[#858585]">
                          <span>{typeof ts === 'string' && ts.includes('T') ? ts.replace('T', ' ').slice(0, 19) : ts}</span>
                          <span className="uppercase text-[#111111] font-bold">{actor} ({role})</span>
                        </div>
                        <strong className="text-[#111111] block text-xs">{action}: {entity}</strong>
                        <p className="text-[11px] text-[#666666] leading-tight">{summary}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
