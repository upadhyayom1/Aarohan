import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge, Dialog } from '../../components/ui';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export function StudentApplicationDetailPage() {
  const { params, navigate } = useRouter();
  const { applications, jobs, actions } = useCampusStore();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const app = useMemo(() => {
    return applications.find(a => a.id === params.applicationId) || applications[0];
  }, [applications, params.applicationId]);

  const job = useMemo(() => {
    return jobs.find(j => j.id === app?.jobId);
  }, [jobs, app]);

  const stages = [
    { title: 'Applied', desc: 'Application dossier received by placement office' },
    { title: 'Under Review', desc: 'Department & recruiter screening in progress' },
    { title: 'Shortlisted', desc: 'Candidate invited to technical round' },
    { title: 'Interview Scheduled', desc: 'Interview slots booked and confirmed' },
    { title: 'Selected', desc: 'Final placement offer extended' },
  ];

  const currentStageIndex = stages.findIndex(s => s.title === app.status);

  const handleWithdraw = () => {
    actions.withdrawApplication(app.id);
    setWithdrawModalOpen(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button
        onClick={() => navigate('/student/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Application Tracker</span>
      </button>

      {/* Header Banner */}
      <div className="border border-[#222222] bg-[#FAFAF9] p-6 sm:p-8 rounded-[2px]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
              OFFICIAL PLACEMENT APPLICATION DOSSIER • {app.id}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              {app.jobTitle}
            </h1>
            <p className="text-sm font-mono text-[#666666]">
              {app.company} • Submitted {app.appliedDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
              <Button variant="danger" size="sm" onClick={() => setWithdrawModalOpen(true)}>
                Withdraw Candidacy
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Progress Timeline */}
        <div className="lg:col-span-8 space-y-8">
          <div className="border border-[#E4E4E1] bg-white p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-3">
              Application Milestones
            </h2>

            {/* Vertical Timeline */}
            <div className="relative border-l-2 border-[#111111] ml-3 pl-6 space-y-8 pt-2">
              {app.history.map((hist, i) => (
                <div key={i} className="relative">
                  {/* Bullet */}
                  <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#111111] border-2 border-white" />
                  <div className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-[#111111]">{hist.stage}</strong>
                      <span className="text-[11px] text-[#858585]">({hist.date})</span>
                    </div>
                    {hist.note && (
                      <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                        {hist.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Notes / Feedback */}
          {app.recruiterNotes && (
            <div className="border border-[#222222] bg-[#FAFAF9] p-6 space-y-3 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#858585] block">
                RECRUITER REVIEW NOTES
              </span>
              <p className="text-sm text-[#111111] leading-relaxed">
                "{app.recruiterNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Submission Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6 space-y-4 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#858585] block border-b border-[#E4E4E1] pb-2">
              SUBMITTED CANDIDACY DOSSIER
            </span>
            <div className="space-y-2">
              <div>Candidate: <strong>{app.studentName}</strong></div>
              <div>Department: <strong>{app.studentBranch}</strong></div>
              <div>CGPA at Submission: <strong>{app.studentCgpa.toFixed(2)}</strong></div>
              <div>Cohort: <strong>Class of {app.studentGradYear}</strong></div>
              <div>Match Fit Index: <strong>{app.matchScore}%</strong></div>
            </div>

            {job && (
              <div className="pt-4 border-t border-[#E4E4E1]">
                <Link to={`/opportunities/${job.id}`} className="text-xs font-bold text-[#111111] hover:underline block">
                  Review Original Job Opening →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Dialog
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Withdraw Candidacy"
        description="Are you certain you wish to withdraw your application for this placement opening?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleWithdraw}>
              Confirm Withdrawal
            </Button>
          </>
        }
      >
        <p className="text-xs font-mono text-[#666666]">
          Withdrawing will immediately inform the campus recruitment team and remove your dossier from consideration for this active vacancy.
        </p>
      </Dialog>
    </div>
  );
}
