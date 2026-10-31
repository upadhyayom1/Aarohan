import React, { useState, useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Select, StatusBadge } from '../../components/ui';
import { Search, Download, FileCheck2 } from 'lucide-react';

export function AdminApplicationsPage() {
  const { applications } = useCampusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return applications.filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !a.studentName.toLowerCase().includes(q) &&
          !a.jobTitle.toLowerCase().includes(q) &&
          !a.company.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            MASTER APPLICATION REGISTRY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            University Application Monitor
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Live institution-wide ledger of student candidate dossiers transmitted across all partner companies.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search candidate, job, or employer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <span className="text-[#858585]">Status:</span>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E4E4E1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Latest Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E1]">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-[#F5F5F3]">
                  <td className="py-3.5 px-4 text-[#858585]">{app.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{app.studentName}</td>
                  <td className="py-3.5 px-4 text-[#444444]">{app.company}</td>
                  <td className="py-3.5 px-4">{app.jobTitle}</td>
                  <td className="py-3.5 px-4 font-bold">{app.studentCgpa.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#666666]">{app.latestUpdateDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
