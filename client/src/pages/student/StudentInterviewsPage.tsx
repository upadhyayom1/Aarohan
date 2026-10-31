import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { api } from '../../lib/api';
import { Button, StatusBadge, Dialog } from '../../components/ui';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function StudentInterviewsPage() {
  const { navigate } = useRouter();
  const { interviews, studentProfile, actions } = useCampusStore();
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync interviews from Node backend on mount
  useEffect(() => {
    let active = true;
    const fetchInterviews = async () => {
      try {
        const res = await api.interviews.getMy();
        if (active && res && Array.isArray(res.interviews)) {
          actions.syncInterviews(res.interviews);
        }
      } catch (err) {
        console.debug('Interviews fetch fallback to store:', err);
      }
    };

    fetchInterviews();
    return () => {
      active = false;
    };
  }, [actions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.interviews.getMy();
      if (res && Array.isArray(res.interviews)) {
        actions.syncInterviews(res.interviews);
      }
    } catch (err) {
      console.warn('Interviews refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const studentInterviews = useMemo(() => {
    return interviews.filter(i => i.studentId === studentProfile.id);
  }, [interviews, studentProfile.id]);

  const activeModalInterview = useMemo(() => {
    return studentInterviews.find(i => i.id === selectedInterviewId);
  }, [studentInterviews, selectedInterviewId]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            CAMPUS RECRUITMENT INTERVIEW DESK (NODE.JS BACKEND)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Scheduled Interviews
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Access meeting coordinates, technical evaluation guidelines, and schedules confirmed by corporate hiring partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          >
            {isRefreshing ? 'Syncing...' : 'Refresh Schedule'}
          </Button>
          <Link to="/student/calendar">
            <Button variant="secondary" size="sm" icon={<Calendar size={14} />}>
              Open Placement Calendar
            </Button>
          </Link>
        </div>
      </div>

      {studentInterviews.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <p className="text-sm text-[#666666]">You have no scheduled interviews at this time.</p>
          <p className="text-xs text-[#858585] mt-1">
            When recruiters shortlist your submitted applications, interview schedule requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentInterviews.map(interview => (
            <div
              key={interview.id}
              className="border border-[#222222] bg-white p-6 sm:p-8 space-y-6 hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E4E4E1] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#858585]">
                      {interview.company}
                    </span>
                    <span className="text-[#858585]">•</span>
                    <span className="text-xs font-mono text-[#666666]">
                      {interview.jobTitle}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#111111]">
                    {interview.round}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-[#111111] text-white px-2.5 py-1 rounded-[2px] font-bold">
                    {interview.status}
                  </span>
                </div>
              </div>

              {/* Schedule details bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs bg-[#FAFAF9] p-4 border border-[#E4E4E1]">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#111111]" />
                  <div>
                    <span className="text-[#858585] block text-[10px]">DATE</span>
                    <strong className="text-[#111111]">{interview.date}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#111111]" />
                  <div>
                    <span className="text-[#858585] block text-[10px]">TIME ({interview.timezone})</span>
                    <strong className="text-[#111111]">
                      {interview.startTime} – {interview.endTime}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Video size={15} className="text-[#111111]" />
                  <div>
                    <span className="text-[#858585] block text-[10px]">INTERVIEW FORMAT</span>
                    <strong className="text-[#111111]">{interview.mode}</strong>
                  </div>
                </div>
              </div>

              {/* Instructions and Meeting coordinates */}
              {interview.notes && (
                <div className="font-mono text-xs text-[#444444] border-l-2 border-[#111111] pl-3 py-1">
                  <strong className="text-[#111111] block mb-0.5">Recruiter Briefing:</strong>
                  {interview.notes}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E1]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#858585]">
                  <ShieldCheck size={14} className="text-[#111111]" />
                  <span>Verified link monitored by Central Placement Office</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInterviewId(interview.id)}
                  >
                    View Guidelines
                  </Button>
                  {interview.locationOrLink.startsWith('http') ? (
                    <a
                      href={interview.locationOrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#111111] text-white px-4 py-2 rounded-[2px] font-bold hover:bg-neutral-800 transition-colors"
                    >
                      Enter Meeting Room <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-xs font-mono bg-[#F5F5F3] px-3 py-2 border border-[#E4E4E1]">
                      Location: {interview.locationOrLink}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines Modal */}
      {activeModalInterview && (
        <Dialog
          isOpen={!!activeModalInterview}
          onClose={() => setSelectedInterviewId(null)}
          title={`Briefing: ${activeModalInterview.round}`}
          description={`${activeModalInterview.company} • ${activeModalInterview.jobTitle}`}
          footer={
            <Button size="sm" onClick={() => setSelectedInterviewId(null)}>
              Dismiss Briefing
            </Button>
          }
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#FAFAF9] border border-[#E4E4E1] space-y-1">
              <div>Scheduled Time: <strong>{activeModalInterview.date} at {activeModalInterview.startTime} ({activeModalInterview.timezone})</strong></div>
              <div>Meeting Mode: <strong>{activeModalInterview.mode}</strong></div>
              <div>Candidate: <strong>{activeModalInterview.studentName}</strong></div>
            </div>

            <div className="space-y-2">
              <span className="text-[#111111] font-bold block">Institutional Placement Instructions:</span>
              <ul className="space-y-1.5 text-[#666666] list-disc list-inside">
                <li>Join the meeting room 5 minutes prior to the scheduled start time.</li>
                <li>Have your photo institutional student ID card accessible.</li>
                <li>Prepare a quiet, well-lit environment with reliable network connectivity.</li>
                <li>Technical coding assessments may require screen-sharing your approved IDE.</li>
              </ul>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
