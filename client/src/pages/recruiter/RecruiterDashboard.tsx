import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge, MetricSummary } from '../../components/ui';
import {
  Briefcase,
  Users,
  Calendar,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Building,
  RefreshCw,
} from 'lucide-react';

export function RecruiterDashboard() {
  const { navigate } = useRouter();
  const { currentUser, jobs, applications, interviews, actions } = useCampusStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recruiterCompany = currentUser.organization || currentUser.name || 'Corporate Partner';

  // Load recruiter portal data on mount
  useEffect(() => {
    actions.loadRecruiterPortalData();
  }, [actions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await actions.loadRecruiterPortalData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter jobs published by or relevant to this recruiter's company
  const companyJobs = useMemo(() => {
    return jobs.filter(j => {
      if (currentUser.role === 'admin') return true;
      if (currentUser.id && (j as any).recruiter_id === currentUser.id) return true;
      if (currentUser.id && (j as any).recruiterId === currentUser.id) return true;
      if (j.company.toLowerCase() === recruiterCompany.toLowerCase()) return true;
      return false;
    });
  }, [jobs, recruiterCompany, currentUser.id, currentUser.role]);

  const activeJobs = companyJobs.filter(j => j.status === 'Active');

  // Applications for this company's jobs
  const companyJobIds = new Set(companyJobs.map(j => j.id));
  const companyApps = useMemo(() => {
    return applications.filter(a => companyJobIds.has(a.jobId));
  }, [applications, companyJobIds]);

  const shortlistedApps = companyApps.filter(
    a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
  );

  const companyInterviews = useMemo(() => {
    return interviews.filter(i => companyJobIds.has(i.jobId) && i.status === 'Scheduled');
  }, [interviews, companyJobIds]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
              CORPORATE PARTNER WORKSPACE
            </span>
            <span className="text-[#858585]">•</span>
            <span className="text-[10px] font-mono font-bold text-[#111111]">
              {recruiterCompany}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Recruiter Desk — {currentUser.name}
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Coordinate campus recruitment drives, evaluate candidate credentials, and schedule interview rounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          >
            {isRefreshing ? 'Syncing...' : 'Sync Portal'}
          </Button>
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="md" icon={<PlusCircle size={15} />}>
              Post Campus Vacancy
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSummary
            label="Active Openings"
            value={activeJobs.length}
            sublabel="Published campus vacancies"
          />
          <MetricSummary
            label="Total Applicants"
            value={companyApps.length}
            sublabel="Dossiers submitted by students"
          />
          <MetricSummary
            label="Candidates Shortlisted"
            value={shortlistedApps.length}
            sublabel="Advanced to evaluation"
          />
          <MetricSummary
            label="Confirmed Interviews"
            value={companyInterviews.length}
            sublabel="Upcoming technical rounds"
          />
        </div>
      </div>

      {/* Active Recruitment Jobs Table */}
      <div className="border border-[#E4E4E1] bg-white">
        <div className="p-5 border-b border-[#E4E4E1] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
              PUBLISHED ROLES
            </span>
            <h2 className="text-base font-bold text-[#111111]">
              Active Recruitment Openings
            </h2>
          </div>
          <Link to="/recruiter/jobs" className="text-xs font-mono font-bold text-[#111111] hover:underline">
            Manage All Openings →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
              <tr>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Publication Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Applicants</th>
                <th className="py-3 px-4">Shortlisted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E1]">
              {companyJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#858585]">
                    No campus vacancies published yet. Click "Post Campus Vacancy" to begin.
                  </td>
                </tr>
              ) : (
                companyJobs.map(job => {
                  const jobApps = companyApps.filter(a => a.jobId === job.id);
                  const jobShortlisted = jobApps.filter(
                    a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
                  );
                  const countToDisplay = job.applicantsCount || jobApps.length;

                  return (
                    <tr key={job.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="py-3.5 px-4">
                        <strong className="text-sm text-[#111111] block">{job.title}</strong>
                        <span className="text-[10px] text-[#858585]">{job.location} ({job.workArrangement})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#666666]">{job.deadline}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">{countToDisplay}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">{jobShortlisted.length}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                          <Button variant="secondary" size="sm">
                            Review Applicants ({countToDisplay})
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Recent Applications & Scheduled Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Applicants */}
        <div className="lg:col-span-7 border border-[#E4E4E1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                INCOMING CANDIDACIES
              </span>
              <h3 className="text-sm font-bold text-[#111111]">
                Recent Applicant Dossiers
              </h3>
            </div>
            {companyJobs[0] && (
              <Link to={`/recruiter/jobs/${companyJobs[0].id}/applicants`} className="text-xs font-mono font-bold text-[#111111] hover:underline">
                Applicant Review Hub →
              </Link>
            )}
          </div>

          <div className="divide-y divide-[#E4E4E1]">
            {companyApps.length === 0 ? (
              <p className="text-xs font-mono text-[#858585] py-4 text-center">
                No candidate dossiers received yet.
              </p>
            ) : (
              companyApps.slice(0, 4).map(app => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/recruiter/jobs/${app.jobId}/applicants`)}
                  className="py-3 flex items-center justify-between gap-4 font-mono text-xs hover:bg-[#FAFAF9] p-2 cursor-pointer transition-colors"
                >
                  <div>
                    <strong className="text-sm text-[#111111] block">{app.studentName}</strong>
                    <span className="text-[10px] text-[#666666]">
                      {app.jobTitle} • {app.studentBranch ? app.studentBranch.slice(0, 24) : 'Engineering'}... (CGPA: {app.studentCgpa.toFixed(2)})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold bg-[#F5F5F3] px-2 py-0.5 border border-[#E4E4E1]">
                      {app.matchScore}% Fit
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="lg:col-span-5 border border-[#222222] bg-[#FAFAF9] p-6 space-y-4 rounded-[2px]">
          <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                COORDINATION SCHEDULE
              </span>
              <h3 className="text-sm font-bold text-[#111111]">
                Upcoming Candidate Rounds
              </h3>
            </div>
            <Link to="/recruiter/interviews" className="text-xs font-mono font-bold text-[#111111] hover:underline">
              All ({companyInterviews.length}) →
            </Link>
          </div>

          {companyInterviews.length === 0 ? (
            <p className="text-xs font-mono text-[#858585] py-4">
              No technical rounds scheduled today. Shortlist applicants to book slots.
            </p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {companyInterviews.map(int => (
                <div key={int.id} className="p-3 bg-white border border-[#E4E4E1] space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-[#111111] block">{int.studentName}</strong>
                      <span className="text-[10px] text-[#666666]">{int.round}</span>
                    </div>
                    <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                      {int.startTime}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#858585]">
                    Date: {int.date} ({int.timezone}) • {int.mode}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
