import React, { useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button, MetricSummary } from '../../components/ui';
import { Download, BarChart2, TrendingUp, Users, Award } from 'lucide-react';

export function RecruiterReportsPage() {
  const { currentUser, jobs, applications } = useCampusStore();
  const recruiterCompany = currentUser.organization || 'Apex Systems';

  const companyJobs = useMemo(() => {
    return jobs.filter(
      j => j.company.toLowerCase() === recruiterCompany.toLowerCase() || j.company.includes('Apex')
    );
  }, [jobs, recruiterCompany]);

  const companyJobIds = new Set(companyJobs.map(j => j.id));
  const companyApps = useMemo(() => {
    return applications.filter(a => companyJobIds.has(a.jobId));
  }, [applications, companyJobIds]);

  // Funnel calculations
  const funnel = useMemo(() => {
    const applied = companyApps.length;
    const underReview = companyApps.filter(a => a.status !== 'Applied').length;
    const shortlisted = companyApps.filter(
      a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
    ).length;
    const interviewed = companyApps.filter(
      a => a.status === 'Interview Scheduled' || a.status === 'Selected'
    ).length;
    const selected = companyApps.filter(a => a.status === 'Selected').length;

    return { applied, underReview, shortlisted, interviewed, selected };
  }, [companyApps]);

  const shortlistingRate = funnel.applied > 0 ? Math.round((funnel.shortlisted / funnel.applied) * 100) : 0;

  const handleExportCsv = () => {
    const rows = [
      ['Candidate Name', 'Candidate Email', 'Job Title', 'Branch', 'CGPA', 'Match Fit', 'Status'],
      ...companyApps.map(a => [
        a.studentName,
        a.studentEmail,
        a.jobTitle,
        a.studentBranch,
        a.studentCgpa.toString(),
        `${a.matchScore}%`,
        a.status,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarohan_Report_${recruiterCompany.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            EXECUTIVE HIRING INTELLIGENCE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Recruitment Reports & Funnel
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Aggregate hiring funnel metrics, candidate conversion rates, and competency distributions for {recruiterCompany}.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleExportCsv} icon={<Download size={14} />}>
          Export Recruitment CSV
        </Button>
      </div>

      {/* Summary KPI Bar */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSummary
            label="Total Dossiers Evaluated"
            value={funnel.applied}
            sublabel="Submitted across active vacancies"
          />
          <MetricSummary
            label="Shortlist Conversion"
            value={`${shortlistingRate}%`}
            sublabel="Passed initial credentials review"
          />
          <MetricSummary
            label="Interview Round Volume"
            value={funnel.interviewed}
            sublabel="Advanced to live technical rounds"
          />
          <MetricSummary
            label="Placement Offers"
            value={funnel.selected}
            sublabel="Final offers extended"
          />
        </div>
      </div>

      {/* Recruitment Funnel Section */}
      <div className="border border-[#222222] bg-white p-6 sm:p-8 space-y-6 rounded-[2px]">
        <div className="border-b border-[#E4E4E1] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
            CONVERSION STAGES
          </span>
          <h2 className="text-base font-bold text-[#111111]">
            Recruitment Pipeline Funnel
          </h2>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {[
            { label: '01 — Applications Submitted', count: funnel.applied, total: funnel.applied || 1 },
            { label: '02 — Advanced Past Screening', count: funnel.underReview, total: funnel.applied || 1 },
            { label: '03 — Shortlisted for Technical Evaluation', count: funnel.shortlisted, total: funnel.applied || 1 },
            { label: '04 — Scheduled in Technical Rounds', count: funnel.interviewed, total: funnel.applied || 1 },
            { label: '05 — Final Placement Selection', count: funnel.selected, total: funnel.applied || 1 },
          ].map((step, idx) => {
            const pct = Math.round((step.count / step.total) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#111111]">{step.label}</span>
                  <span className="text-[#858585]">
                    {step.count} candidates ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#F5F5F3] h-3 border border-[#E4E4E1] rounded-[1px] overflow-hidden">
                  <div
                    className="bg-[#111111] h-full transition-all duration-300"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vacancy Breakdown Table */}
      <div className="border border-[#E4E4E1] bg-white">
        <div className="p-5 border-b border-[#E4E4E1]">
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
            Openings Performance Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
              <tr>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Arrangement</th>
                <th className="py-3 px-4">Applicants</th>
                <th className="py-3 px-4">Shortlisted</th>
                <th className="py-3 px-4">Interviews</th>
                <th className="py-3 px-4 text-right">Avg Match Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E1]">
              {companyJobs.map(job => {
                const apps = companyApps.filter(a => a.jobId === job.id);
                const shortlisted = apps.filter(
                  a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
                ).length;
                const interviewsCount = apps.filter(a => a.status === 'Interview Scheduled' || a.status === 'Selected').length;
                const avgScore = apps.length > 0 ? Math.round(apps.reduce((acc, a) => acc + a.matchScore, 0) / apps.length) : 0;

                return (
                  <tr key={job.id} className="hover:bg-[#F5F5F3]">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{job.title}</td>
                    <td className="py-3.5 px-4 text-[#666666]">{job.workArrangement}</td>
                    <td className="py-3.5 px-4 font-bold">{apps.length}</td>
                    <td className="py-3.5 px-4">{shortlisted}</td>
                    <td className="py-3.5 px-4">{interviewsCount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#111111]">
                      {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
