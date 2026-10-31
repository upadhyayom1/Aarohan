import React, { useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch, checkEligibility } from '../../lib/matching';
import { Button, StatusBadge, MetricSummary } from '../../components/ui';
import {
  Briefcase,
  Compass,
  FileCheck2,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export function StudentDashboard() {
  const { navigate } = useRouter();
  const { studentProfile, jobs, applications, interviews, drives } = useCampusStore();

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let score = 0;
    const checks = [
      { label: 'Academic & CGPA Data', done: !!studentProfile.cgpa && !!studentProfile.branch },
      { label: 'Technical Competencies', done: studentProfile.skills.length >= 5 },
      { label: 'Engineering Projects', done: studentProfile.projects.length >= 1 },
      { label: 'Verified Resume PDF', done: !!studentProfile.resume && studentProfile.resume.parsingStatus === 'completed' },
      { label: 'Experience & Internships', done: studentProfile.experience.length >= 1 },
    ];
    checks.forEach(c => {
      if (c.done) score += 20;
    });
    return { score, checks };
  }, [studentProfile]);

  // Summary counts
  const eligibleJobsCount = useMemo(() => {
    return jobs.filter(j => checkEligibility(studentProfile, j).isEligible).length;
  }, [jobs, studentProfile]);

  const studentApps = useMemo(() => {
    return applications.filter(a => a.studentId === studentProfile.id && a.status !== 'Withdrawn');
  }, [applications, studentProfile.id]);

  const shortlistedCount = studentApps.filter(
    a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled' || a.status === 'Selected'
  ).length;

  const upcomingInterviews = useMemo(() => {
    return interviews.filter(
      i => i.studentId === studentProfile.id && (i.status === 'Scheduled' || i.status === 'Rescheduled')
    );
  }, [interviews, studentProfile.id]);

  // Recommended opportunities
  const recommendedJobs = useMemo(() => {
    return jobs
      .map(job => ({
        job,
        match: calculateMatch(studentProfile, job),
      }))
      .filter(item => item.match.isEligible)
      .sort((a, b) => b.match.overallScore - a.match.overallScore)
      .slice(0, 3);
  }, [jobs, studentProfile]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Welcome Section */}
      <div className="border-b border-[#E4E4E1] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
              STUDENT PLACEMENT DESK
            </span>
            <span className="text-[#858585]">•</span>
            <span className="text-[10px] font-mono text-[#666666]">
              COHORT {studentProfile.graduationYear}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
            Welcome, {studentProfile.fullName.split(' ')[0]}.
          </h1>
          <p className="text-sm sm:text-base text-[#666666] mt-2 max-w-xl">
            You are eligible for <strong className="text-[#111111]">{eligibleJobsCount} campus openings</strong>. Your profile is verified for the Autumn 2026 recruitment drive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/student/opportunities">
            <Button variant="primary" size="md" icon={<Compass size={15} />}>
              Find Opportunities
            </Button>
          </Link>
          <Link to="/student/profile">
            <Button variant="secondary" size="md" icon={<User size={15} />}>
              Update Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Profile Completion Bar */}
      <div className="border border-[#222222] bg-[#FAFAF9] p-6 rounded-[2px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
              INSTITUTIONAL DOSSIER COMPLETENESS
            </span>
            <h3 className="text-base font-bold text-[#111111]">
              Profile Verification: {profileCompletion.score}% Complete
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#111111] bg-white border border-[#E4E4E1] px-3 py-1">
            CGPA: {studentProfile.cgpa.toFixed(2)} / 10.00
          </span>
        </div>

        <div className="w-full bg-[#E4E4E1] h-2 rounded-[1px] overflow-hidden mb-4">
          <div
            className="bg-[#111111] h-full transition-all duration-300"
            style={{ width: `${profileCompletion.score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono text-xs">
          {profileCompletion.checks.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-[1px] border flex items-center justify-center text-[10px] ${item.done ? 'bg-[#111111] border-[#111111] text-white' : 'border-[#858585] bg-white'}`}>
                {item.done ? '✓' : ''}
              </span>
              <span className={item.done ? 'text-[#111111]' : 'text-[#858585]'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Summary Statistics */}
      <div className="border-y border-[#E4E4E1] py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSummary
            label="Eligible Positions"
            value={eligibleJobsCount}
            sublabel="Directly qualified by CGPA & branch"
          />
          <MetricSummary
            label="Applications Submitted"
            value={studentApps.length}
            sublabel="Transmitted to hiring teams"
          />
          <MetricSummary
            label="Shortlisted / In Progress"
            value={shortlistedCount}
            sublabel="Passed initial screening"
          />
          <MetricSummary
            label="Scheduled Interviews"
            value={upcomingInterviews.length}
            sublabel="Confirmed technical rounds"
          />
        </div>
      </div>

      {/* 4. Two Columns: Recommended Jobs & Application Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Top Recommended Openings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                ALIGNED VACANCIES
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                Recommended for Your Profile
              </h2>
            </div>
            <Link to="/student/opportunities" className="text-xs font-mono font-bold text-[#111111] hover:underline">
              View All ({jobs.length}) →
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedJobs.map(({ job, match }) => (
              <div
                key={job.id}
                className="border border-[#E4E4E1] bg-white p-5 hover:border-[#111111] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#858585]">
                      {job.company}
                    </span>
                    <span className="text-[#858585]">•</span>
                    <span className="text-[10px] font-mono text-[#666666]">
                      {job.workArrangement}
                    </span>
                  </div>
                  <h3
                    onClick={() => navigate(`/opportunities/${job.id}`)}
                    className="text-base font-bold text-[#111111] hover:underline cursor-pointer"
                  >
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {job.requiredSkills.slice(0, 4).map(skill => (
                      <span key={skill} className="bg-[#F5F5F3] px-2 py-0.5 border border-[#E4E4E1] rounded-[2px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E4E4E1]">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Sparkles size={13} className="text-[#111111]" />
                    <strong className="text-sm font-bold text-[#111111]">{match.overallScore}%</strong>
                    <span className="text-[#858585]">match</span>
                  </div>
                  <Link to={`/opportunities/${job.id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Applications & Next Interview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Next Interview Widget */}
          <div className="border border-[#222222] bg-[#FAFAF9] p-6 space-y-4 rounded-[2px]">
            <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
                UPCOMING INTERVIEW
              </span>
              <Calendar size={15} className="text-[#111111]" />
            </div>

            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <h4 className="text-base font-bold text-[#111111]">
                    {upcomingInterviews[0].round}
                  </h4>
                  <span className="text-[#666666] block">
                    {upcomingInterviews[0].company} — {upcomingInterviews[0].jobTitle}
                  </span>
                </div>

                <div className="bg-white border border-[#E4E4E1] p-3 space-y-1">
                  <div>Date: <strong>{upcomingInterviews[0].date}</strong></div>
                  <div>Time: <strong>{upcomingInterviews[0].startTime} ({upcomingInterviews[0].timezone})</strong></div>
                  <div>Format: <strong>{upcomingInterviews[0].mode}</strong></div>
                </div>

                <Link to="/student/interviews" className="block pt-1">
                  <Button variant="primary" size="sm" className="w-full">
                    View Interview Briefing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-xs font-mono text-[#666666] py-3">
                No interviews scheduled currently. Shortlisted candidates will receive official schedule invites.
              </div>
            )}
          </div>

          {/* Recent Application Activity */}
          <div className="border border-[#E4E4E1] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
                APPLICATION STATUS FEED
              </span>
              <Link to="/student/applications" className="text-xs font-mono font-bold text-[#111111] hover:underline">
                View All →
              </Link>
            </div>

            {studentApps.length === 0 ? (
              <p className="text-xs text-[#858585] py-2">
                No active applications. Explore vacancies to submit your dossier.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {studentApps.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/student/applications/${app.id}`)}
                    className="p-3 border border-[#E4E4E1] hover:border-black transition-colors cursor-pointer space-y-2 bg-[#FAFAF9]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <strong className="text-xs text-[#111111] block truncate">{app.jobTitle}</strong>
                        <span className="text-[10px] text-[#858585]">{app.company}</span>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#858585] pt-1 border-t border-[#E4E4E1]">
                      <span>Updated: {app.latestUpdateDate}</span>
                      <span>Fit: {app.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
