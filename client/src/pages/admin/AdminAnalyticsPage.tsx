import React, { useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { MetricSummary } from '../../components/ui';
import { BarChart3, TrendingUp, PieChart, Users, Award, ShieldCheck } from 'lucide-react';

export function AdminAnalyticsPage() {
  const { applications, jobs, drives } = useCampusStore();

  // Branch statistics
  const branchData = [
    { branch: 'Computer Science & Engineering', applicants: 185, placed: 32, rate: 86 },
    { branch: 'Information Technology', applicants: 94, placed: 18, rate: 78 },
    { branch: 'Electrical & Computer Engineering', applicants: 68, placed: 12, rate: 72 },
    { branch: 'Data Science', applicants: 45, placed: 9, rate: 84 },
    { branch: 'Mechanical Engineering', applicants: 20, placed: 3, rate: 65 },
  ];

  // Most required skills across all active jobs
  const skillDemands = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach(j => {
      j.requiredSkills.forEach(s => map.set(s, (map.get(s) || 0) + 1));
      j.preferredSkills?.forEach(s => map.set(s, (map.get(s) || 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [jobs]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          INSTITUTIONAL METRICS & INTELLIGENCE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Placement Directorate Analytics
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Empirical hiring outcomes, academic department conversion rates, and industry technical skill requirements.
        </p>
      </div>

      {/* KPI Bar */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSummary label="Total Applications Processed" value={applications.length} sublabel="Current recruitment period" />
          <MetricSummary label="Interview Conversion Rate" value="28%" sublabel="Application-to-interview" />
          <MetricSummary label="Selection Conversion Rate" value="14%" sublabel="Interview-to-offer" />
          <MetricSummary label="Department Breadth" value="5" sublabel="Disciplines placed" />
        </div>
      </div>

      {/* Department Conversion Rates */}
      <div className="border border-[#222222] bg-white p-6 sm:p-8 space-y-6 rounded-[2px]">
        <div className="border-b border-[#E4E4E1] pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
              ACADEMIC DEPARTMENT PERFORMANCE
            </span>
            <h2 className="text-base font-bold text-[#111111]">
              Placement Outcomes by Branch
            </h2>
          </div>
          <span className="text-xs font-mono text-[#858585]">
            Verified AY 2026–2027
          </span>
        </div>

        <div className="space-y-5 font-mono text-xs">
          {branchData.map(item => (
            <div key={item.branch} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <strong className="text-sm text-[#111111]">{item.branch}</strong>
                <span className="text-[#858585]">
                  {item.applicants} Candidates • {item.placed} Placed ({item.rate}% Placement Index)
                </span>
              </div>
              <div className="w-full bg-[#F5F5F3] h-3 border border-[#E4E4E1] rounded-[1px] overflow-hidden">
                <div
                  className="bg-[#111111] h-full transition-all duration-300"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skill Demand Matrix */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E4E4E1] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
            CURRICULUM ALIGNMENT INTELLIGENCE
          </span>
          <h2 className="text-base font-bold text-[#111111]">
            Most In-Demand Technical Competencies
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Aggregated from corporate placement opening prerequisites.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          {skillDemands.map(([skill, count]) => (
            <div key={skill} className="p-4 bg-white border border-[#E4E4E1] space-y-1">
              <span className="text-[10px] text-[#858585] uppercase block">Competency</span>
              <strong className="text-base text-[#111111] block">{skill}</strong>
              <span className="text-[11px] text-[#666666]">Required in {count} openings</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
