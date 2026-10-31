import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../../lib/router';
import { useCampusStore } from '../../lib/useStore';
import { Application, ApplicationStatus } from '../../types';
import { Button, Input, Select, StatusBadge, Dialog, FormField, Textarea } from '../../components/ui';
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';

export function RecruiterApplicantsPage() {
  const { params, navigate } = useRouter();
  const { jobs, applications, studentProfile, actions } = useCampusStore();

  const currentJob = useMemo(() => {
    return jobs.find(j => j.id === params.jobId) || jobs[0];
  }, [jobs, params.jobId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  // Selected candidate for detail review drawer
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Schedule form state
  const [interviewRound, setInterviewRound] = useState('Technical Architecture & Coding');
  const [interviewDate, setInterviewDate] = useState('2026-11-06');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('12:15 PM');
  const [interviewMode, setInterviewMode] = useState<'Video Call' | 'In-person' | 'Phone'>('Video Call');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.apexsystems.com/univ-tech-interview');
  const [interviewNotes, setInterviewNotes] = useState('Prepare to discuss systems projects and write algorithmic solutions.');

  // Applicants for this job
  const jobApplicants = useMemo(() => {
    return applications.filter(a => a.jobId === currentJob.id);
  }, [applications, currentJob.id]);

  const filteredApplicants = useMemo(() => {
    return jobApplicants.filter(app => {
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (app.matchScore < minScoreFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !app.studentName.toLowerCase().includes(q) &&
          !app.studentBranch.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [jobApplicants, statusFilter, minScoreFilter, searchQuery]);

  const selectedApp = useMemo(() => {
    return applications.find(a => a.id === selectedAppId);
  }, [applications, selectedAppId]);

  const handleShortlist = (appId: string) => {
    actions.updateApplicationStatus(
      appId,
      'Shortlisted',
      'Candidate shortlisted following academic and technical dossier review.'
    );
  };

  const handleOpenReject = (appId: string) => {
    setSelectedAppId(appId);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedApp) {
      actions.updateApplicationStatus(
        selectedApp.id,
        'Rejected',
        'Candidate not selected at this stage.',
        rejectionReason || 'Profile did not align closely enough with current vacancy requirements.'
      );
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const handleOpenSchedule = (appId: string) => {
    setSelectedAppId(appId);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedApp) {
      actions.scheduleInterview({
        applicationId: selectedApp.id,
        jobId: currentJob.id,
        jobTitle: currentJob.title,
        company: currentJob.company,
        studentId: selectedApp.studentId,
        studentName: selectedApp.studentName,
        studentEmail: selectedApp.studentEmail,
        round: interviewRound,
        date: interviewDate,
        startTime,
        endTime,
        timezone: 'EST',
        mode: interviewMode,
        locationOrLink,
        notes: interviewNotes,
      });
      setScheduleModalOpen(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] hover:text-[#111111] cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Openings List</span>
      </button>

      {/* Header */}
      <div className="border border-[#222222] bg-[#FAFAF9] p-6 sm:p-8 rounded-[2px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block">
              APPLICANT REVIEW WORKSPACE • {currentJob.company}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Applicants: {currentJob.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#666666]">
              <span>Deadline: {currentJob.deadline}</span>
              <span>•</span>
              <span>Min CGPA: {currentJob.minCgpa.toFixed(2)}</span>
              <span>•</span>
              <StatusBadge status={currentJob.status} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/opportunities/${currentJob.id}`}>
              <Button variant="secondary" size="sm">
                View Public Vacancy Spec
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search candidates by name or department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#858585]">Status:</span>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#858585]">Min Fit Score:</span>
            <Select
              value={minScoreFilter.toString()}
              onChange={e => setMinScoreFilter(parseInt(e.target.value) || 0)}
              className="w-28"
            >
              <option value="0">All</option>
              <option value="70">≥ 70%</option>
              <option value="80">≥ 80%</option>
              <option value="90">≥ 90%</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="border border-[#E4E4E1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">AI Fit Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E1]">
              {filteredApplicants.map(app => (
                <tr key={app.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3.5 px-4">
                    <strong
                      onClick={() => setSelectedAppId(app.id)}
                      className="text-sm text-[#111111] hover:underline cursor-pointer block"
                    >
                      {app.studentName}
                    </strong>
                    <span className="text-[10px] text-[#858585]">{app.studentEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#444444]">{app.studentBranch}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">
                    {app.studentCgpa.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F5F3] border border-[#222222] font-bold text-[#111111] rounded-[2px]">
                      <Sparkles size={11} /> {app.matchScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAppId(app.id)}
                      >
                        Dossier
                      </Button>
                      {app.status === 'Applied' || app.status === 'Under Review' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleShortlist(app.id)}
                        >
                          Shortlist
                        </Button>
                      ) : null}
                      {app.status === 'Shortlisted' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenSchedule(app.id)}
                        >
                          Schedule Round
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedApp && (
        <Dialog
          isOpen={!!selectedApp}
          onClose={() => setSelectedAppId(null)}
          title={`Candidate Dossier: ${selectedApp.studentName}`}
          description={`Application ID: ${selectedApp.id} • ${selectedApp.studentBranch}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center gap-2">
              {selectedApp.status !== 'Rejected' && selectedApp.status !== 'Withdrawn' && (
                <Button variant="danger" size="sm" onClick={() => handleOpenReject(selectedApp.id)}>
                  Reject Candidate
                </Button>
              )}
              {selectedApp.status === 'Applied' || selectedApp.status === 'Under Review' ? (
                <Button variant="primary" size="sm" onClick={() => handleShortlist(selectedApp.id)}>
                  Shortlist for Evaluation
                </Button>
              ) : null}
              {selectedApp.status === 'Shortlisted' ? (
                <Button variant="primary" size="sm" onClick={() => handleOpenSchedule(selectedApp.id)}>
                  Schedule Interview
                </Button>
              ) : null}
              <Button variant="secondary" size="sm" onClick={() => setSelectedAppId(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6 font-mono text-xs">
            {/* Quick Status Bar */}
            <div className="p-3 bg-[#FAFAF9] border border-[#E4E4E1] flex items-center justify-between">
              <div>
                <span>Current Candidacy Status: </span>
                <StatusBadge status={selectedApp.status} />
              </div>
              <div>
                Fit Index: <strong>{selectedApp.matchScore}%</strong>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border border-[#E4E4E1] p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#858585] block">
                Academic Qualifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-[#111111]">
                <div>Department: <strong>{selectedApp.studentBranch}</strong></div>
                <div>CGPA: <strong>{selectedApp.studentCgpa.toFixed(2)}</strong></div>
                <div>Graduation Cohort: <strong>{selectedApp.studentGradYear}</strong></div>
                <div>Submission Date: <strong>{selectedApp.appliedDate}</strong></div>
              </div>
            </div>

            {/* Verified Student Skills & Projects if available */}
            {selectedApp.studentId === studentProfile.id && (
              <div className="border border-[#E4E4E1] p-4 space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#858585] block">
                  Verified Technical Competencies
                </span>
                <div className="flex flex-wrap gap-1">
                  {studentProfile.skills.map(s => (
                    <span key={s} className="bg-white border border-[#111111] px-2 py-0.5 text-[#111111]">
                      {s}
                    </span>
                  ))}
                </div>

                <span className="text-[10px] uppercase font-bold text-[#858585] block pt-2">
                  Key Technical Projects
                </span>
                <div className="space-y-2">
                  {studentProfile.projects.map(proj => (
                    <div key={proj.id} className="p-2.5 bg-[#FAFAF9] border border-[#E4E4E1]">
                      <strong className="text-[#111111] block">{proj.title}</strong>
                      <p className="text-[11px] text-[#666666] mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter Notes Input */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#858585] block">
                Recruiter Evaluation Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Add technical review notes or interviewer evaluation feedback..."
                value={selectedApp.recruiterNotes || ''}
                onChange={e => {
                  actions.updateApplicationStatus(
                    selectedApp.id,
                    selectedApp.status,
                    e.target.value
                  );
                }}
                className="w-full bg-white border border-[#E4E4E1] p-2 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && selectedApp && (
        <Dialog
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title={`Schedule Interview: ${selectedApp.studentName}`}
          description={`Position: ${currentJob.title}`}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSchedule}>
                Confirm & Dispatch Invitation
              </Button>
            </>
          }
        >
          <div className="space-y-4 font-mono text-xs">
            <FormField label="Interview Round / Title" required>
              <Input
                value={interviewRound}
                onChange={e => setInterviewRound(e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Date" required>
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                />
              </FormField>

              <FormField label="Format / Mode">
                <Select
                  value={interviewMode}
                  onChange={e => setInterviewMode(e.target.value as any)}
                >
                  <option value="Video Call">Video Call</option>
                  <option value="In-person">In-person</option>
                  <option value="Phone">Phone</option>
                </Select>
              </FormField>

              <FormField label="Start Time" required>
                <Input
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </FormField>

              <FormField label="End Time" required>
                <Input
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Meeting URL or Physical Location" required>
              <Input
                value={locationOrLink}
                onChange={e => setLocationOrLink(e.target.value)}
              />
            </FormField>

            <FormField label="Preparation Notes for Candidate">
              <Textarea
                rows={2}
                value={interviewNotes}
                onChange={e => setInterviewNotes(e.target.value)}
              />
            </FormField>
          </div>
        </Dialog>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectModalOpen && selectedApp && (
        <Dialog
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Candidate Rejection Confirmation"
          description={`Provide an institutional rationale for candidate ${selectedApp.studentName}.`}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </>
          }
        >
          <div className="space-y-3 font-mono text-xs">
            <FormField label="Feedback Rationale">
              <Textarea
                rows={3}
                placeholder="Reason for non-selection (e.g. skills gap in concurrency or insufficient CGPA threshold)..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </FormField>
          </div>
        </Dialog>
      )}
    </div>
  );
}
