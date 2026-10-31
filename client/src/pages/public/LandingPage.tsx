import React from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge, AarohanLogo } from '../../components/ui';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  ShieldCheck,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Briefcase,
  Compass,
  Award,
  ChevronRight,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();
  const { jobs, applications, drives, studentProfile } = useCampusStore();

  const featuredJobs = jobs.slice(0, 4);
  const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
  const companiesCount = new Set(jobs.map(j => j.company)).size;
  const totalAppsCount = applications.length;

  return (
    <div className="bg-white text-[#111111] antialiased">
      {/* ======================================================== */}
      {/* SECTION 1: HERO */}
      {/* ======================================================== */}
      <section className="border-b border-[#E4E4E1] overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-[620px] items-center py-12 lg:py-0">
            {/* Left Main Editorial Copy */}
            <div className="lg:col-span-7 space-y-6 lg:py-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F3] border border-[#E4E4E1] rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-bold">
                  AUTUMN 2026 PLACEMENT CYCLE · LIVE
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tight text-[#111111] leading-[0.98]">
                  Every career <br />
                  <span className="text-[#666666] font-normal italic font-serif">begins with</span> a step.
                </h1>
                <p className="text-base sm:text-lg text-[#555555] max-w-xl font-normal leading-relaxed pt-2">
                  Aarohan unifies student preparation, verified credential portfolios, recruiter drives, and transparent AI matching into one high-trust university placement platform.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link to="/opportunities">
                  <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                    Explore Opportunities
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary" size="lg">
                    How Aarohan Works
                  </Button>
                </Link>
              </div>

              {/* Institutional verification notice */}
              <div className="pt-4 flex items-center gap-3 text-xs font-mono text-[#777777]">
                <ShieldCheck size={16} className="text-[#111111] shrink-0" />
                <span>Verified by Directorate of Career Placement & Corporate Relations</span>
              </div>
            </div>

            {/* Right Hero Visual with High-Quality Photo & Dynamic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[4px] overflow-hidden border border-[#222222] shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
                  alt="University students collaborating on campus"
                  className="w-full h-[460px] object-cover filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Metric Card Overlay */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md border border-[#E4E4E1] p-5 rounded-[3px] shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AarohanLogo size={22} />
                      <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#111111]">
                        Current Recruitment Pulse
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#111111] text-white px-2 py-0.5 rounded-full font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border-r border-[#E4E4E1] pr-2">
                      <span className="text-xl font-mono font-extrabold text-[#111111] block">{activeJobsCount}</span>
                      <span className="text-[10px] text-[#777777] font-mono uppercase tracking-wider">Open Roles</span>
                    </div>
                    <div className="border-r border-[#E4E4E1] px-2">
                      <span className="text-xl font-mono font-extrabold text-[#111111] block">{companiesCount}</span>
                      <span className="text-[10px] text-[#777777] font-mono uppercase tracking-wider">Employers</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-xl font-mono font-extrabold text-[#111111] block">{drives.length}</span>
                      <span className="text-[10px] text-[#777777] font-mono uppercase tracking-wider">Drives</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: METRICS / KEY INDICATORS */}
      {/* ======================================================== */}
      <section className="border-b border-[#E4E4E1] bg-[#FAFAF9] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                label: 'Accredited Partners',
                value: companiesCount,
                desc: 'Apex Systems, Horizon Labs & global firms',
              },
              {
                icon: TrendingUp,
                label: 'Active Campus Openings',
                value: activeJobsCount,
                desc: 'Engineering, Data, Product & Research roles',
              },
              {
                icon: Users,
                label: 'Applications Tracked',
                value: totalAppsCount,
                desc: 'Real-time candidate pipeline stages',
              },
              {
                icon: GraduationCap,
                label: 'Placement Drives',
                value: drives.length,
                desc: 'Coordinated by Career Directorate',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E4E4E1] p-5 rounded-[3px] hover:border-[#111111] transition-colors"
              >
                <div className="w-9 h-9 border border-[#E4E4E1] bg-[#F5F5F3] flex items-center justify-center rounded-[2px] mb-3">
                  <stat.icon size={18} className="text-[#111111]" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-[#111111] leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111] mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#777777] leading-tight">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: PLATFORM ARCHITECTURE WITH IMAGERY */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-2 font-semibold">
              ECOSYSTEM ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              A clearer path from campus to career.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] mt-3 leading-relaxed">
              Aarohan bridges the gap between academic accomplishment and enterprise talent acquisition through an explainable, objective framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'For Students',
                subtitle: 'Aspire & Ascend',
                desc: 'Build your verified academic resume, explore tailored opportunities, and receive transparent match insights before submitting dossiers.',
                href: '/student/dashboard',
                cta: 'Access Student Workspace',
                image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
              },
              {
                step: '02',
                title: 'For Recruiters',
                subtitle: 'Source & Evaluate',
                desc: 'Broadcast role openings, schedule multiple interview stages, track candidate progress, and communicate official outcomes with confidence.',
                href: '/recruiter/dashboard',
                cta: 'Access Recruiter Portal',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
              },
              {
                step: '03',
                title: 'For Directorate',
                subtitle: 'Govern & Measure',
                desc: 'Coordinate campus drives, monitor institutional placement statistics, generate accredited compliance audits, and manage company ties.',
                href: '/admin/dashboard',
                cta: 'Access Placement Directorate',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80',
              },
            ].map(col => (
              <div
                key={col.step}
                className="group border border-[#E4E4E1] hover:border-[#111111] transition-all duration-300 rounded-[3px] overflow-hidden flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="h-48 overflow-hidden relative border-b border-[#E4E4E1]">
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-105 group-hover:grayscale-0"
                    />
                    <div className="absolute top-3 left-3 bg-[#111111] text-white text-xs font-mono font-bold px-2 py-0.5 rounded-[2px]">
                      {col.step}
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                      {col.subtitle}
                    </span>
                    <h3 className="text-xl font-bold text-[#111111]">{col.title}</h3>
                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed pt-1">
                      {col.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={col.href}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#111111] hover:underline pt-2"
                  >
                    <span>{col.cta}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: FEATURED CAMPUS VACANCIES */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-[#FAFAF9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-[#E4E4E1] pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1 font-semibold">
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
                className="border border-[#E4E4E1] bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-[#111111] transition-colors rounded-[3px] shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#666666] block">
                        {job.company}
                      </span>
                      <h3
                        className="text-xl font-bold text-[#111111] mt-1 hover:underline cursor-pointer"
                        onClick={() => navigate(`/opportunities/${job.id}`)}
                      >
                        {job.title}
                      </h3>
                    </div>
                    <span className="w-10 h-10 border border-[#222222] flex items-center justify-center font-mono font-bold text-xs uppercase bg-[#F5F5F3] shrink-0">
                      {job.companyInitials}
                    </span>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
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

                <div className="pt-5 mt-5 border-t border-[#E4E4E1] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5 text-[#666666]">
                    <div>{job.location} • {job.workArrangement}</div>
                    <div>Application Deadline: <strong className="text-[#111111]">{job.deadline}</strong></div>
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
      {/* SECTION 5: EXPLAINABLE AI ENGINE */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F5F5F3] border border-[#E4E4E1] rounded-[2px]">
                <Sparkles size={13} className="text-[#111111]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#111111] font-bold">
                  EXPLAINABLE AI ENGINE
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
                Know where you stand before applying.
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Aarohan evaluates verified student credentials against institutional placement criteria and company vacancy profiles in real time.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5 rounded-[2px] bg-[#111111] text-white">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Deterministic Cutoff Validation</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Validates CGPA thresholds, eligible academic branches, and active backlogs against institutional placement rules.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5 rounded-[2px] bg-[#111111] text-white">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Semantic Skill Matching</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Extracts verified student competencies and project codebases against employer tech stacks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-[#111111] flex items-center justify-center shrink-0 mt-0.5 rounded-[2px] bg-[#111111] text-white">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Transparent Gap Analysis</h4>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Actionable learning pathways without automated rejections. Human recruiters make all final shortlisting choices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Illustrative Match Report Panel */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border border-[#222222] bg-[#FAFAF9] p-6 sm:p-7 space-y-5 rounded-[3px] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#858585] uppercase tracking-wider block">
                      ILLUSTRATIVE MATCH BREAKDOWN
                    </span>
                    <h4 className="text-base font-bold text-[#111111]">
                      Software Development Engineer I — Apex Systems
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                    VERIFIED
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
                    Eligibility: Verified (CGPA 8.84 exceeds 8.00 requirement; CSE branch approved).
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
                        Docker (Cloud Platform Architecture)
                      </span>
                      <span className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#666666]">
                        FastAPI (REST Integration)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#858585] uppercase text-[10px] block mb-1">Recommended Growth Area</span>
                    <span className="text-[#666666]">
                      Review GraphQL query composition and AWS infrastructure primitives to increase match rating.
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo strip below illustrative report */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 rounded-[3px] overflow-hidden border border-[#E4E4E1]">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=80"
                    alt="Technical interview preparation"
                    className="w-full h-full object-cover filter grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="h-32 rounded-[3px] overflow-hidden border border-[#E4E4E1]">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80"
                    alt="Team engineering discussion"
                    className="w-full h-full object-cover filter grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: RECRUITMENT TIMELINE */}
      {/* ======================================================== */}
      <section className="py-20 border-b border-[#E4E4E1] bg-[#FAFAF9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1 font-semibold">
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
              <div
                key={item.step}
                className="space-y-2 border-l-2 border-[#111111] pl-4 md:border-l-0 md:pl-0 md:border-t-2 md:pt-4"
              >
                <span className="text-xs font-mono font-bold text-[#858585]">{item.step}</span>
                <h4 className="text-sm font-bold text-[#111111]">{item.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: CALL TO ACTION */}
      {/* ======================================================== */}
      <section className="bg-[#111111] text-white py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <AarohanLogo size={36} variant="light" />
            <span className="font-mono text-xl font-bold uppercase tracking-tight text-white">
              Aarohan
            </span>
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
            CENTRAL UNIVERSITY PLACEMENT DIRECTORY
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Ascend toward your career milestone.
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm leading-relaxed">
            Connect directly with verified corporate partners, evaluate your eligibility in real time, and secure campus placement opportunities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/opportunities">
              <Button variant="secondary" size="lg">
                Explore Opportunities
              </Button>
            </Link>
            <Link to="/register">
              <button className="bg-transparent text-white border border-neutral-600 hover:border-white hover:bg-neutral-900 px-6 py-3 text-base rounded-[3px] font-medium transition-colors cursor-pointer">
                Join Aarohan
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
