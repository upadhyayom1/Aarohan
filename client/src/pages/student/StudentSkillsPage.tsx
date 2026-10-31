import React, { useMemo, useState } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../../components/ui';
import {
  BookOpen,
  ExternalLink,
  CheckCircle,
  Bookmark,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export function StudentSkillsPage() {
  const { studentProfile, jobs, skillResources, actions } = useCampusStore();
  const [filterType, setFilterType] = useState<'All' | 'Saved' | 'Completed'>('All');

  // Compute market demand across campus openings
  const marketDemand = useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach(j => {
      j.requiredSkills.forEach(s => counts.set(s, (counts.get(s) || 0) + 1));
      j.preferredSkills?.forEach(s => counts.set(s, (counts.get(s) || 0) + 1));
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const studentSkillsSet = useMemo(() => {
    return new Set(studentProfile.skills.map(s => s.toLowerCase()));
  }, [studentProfile.skills]);

  const missingMarketSkills = useMemo(() => {
    return marketDemand.filter(([skill]) => !studentSkillsSet.has(skill.toLowerCase()));
  }, [marketDemand, studentSkillsSet]);

  const filteredResources = useMemo(() => {
    return skillResources.filter(r => {
      if (filterType === 'Saved') return r.isSaved;
      if (filterType === 'Completed') return r.isCompleted;
      return true;
    });
  }, [skillResources, filterType]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            CAREER ADVANCEMENT & CURRICULUM
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Skill Development & Resources
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Targeted learning pathways curated from identified campus recruitment demands to close technical competency gaps.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-[#FAFAF9] border border-[#E4E4E1] p-1 font-mono text-xs rounded-[2px]">
          {(['All', 'Saved', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1 rounded-[2px] transition-colors ${
                filterType === tab ? 'bg-[#111111] text-white font-medium' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Market Skill Matrix */}
      <div className="border border-[#222222] bg-[#FAFAF9] p-6 space-y-6 rounded-[2px]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
            CAMPUS RECRUITMENT MARKET DEMAND
          </span>
          <h2 className="text-lg font-bold text-[#111111]">
            Skills Required by Participating Employers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Currently Mastered */}
          <div className="p-4 bg-white border border-[#E4E4E1] space-y-2">
            <span className="text-[10px] text-[#111111] font-bold uppercase block">
              ✓ Verified in Your Profile ({studentProfile.skills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {studentProfile.skills.map(s => (
                <span key={s} className="bg-[#FAFAF9] border border-[#111111] text-[#111111] px-2 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Underrepresented / In Demand */}
          <div className="p-4 bg-white border border-[#E4E4E1] space-y-2">
            <span className="text-[10px] text-[#858585] font-bold uppercase block">
              In-Demand Missing Competencies ({missingMarketSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingMarketSkills.map(([skill, count]) => (
                <span key={skill} className="bg-white border border-[#E4E4E1] text-[#666666] px-2 py-0.5">
                  {skill} ({count} openings)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Curated Resources List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold uppercase font-mono tracking-wider text-[#111111] border-b border-[#E4E4E1] pb-2">
          Recommended Learning Modules & Catalogs
        </h2>

        <div className="divide-y divide-[#E4E4E1] border border-[#E4E4E1] bg-white">
          {filteredResources.map(res => (
            <div
              key={res.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAF9] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                    {res.resourceType}
                  </span>
                  <span className="text-xs font-mono text-[#858585]">• {res.provider}</span>
                </div>
                <h3 className="text-base font-bold text-[#111111]">
                  {res.title}
                </h3>
                <div className="flex items-center gap-4 text-xs font-mono text-[#666666] pt-1">
                  <span>Targets Competency: <strong className="text-[#111111]">{res.relevantSkill}</strong></span>
                  <span>•</span>
                  <span>Duration: {res.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => actions.toggleSaveSkillResource(res.id)}
                  className={`p-2 border rounded-[2px] transition-colors ${
                    res.isSaved
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E4E4E1] text-[#666666] hover:text-[#111111]'
                  }`}
                  title={res.isSaved ? 'Saved to learning list' : 'Save for later'}
                >
                  <Bookmark size={15} />
                </button>

                <button
                  onClick={() => actions.toggleCompleteSkillResource(res.id)}
                  className={`px-3 py-1.5 text-xs font-mono border rounded-[2px] transition-colors flex items-center gap-1.5 ${
                    res.isCompleted
                      ? 'border-[#111111] bg-white text-[#111111] font-bold'
                      : 'border-[#E4E4E1] bg-white text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  <CheckCircle size={14} />
                  <span>{res.isCompleted ? 'Completed' : 'Mark Done'}</span>
                </button>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#111111] font-bold hover:underline px-2"
                >
                  Access <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
