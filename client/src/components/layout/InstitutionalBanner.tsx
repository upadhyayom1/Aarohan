import React from 'react';
import { useRouter } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { UserRole } from '../../types';

export function InstitutionalBanner() {
  const { path, navigate } = useRouter();
  const { currentUser, notifications, actions } = useCampusStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSwitch = (role: UserRole) => {
    actions.switchRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <aside aria-label="Institutional Portal Switcher" className="bg-[#111111] text-white text-xs border-b border-[#222222] py-2 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Institutional notice */}
        <div className="flex items-center gap-3">
          <span className="font-mono uppercase tracking-widest text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded-[2px]">
            DEMO SANDBOX
          </span>
          <span className="text-neutral-300 hidden sm:inline text-[11px]">
            Active Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
          </span>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-neutral-400 hidden md:inline">Switch Role:</span>
          <button
            onClick={() => handleRoleSwitch('student')}
            className={`px-2 py-0.5 rounded-[2px] transition-colors ${currentUser.role === 'student' && path.startsWith('/student')
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
          >
            Student
          </button>
          <button
            onClick={() => handleRoleSwitch('recruiter')}
            className={`px-2 py-0.5 rounded-[2px] transition-colors ${currentUser.role === 'recruiter' && path.startsWith('/recruiter')
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
          >
            Recruiter
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2 py-0.5 rounded-[2px] transition-colors ${currentUser.role === 'admin' && path.startsWith('/admin')
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
          >
            Admin
          </button>
          <button
            onClick={() => navigate('/')}
            className={`px-2 py-0.5 rounded-[2px] transition-colors ${
              !path.startsWith('/student') && !path.startsWith('/recruiter') && !path.startsWith('/admin')
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Public
          </button>

        {unreadCount > 0 && (
          <button
            onClick={() => navigate('/student/notifications')}
            className="ml-2 bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-0.5 rounded-[2px] flex items-center gap-1 text-[10px]"
            title="Unread notifications"
          >
            <span>🔔</span>
            <span>{unreadCount}</span>
          </button>
        )}

        <button
          onClick={() => {
            if (confirm('Reset application store to original seed data?')) {
              actions.resetToDefaults();
              alert('State reset to verified institutional defaults.');
            }
          }}
          className="text-neutral-400 hover:text-white ml-2 underline text-[10px]"
          title="Reset simulated data"
        >
          Reset
        </button>
      </div>
    </div>
    </aside >
  );
}
