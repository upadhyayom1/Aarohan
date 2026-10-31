import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';
import { Input, Select, StatusBadge } from '../../components/ui';
import { Loader2 } from 'lucide-react';

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function fetchApplications() {
      try {
        setLoading(true);
        const res = await api.admin.getApplications();
        if (mounted && res?.applications) {
          setApplications(res.applications);
        }
      } catch (err) {
        console.warn('Backend admin applications error:', err);
        if (mounted) setApplications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchApplications();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const rawStatus = (a.status || '').toLowerCase();
      const rawFilter = statusFilter.toLowerCase();
      if (statusFilter !== 'All') {
        if (rawFilter === 'interview scheduled' && (rawStatus === 'interview_scheduled' || rawStatus === 'interview scheduled')) {
          // match
        } else if (rawFilter === 'under review' && (rawStatus === 'under review' || rawStatus === 'applied')) {
          // match
        } else if (rawStatus !== rawFilter && !rawStatus.includes(rawFilter)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const candidate = (a.student_name || '').toLowerCase();
        const title = (a.job_title || '').toLowerCase();
        const comp = (a.company || '').toLowerCase();
        if (!candidate.includes(q) && !title.includes(q) && !comp.includes(q)) {
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
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2">
            <Loader2 className="animate-spin text-[#111111]" size={18} />
            <span>Loading university application dossiers from database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-[#858585]">
            No applications found matching the selected filters.
          </div>
        ) : (
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
                {filtered.map(app => {
                  const id = app.id;
                  const name = app.student_name || 'Candidate';
                  const comp = app.company || '—';
                  const job = app.job_title || 'Role';
                  const cgpa = typeof app.student_cgpa === 'number'
                    ? app.student_cgpa.toFixed(2)
                    : '—';
                  const status = app.status || 'applied';
                  const updated = app.latest_update_date || app.applied_date || '—';

                  return (
                    <tr key={id} className="hover:bg-[#F5F5F3]">
                      <td className="py-3.5 px-4 text-[#858585]">{id.slice(0, 10)}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">{name}</td>
                      <td className="py-3.5 px-4 text-[#444444]">{comp}</td>
                      <td className="py-3.5 px-4">{job}</td>
                      <td className="py-3.5 px-4 font-bold">{cgpa}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#666666]">
                        {typeof updated === 'string' && updated.includes('T') ? updated.split('T')[0] : updated}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
