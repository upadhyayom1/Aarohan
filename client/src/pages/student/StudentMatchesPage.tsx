import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch } from '../../lib/matching';
import { api, MatchResult, SkillGapResult, MatchComparison } from '../../lib/api';
import { Button, MetricSummary } from '../../components/ui';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Building,
  GraduationCap,
  RefreshCw,
  Cpu,
  Layers,
  Clock,
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
  const [aiMatch, setAiMatch] = useState<MatchResult | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapResult | null>(null);
  const [comparison, setComparison] = useState<MatchComparison | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  // Fetch AI Match & Skill Gaps when selected job changes
  useEffect(() => {
    let active = true;
    if (!studentProfile.id || !selectedJobId) return;

    const fetchAiInsights = async () => {
      setIsLoadingAi(true);
      setAiError(null);
      setComparison(null);

      try {
        const [matchRes, gapsRes] = await Promise.all([
          api.ai.matchResume(studentProfile.id, selectedJobId).catch(() => null),
          api.ai.getSkillGaps(studentProfile.id, selectedJobId).catch(() => null),
        ]);

        if (active) {
          if (matchRes) setAiMatch(matchRes);
          if (gapsRes) setSkillGaps(gapsRes);
        }
      } catch (err: any) {
        if (active) {
          console.debug('AI matching service fallback:', err);
        }
      } finally {
        if (active) setIsLoadingAi(false);
      }
    };

    fetchAiInsights();
    return () => {
      active = false;
    };
  }, [studentProfile.id, selectedJobId]);

  const handleRunComparison = async () => {
    if (!studentProfile.id || !selectedJobId) return;
    setIsComparing(true);
    setAiError(null);
    try {
      const comp = await api.ai.compareMatching(studentProfile.id, selectedJobId);
      setComparison(comp);
    } catch (err: any) {
      console.warn('Comparison failed:', err);
      setAiError('Could not execute semantic comparison. Using deterministic matching.');
    } finally {
      setIsComparing(false);
    }
  };

  const displayedScore = aiMatch ? aiMatch.match_score : selectedItem?.match.overallScore ?? 0;
  const displayedExplanation = aiMatch?.explanation || selectedItem?.match.matchExplanation || '';
  const displayedMatchedSkills = aiMatch ? aiMatch.matched_skills : selectedItem?.match.matchedSkills || [];
  const displayedMissingSkills = aiMatch ? aiMatch.missing_skills : selectedItem?.match.missingRequiredSkills || [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            EXPLAINABLE AI ENGINE (TF-IDF & NEURAL EMBEDDINGS)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            AI Match Insights
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Transparent, explainable evaluations of your academic profile and resume against active campus openings.
          </p>
        </div>

        {selectedItem && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunComparison}
            disabled={isComparing}
            icon={<Cpu size={14} className={isComparing ? 'animate-spin' : ''} />}
          >
            {isComparing ? 'Evaluating Models...' : 'Compare Semantic vs Keyword AI'}
          </Button>
        )}
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
      {matchResults.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <h3 className="text-base font-bold text-[#111111] mb-1">No Placement Opportunities Found</h3>
          <p className="text-xs font-mono text-[#666666]">
            Opportunities will appear here for AI match analysis once published by recruiters or administrators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Match Listings */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-mono uppercase text-[#858585] tracking-widest block mb-2">
            SELECT VACANCY FOR FULL FIT BREAKDOWN
          </span>

          <div className="space-y-3">
            {matchResults.map(({ job, match }) => {
              const isSelected = job.id === selectedJobId;
              const currentScore = isSelected && aiMatch ? aiMatch.match_score : match.overallScore;

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
                      {currentScore}%
                    </span>
                  </div>

                  <div className="w-full bg-[#E4E4E1] h-1.5 rounded-[1px] overflow-hidden my-2.5">
                    <div
                      className="bg-[#111111] h-full"
                      style={{ width: `${currentScore}%` }}
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585]">
                    AI FIT AUDIT
                  </span>
                  {isLoadingAi && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#111111] bg-[#FAFAF9] px-2 py-0.5 border border-[#E4E4E1]">
                      <RefreshCw size={10} className="animate-spin" /> Live AI Inference
                    </span>
                  )}
                  {aiMatch && !isLoadingAi && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white bg-[#111111] px-2 py-0.5 rounded-[2px]">
                      <Sparkles size={10} /> Neural / TF-IDF Scored
                    </span>
                  )}
                </div>
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
                  {displayedScore} / 100
                </span>
              </div>
              <div className="w-full bg-[#E4E4E1] h-2.5 rounded-[2px] overflow-hidden">
                <div
                  className="bg-[#111111] h-full transition-all duration-300"
                  style={{ width: `${displayedScore}%` }}
                />
              </div>
              <p className="text-xs text-[#444444] pt-1 leading-relaxed">
                {displayedExplanation}
              </p>
            </div>

            {/* Comparison Module (Keyword vs Semantic) */}
            {comparison && (
              <div className="border-2 border-[#111111] bg-[#FAFAF9] p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-[#111111]" />
                    <span className="font-bold text-[#111111] uppercase tracking-wider text-[10px]">
                      Model Comparison ({comparison.embedding_backend.toUpperCase()})
                    </span>
                  </div>
                  <button
                    onClick={() => setComparison(null)}
                    className="text-[#858585] hover:text-[#111111] text-[10px] underline"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-[#E4E4E1]">
                    <span className="text-[10px] text-[#858585] block mb-1">Exact Keyword Match</span>
                    <span className="text-xl font-bold text-[#111111]">{comparison.keyword_score}%</span>
                    <span className="text-[10px] text-[#666666] block mt-1">
                      {comparison.keyword_matched.length} matched keywords
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#111111]">
                    <span className="text-[10px] text-[#111111] font-bold block mb-1">Semantic Embedding Fit</span>
                    <span className="text-xl font-bold text-[#111111]">{comparison.semantic_score}%</span>
                    <span className="text-[10px] text-[#666666] block mt-1">
                      {comparison.semantic_matched.length} semantic clusters
                    </span>
                  </div>
                </div>

                {comparison.found_only_by_semantic.length > 0 && (
                  <div>
                    <span className="text-[10px] text-[#111111] uppercase font-bold block mb-1">
                      Skills Discovered Exclusively via Semantic Context
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comparison.found_only_by_semantic.map(s => (
                        <span key={s} className="bg-white border border-[#111111] px-2 py-0.5 text-[#111111]">
                          ✨ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dimensional Score Breakdown */}
            <div className="border border-[#E4E4E1] p-4 bg-[#FAFAF9] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#858585] block border-b border-[#E4E4E1] pb-1">
                COMPUTED DIMENSIONS
              </span>
              <div className="flex justify-between">
                <span>Core Skill Overlap:</span>
                <strong>{selectedItem.match.breakdown.skillFitScore} / 75</strong>
              </div>
              <div className="flex justify-between">
                <span>Academic & CGPA Standard:</span>
                <strong>{selectedItem.match.breakdown.academicFitScore} / 15</strong>
              </div>
              <div className="flex justify-between">
                <span>Projects & Internship Portfolio:</span>
                <strong>{selectedItem.match.breakdown.experienceFitScore} / 10</strong>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-[#E4E4E1] p-4 space-y-2">
                <span className="text-[10px] text-[#111111] uppercase font-bold block">
                  ✓ Directly Matched ({displayedMatchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {displayedMatchedSkills.map(s => (
                    <span key={s} className="bg-white border border-[#111111] px-2 py-0.5 text-[#111111]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-[#E4E4E1] p-4 space-y-2">
                <span className="text-[10px] text-[#858585] uppercase font-bold block">
                  Missing Competencies ({displayedMissingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {displayedMissingSkills.map(s => (
                    <span key={s} className="bg-white border border-[#E4E4E1] px-2 py-0.5 text-[#858585]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Skill Gap Recommendations */}
            {skillGaps && skillGaps.recommendations.length > 0 && (
              <div className="border border-[#222222] bg-[#FAFAF9] p-5 space-y-3 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#111111] font-bold block border-b border-[#E4E4E1] pb-1">
                  AI-RECOMMENDED LEARNING PATHWAYS FOR THIS ROLE
                </span>
                <div className="space-y-3 pt-1">
                  {skillGaps.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="p-3 bg-white border border-[#E4E4E1] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#111111] text-sm">{rec.skill}</strong>
                        <span className="text-[10px] text-[#858585] flex items-center gap-1">
                          <Clock size={11} /> {rec.estimated_time}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666] leading-relaxed">{rec.why}</p>
                      <div className="text-[11px] text-[#111111] pt-1">
                        Resource: <span className="underline">{rec.learn_from}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Next Step */}
            <div className="pt-2 border-t border-[#E4E4E1] flex items-center justify-between text-xs font-mono">
              <Link to="/student/skills" className="text-[#111111] font-bold hover:underline flex items-center gap-1">
                <BookOpen size={13} /> View Campus Skill Demand →
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
      )}
    </div>
  );
}
