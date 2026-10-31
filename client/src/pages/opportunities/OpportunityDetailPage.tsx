import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch, checkEligibility } from '../../lib/matching';
import { api, MatchResult, ApiError } from '../../lib/api';
import { Button, StatusBadge, Dialog } from '../../components/ui';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Share2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function OpportunityDetailPage() {
  const { params, navigate } = useRouter();
  const { jobs, studentProfile, applications, currentUser, actions } = useCampusStore();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);
  const [eligibilityFailures, setEligibilityFailures] = useState<string[] | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [aiMatch, setAiMatch] = useState<MatchResult | null>(null);
  const [isLoadingAiMatch, setIsLoadingAiMatch] = useState(false);

  const job = useMemo(() => {
    return jobs.find(j => j.id === params.jobId);
  }, [jobs, params.jobId]);

  const existingApp = useMemo(() => {
    if (!job) return null;
    return applications.find(
      a => a.jobId === job.id && (!studentProfile.id || a.studentId === studentProfile.id) && a.status !== 'Withdrawn'
    );
  }, [applications, job, studentProfile.id]);

  const eligibility = useMemo(() => {
    if (!job) return { isEligible: false, reasons: [] };
    return checkEligibility(studentProfile, job);
  }, [studentProfile, job]);

  const match = useMemo(() => {
    if (!job) return { overallScore: 0, matchedSkills: [], missingRequiredSkills: [], matchExplanation: '' };
    return calculateMatch(studentProfile, job);
  }, [studentProfile, job]);

  // Request AI Match from Python AI Server on mount
  useEffect(() => {
    let active = true;
    if (!studentProfile.id || !job?.id) return;

    const fetchAiMatch = async () => {
      setIsLoadingAiMatch(true);
      try {
        const res = await api.ai.matchResume(studentProfile.id, job.id);
        if (active && res) {
          setAiMatch(res);
        }
      } catch (err) {
        console.debug('AI match fetch fallback to local:', err);
      } finally {
        if (active) setIsLoadingAiMatch(false);
      }
    };

    fetchAiMatch();
    return () => {
      active = false;
    };
  }, [studentProfile.id, job.id]);

  const handleApply = async () => {
    setIsApplying(true);
    setApplyErrorMessage(null);
    setEligibilityFailures(null);

    const matchScore = aiMatch ? aiMatch.match_score : match.overallScore;

    try {
      // 1. Submit application to Node backend
      await api.applications.apply(job.id);

      // 2. Also inform local store & trigger background AI match update
      actions.applyToJob(job.id, matchScore);
      api.ai.matchResume(studentProfile.id, job.id).catch(() => null);
      actions.loadStudentPortalData();

      setApplySuccessMessage('Your formal application dossier has been submitted to the recruitment team.');
      setApplyModalOpen(false);
    } catch (err: any) {
      console.warn('Backend application submission:', err);
      if (err instanceof ApiError) {
        if (err.eligibility_reasons && err.eligibility_reasons.length > 0) {
          setEligibilityFailures(err.eligibility_reasons);
          setApplyErrorMessage('Application rejected: You do not meet institutional eligibility requirements for this role.');
        } else {
          setApplyErrorMessage(err.message || 'Server rejected application');
        }
      } else {
        // Fallback for offline demo mode
        const res = actions.applyToJob(job.id, matchScore);
        if (res.success) {
          setApplySuccessMessage('Your application dossier has been submitted (local demo mode).');
          setApplyModalOpen(false);
        } else {
          setApplyErrorMessage(res.message);
        }
      }
    } finally {
      setIsApplying(false);
    }
  };

  const displayedScore = aiMatch ? aiMatch.match_score : match.overallScore;
  const displayedExplanation = aiMatch?.explanation || match.matchExplanation;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/opportunities')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Opportunities Registry</span>
      </button>

      {/* Header Banner */}
      <div className="border border-[#222222] bg-[#FAFAF9] p-6 sm:p-10 mb-10 rounded-[2px]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 border border-[#222222] flex items-center justify-center font-mono font-bold text-sm uppercase bg-white">
                {job.companyInitials}
              </span>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#858585] block">
                  {job.company}
                </span>
                <span className="text-[10px] font-mono text-[#666666]">
                  Verified Campus Recruitment Partner
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#666666] pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {job.location} ({job.workArrangement})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={13} /> {job.employmentType}
              </span>
              {job.salaryRange && (
                <>
                  <span>•</span>
                  <span>Compensation: {job.salaryRange}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Deadline: {job.deadline}
              </span>
            </div>
          </div>

          {/* Quick Status / Application CTA */}
          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0">
            {existingApp ? (
              <div className="text-left lg:text-right space-y-2">
                <span className="text-xs font-mono text-[#858585] block">APPLICATION STATUS</span>
                <StatusBadge status={existingApp.status} />
                <div className="pt-2">
                  <Link to={`/student/applications/${existingApp.id}`}>
                    <Button variant="secondary" size="sm">
                      View Application Dossier →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : eligibility.isEligible ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setApplyModalOpen(true)}
              >
                Apply for this Opening
              </Button>
            ) : (
              <div className="bg-[#F5F5F3] border border-[#E4E4E1] p-3 text-xs font-mono text-[#858585] text-left lg:text-right">
                Ineligible according to placement rules.
              </div>
            )}
          </div>
        </div>
      </div>

      {applySuccessMessage && (
        <div className="mb-8 p-4 border border-[#111111] bg-white text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#111111]" />
            <span>{applySuccessMessage}</span>
          </div>
          <Link to="/student/applications" className="font-bold underline">
            Track Applications →
          </Link>
        </div>
      )}

      {applyErrorMessage && (
        <div className="mb-8 p-4 border border-[#111111] bg-neutral-50 text-xs font-mono text-[#111111] space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={16} />
            <span>{applyErrorMessage}</span>
          </div>
          {eligibilityFailures && eligibilityFailures.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-[#444444] pt-1">
              {eligibilityFailures.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Job Spec & Requirements */}
        <div className="lg:col-span-8 space-y-10">
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
              Role Overview
            </h2>
            <p className="text-sm text-[#444444] leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
              Key Responsibilities
            </h2>
            <ul className="space-y-2.5 text-sm text-[#444444]">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#858585] pt-0.5">0{i + 1}.</span>
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Qualifications */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
              Required Qualifications
            </h2>
            <ul className="space-y-2.5 text-sm text-[#444444]">
              {job.requiredQualifications.map((qual, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#858585] pt-0.5">—</span>
                  <span className="leading-relaxed">{qual}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Competencies */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
              Technical Competency Profile
            </h2>
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-[#858585] uppercase block mb-2">Core Mandatory Competencies</span>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="border border-[#222222] bg-white px-3 py-1 font-medium text-[#111111] rounded-[2px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div>
                  <span className="text-[#858585] uppercase block mb-2">Preferred / Secondary Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map(skill => (
                      <span
                        key={skill}
                        className="border border-[#E4E4E1] bg-[#FAFAF9] px-3 py-1 text-[#666666] rounded-[2px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Match Score & Eligibility Audit */}
        <div className="lg:col-span-4 space-y-6">
          {/* Match Score Card */}
          <div className="border border-[#222222] p-6 space-y-4 bg-[#FAFAF9]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#111111]" />
                {aiMatch ? 'AI NEURAL FIT' : 'COMPUTED MATCH FIT'}
              </span>
              <span className="text-xl font-mono font-extrabold text-[#111111]">
                {displayedScore}% MATCH
              </span>
            </div>

            <div>
              <div className="w-full bg-[#E4E4E1] h-2 rounded-[1px] overflow-hidden mb-2">
                <div
                  className="bg-[#111111] h-full transition-all duration-300"
                  style={{ width: `${displayedScore}%` }}
                />
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">
                {displayedExplanation}
              </p>
            </div>

            {/* Dimensional Breakdown */}
            <div className="border-t border-[#E4E4E1] pt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#858585]">Skill Alignment</span>
                <strong>{match.breakdown.skillFitScore} / 75</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Academic Qualification</span>
                <strong>{match.breakdown.academicFitScore} / 15</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Project & Internship Fit</span>
                <strong>{match.breakdown.experienceFitScore} / 10</strong>
              </div>
            </div>

            {/* Itemized Criteria Verification */}
            <div className="border-t border-[#E4E4E1] pt-4 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                ELIGIBILITY EVALUATION
              </span>
              {eligibility.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono">
                  {r.passed ? (
                    <CheckCircle2 size={13} className="text-[#111111] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={13} className="text-[#858585] shrink-0 mt-0.5" />
                  )}
                  <div className="leading-tight">
                    <span className="text-[#111111] font-semibold">{r.rule}:</span>{' '}
                    <span className={r.passed ? 'text-[#666666]' : 'text-[#858585]'}>
                      {r.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Apply Action */}
            <div className="pt-4 border-t border-[#E4E4E1]">
              {existingApp ? (
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono text-[#858585] block">Application already active</span>
                  <Link to={`/student/applications/${existingApp.id}`} className="w-full block">
                    <Button variant="secondary" size="md" className="w-full">
                      Track Status ({existingApp.status})
                    </Button>
                  </Link>
                </div>
              ) : eligibility.isEligible ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setApplyModalOpen(true)}
                >
                  Apply for this Opening
                </Button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 bg-[#E4E4E1] text-[#858585] text-xs font-mono cursor-not-allowed rounded-[2px]"
                >
                  Not Eligible per Criteria
                </button>
              )}
            </div>
          </div>

          {/* Employer Verification Panel */}
          <div className="border border-[#E4E4E1] p-5 space-y-3 bg-white text-xs font-mono">
            <span className="text-[10px] uppercase tracking-widest text-[#858585] block">
              RECRUITMENT COORDINATOR
            </span>
            <div>
              <strong className="text-sm text-[#111111] block">
                {job.recruiterName || `${job.company} Talent Acquisition`}
              </strong>
              <span className="text-[#666666]">{job.recruiterEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}</span>
            </div>
            <div className="flex items-center gap-2 text-[#858585] pt-1">
              <ShieldCheck size={14} className="text-[#111111]" />
              <span>Accredited Campus Hiring Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Confirm Application Dossier"
        description="Review your student dossier before transmitting to the employer recruitment team."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setApplyModalOpen(false)} disabled={isApplying}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} disabled={isApplying}>
              {isApplying ? 'Transmitting...' : 'Confirm & Submit'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-[#E4E4E1] p-3 bg-[#FAFAF9] space-y-1">
            <div>Position: <strong>{job.title}</strong></div>
            <div>Company: <strong>{job.company}</strong></div>
            <div>Deadline: <strong>{job.deadline}</strong></div>
          </div>

          <div className="space-y-2">
            <span className="text-[#858585] block">Transmitted Information:</span>
            <ul className="space-y-1 text-[#666666] list-disc list-inside">
              <li>Verified Academic Transcript (CGPA: {(studentProfile.cgpa || 0).toFixed(2)})</li>
              <li>Active Resume: {studentProfile.resume?.fileName || (studentProfile.resume_uploaded ? 'Uploaded PDF Dossier' : 'No resume uploaded')}</li>
              <li>{studentProfile.skills.length} Technical Skills & {studentProfile.projects.length} Projects</li>
              <li>Department: {studentProfile.branch}</li>
            </ul>
          </div>

          <p className="text-[11px] text-[#858585] border-t border-[#E4E4E1] pt-3">
            By submitting, you certify that all academic and technical records are accurate in accordance with university placement regulations.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
