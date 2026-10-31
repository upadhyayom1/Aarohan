import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api } from '../../lib/api';
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
  RefreshCw,
} from 'lucide-react';

export function StudentApplicationDetailPage() {
  const { params, navigate } = useRouter();
  const { applications, jobs, actions } = useCampusStore();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [backendApp, setBackendApp] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live application details from Node backend
  useEffect(() => {
    let active = true;
    if (!params.applicationId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.applications.getById(params.applicationId!);
        if (active && res) {
          setBackendApp(res);
        }
      } catch (err) {
        console.debug('Application detail fetch fallback to store:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [params.applicationId]);

  const app = useMemo(() => {
    const fromStore = applications.find(a => a.id === params.applicationId);
    if (!fromStore && !backendApp) return null;
    if (backendApp) {
      return {
        ...(fromStore || {
          id: backendApp.id,
          jobId: backendApp.job_id || backendApp.jobId || '',
          jobTitle: backendApp.job?.title || 'Placement Opening',
          company: backendApp.job?.company || 'Company Partner',
          studentId: backendApp.student_id || '',
          studentName: backendApp.student?.name || '',
          studentBranch: backendApp.student?.branch || '',
          studentCgpa: backendApp.student?.cgpa || 0,
          studentGradYear: backendApp.student?.graduation_year || 2026,
          appliedDate: backendApp.created_at ? new Date(backendApp.created_at).toISOString().split('T')[0] : '',
          history: [],
        }),
        id: backendApp.id,
        jobTitle: backendApp.job?.title || fromStore?.jobTitle || 'Placement Opening',
        company: backendApp.job?.company || fromStore?.company || 'Company Partner',
        status: (backendApp.status === 'interview_scheduled'
          ? 'Interview Scheduled'
          : backendApp.status === 'shortlisted'
          ? 'Shortlisted'
          : backendApp.status === 'selected'
          ? 'Selected'
          : backendApp.status === 'rejected' || backendApp.status === 'not_selected'
          ? 'Rejected'
          : backendApp.status === 'withdrawn'
          ? 'Withdrawn'
          : 'Under Review') as any,
        matchScore: backendApp.matchResult?.match_score ?? backendApp.match_score ?? fromStore?.matchScore ?? 0,
        recruiterNotes: backendApp.notes || backendApp.recruiterNotes || fromStore?.recruiterNotes,
      };
    }
    return fromStore;
  }, [applications, params.applicationId, backendApp]);

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

  const handleWithdraw = () => {
    if (!app) return;
    actions.withdrawApplication(app.id);
    setWithdrawModalOpen(false);
  };

  if (!app) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <button
          onClick={() => navigate('/student/applications')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Application Tracker</span>
        </button>
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <h2 className="text-xl font-bold text-[#111111] mb-2">Application Dossier Not Found</h2>
          <p className="text-xs font-mono text-[#666666] mb-4">
            The requested application could not be found or may have been deleted.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/student/applications')}>
            Back to My Applications
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
                OFFICIAL PLACEMENT APPLICATION DOSSIER • {app.id}
              </span>
              {isLoading && (
                <span className="text-[10px] font-mono text-[#858585] flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin" /> Live Data
                </span>
              )}
            </div>
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
                RECRUITER REVIEW NOTES & AI ASSESSMENT
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
              <div>CGPA at Submission: <strong>{(app.studentCgpa || 0).toFixed(2)}</strong></div>
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
