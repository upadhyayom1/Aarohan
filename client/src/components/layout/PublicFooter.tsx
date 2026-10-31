import React from 'react';
import { Link } from '../../lib/router';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E4E4E1] bg-white text-[#111111] pt-16 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E4E4E1]">
          {/* Col 1: Identity */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xl font-bold uppercase tracking-tight font-mono text-[#111111] block">
              CampusLink
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-[#858585] block">
              Directorate of Career Development & Placement
            </span>
            <p className="text-xs text-[#666666] max-w-sm leading-relaxed mt-2">
              An institutional platform coordinating student career readiness, corporate campus recruitment drives, and explainable qualifications matching.
            </p>
          </div>

          {/* Col 2: Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-[#111111]">
              For Students
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li><Link to="/opportunities" className="hover:text-black">Job Openings</Link></li>
              <li><Link to="/student/dashboard" className="hover:text-black">Student Portal</Link></li>
              <li><Link to="/student/matches" className="hover:text-black">AI Match Insights</Link></li>
              <li><Link to="/student/resume" className="hover:text-black">Resume Verification</Link></li>
              <li><Link to="/student/skills" className="hover:text-black">Skill Development</Link></li>
            </ul>
          </div>

          {/* Col 3: Recruiters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-[#111111]">
              For Employers
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li><Link to="/recruiter/dashboard" className="hover:text-black">Employer Portal</Link></li>
              <li><Link to="/recruiter/jobs/new" className="hover:text-black">Post Campus Vacancy</Link></li>
              <li><Link to="/recruiter/reports" className="hover:text-black">Hiring Analytics</Link></li>
              <li><Link to="/login" className="hover:text-black">Recruiter Sign In</Link></li>
            </ul>
          </div>

          {/* Col 4: Institutional Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-[#111111]">
              Placement Office
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li><Link to="/admin/dashboard" className="hover:text-black">Administration</Link></li>
              <li><Link to="/admin/drives" className="hover:text-black">Recruitment Drives</Link></li>
              <li><Link to="/admin/analytics" className="hover:text-black">Outcome Reports</Link></li>
              <li><Link to="/admin/audit-logs" className="hover:text-black">Audit Registry</Link></li>
              <li><Link to="/about" className="hover:text-black">About CampusLink</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#858585]">
          <p>© {new Date().getFullYear()} CampusLink Placement Directorate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Institutional Policy</span>
            <span>Data Protection</span>
            <span>Verification Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
