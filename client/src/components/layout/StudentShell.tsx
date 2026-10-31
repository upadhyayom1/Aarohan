import React, { useState, ReactNode } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  Sparkles,
  GraduationCap,
  User,
  FileText,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';

interface StudentShellProps {
  children: ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const { path, navigate } = useRouter();
  const { studentProfile, notifications } = useCampusStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CAREER',
      items: [
        { label: 'Find Opportunities', href: '/student/opportunities', icon: Compass },
        { label: 'My Applications', href: '/student/applications', icon: FileCheck2 },
        { label: 'AI Match Insights', href: '/student/matches', icon: Sparkles },
        { label: 'Skill Development', href: '/student/skills', icon: GraduationCap },
      ],
    },
    {
      title: 'PROFILE & INTERVIEWS',
      items: [
        { label: 'My Profile', href: '/student/profile', icon: User },
        { label: 'Resume', href: '/student/resume', icon: FileText },
        { label: 'Interviews', href: '/student/interviews', icon: Briefcase },
        { label: 'Calendar', href: '/student/calendar', icon: Calendar },
        {
          label: 'Notifications',
          href: '/student/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Preferences', href: '/student/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden border-b border-[#E4E4E1] px-4 py-3 bg-white flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle navigation drawer"
            className="p-1.5 border border-[#E4E4E1] rounded-[2px]"
          >
            {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-tight block">
              Aarohan
            </span>
            <span className="text-[9px] font-mono uppercase text-[#858585] tracking-widest block">
              Every career begins with a step
            </span>
          </div>
        </div>

        <Link
          to="/student/notifications"
          className="relative p-1.5 border border-[#E4E4E1] rounded-[2px] text-xs"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] px-1 rounded-full font-mono font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Desktop Sidebar (and mobile drawer overlay) */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 shrink-0 bg-[#FAFAF9] border-r border-[#E4E4E1] z-40 flex flex-col justify-between transition-transform duration-200 ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Top Branding */}
        <div className="p-5 border-b border-[#E4E4E1]">
          <Link to="/student/dashboard" className="block group">
            <span className="font-mono text-base font-bold uppercase tracking-tight text-[#111111]">
              Aarohan
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#858585] block mt-0.5">
              Every career begins with a step
            </span>
          </Link>
        </div>

        {/* Navigation list */}
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
                    (item.href === '/student/dashboard' && (path === '/student' || path === '/student/dashboard')) ||
                    (item.href !== '/student/dashboard' && path.startsWith(item.href));
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
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white text-black' : 'bg-[#111111] text-white'
                            }`}
                        >
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

        {/* Bottom Student Profile Summary */}
        <div className="p-4 border-t border-[#E4E4E1] bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="truncate">
              <span className="text-xs font-bold text-[#111111] block truncate">
                {studentProfile.fullName}
              </span>
              <span className="text-[10px] font-mono text-[#858585] block truncate">
                {studentProfile.branch.slice(0, 24)}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-[#F5F5F3] border border-[#E4E4E1] px-1.5 py-0.5 rounded-[2px] text-[#111111] font-bold">
              {studentProfile.cgpa.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#666666] hover:text-[#111111] py-1.5 border border-[#E4E4E1] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Main Page Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen bg-white">
        {children}
      </main>
    </div>
  );
}
