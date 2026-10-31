import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { calculateMatch, checkEligibility } from '../../lib/matching';
import { Button, Input, Select, StatusBadge } from '../../components/ui';
import {
  Search,
  Filter,
  X,
  Building,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export function OpportunitiesPage({ isStudentPortal = false }: { isStudentPortal?: boolean }) {
  const { navigate } = useRouter();
  const { jobs, studentProfile, applications, currentUser } = useCampusStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedWorkArrangement, setSelectedWorkArrangement] = useState('All');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Collect unique branches and skills
  const allBranches = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => j.eligibleBranches.forEach(b => set.add(b)));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => j.requiredSkills.forEach(s => set.add(s)));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  // Map applied job IDs
  const appliedJobMap = useMemo(() => {
    const map = new Map<string, string>();
    applications.forEach(a => {
      if (a.studentId === studentProfile.id && a.status !== 'Withdrawn') {
        map.set(a.jobId, a.status);
      }
    });
    return map;
  }, [applications, studentProfile.id]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesSkill = job.requiredSkills.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
      }

      // Branch
      if (selectedBranch !== 'All') {
        const matchesBranch = job.eligibleBranches.some(
          b => b.toLowerCase() === selectedBranch.toLowerCase() || b.toLowerCase() === 'all branches'
        );
        if (!matchesBranch) return false;
      }

      // Work arrangement
      if (selectedWorkArrangement !== 'All' && job.workArrangement !== selectedWorkArrangement) {
        return false;
      }

      // Employment type
      if (selectedEmploymentType !== 'All' && job.employmentType !== selectedEmploymentType) {
        return false;
      }

      // Skill
      if (selectedSkill !== 'All' && !job.requiredSkills.includes(selectedSkill)) {
        return false;
      }

      // Eligibility
      if (eligibleOnly) {
        const el = checkEligibility(studentProfile, job);
        if (!el.isEligible) return false;
      }

      return true;
    });
  }, [
    jobs,
    searchQuery,
    selectedBranch,
    selectedWorkArrangement,
    selectedEmploymentType,
    selectedSkill,
    eligibleOnly,
    studentProfile,
  ]);

  const activeFiltersCount =
    (selectedBranch !== 'All' ? 1 : 0) +
    (selectedWorkArrangement !== 'All' ? 1 : 0) +
    (selectedEmploymentType !== 'All' ? 1 : 0) +
    (selectedSkill !== 'All' ? 1 : 0) +
    (eligibleOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBranch('All');
    setSelectedWorkArrangement('All');
    setSelectedEmploymentType('All');
    setSelectedSkill('All');
    setEligibleOnly(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-8 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          CAMPUS RECRUITMENT REGISTRY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
          Find your next opportunity.
        </h1>
        <p className="text-sm sm:text-base text-[#666666] mt-2 max-w-2xl leading-relaxed">
          Explore openings, understand eligibility, and discover roles aligned with your verified academic profile.
        </p>

        {/* Compact summary metrics */}
        <div className="flex flex-wrap items-center gap-6 pt-6 text-xs font-mono text-[#666666]">
          <div>
            Showing <strong className="text-[#111111]">{filteredJobs.length}</strong> of{' '}
            <strong className="text-[#111111]">{jobs.length}</strong> active openings
          </div>
          <div>•</div>
          <div>
            Student CGPA: <strong className="text-[#111111]">{studentProfile.cgpa.toFixed(2)}</strong> ({studentProfile.branch.slice(0, 20)}...)
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 text-[#858585]" size={16} />
            <Input
              type="text"
              placeholder="Search by role, company, or skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex md:col-span-8 items-center gap-3">
            <div className="flex-1">
              <Select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="All">All Departments</option>
                {allBranches.filter(b => b !== 'All').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </div>

            <div className="w-36">
              <Select
                value={selectedWorkArrangement}
                onChange={e => setSelectedWorkArrangement(e.target.value)}
                aria-label="Filter by work arrangement"
              >
                <option value="All">Arrangement</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </Select>
            </div>

            <div className="w-36">
              <Select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
                aria-label="Filter by required skill"
              >
                <option value="All">Skill</option>
                {allSkills.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono select-none cursor-pointer whitespace-nowrap px-2 py-2 border border-[#E4E4E1] bg-white rounded-[2px]">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={e => setEligibleOnly(e.target.checked)}
                className="rounded-[2px] accent-black cursor-pointer"
              />
              <span>Eligible Only</span>
            </label>
          </div>

          {/* Mobile Filter Trigger */}
          <div className="flex md:hidden items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              icon={<Filter size={14} />}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Button>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-[#858585] underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden border border-[#222222] p-4 bg-[#FAFAF9] space-y-3 rounded-[2px]">
            <div>
              <label className="text-xs font-mono uppercase text-[#858585] block mb-1">Department</label>
              <Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                <option value="All">All Departments</option>
                {allBranches.filter(b => b !== 'All').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-[#858585] block mb-1">Work Arrangement</label>
              <Select value={selectedWorkArrangement} onChange={e => setSelectedWorkArrangement(e.target.value)}>
                <option value="All">All Arrangements</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-[#858585] block mb-1">Required Skill</label>
              <Select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
                <option value="All">All Skills</option>
                {allSkills.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="checkbox"
                  checked={eligibleOnly}
                  onChange={e => setEligibleOnly(e.target.checked)}
                  className="accent-black"
                />
                <span>Show only jobs matching my eligibility</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setMobileFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-[#858585]">Active Filters:</span>
            {selectedBranch !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#F5F5F3] border border-[#E4E4E1] px-2 py-0.5 rounded-[2px]">
                Dept: {selectedBranch}
                <button onClick={() => setSelectedBranch('All')} className="hover:text-black">✕</button>
              </span>
            )}
            {selectedWorkArrangement !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#F5F5F3] border border-[#E4E4E1] px-2 py-0.5 rounded-[2px]">
                {selectedWorkArrangement}
                <button onClick={() => setSelectedWorkArrangement('All')} className="hover:text-black">✕</button>
              </span>
            )}
            {selectedSkill !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#F5F5F3] border border-[#E4E4E1] px-2 py-0.5 rounded-[2px]">
                Skill: {selectedSkill}
                <button onClick={() => setSelectedSkill('All')} className="hover:text-black">✕</button>
              </span>
            )}
            {eligibleOnly && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#111111] text-white px-2 py-0.5 rounded-[2px]">
                Eligible Only
                <button onClick={() => setEligibleOnly(false)} className="hover:text-neutral-300">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#F5F5F3] border border-[#E4E4E1] px-2 py-0.5 rounded-[2px]">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-black">✕</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-mono text-[#858585] hover:text-[#111111] underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Listings Grid */}
      {filteredJobs.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-base font-semibold text-[#111111]">No opportunities match your current filters.</h3>
            <p className="text-xs text-[#666666]">
              Try resetting your department, skill, or eligibility filters to view all campus opportunities.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => {
            const match = calculateMatch(studentProfile, job);
            const appliedStatus = appliedJobMap.get(job.id);

            return (
              <div
                key={job.id}
                className="border border-[#E4E4E1] bg-white p-6 flex flex-col justify-between hover:border-[#111111] transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Company & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block truncate max-w-[200px]">
                        {job.company}
                      </span>
                      <h2
                        onClick={() => navigate(`/opportunities/${job.id}`)}
                        className="text-lg font-bold text-[#111111] mt-1 leading-snug hover:underline cursor-pointer group-hover:text-black"
                      >
                        {job.title}
                      </h2>
                    </div>
                    <span className="w-9 h-9 border border-[#222222] flex items-center justify-center font-mono font-bold text-xs uppercase bg-[#F5F5F3] shrink-0">
                      {job.companyInitials}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#666666]">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.workArrangement}</span>
                    <span>•</span>
                    <span>{job.employmentType}</span>
                  </div>

                  {/* AI Match & Eligibility indicators */}
                  <div className="bg-[#FAFAF9] border border-[#E4E4E1] p-3 space-y-2 rounded-[2px]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#666666] flex items-center gap-1">
                        <Sparkles size={12} className="text-[#111111]" />
                        Match Fit:
                      </span>
                      <strong className="text-[#111111]">{match.overallScore}%</strong>
                    </div>
                    {/* Linear progress indicator */}
                    <div className="w-full bg-[#E4E4E1] h-1.5 rounded-[1px] overflow-hidden">
                      <div
                        className="bg-[#111111] h-full"
                        style={{ width: `${match.overallScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <span className="text-[#858585]">Eligibility:</span>
                      {match.isEligible ? (
                        <span className="text-[#111111] font-semibold flex items-center gap-1">
                          <CheckCircle size={11} /> Eligible
                        </span>
                      ) : (
                        <span className="text-[#858585] flex items-center gap-1">
                          <AlertCircle size={11} /> Ineligible (CGPA/Branch)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#858585] block mb-1.5">
                      Required Competencies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map(skill => {
                        const isStudentSkill = studentProfile.skills
                          .map(s => s.toLowerCase())
                          .includes(skill.toLowerCase());
                        return (
                          <span
                            key={skill}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] ${
                              isStudentSkill
                                ? 'bg-white border border-[#111111] text-[#111111] font-medium'
                                : 'bg-[#F5F5F3] border border-[#E4E4E1] text-[#666666]'
                            }`}
                          >
                            {isStudentSkill ? `✓ ${skill}` : skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Actions */}
                <div className="pt-6 mt-6 border-t border-[#E4E4E1] flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="text-[11px] text-[#858585]">
                    Closes: {job.deadline}
                  </div>

                  {appliedStatus ? (
                    <StatusBadge status={appliedStatus} />
                  ) : (
                    <Link to={`/opportunities/${job.id}`}>
                      <Button variant="primary" size="sm" icon={<ChevronRight size={14} />}>
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
