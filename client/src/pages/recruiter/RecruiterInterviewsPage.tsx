import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Button, StatusBadge, Dialog, FormField, Input } from '../../components/ui';
import { Calendar, Clock, Video, PlusCircle, CheckCircle2, RotateCcw, XCircle, RefreshCw } from 'lucide-react';

export function RecruiterInterviewsPage() {
  const { navigate } = useRouter();
  const { interviews, currentUser, actions } = useCampusStore();
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newDate, setNewDate] = useState('2026-11-08');
  const [newStart, setNewStart] = useState('02:00 PM');
  const [newEnd, setNewEnd] = useState('03:15 PM');

  useEffect(() => {
    actions.loadRecruiterPortalData();
  }, [actions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await actions.loadRecruiterPortalData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const companyInterviews = useMemo(() => {
    const recruiterCompany = (currentUser.organization || currentUser.name || '').toLowerCase();
    return interviews.filter(
      i =>
        currentUser.role === 'admin' ||
        (recruiterCompany && i.company.toLowerCase() === recruiterCompany)
    );
  }, [interviews, currentUser.organization, currentUser.name, currentUser.role]);

  const handleOpenReschedule = (id: string) => {
    setSelectedInterviewId(id);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (selectedInterviewId) {
      actions.rescheduleInterview(selectedInterviewId, newDate, newStart, newEnd);
      setRescheduleModalOpen(false);
    }
  };

  const handleCancelInterview = (id: string) => {
    const reason = prompt('Please enter cancellation reason for student notification:');
    if (reason !== null) {
      actions.cancelInterview(id, reason);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            TECHNICAL ROUND COORDINATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Scheduled Interviews
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Coordinate interview logistics, monitor booked time slots, and update scheduling status for {currentUser.organization || currentUser.name || 'Corporate Partner'}.
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
            {isRefreshing ? 'Syncing...' : 'Sync Schedule'}
          </Button>
          <Link to="/recruiter/calendar">
            <Button variant="secondary" size="sm" icon={<Calendar size={14} />}>
              Open Recruiter Calendar
            </Button>
          </Link>
        </div>
      </div>

      {companyInterviews.length === 0 ? (
        <div className="border border-dashed border-[#E4E4E1] p-12 text-center bg-[#FAFAF9]">
          <p className="text-sm text-[#666666]">No active interviews scheduled for this organization.</p>
          <div className="pt-3">
            <Link to="/recruiter/jobs">
              <Button variant="primary" size="sm">
                Review Openings to Schedule Candidates
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#E4E4E1] border border-[#E4E4E1] bg-white">
          {companyInterviews.map(int => (
            <div
              key={int.id}
              className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#FAFAF9] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#858585]">
                    {int.jobTitle}
                  </span>
                  <span className="text-[#858585]">•</span>
                  <StatusBadge status={int.status} />
                </div>
                <h3 className="text-lg font-bold text-[#111111]">
                  {int.studentName} — {int.round}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#666666]">
                  <span>Date: <strong className="text-[#111111]">{int.date}</strong></span>
                  <span>•</span>
                  <span>Time: <strong className="text-[#111111]">{int.startTime} – {int.endTime} ({int.timezone})</strong></span>
                  <span>•</span>
                  <span>Format: <strong>{int.mode}</strong></span>
                </div>
                {int.notes && (
                  <p className="text-xs font-mono text-[#858585]">Notes: {int.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {int.status !== 'Cancelled' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenReschedule(int.id)}
                      icon={<RotateCcw size={13} />}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelInterview(int.id)}
                      icon={<XCircle size={13} />}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <Dialog
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title="Reschedule Interview Round"
          description="Update date and times. An automatic advisory will be dispatched to the candidate."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setRescheduleModalOpen(false)}>
                Dismiss
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmReschedule}>
                Save Rescheduled Slot
              </Button>
            </>
          }
        >
          <div className="space-y-4 font-mono text-xs">
            <FormField label="New Date" required>
              <Input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Time" required>
                <Input
                  value={newStart}
                  onChange={e => setNewStart(e.target.value)}
                />
              </FormField>
              <FormField label="End Time" required>
                <Input
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
