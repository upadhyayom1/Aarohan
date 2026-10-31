import React, { useState, ReactNode } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { AarohanLogo } from '../ui';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Building,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export function RecruiterShell({ children }: { children: ReactNode }) {
  const { path, navigate } = useRouter();
  const { currentUser, jobs, actions } = useCampusStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeJobsCount = jobs.filter(j => j.status === 'Active').length;

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'RECRUITMENT OPS',
      items: [
        { label: 'Job Openings', href: '/recruiter/jobs', icon: Briefcase, badge: activeJobsCount },
        { label: 'Post New Job', href: '/recruiter/jobs/new', icon: PlusCircle },
        { label: 'Review Applicants', href: '/recruiter/jobs/job_apex_sde/applicants', icon: Users },
        { label: 'Interviews', href: '/recruiter/interviews', icon: Calendar },
        { label: 'Calendar', href: '/recruiter/calendar', icon: Calendar },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Recruitment Reports', href: '/recruiter/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Company Profile', href: '/recruiter/settings', icon: Building },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-[#E4E4E1] px-4 py-3 bg-white flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle navigation drawer"
            className="p-1.5 border border-[#E4E4E1] rounded-[2px]"
          >
            {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <AarohanLogo size={24} />
            <div>
              <span className="font-mono text-sm font-bold uppercase tracking-tight block">
                Aarohan
              </span>
              <span className="text-[9px] font-mono uppercase text-[#858585] tracking-widest block">
                Recruiter Desk
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 shrink-0 bg-[#FAFAF9] border-r border-[#E4E4E1] z-40 flex flex-col justify-between transition-transform duration-200 ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-5 border-b border-[#E4E4E1]">
          <Link to="/recruiter/dashboard" className="flex items-center gap-2.5 group">
            <AarohanLogo size={28} />
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-base font-bold uppercase tracking-tight text-[#111111] group-hover:opacity-85 transition-opacity">
                Aarohan
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#858585] block mt-0.5">
                Employer Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] px-3 font-semibold">
                {group.title}
              </span>
              <nav className="space-y-0.5 pt-1">
                {group.items.map(item => {
                  const isActive =
                    path === item.href ||
                    (item.href === '/recruiter/dashboard' && (path === '/recruiter' || path === '/recruiter/dashboard')) ||
                    (item.href !== '/recruiter/dashboard' && path.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-mono tracking-tight rounded-[2px] transition-colors ${isActive
                        ? 'bg-[#111111] text-white font-medium shadow-xs'
                        : 'text-[#444444] hover:text-[#111111] hover:bg-[#F5F5F3]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={isActive ? 'text-white' : 'text-[#858585]'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white text-black' : 'bg-[#111111] text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#E4E4E1] bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="truncate">
              <span className="text-xs font-bold text-[#111111] block truncate">
                {currentUser.role === 'recruiter' ? currentUser.name : 'Marcus Vance'}
              </span>
              <span className="text-[10px] font-mono text-[#858585] block truncate">
                {currentUser.role === 'recruiter' ? currentUser.organization : 'Apex Systems'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              actions.logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#666666] hover:text-[#111111] py-1.5 border border-[#E4E4E1] rounded-[2px] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {mobileDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileDrawerOpen(false)} />
      )}

      <main className="flex-1 overflow-x-hidden min-h-screen bg-white">
        {children}
      </main>
    </div>
  );
}
