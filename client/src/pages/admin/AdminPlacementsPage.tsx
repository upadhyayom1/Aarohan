import React from 'react';
import { useCampusStore } from '../../lib/useStore';
import { MetricSummary, StatusBadge } from '../../components/ui';
import { Award, Building, GraduationCap, CheckCircle2 } from 'lucide-react';

export function AdminPlacementsPage() {
  const { applications, jobs } = useCampusStore();

  const confirmedPlacements = [
    {
      id: 'plc_1',
      studentName: 'Dev Sharma',
      studentId: 'STU-2022-CSE-018',
      branch: 'Computer Science & Engineering',
      company: 'Apex Systems',
      role: 'Software Development Engineer I',
      compensation: '$125,000 / yr',
      dateConfirmed: '2026-10-29',
    },
    {
      id: 'plc_2',
      studentName: 'Aisha Khan',
      studentId: 'STU-2022-DS-012',
      branch: 'Data Science',
      company: 'Horizon AI Labs',
      role: 'Machine Learning Research Engineer',
      compensation: '$145,000 / yr',
      dateConfirmed: '2026-10-27',
    },
    {
      id: 'plc_3',
      studentName: 'Siddharth Rao',
      studentId: 'STU-2022-ECE-044',
      branch: 'Electrical & Computer Engineering',
      company: 'Crest Robotics',
      role: 'Embedded Systems Engineer',
      compensation: '$110,000 / yr',
      dateConfirmed: '2026-10-24',
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          CONFIRMED INSTITUTIONAL OUTCOMES
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Placement Outcomes & Selections
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          Official ledger of accepted corporate employment offers for graduating class cohorts.
        </p>
      </div>

      {/* KPI Bar */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSummary label="Verified Offers" value={confirmedPlacements.length} sublabel="Current recruitment period" />
          <MetricSummary label="Average Compensation" value="$126,600" sublabel="Base starting salary" />
          <MetricSummary label="Highest Package" value="$145,000" sublabel="Horizon AI Labs" />
          <MetricSummary label="Partner Companies Hiring" value="3" sublabel="Active corporate selections" />
        </div>
      </div>

      {/* Verified Selections Table */}
      <div className="border border-[#222222] bg-white">
        <div className="p-5 border-b border-[#E4E4E1] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#111111]">
            Official Placement Selections Ledger
          </h2>
          <span className="text-xs font-mono text-[#858585]">
            Verified with Department Deans
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Corporate Employer</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4 text-right">Date Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E1]">
              {confirmedPlacements.map(plc => (
                <tr key={plc.id} className="hover:bg-[#F5F5F3]">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{plc.studentName}</td>
                  <td className="py-3.5 px-4 text-[#444444]">{plc.branch}</td>
                  <td className="py-3.5 px-4 font-bold">{plc.company}</td>
                  <td className="py-3.5 px-4">{plc.role}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{plc.compensation}</td>
                  <td className="py-3.5 px-4 text-right text-[#666666]">{plc.dateConfirmed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
