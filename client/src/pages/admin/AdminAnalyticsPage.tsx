import React, { useState, useEffect } from 'react';
import { MetricSummary } from '../../components/ui';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

export function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<{
    kpis: {
      total_applications: number;
      interview_conversion_rate: number;
      selection_conversion_rate: number;
      department_breadth: number;
    };
    department_performance: Array<{
      branch: string;
      applicants: number;
      placed: number;
      rate: number;
    }>;
    in_demand_skills: Array<{ skill: string; count: number }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.admin
      .getAnalytics()
      .then((data) => {
        if (!isMounted) return;
        if (data) setAnalyticsData(data);
      })
      .catch((err) => {
        console.warn('Failed to load live analytics:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const branchData = analyticsData?.department_performance || [];
  const inDemandSkillsList = analyticsData?.in_demand_skills || [];

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

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2 border border-[#E4E4E1] bg-white">
          <Loader2 className="animate-spin text-[#111111]" size={20} />
          <span>Aggregating institutional placement metrics from database...</span>
        </div>
      ) : (
        <>
          {/* KPI Bar */}
          <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricSummary
                label="Total Applications Processed"
                value={analyticsData?.kpis.total_applications ?? 0}
                sublabel="Current recruitment period"
              />
              <MetricSummary
                label="Interview Conversion Rate"
                value={`${analyticsData?.kpis.interview_conversion_rate ?? 0}%`}
                sublabel="Application-to-interview"
              />
              <MetricSummary
                label="Selection Conversion Rate"
                value={`${analyticsData?.kpis.selection_conversion_rate ?? 0}%`}
                sublabel="Interview-to-offer"
              />
              <MetricSummary
                label="Department Breadth"
                value={analyticsData?.kpis.department_breadth ?? 0}
                sublabel="Disciplines placed"
              />
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
            </div>

            {branchData.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#858585]">
                No department application data recorded yet.
              </div>
            ) : (
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
                        style={{ width: `${Math.min(100, Math.max(0, item.rate))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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

            {inDemandSkillsList.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#858585]">
                No job postings or skill requirements recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                {inDemandSkillsList.map(item => (
                  <div key={item.skill} className="p-4 bg-white border border-[#E4E4E1] space-y-1">
                    <span className="text-[10px] text-[#858585] uppercase block">Competency</span>
                    <strong className="text-base text-[#111111] block">{item.skill}</strong>
                    <span className="text-[11px] text-[#666666]">Required in {item.count} openings</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
