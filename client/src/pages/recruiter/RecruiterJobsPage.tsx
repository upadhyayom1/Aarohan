import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Select, StatusBadge } from '../../components/ui';
import { PlusCircle, Search, Users, ChevronRight, Eye } from 'lucide-react';

export function RecruiterJobsPage() {
  const { navigate } = useRouter();
  const { jobs, currentUser, applications } = useCampusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isAdmin = currentUser.role === 'admin';

  const companyJobs = useMemo(() => {
    if (isAdmin) {
      return jobs;
    }
    return jobs.filter(
      j => j.company.toLowerCase() === (currentUser.organization || 'Apex Systems').toLowerCase() || j.company.includes('Apex')
    );
}, [jobs, currentUser.organization, isAdmin]);

const filteredJobs = useMemo(() => {
  return companyJobs.filter(j => {
    if (statusFilter !== 'All' && j.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
        if (
          !j.title.toLowerCase().includes(q) &&
          !j.location.toLowerCase().includes(q) &&
          !j.company.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
}, [companyJobs, statusFilter, searchQuery]);

return (
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    {/* Header */}
    <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          {isAdmin ? 'INSTITUTIONAL PARTNERS & VACANCIES' : 'VACANCY REPOSITORY'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          {isAdmin ? 'Corporate Partner Openings' : 'Campus Openings'}
        </h1>
        <p className="text-sm text-[#666666] mt-1 max-w-xl">
          {isAdmin
            ? 'Published placement opportunities and candidate application pipelines across all accredited employer partners.'
            : `Published placement opportunities and candidate application pipelines for ${currentUser.organization || 'Apex Systems'}.`}
        </p>
      </div>

      {!isAdmin ? (
        <Link to="/recruiter/jobs/new">
          <Button variant="primary" size="md" icon={<PlusCircle size={15} />}>
            Post Campus Vacancy
          </Button>
        </Link>
      ) : (
        <Link to="/admin/drives/new">
          <Button variant="primary" size="md" icon={<PlusCircle size={15} />}>
            Create Placement Drive
          </Button>
        </Link>
      )}
    </div>

    {/* Toolbar */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="w-full sm:w-80">
        <Input
          placeholder="Search roles, companies, or locations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="w-full sm:w-auto flex items-center gap-3">
        <span className="text-xs font-mono text-[#858585]">Status:</span>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </Select>
      </div>
    </div>

    {/* Jobs Table */}
    <div className="border border-[#E4E4E1] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
            <tr>
              <th className="py-3 px-4">Role Title</th>
              {isAdmin && <th className="py-3 px-4">Employer</th>}
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Arrangement</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Applicants</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E1]">
            {filteredJobs.map(job => {
              const totalApps = applications.filter(a => a.jobId === job.id).length;
              return (
                <tr key={job.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-sm text-[#111111] block">{job.title}</strong>
                    <span className="text-[10px] text-[#858585]">Min CGPA: {job.minCgpa.toFixed(2)}</span>
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      {job.company}
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-3.5 px-4 text-[#444444]">{job.workArrangement} ({job.location})</td>
                  <td className="py-3.5 px-4 text-[#666666]">{job.deadline}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{totalApps}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/opportunities/${job.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye size={13} />}>
                          Preview
                        </Button>
                      </Link>
                      <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                        <Button variant="secondary" size="sm" icon={<Users size={13} />}>
                          Review Applicants
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
