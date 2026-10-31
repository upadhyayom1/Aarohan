import React from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge } from '../../components/ui';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();
  const { jobs, applications, drives, studentProfile } = useCampusStore();

  const featuredJobs = jobs.slice(0, 4);
  const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
  const companiesCount = new Set(jobs.map(j => j.company)).size;
  const totalAppsCount = applications.length;

  return (
    <div className="bg-white text-[#111111]">
      {/* ======================================================== */}
      {/* SECTION 2: HERO */}
      {/* ======================================================== */}
      <section className="border-b border-[#E4E4E1] pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Main Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F5F5F3] border border-[#E4E4E1] rounded-[2px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-semibold">
                  UNIVERSITY PLACEMENT OFFICE
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-tight text-[#111111] leading-[0.98]">
                Every career <br />
                <span className="text-[#666666] font-normal italic font-serif">begins with</span> a step.
              </h1>

              <p className="text-base sm:text-lg text-[#666666] max-w-xl font-normal leading-relaxed">
                Discover meaningful career opportunities, understand your fit, and navigate every stage of recruitment through Aarohan.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link to="/opportunities">
                  <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                    Explore opportunities
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary" size="lg">
                    How Aarohan works
                  </Button>
                </Link>
              </div>

              {/* Institutional verification notice */}
              <div className="pt-8 flex items-center gap-3 text-xs font-mono text-[#858585]">
                <ShieldCheck size={16} className="text-[#111111]" />
                <span>Verified by Directorate of Career Placement & Corporate Relations</span>
              </div>
            </div>

            {/* Right Typographic Interface Panel */}
            <div className="lg:col-span-5 border border-[#222222] bg-[#FAFAF9] p-6 sm:p-8 space-y-6 rounded-[2px]">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                    ACTIVE RECRUITMENT CYCLE
                  </span>
                  <h3 className="text-sm font-bold uppercase font-mono text-[#111111]">
                    Autumn Cohort 2026
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                  LIVE SESSION
                </span>
              </div>

              {/* Sample Placement Timeline Preview */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-2.5">
                  <span className="text-[#858585]">Phase 01</span>
                  <span className="text-[#111111] font-semibold">Student Profile Verification</span>
                  <span className="text-[#111111]">Completed</span>
                </div>
                <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-2.5">
                  <span className="text-[#858585]">Phase 02</span>
                  <span className="text-[#111111] font-semibold">Campus Vacancy Publishing</span>
                  <span className="text-[#111111]">In Progress</span>
                </div>
                <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-2.5">
                  <span className="text-[#858585]">Phase 03</span>
                  <span className="text-[#111111] font-semibold">AI Match & Eligibility Check</span>
                  <span className="text-[#111111]">Automated</span>
                </div>
                <div className="flex items-start justify-between pb-1">
                  <span className="text-[#858585]">Phase 04</span>
                  <span className="text-[#111111] font-semibold">Interview Coordination</span>
                  <span className="text-[#666666]">Commencing</span>
                </div>
              </div>

              {/* Quick Jump Bar */}
              <div className="pt-2 border-t border-[#E4E4E1] flex items-center justify-between">
                <span className="text-[11px] text-[#666666]">Graduating Cohort 2026 / 2027</span>
                <Link to="/opportunities" className="text-xs font-mono font-bold text-[#111111] hover:underline">
                  View Listings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: PLATFORM INTRODUCTION */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-2">
              ECOSYSTEM ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              A clearer path from campus to career.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] mt-4 leading-relaxed">
              Aarohan unifies student preparation, recruiter coordination, and administrative governance into an objective, data-driven placement process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {/* Col 01 */}
            <div className="border-t border-[#111111] pt-6 space-y-3">
              <span className="text-2xl font-mono font-bold text-[#111111] block">01</span>
              <h3 className="text-lg font-bold text-[#111111]">Students</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Discover opportunities that fit your qualifications and understand how your profile aligns with employer requirements.
              </p>
              <Link to="/student/dashboard" className="inline-flex text-xs font-mono font-bold text-[#111111] hover:underline pt-2">
                Access Student Workspace →
              </Link>
            </div>

            {/* Col 02 */}
            <div className="border-t border-[#111111] pt-6 space-y-3">
              <span className="text-2xl font-mono font-bold text-[#111111] block">02</span>
              <h3 className="text-lg font-bold text-[#111111]">Recruiters</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Manage openings, evaluate applicants, and coordinate interviews through a structured recruitment workflow.
              </p>
              <Link to="/recruiter/dashboard" className="inline-flex text-xs font-mono font-bold text-[#111111] hover:underline pt-2">
                Access Recruiter Portal →
              </Link>
            </div>

            {/* Col 03 */}
            <div className="border-t border-[#111111] pt-6 space-y-3">
              <span className="text-2xl font-mono font-bold text-[#111111] block">03</span>
              <h3 className="text-lg font-bold text-[#111111]">Placement Office</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Coordinate recruitment drives, monitor outcomes, and maintain a reliable overview of placement activity.
              </p>
              <Link to="/admin/dashboard" className="inline-flex text-xs font-mono font-bold text-[#111111] hover:underline pt-2">
                Access Placement Directorate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: FEATURED OPPORTUNITIES */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-[#FAFAF9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-[#E4E4E1] pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
                CAMPUS VACANCIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Opportunities worth exploring.
              </h2>
            </div>
            <Link to="/opportunities">
              <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
                View all {jobs.length} openings
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map(job => (
              <div
                key={job.id}
                className="border border-[#E4E4E1] bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-[#111111] transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#666666] block">
                        {job.company}
                      </span>
                      <h3 className="text-xl font-bold text-[#111111] mt-1 hover:underline cursor-pointer" onClick={() => navigate(`/opportunities/${job.id}`)}>
                        {job.title}
                      </h3>
                    </div>
                    <span className="w-10 h-10 border border-[#222222] flex items-center justify-center font-mono font-bold text-xs uppercase bg-[#F5F5F3]">
                      {job.companyInitials}
                    </span>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {job.requiredSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 bg-[#F5F5F3] text-[#111111] border border-[#E4E4E1] rounded-[2px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E4E4E1] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5 text-[#666666]">
                    <div>{job.location} • {job.workArrangement}</div>
                    <div>Deadline: {job.deadline}</div>
                  </div>
                  <Link to={`/opportunities/${job.id}`}>
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: EXPLAINABLE AI FEATURE */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block">
                EXPLAINABLE AI ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111]">
                Know where you stand.
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Aarohan helps students evaluate how their profile and verified coursework align with specific job requirements before applying.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} className="text-[#111111]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Deterministic Eligibility Calculation</h4>
                    <p className="text-xs text-[#666666]">
                      Validates CGPA thresholds, eligible academic branches, and active backlogs against institutional placement rules.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} className="text-[#111111]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Semantic Skill Matching</h4>
                    <p className="text-xs text-[#666666]">
                      Maps verified student competencies and projects against required and preferred company competencies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} className="text-[#111111]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Transparent Gap Analysis</h4>
                    <p className="text-xs text-[#666666]">
                      Provides actionable learning pathways without automated rejections. Human recruiters make all shortlisting decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Illustrative Match Report */}
            <div className="lg:col-span-6 border border-[#222222] bg-[#FAFAF9] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#858585] uppercase">ILLUSTRATIVE FIT REPORT</span>
                  <h4 className="text-base font-bold text-[#111111]">Software Development Engineer I — Apex Systems</h4>
                </div>
                <span className="text-[10px] font-mono bg-[#E4E4E1] text-[#111111] px-2 py-0.5">
                  SAMPLE PREVIEW
                </span>
              </div>

              {/* Score bar */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#111111]">Overall Alignment</span>
                  <span className="text-2xl font-mono font-extrabold text-[#111111]">92 / 100</span>
                </div>
                <div className="w-full bg-[#E4E4E1] h-2.5 rounded-[2px] overflow-hidden">
                  <div className="bg-[#111111] h-full w-[92%]" />
                </div>
                <p className="text-[11px] text-[#666666] mt-2 font-mono">
                  Eligibility: Verified (CGPA 8.84 meets 8.00 requirement; CSE branch approved).
                </p>
              </div>

              {/* Skills breakdown */}
              <div className="space-y-3 pt-2 text-xs font-mono">
                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">Directly Matched Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {['React', 'TypeScript', 'Node.js', 'SQL', 'Git'].map(s => (
                      <span key={s} className="bg-white border border-[#222222] px-2 py-0.5 text-[#111111]">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">Related Skills Detected</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#666666]">
                      Docker (Supports Cloud Platform)
                    </span>
                    <span className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#666666]">
                      FastAPI (REST Architecture)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[#858585] uppercase text-[10px] block mb-1">Recommended Growth Area</span>
                  <span className="text-[#666666]">
                    Consider reviewing GraphQL and AWS infrastructure fundamentals to boost compatibility.
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#858585] border-t border-[#E4E4E1] pt-3">
                * Note: AI matching provides advisory insights and does not guarantee an interview invitation or job offer.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: RECRUITMENT PROCESS TIMELINE */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
              RECRUITMENT TIMELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Structured stages from application to offer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-[#E4E4E1] pt-8">
            {[
              {
                step: '01',
                title: 'Complete Profile',
                desc: 'Upload verified academics, technical projects, and parse your resume.',
              },
              {
                step: '02',
                title: 'Discover Openings',
                desc: 'Filter opportunities by department, CGPA, graduation cohort, and roles.',
              },
              {
                step: '03',
                title: 'Review Fit Insights',
                desc: 'Understand competency matches and verify your formal eligibility.',
              },
              {
                step: '04',
                title: 'Apply & Track',
                desc: 'Submit your candidacy directly to employer recruitment teams.',
              },
              {
                step: '05',
                title: 'Interview & Offer',
                desc: 'Participate in scheduled technical rounds and track official placement offers.',
              },
            ].map(item => (
              <div key={item.step} className="space-y-2 border-l-2 border-[#111111] pl-4 md:border-l-0 md:pl-0 md:border-t-2 md:pt-4">
                <span className="text-xs font-mono font-bold text-[#858585]">{item.step}</span>
                <h4 className="text-sm font-bold text-[#111111]">{item.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: INSTITUTIONAL STATISTICS */}
      {/* ======================================================== */}
      <section className="py-16 border-b border-[#E4E4E1] bg-[#FAFAF9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block">
                Active Campus Vacancies
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#111111] block">
                {activeJobsCount}
              </span>
              <span className="text-xs text-[#666666]">Across Engineering & Sciences</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block">
                Participating Employers
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#111111] block">
                {companiesCount}
              </span>
              <span className="text-xs text-[#666666]">Accredited corporate partners</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block">
                Applications Transmitted
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#111111] block">
                {totalAppsCount}
              </span>
              <span className="text-xs text-[#666666]">In current autumn cycle</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block">
                Active Placement Drives
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#111111] block">
                {drives.length}
              </span>
              <span className="text-xs text-[#666666]">Coordinated by Career Directorate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: CALL TO ACTION */}
      {/* ======================================================== */}
      <section className="bg-[#111111] text-white py-20 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            AAROHAN — EVERY CAREER BEGINS WITH A STEP
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Your next opportunity starts here.
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm leading-relaxed">
            Connect directly with verified employers, understand your eligibility in real time, and progress toward your career milestone.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/opportunities">
              <Button variant="secondary" size="lg">
                Explore opportunities
              </Button>
            </Link>
            <Link to="/register">
              <button className="bg-transparent text-white border border-neutral-400 hover:border-white hover:bg-neutral-900 px-6 py-3 text-base rounded-[3px] font-medium transition-colors cursor-pointer">
                Join Aarohan
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
