import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch } from '../../lib/matching';
import { Button, MetricSummary } from '../../components/ui';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Building,
  GraduationCap,
} from 'lucide-react';

export function StudentMatchesPage() {
  const { navigate } = useRouter();
  const { studentProfile, jobs, skillResources } = useCampusStore();

  const matchResults = useMemo(() => {
    return jobs.map(job => ({
      job,
      match: calculateMatch(studentProfile, job),
    }));
  }, [jobs, studentProfile]);

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');

  const selectedItem = useMemo(() => {
    return matchResults.find(m => m.job.id === selectedJobId) || matchResults[0];
  }, [matchResults, selectedJobId]);

  // Aggregate stats
  const averageMatchScore = useMemo(() => {
    if (!matchResults.length) return 0;
    const sum = matchResults.reduce((acc, m) => acc + m.match.overallScore, 0);
    return Math.round(sum / matchResults.length);
  }, [matchResults]);

  // High affinity skills across listings
  const commonMatchedSkills = useMemo(() => {
    const counts = new Map<string, number>();
    matchResults.forEach(m => {
      m.match.matchedSkills.forEach(s => {
        counts.set(s, (counts.get(s) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [matchResults]);

  // Common gaps
  const commonGaps = useMemo(() => {
    const counts = new Map<string, number>();
    matchResults.forEach(m => {
      m.match.missingRequiredSkills.forEach(s => {
        counts.set(s, (counts.get(s) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [matchResults]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          EXPLAINABLE AI ENGINE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          AI Match Insights
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Transparent, deterministic evaluations of your academic and technical fit against active campus opportunities.
        </p>
      </div>

      {/* Overview Analytics Bar */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricSummary
            label="Average Placement Fit"
            value={`${averageMatchScore}%`}
            sublabel="Across active campus openings"
          />
          <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-[#E4E4E1] pr-6 py-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] mb-2">
              Strongest Aligned Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {commonMatchedSkills.map(([skill, count]) => (
                <span
                  key={skill}
                  className="bg-white border border-[#222222] text-[#111111] text-[10px] font-mono px-2 py-0.5 rounded-[2px]"
                >
                  {skill} ({count})
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col py-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] mb-2">
              Most Common Skill Gaps
            </span>
            <div className="flex flex-wrap gap-1.5">
              {commonGaps.map(([skill, count]) => (
                <span
                  key={skill}
                  className="bg-white border border-[#E4E4E1] text-[#666666] text-[10px] font-mono px-2 py-0.5 rounded-[2px]"
                >
                  {skill} ({count})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Master / Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Match Listings */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-mono uppercase text-[#858585] tracking-widest block mb-2">
            SELECT VACANCY FOR FULL FIT BREAKDOWN
          </span>

          <div className="space-y-3">
            {matchResults.map(({ job, match }) => {
              const isSelected = job.id === selectedJobId;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#111111] bg-white shadow-xs'
                      : 'border-[#E4E4E1] bg-[#FAFAF9] hover:border-[#858585]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#858585] block">
                        {job.company}
                      </span>
                      <h3 className="font-bold text-sm text-[#111111] leading-tight">
                        {job.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#111111] text-white px-2 py-0.5 rounded-[2px] shrink-0">
                      {match.overallScore}%
                    </span>
                  </div>

                  <div className="w-full bg-[#E4E4E1] h-1.5 rounded-[1px] overflow-hidden my-2.5">
                    <div
                      className="bg-[#111111] h-full"
                      style={{ width: `${match.overallScore}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#666666]">
                    <span>{match.matchedSkills.length} matches • {match.missingRequiredSkills.length} gaps</span>
                    <span className={match.isEligible ? 'text-[#111111] font-semibold' : 'text-[#858585]'}>
                      {match.isEligible ? '✓ Eligible' : '✕ Ineligible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-depth Transparent Report */}
        {selectedItem && (
          <div className="lg:col-span-7 border border-[#222222] bg-white p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
                  DETAILED FIT AUDIT
                </span>
                <h2 className="text-2xl font-extrabold text-[#111111]">
                  {selectedItem.job.title}
                </h2>
                <span className="text-xs font-mono text-[#666666]">
                  {selectedItem.job.company} • {selectedItem.job.location}
                </span>
              </div>
              <Link to={`/opportunities/${selectedItem.job.id}`}>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={13} />}>
                  View Job
                </Button>
              </Link>
            </div>

            {/* Score & Explanation */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs uppercase text-[#858585]">Total Suitability Index</span>
                <span className="text-3xl font-extrabold text-[#111111]">
                  {selectedItem.match.overallScore} / 100
                </span>
              </div>
              <div className="w-full bg-[#E4E4E1] h-2.5 rounded-[2px] overflow-hidden">
                <div
                  className="bg-[#111111] h-full"
                  style={{ width: `${selectedItem.match.overallScore}%` }}
                />
              </div>
              <p className="text-xs text-[#444444] pt-1 leading-relaxed">
                {selectedItem.match.matchExplanation}
              </p>
            </div>

            {/* Dimensional Score Breakdown */}
            <div className="border border-[#E4E4E1] p-4 bg-[#FAFAF9] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#858585] block border-b border-[#E4E4E1] pb-1">
                COMPUTED DIMENSIONS
              </span>
              <div className="flex justify-between">
                <span>Core Skill Overlap (60 max):</span>
                <strong>{selectedItem.match.breakdown.skillFitScore} / 75</strong>
              </div>
              <div className="flex justify-between">
                <span>Academic & CGPA Standard (15 max):</span>
                <strong>{selectedItem.match.breakdown.academicFitScore} / 15</strong>
              </div>
              <div className="flex justify-between">
                <span>Projects & Internship Portfolio (10 max):</span>
                <strong>{selectedItem.match.breakdown.experienceFitScore} / 10</strong>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-[#E4E4E1] p-4 space-y-2">
                <span className="text-[10px] text-[#111111] uppercase font-bold block">
                  ✓ Directly Matched ({selectedItem.match.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.match.matchedSkills.map(s => (
                    <span key={s} className="bg-white border border-[#111111] px-2 py-0.5 text-[#111111]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-[#E4E4E1] p-4 space-y-2">
                <span className="text-[10px] text-[#858585] uppercase font-bold block">
                  Missing Competencies ({selectedItem.match.missingRequiredSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.match.missingRequiredSkills.map(s => (
                    <span key={s} className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#858585]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Skills */}
            {selectedItem.match.relatedSkills.length > 0 && (
              <div className="border border-[#E4E4E1] p-4 bg-[#FAFAF9] space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#858585] block">
                  RELATED / TRANSFERABLE SKILLS DETECTED
                </span>
                <div className="space-y-1">
                  {selectedItem.match.relatedSkills.map((rel, i) => (
                    <div key={i} className="text-[#666666]">
                      • Candidate skill <strong className="text-[#111111]">{rel.studentSkill}</strong> correlates with requirement <strong className="text-[#111111]">{rel.relatedTo}</strong>.
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Next Step */}
            <div className="pt-2 border-t border-[#E4E4E1] flex items-center justify-between text-xs font-mono">
              <Link to="/student/skills" className="text-[#111111] font-bold hover:underline flex items-center gap-1">
                <BookOpen size={13} /> Bridge Identified Skill Gaps →
              </Link>
              <Link to={`/opportunities/${selectedItem.job.id}`}>
                <Button variant="primary" size="sm">
                  Apply for Opening
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
