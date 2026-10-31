import React, { useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch, checkEligibility } from '../../lib/matching';
import { Button, StatusBadge } from '../../components/ui';
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
  TrendingUp,
  CheckCheck,
  AlertCircle,
  ExternalLink,
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

  // Chronological recent activity from actual application history
  const recentActivities = useMemo(() => {
    const list: {
      id: string;
      appId: string;
      jobTitle: string;
      company: string;
      stage: string;
      date: string;
      note?: string;
    }[] = [];

    studentApps.forEach(app => {
      app.history.forEach((h, idx) => {
        list.push({
          id: `${app.id}-${idx}`,
          appId: app.id,
          jobTitle: app.jobTitle,
          company: app.company,
          stage: h.stage,
          date: h.date,
          note: h.note,
        });
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [studentApps]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* 1. Welcome Section */}
      <div className="border-b border-[#E4E4E1] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] font-semibold">
              STUDENT PLACEMENT DESK
            </span>
            <span className="text-[#858585]">•</span>
            <span className="text-[10px] font-mono text-[#666666] font-semibold">
              COHORT {studentProfile.graduationYear}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111]">
            Welcome, {studentProfile.fullName.split(' ')[0]}.
          </h1>
          <p className="text-sm sm:text-base text-[#666666] max-w-xl leading-relaxed">
            You are eligible for <strong className="text-[#111111]">{eligibleJobsCount} campus openings</strong>. Your profile is active and verified for institutional recruitment drives.
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

      {/* 2. Profile Verification Card */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6 rounded-[3px] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] font-semibold block">
              INSTITUTIONAL DOSSIER COMPLETENESS
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-base sm:text-lg font-bold text-[#111111]">
                Profile Verification Status
              </h3>
              <span className="text-xs font-mono font-bold bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                {profileCompletion.score}% COMPLETE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#666666]">Cumulative Grade:</span>
            <span className="text-xs font-mono font-bold text-[#111111] bg-white border border-[#E4E4E1] px-2.5 py-1 rounded-[2px]">
              CGPA {studentProfile.cgpa.toFixed(2)} / 10.00
            </span>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="w-full bg-[#E4E4E1] h-2 rounded-[2px] overflow-hidden">
          <div
            className="bg-[#111111] h-full transition-all duration-500 rounded-[2px]"
            style={{ width: `${profileCompletion.score}%` }}
          />
        </div>

        {/* Verification Check Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 font-mono text-xs">
          {profileCompletion.checks.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 border rounded-[2px] transition-colors ${
                item.done
                  ? 'bg-white border-[#D1D1CE] text-[#111111]'
                  : 'bg-transparent border-dashed border-[#D1D1CE] text-[#858585]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-[2px] border flex items-center justify-center text-[10px] shrink-0 ${
                  item.done
                    ? 'bg-[#111111] border-[#111111] text-white font-bold'
                    : 'border-[#858585] bg-white text-transparent'
                }`}
              >
                ✓
              </span>
              <span className="truncate text-[11px] leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            label: 'Eligible Positions',
            value: eligibleJobsCount,
            sublabel: 'Directly qualified by CGPA & branch',
            icon: Briefcase,
            href: '/student/opportunities',
          },
          {
            label: 'Applications Submitted',
            value: studentApps.length,
            sublabel: 'Transmitted to hiring teams',
            icon: FileCheck2,
            href: '/student/applications',
          },
          {
            label: 'Shortlisted / In Progress',
            value: shortlistedCount,
            sublabel: 'Passed initial qualification screening',
            icon: TrendingUp,
            href: '/student/applications',
          },
          {
            label: 'Scheduled Interviews',
            value: upcomingInterviews.length,
            sublabel: 'Confirmed technical & HR rounds',
            icon: Calendar,
            href: '/student/interviews',
          },
        ].map((card, idx) => (
          <Link
            key={idx}
            to={card.href}
            className="border border-[#E4E4E1] bg-white p-5 rounded-[3px] hover:border-[#111111] transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#858585] font-semibold">
                  {card.label}
                </span>
                <card.icon size={15} className="text-[#858585] group-hover:text-[#111111] transition-colors" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#111111] leading-none mb-2">
                {card.value}
              </div>
            </div>
            <p className="text-xs text-[#666666] pt-1 border-t border-[#F5F5F3] leading-snug">
              {card.sublabel}
            </p>
          </Link>
        ))}
      </div>

      {/* 4. Two Columns: Recommended Jobs & Application Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Top Recommended Openings */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] font-semibold block">
                ALIGNED VACANCIES
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                Recommended for Your Profile
              </h2>
            </div>
            <Link
              to="/student/opportunities"
              className="text-xs font-mono font-bold text-[#111111] hover:underline flex items-center gap-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recommendedJobs.map(({ job, match }) => (
              <div
                key={job.id}
                className="border border-[#E4E4E1] bg-white p-5 rounded-[3px] hover:border-[#111111] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
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
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {job.requiredSkills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="bg-[#F5F5F3] px-2 py-0.5 border border-[#E4E4E1] rounded-[2px] text-[#444444]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E4E4E1]">
                  <div className="flex items-center gap-1.5 font-mono text-xs bg-[#FAFAF9] border border-[#E4E4E1] px-2.5 py-1 rounded-[2px]">
                    <Sparkles size={13} className="text-[#111111]" />
                    <strong className="text-sm font-bold text-[#111111]">{match.overallScore}%</strong>
                    <span className="text-[#858585]">fit</span>
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

        {/* Right Column: Upcoming Interview & Recent Application Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Interview Widget */}
          <div className="border border-[#222222] bg-[#FAFAF9] p-5 sm:p-6 space-y-4 rounded-[3px]">
            <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] font-semibold">
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
                  <span className="text-[#666666] block text-xs mt-0.5">
                    {upcomingInterviews[0].company} — {upcomingInterviews[0].jobTitle}
                  </span>
                </div>

                <div className="bg-white border border-[#E4E4E1] p-3.5 space-y-1.5 rounded-[2px]">
                  <div>Date: <strong className="text-[#111111]">{upcomingInterviews[0].date}</strong></div>
                  <div>Time: <strong className="text-[#111111]">{upcomingInterviews[0].startTime} ({upcomingInterviews[0].timezone})</strong></div>
                  <div>Format: <strong className="text-[#111111]">{upcomingInterviews[0].mode}</strong></div>
                </div>

                <Link to="/student/interviews" className="block pt-1">
                  <Button variant="primary" size="sm" className="w-full">
                    View Interview Briefing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-xs font-mono text-[#666666] py-3 text-center sm:text-left">
                No interviews scheduled currently. Shortlisted candidates will receive official schedule invites.
              </div>
            )}
          </div>

          {/* Recent Application Activity */}
          <div className="border border-[#E4E4E1] bg-white p-5 sm:p-6 space-y-4 rounded-[3px]">
            <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] font-semibold">
                RECENT APPLICATION ACTIVITY
              </span>
              <Link to="/student/applications" className="text-xs font-mono font-bold text-[#111111] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-[#858585] py-2 font-mono">
                No recent application activity recorded.
              </p>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {recentActivities.map(act => (
                  <div
                    key={act.id}
                    onClick={() => navigate(`/student/applications/${act.appId}`)}
                    className="p-3 border border-[#E4E4E1] hover:border-[#111111] transition-colors cursor-pointer rounded-[2px] bg-[#FAFAF9] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate flex-1">
                        <strong className="text-xs text-[#111111] block truncate">{act.jobTitle}</strong>
                        <span className="text-[10px] text-[#858585]">{act.company}</span>
                      </div>
                      <StatusBadge status={act.stage} />
                    </div>
                    {act.note && (
                      <p className="text-[11px] text-[#666666] font-sans line-clamp-1">
                        {act.note}
                      </p>
                    )}
                    <div className="text-[10px] text-[#858585] pt-1 border-t border-[#E4E4E1]">
                      Milestone Date: <strong className="text-[#111111]">{act.date}</strong>
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
