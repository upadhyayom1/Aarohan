import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Select } from '../../components/ui';
import api from '../../lib/api';
import { Search, Loader2 } from 'lucide-react';

interface StudentRosterItem {
  id: string;
  name: string;
  studentId: string;
  branch: string;
  cgpa: number;
  cohort: number;
  appliedCount: number;
  shortlistedCount: number;
  resumeUploaded: boolean;
  status: string;
}

export function AdminStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [liveStudents, setLiveStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.admin
      .getStudents()
      .then((res) => {
        if (!isMounted) return;
        if (res?.students) {
          const mapped: StudentRosterItem[] = res.students.map((s, index) => ({
            id: s.id,
            name: s.name,
            studentId: `STU-${s.graduation_year || 2027}-${s.branch}-${String(index + 1).padStart(3, '0')}`,
            branch: s.branch,
            cgpa: typeof s.cgpa === 'number' ? s.cgpa : 0,
            cohort: s.graduation_year || 2027,
            appliedCount: s.applications_count || 0,
            shortlistedCount: s.shortlisted_count || 0,
            resumeUploaded: Boolean(s.resume_uploaded),
            status:
              s.shortlisted_count > 0
                ? 'Shortlisted'
                : s.applications_count > 0
                ? 'Applied'
                : 'Active Candidacy',
          }));
          setLiveStudents(mapped);
        }
      })
      .catch((err) => {
        console.warn('Failed to load students from backend API:', err);
        if (isMounted) setLiveStudents([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRoster = useMemo(() => {
    return liveStudents.filter(s => {
      if (departmentFilter !== 'All' && s.branch !== departmentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [liveStudents, departmentFilter, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            INSTITUTIONAL REGISTRY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Registered Students Roster
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Official records, verified academic CGPAs, and placement drive participation status for graduating seniors.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by student name or institutional ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <span className="text-[#858585]">Department:</span>
          <Select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="w-56"
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
            <option value="CH">CH</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
            <option value="PHD_CS">PHD_CS</option>
            <option value="OTHER">OTHER</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E4E4E1] bg-white">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2">
            <Loader2 className="animate-spin text-[#111111]" size={18} />
            <span>Retrieving student records from database...</span>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-[#858585]">
            No student records found in the database matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">ID Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Cohort</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Shortlisted</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E1]">
                {filteredRoster.map(s => (
                  <tr key={s.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{s.name}</td>
                    <td className="py-3.5 px-4 text-[#858585]">{s.studentId}</td>
                    <td className="py-3.5 px-4 text-[#444444]">{s.branch}</td>
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{s.cgpa.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-[#666666]">{s.cohort}</td>
                    <td className="py-3.5 px-4">{s.appliedCount} submitted</td>
                    <td className="py-3.5 px-4 font-bold text-[#111111]">{s.shortlistedCount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] uppercase font-bold bg-[#FAFAF9] border border-[#222222] px-2 py-0.5 rounded-[2px]">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
