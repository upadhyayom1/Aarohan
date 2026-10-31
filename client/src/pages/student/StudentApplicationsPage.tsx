import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { ApplicationStatus } from '../../types';
import { Button, Input, Select, StatusBadge, MetricSummary } from '../../components/ui';
import { Search, ChevronRight, Filter, Building, Calendar } from 'lucide-react';

export function StudentApplicationsPage() {
  const { navigate } = useRouter();
  const { applications, studentProfile } = useCampusStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const studentApps = useMemo(() => {
    return applications.filter(a => a.studentId === studentProfile.id);
  }, [applications, studentProfile.id]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: studentApps.length,
      underReview: studentApps.filter(a => a.status === 'Under Review').length,
      shortlisted: studentApps.filter(a => a.status === 'Shortlisted').length,
      interviews: studentApps.filter(a => a.status === 'Interview Scheduled').length,
      selected: studentApps.filter(a => a.status === 'Selected').length,
    };
  }, [studentApps]);

  // Filtered
  const filteredApps = useMemo(() => {
    return studentApps.filter(app => {
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !app.jobTitle.toLowerCase().includes(q) &&
          !app.company.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [studentApps, statusFilter, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            CANDIDACY RECRUITMENT TRACKER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            My Applications
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Monitor the status of your submitted candidacy dossiers and review feedback from campus recruiters.
          </p>
        </div>

        <Link to="/student/opportunities">
          <Button variant="primary" size="sm">
            Find New Openings
          </Button>
        </Link>
      </div>

      {/* Summary Counts Bar */}
      <div className="border border-[#E4E4E1] bg-[#FAFAF9] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          <MetricSummary label="Total Applications" value={counts.total} />
          <MetricSummary label="Under Review" value={counts.underReview} />
          <MetricSummary label="Shortlisted" value={counts.shortlisted} />
          <MetricSummary label="Interviews" value={counts.interviews} />
          <MetricSummary label="Selected" value={counts.selected} />
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <span className="text-xs font-mono text-[#858585] hidden sm:inline">Status:</span>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </Select>
        </div>
      </div>

      {/* Applications Table (Desktop) / Cards (Mobile) */}
      {filteredApps.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <p className="text-sm text-[#666666]">No applications match the current filter criteria.</p>
          {statusFilter !== 'All' && (
            <div className="pt-3">
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter('All')}>
                View All Applications
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-[#E4E4E1] bg-white">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] uppercase tracking-wider text-[#858585]">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Employer</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latest Update</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E1]">
                {filteredApps.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/student/applications/${app.id}`)}
                    className="hover:bg-[#F5F5F3] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{app.jobTitle}</td>
                    <td className="py-3.5 px-4 text-[#444444]">{app.company}</td>
                    <td className="py-3.5 px-4 text-[#666666]">{app.appliedDate}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#666666]">{app.latestUpdateDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-[#111111] hover:underline inline-flex items-center gap-1">
                        Review Dossier <ChevronRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Items */}
          <div className="md:hidden divide-y divide-[#E4E4E1]">
            {filteredApps.map(app => (
              <div
                key={app.id}
                onClick={() => navigate(`/student/applications/${app.id}`)}
                className="p-4 space-y-2 hover:bg-[#F5F5F3] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#111111]">{app.jobTitle}</h3>
                    <span className="text-xs font-mono text-[#666666]">{app.company}</span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[#858585] pt-1">
                  <span>Applied: {app.appliedDate}</span>
                  <span>Fit: {app.matchScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
