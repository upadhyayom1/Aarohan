import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../../components/ui';
import { Bell, CheckCheck, ExternalLink, Calendar, Briefcase, Award } from 'lucide-react';

export function StudentNotificationsPage() {
  const { navigate } = useRouter();
  const { notifications, actions } = useCampusStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterCategory !== 'all' && n.category !== filterCategory) return false;
      return true;
    });
  }, [notifications, filterCategory]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            INSTITUTIONAL ADVISORIES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Notifications Center
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Official recruitment updates, interview invitations, and placement directorate notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => actions.markAllNotificationsAsRead()}
            icon={<CheckCheck size={14} />}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {[
          { key: 'all', label: 'All Updates' },
          { key: 'interview', label: 'Interviews' },
          { key: 'shortlist', label: 'Shortlists' },
          { key: 'application', label: 'Applications' },
          { key: 'drive', label: 'Drives' },
          { key: 'system', label: 'System' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            className={`px-3 py-1.5 rounded-[2px] transition-colors border ${
              filterCategory === cat.key
                ? 'bg-[#111111] text-white border-[#111111] font-bold'
                : 'bg-white text-[#666666] border-[#E4E4E1] hover:text-[#111111]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification items */}
      {filteredNotifications.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <p className="text-sm text-[#666666]">No notifications found in this category.</p>
        </div>
      ) : (
        <div className="border border-[#E4E4E1] divide-y divide-[#E4E4E1] bg-white">
          {filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                notif.read ? 'bg-white hover:bg-[#FAFAF9]' : 'bg-[#FAFAF9] border-l-4 border-l-[#111111]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#111111] text-white px-1.5 py-0.2 rounded-[2px]">
                    {notif.category}
                  </span>
                  <span className="text-xs font-mono text-[#858585]">• {notif.timestamp}</span>
                  {!notif.read && (
                    <span className="text-[9px] font-mono bg-white border border-[#222222] text-[#111111] px-1 font-bold">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#111111]">{notif.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed max-w-2xl">{notif.message}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => actions.markNotificationAsRead(notif.id)}
                    className="text-xs font-mono text-[#858585] hover:text-[#111111] underline"
                  >
                    Mark read
                  </button>
                )}
                {notif.link && (
                  <button
                    onClick={() => {
                      actions.markNotificationAsRead(notif.id);
                      navigate(notif.link);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-mono bg-white border border-[#222222] px-3 py-1.5 rounded-[2px] font-bold hover:bg-[#F5F5F3]"
                  >
                    Open Details <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
