import React, { useState, useEffect, useMemo } from 'react';
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
  FileCheck2,
  BarChart3,
  Award,
} from 'lucide-react';

export function AdminDashboard() {
  const { navigate } = useRouter();
  const { currentUser, jobs, applications, interviews, drives, auditLogs } = useCampusStore();

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.admin.getStats().catch((err) => {
        console.warn('Failed to load admin stats from backend:', err);
        return null;
      }),
      api.admin.getRecruiters().catch((err) => {
        console.warn('Failed to load recruiters from backend:', err);
        return null;
      }),
    ]).then(([statsRes, recruitersRes]) => {
      if (!isMounted) return;
      if (statsRes) setStats(statsRes);
      if (recruitersRes) setRecruitersCount(recruitersRes.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeDrives = drives.filter(d => d.status === 'Active');
  const fallbackCompaniesCount = new Set(jobs.map(j => j.company)).size;
  const fallbackSelectedCount = applications.filter(a => a.status === 'Selected').length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
              DIRECTORATE OF CAREER ADVANCEMENT & CORPORATE RELATIONS
            </span>
            <span className="text-[#858585]">•</span>
            <span className="text-[10px] font-mono font-bold text-[#111111]">
              AY 2026–2027
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Placement Directorate Desk
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Central governance console for campus placement drives, corporate partner accreditation, and student placement outcomes.
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

      {/* Summary Metrics */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          <MetricSummary
            label="Registered Seniors"
            value={stats ? stats.total_students.toString() : '412'}
            sublabel="Class of 2026/27"
          />
          <MetricSummary
            label="Accredited Companies"
            value={recruitersCount || fallbackCompaniesCount}
            sublabel="Active hiring partners"
          />
          <MetricSummary
            label="Active Vacancies"
            value={stats ? stats.open_jobs : jobs.length}
            sublabel="Approved campus roles"
          />
          <MetricSummary
            label="Total Applications"
            value={stats ? stats.total_applications : applications.length}
            sublabel="Dossiers evaluated"
          />
          <MetricSummary
            label="Interviews Booked"
            value={stats ? stats.interviews_scheduled : interviews.length}
            sublabel="Technical rounds"
          />
          <MetricSummary
            label="Placement Offers"
            value={stats ? stats.students_placed : fallbackSelectedCount}
            sublabel="Confirmed offers"
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
          <span className="text-[#666666] text-[11px] block">{drives.length} drives registered ({activeDrives.length} active)</span>
        </Link>

        <Link
          to="/admin/students"
          className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111111]">Student Roster</span>
            <GraduationCap size={15} className="text-[#858585]" />
          </div>
          <span className="text-[#666666] text-[11px] block">Registrations & CGPA audits</span>
        </Link>

        <Link
          to="/admin/analytics"
          className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111111]">Placement Analytics</span>
            <BarChart3 size={15} className="text-[#858585]" />
          </div>
          <span className="text-[#666666] text-[11px] block">Branch & salary intelligence</span>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="border border-[#E4E4E1] p-4 bg-white hover:border-[#111111] transition-colors space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111111]">Audit Registry</span>
            <ShieldCheck size={15} className="text-[#858585]" />
          </div>
          <span className="text-[#666666] text-[11px] block">{auditLogs.length} immutable events</span>
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

          <div className="space-y-3 font-mono text-xs">
            {drives.map(drive => (
              <div key={drive.id} className="p-4 border border-[#E4E4E1] bg-[#FAFAF9] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#111111]">{drive.name}</h3>
                  <StatusBadge status={drive.status} />
                </div>
                <div className="text-[11px] text-[#666666]">
                  Participating: {drive.companies.join(', ')}
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#858585] pt-1 border-t border-[#E4E4E1]">
                  <span>Registration Closes: {drive.registrationDeadline}</span>
                  <span>Min CGPA: {drive.minCgpa.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
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

          <div className="space-y-3 font-mono text-xs divide-y divide-[#E4E4E1]">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="pt-2 first:pt-0 space-y-1">
                <div className="flex justify-between text-[10px] text-[#858585]">
                  <span>{log.timestamp}</span>
                  <span className="uppercase text-[#111111] font-bold">{log.actor} ({log.actorRole})</span>
                </div>
                <strong className="text-[#111111] block text-xs">{log.action}: {log.entity}</strong>
                <p className="text-[11px] text-[#666666] leading-tight">{log.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
