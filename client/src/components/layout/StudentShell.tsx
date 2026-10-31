import React, { useState, useRef, useEffect, ReactNode } from 'react';
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
  CheckCheck,
  ExternalLink,
} from 'lucide-react';

interface StudentShellProps {
  children: ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const { path, navigate } = useRouter();
  const { studentProfile, notifications, actions } = useCampusStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">

      {/* ── Top Header Bar (Desktop + Mobile) ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E4E4E1] px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: hamburger (mobile) + branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle navigation drawer"
            className="md:hidden p-1.5 border border-[#E4E4E1] rounded-[2px]"
          >
            {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/student/dashboard" className="flex flex-col leading-tight">
            <span className="font-mono text-sm font-bold uppercase tracking-tight text-[#111111]">
              Aarohan
            </span>
            <span className="text-[9px] font-mono uppercase text-[#858585] tracking-widest hidden sm:block">
              Student Workspace
            </span>
          </Link>
        </div>

        {/* Right: notification bell */}
        <div className="flex items-center gap-2" ref={notifRef}>
          <div className="relative">
            <button
              onClick={() => setNotifOpen(prev => !prev)}
              className="relative p-2 border border-[#E4E4E1] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[360px] sm:w-[420px] bg-white border border-[#E4E4E1] shadow-lg rounded-[2px] z-50 overflow-hidden">
                {/* Dropdown header */}
                <div className="px-4 py-3 border-b border-[#E4E4E1] flex items-center justify-between bg-[#FAFAF9]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#111111]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono bg-[#111111] text-white px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => actions.markAllNotificationsAsRead()}
                        className="flex items-center gap-1 text-[10px] font-mono text-[#858585] hover:text-[#111111] transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-[#858585] hover:text-[#111111]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div className="max-h-[400px] overflow-y-auto divide-y divide-[#E4E4E1]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell size={24} className="mx-auto text-[#E4E4E1] mb-2" />
                      <p className="text-xs text-[#858585] font-mono">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map(notif => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 flex gap-3 transition-colors ${
                          notif.read ? 'bg-white hover:bg-[#FAFAF9]' : 'bg-[#FAFAF9] border-l-2 border-l-[#111111]'
                        }`}
                      >
                        {/* Unread dot */}
                        <div className="pt-1 shrink-0">
                          <span
                            className={`block w-1.5 h-1.5 rounded-full mt-0.5 ${
                              notif.read ? 'bg-transparent' : 'bg-[#111111]'
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono uppercase bg-[#111111] text-white px-1.5 py-0.5 rounded-[2px]">
                              {notif.category}
                            </span>
                            <span className="text-[10px] font-mono text-[#858585]">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#111111] leading-snug">{notif.title}</p>
                          <p className="text-[11px] text-[#666666] leading-relaxed line-clamp-2">{notif.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex flex-col gap-1 items-end justify-start pt-0.5">
                          {!notif.read && (
                            <button
                              onClick={() => actions.markNotificationAsRead(notif.id)}
                              className="text-[10px] font-mono text-[#858585] hover:text-[#111111] whitespace-nowrap"
                            >
                              Mark read
                            </button>
                          )}
                          {notif.link && (
                            <button
                              onClick={() => {
                                actions.markNotificationAsRead(notif.id);
                                setNotifOpen(false);
                                navigate(notif.link);
                              }}
                              className="text-[10px] font-mono text-[#111111] hover:underline flex items-center gap-0.5"
                            >
                              Open <ExternalLink size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer link to full page */}
                <div className="border-t border-[#E4E4E1] bg-[#FAFAF9]">
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/student/notifications'); }}
                    className="w-full text-center text-[11px] font-mono font-bold text-[#111111] py-3 hover:bg-[#F5F5F3] transition-colors"
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body row: Sidebar + Main ── */}
      <div className="flex flex-1 min-h-0">

        {/* Desktop Sidebar (and mobile drawer overlay) */}
        <aside
          className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 bg-[#FAFAF9] border-r border-[#E4E4E1] z-40 flex flex-col justify-between transition-transform duration-200 ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
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
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-mono tracking-tight rounded-[2px] transition-colors ${
                          isActive
                            ? 'bg-[#111111] text-white font-medium shadow-xs'
                            : 'text-[#444444] hover:text-[#111111] hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <Icon size={14} className={isActive ? 'text-white' : 'text-[#858585]'} />
                        <span>{item.label}</span>
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
        <main className="flex-1 overflow-x-hidden bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
