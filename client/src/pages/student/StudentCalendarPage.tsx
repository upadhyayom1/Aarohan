import React, { useState, useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button } from '../../components/ui';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  AlertCircle,
  Award,
} from 'lucide-react';

export function StudentCalendarPage() {
  const { interviews, jobs, drives, studentProfile, currentUser } = useCampusStore();
  const [currentMonth, setCurrentMonth] = useState<number>(10); // November (0-indexed: 10)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Aggregate all events
  const allEvents = useMemo(() => {
    const list: {
      id: string;
      date: string; // YYYY-MM-DD
      title: string;
      type: 'Interview' | 'Deadline' | 'Drive';
      subtext: string;
      meta?: string;
    }[] = [];

    // Interviews
        const filteredInterviews = currentUser.role === 'recruiter'
          ? interviews.filter(
            i =>
              i.company.toLowerCase() === (currentUser.organization || 'Apex Systems').toLowerCase() ||
              i.company.includes('Apex')
          )
          : currentUser.role === 'admin'
            ? interviews
            : interviews.filter(i => i.studentId === studentProfile.id);

        filteredInterviews.forEach(i => {
          const displayTitle = currentUser.role === 'recruiter' || currentUser.role === 'admin'
            ? `${i.round} — ${i.studentName}`
            : `${i.round} — ${i.company}`;

          list.push({
            id: i.id,
            date: i.date,
            title: displayTitle,
            type: 'Interview',
            subtext: `${i.startTime} (${i.timezone}) • ${i.mode}`,
          });
        });

        // Deadlines
          const filteredJobs = currentUser.role === 'recruiter'
            ? jobs.filter(
              j =>
                j.company.toLowerCase() === (currentUser.organization || 'Apex Systems').toLowerCase() ||
                j.company.includes('Apex')
            )
            : jobs;

          filteredJobs.forEach(j => {
            list.push({
              id: `deadline_${j.id}`,
              date: j.deadline,
              title: `Deadline: ${j.title}`,
              type: 'Deadline',
              subtext: j.company,
            });
          });

          // Drives
          drives.forEach(d => {
            list.push({
              id: `drive_${d.id}`,
              date: d.eventStartDate,
              title: `Drive Commences: ${d.name}`,
              type: 'Drive',
              subtext: `Runs until ${d.eventEndDate}`,
            });
          });

          return list.sort((a, b) => a.date.localeCompare(b.date));
      }, [interviews, jobs, drives, studentProfile.id, currentUser]);

    // Calendar matrix calculation
    const calendarDays = useMemo(() => {
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const days: { dayNumber: number | null; dateStr: string | null }[] = [];
      for (let i = 0; i < firstDay; i++) {
        days.push({ dayNumber: null, dateStr: null });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const formattedMonth = String(currentMonth + 1).padStart(2, '0');
        const formattedDay = String(d).padStart(2, '0');
        days.push({
          dayNumber: d,
          dateStr: `${currentYear}-${formattedMonth}-${formattedDay}`,
        });
      }
      return days;
    }, [currentYear, currentMonth]);

    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
              {currentUser.role === 'recruiter'
                ? 'RECRUITER SCHEDULE & DEADLINES'
                : currentUser.role === 'admin'
                  ? 'UNIVERSITY PLACEMENT SCHEDULE'
                  : 'SCHEDULE & CRITICAL DEADLINES'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Placement Calendar
            </h1>
            <p className="text-sm text-[#666666] mt-1 max-w-xl">
              {currentUser.role === 'recruiter'
                ? `Track confirmed candidate interview rounds and active vacancy application deadlines for ${currentUser.organization || 'Apex Systems'}.`
                : currentUser.role === 'admin'
                  ? 'Track campus placement drives, technical interview rounds, and company application deadlines.'
                  : 'Track confirmed technical interviews, company vacancy deadlines, and placement drive event windows.'}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[#FAFAF9] border border-[#E4E4E1] p-1 font-mono text-xs rounded-[2px]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-[2px] transition-colors ${viewMode === 'calendar' ? 'bg-[#111111] text-white font-medium' : 'text-[#666666] hover:text-[#111111]'
                }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-[2px] transition-colors ${viewMode === 'agenda' ? 'bg-[#111111] text-white font-medium' : 'text-[#666666] hover:text-[#111111]'
                }`}
            >
              Agenda Feed
            </button>
          </div>
        </div>

        {/* Month Navigation Toolbar */}
        <div className="flex items-center justify-between border-b border-[#E4E4E1] pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-[#111111]">
            {monthNames[currentMonth]} {currentYear}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 border border-[#E4E4E1] hover:border-black rounded-[2px]"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(10);
                setCurrentYear(2026);
              }}
              className="px-2.5 py-1 text-xs font-mono border border-[#E4E4E1] hover:bg-[#F5F5F3] rounded-[2px]"
            >
              Today (Nov 2026)
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 border border-[#E4E4E1] hover:border-black rounded-[2px]"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="border border-[#222222] bg-white">
            {/* Day of week headers */}
            <div className="grid grid-cols-7 border-b border-[#E4E4E1] bg-[#FAFAF9] text-center font-mono text-xs uppercase py-2 text-[#858585] font-semibold">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#E4E4E1]">
              {calendarDays.map((cell, idx) => {
                if (!cell.dayNumber || !cell.dateStr) {
                  return (
                    <div key={idx} className="min-h-[110px] bg-[#FAFAF9]/60 p-2" />
                  );
                }

                const daysEvents = allEvents.filter(e => e.date === cell.dateStr);

                return (
                  <div
                    key={idx}
                    className="min-h-[110px] p-2 hover:bg-[#FAFAF9] transition-colors flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start font-mono text-xs">
                      <span className="font-bold text-[#111111]">{cell.dayNumber}</span>
                      {daysEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-[#858585]">
                          {daysEvents.length} event{daysEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 flex-1">
                      {daysEvents.map(ev => {
                        const isInterview = ev.type === 'Interview';
                        const isDeadline = ev.type === 'Deadline';

                        return (
                          <div
                            key={ev.id}
                            className={`p-1 text-[10px] font-mono rounded-[2px] leading-tight ${isInterview
                                ? 'bg-[#111111] text-white font-bold'
                                : isDeadline
                                  ? 'border border-[#222222] bg-white text-[#111111]'
                                  : 'bg-[#F5F5F3] text-[#666666] border border-[#E4E4E1]'
                              }`}
                            title={`${ev.title} (${ev.subtext})`}
                          >
                            <div className="truncate">
                              {isInterview ? '★ ' : isDeadline ? '⏰ ' : '🏛 '}
                              {ev.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Agenda View */
          <div className="border border-[#E4E4E1] divide-y divide-[#E4E4E1] bg-white">
            {allEvents.map(ev => (
              <div key={ev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 uppercase font-bold rounded-[2px] ${ev.type === 'Interview'
                          ? 'bg-[#111111] text-white'
                          : ev.type === 'Deadline'
                            ? 'border border-[#222222] text-[#111111]'
                            : 'bg-[#F5F5F3] text-[#666666]'
                        }`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-[#858585]">{ev.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#111111]">{ev.title}</h4>
                  <p className="text-xs text-[#666666]">{ev.subtext}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-[#111111] hover:underline cursor-pointer">
                    View Reference Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
