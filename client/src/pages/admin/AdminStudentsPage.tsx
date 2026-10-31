import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Select, StatusBadge } from '../../components/ui';
import api from '../../lib/api';
import { Search, Download, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';

interface StudentRosterItem {
  id: string;
  name: string;
  studentId: string;
  branch: string;
  cgpa: number;
  cohort: number;
  backlogs?: number;
  appliedCount: number;
  shortlistedCount: number;
  resumeUploaded: boolean;
  status: string;
}

export function AdminStudentsPage() {
  const { studentProfile, applications } = useCampusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [liveStudents, setLiveStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.admin
      .getStudents()
      .then((res) => {
        if (!isMounted) return;
        if (res?.students && res.students.length > 0) {
          const mapped: StudentRosterItem[] = res.students.map((s, index) => ({
            id: s.id,
            name: s.name,
            studentId: `STU-2022-${s.branch}-${String(index + 1).padStart(3, '0')}`,
            branch: s.branch,
            cgpa: s.cgpa,
            cohort: s.graduation_year,
            appliedCount: s.applications_count,
            shortlistedCount: s.shortlisted_count,
            resumeUploaded: s.resume_uploaded,
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
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const roster: StudentRosterItem[] = useMemo(() => {
    if (liveStudents.length > 0) {
      return liveStudents;
    }
    // Fallback sample cohort
    return [
      {
        id: studentProfile.id,
        name: studentProfile.fullName,
        studentId: 'STU-2022-CSE-042',
        branch: studentProfile.branch,
        cgpa: studentProfile.cgpa,
        cohort: studentProfile.graduationYear,
        appliedCount: applications.filter(a => a.studentId === studentProfile.id).length,
        shortlistedCount: 1,
        resumeUploaded: true,
        status: 'Active Candidacy',
      },
      {
        id: 'stu_dev_sharma',
        name: 'Dev Sharma',
        studentId: 'STU-2022-CSE-018',
        branch: 'CSE',
        cgpa: 9.30,
        cohort: 2026,
        appliedCount: 5,
        shortlistedCount: 2,
        resumeUploaded: true,
        status: 'Shortlisted',
      },
      {
        id: 'stu_priya_nair',
        name: 'Priya Nair',
        studentId: 'STU-2022-IT-089',
        branch: 'IT',
        cgpa: 8.42,
        cohort: 2026,
        appliedCount: 3,
        shortlistedCount: 0,
        resumeUploaded: true,
        status: 'Under Review',
      },
    ];
  }, [liveStudents, studentProfile, applications]);

  const filteredRoster = useMemo(() => {
    return roster.filter(s => {
      if (departmentFilter !== 'All' && s.branch !== departmentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [roster, departmentFilter, searchQuery]);

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
      </div>
    </div>
  );
}
