import {
  User,
  StudentProfile,
  JobOpportunity,
  Application,
  ApplicationStatus,
  ApplicationHistoryItem,
  Interview,
  PlacementDrive,
  NotificationItem,
  AuditLog,
  SkillResource,
  UserRole,
} from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './api';

export const INITIAL_USER_STUDENT: User = {
  id: '',
  name: 'Student Candidate',
  email: '',
  role: 'student',
  studentId: '',
  organization: 'Institute of Technology',
};

export const INITIAL_USER_RECRUITER: User = {
  id: '',
  name: 'Corporate Recruiter',
  email: '',
  role: 'recruiter',
  organization: 'Enterprise Partner',
};

export const INITIAL_USER_ADMIN: User = {
  id: '',
  name: 'Directorate Administrator',
  email: '',
  role: 'admin',
  organization: 'Office of Career Advancement & Placement',
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  bio: '',
  institution: 'National Institute of Technology',
  degree: 'Bachelor of Technology (B.Tech)',
  branch: 'CSE',
  currentSemester: 8,
  cgpa: 0,
  graduationYear: 2027,
  activeBacklogs: 0,
  skills: [],
  projects: [],
  experience: [],
};

export const INITIAL_JOBS: JobOpportunity[] = [];
export const INITIAL_APPLICATIONS: Application[] = [];
export const INITIAL_INTERVIEWS: Interview[] = [];
export const INITIAL_DRIVES: PlacementDrive[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SKILL_RESOURCES: SkillResource[] = [
  {
    id: 'res_1',
    title: 'Distributed Systems & Microservice Architecture',
    provider: 'MIT OpenCourseWare (6.824)',
    relevantSkill: 'Docker',
    resourceType: 'Course',
    duration: '14 Lectures (Self-Paced)',
    url: 'https://ocw.mit.edu',
    isSaved: true,
  },
  {
    id: 'res_2',
    title: 'Designing Data-Intensive Applications Core Principles',
    provider: 'University Career Library',
    relevantSkill: 'PostgreSQL',
    resourceType: 'Documentation',
    duration: '6 Modules',
    url: 'https://library.campus.edu',
    isSaved: false,
  },
  {
    id: 'res_3',
    title: 'Production Kubernetes Cluster Management Fundamentals',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    relevantSkill: 'Docker',
    resourceType: 'Tutorial',
    duration: '4 Hours',
    url: 'https://cncf.io',
    isSaved: false,
  },
  {
    id: 'res_4',
    title: 'High-Performance Graph APIs with GraphQL',
    provider: 'GraphQL Foundation Training',
    relevantSkill: 'REST APIs',
    resourceType: 'Practice',
    duration: '3 Hours',
    url: 'https://graphql.org',
    isSaved: true,
  },
  {
    id: 'res_5',
    title: 'Advanced System Design & Concurrency Patterns',
    provider: 'Association for Computing Machinery (ACM)',
    relevantSkill: 'Algorithms',
    resourceType: 'Course',
    duration: '8 Modules',
    url: 'https://acm.org',
    isSaved: false,
  },
];

// In-memory + LocalStorage reactive state store
class CampusStore {
  private currentUser: User = INITIAL_USER_STUDENT;
  private studentProfile: StudentProfile = INITIAL_STUDENT_PROFILE;
  private jobs: JobOpportunity[] = INITIAL_JOBS;
  private applications: Application[] = INITIAL_APPLICATIONS;
  private interviews: Interview[] = INITIAL_INTERVIEWS;
  private drives: PlacementDrive[] = INITIAL_DRIVES;
  private notifications: NotificationItem[] = INITIAL_NOTIFICATIONS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  private skillResources: SkillResource[] = INITIAL_SKILL_RESOURCES;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        currentUser: this.currentUser,
        studentProfile: this.studentProfile,
        jobs: this.jobs,
        applications: this.applications,
        interviews: this.interviews,
        drives: this.drives,
        notifications: this.notifications,
        auditLogs: this.auditLogs,
        skillResources: this.skillResources,
      };
      localStorage.setItem('aarohan_state', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('aarohan_state') || localStorage.getItem('campuslink_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Clean out legacy mock data if detected
        if (
          parsed.studentProfile?.email === 'aditi.rao@campus.edu' ||
          parsed.studentProfile?.id === 'stu_aditi_rao' ||
          (parsed.jobs && parsed.jobs.some((j: any) => j.id === 'job_apex_sde' || j.id === 'job_veritas_cloud'))
        ) {
          localStorage.removeItem('aarohan_state');
          localStorage.removeItem('campuslink_state');
          return;
        }

        if (parsed.currentUser) this.currentUser = parsed.currentUser;
        if (parsed.studentProfile) this.studentProfile = parsed.studentProfile;
        if (Array.isArray(parsed.jobs)) this.jobs = parsed.jobs;
        if (Array.isArray(parsed.applications)) this.applications = parsed.applications;
        if (Array.isArray(parsed.interviews)) this.interviews = parsed.interviews;
        if (Array.isArray(parsed.drives)) this.drives = parsed.drives;
        if (Array.isArray(parsed.notifications)) this.notifications = parsed.notifications;
        if (Array.isArray(parsed.auditLogs)) this.auditLogs = parsed.auditLogs;
        if (Array.isArray(parsed.skillResources)) this.skillResources = parsed.skillResources;
      }
    } catch {
      // fallback to initial
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn());
  }

  // Getters
  public getCurrentUser(): User {
    return this.currentUser;
  }
  public getStudentProfile(): StudentProfile {
    return this.studentProfile;
  }
  public getJobs(): JobOpportunity[] {
    return this.jobs;
  }
  public getApplications(): Application[] {
    return this.applications;
  }
  public getInterviews(): Interview[] {
    return this.interviews;
  }
  public getDrives(): PlacementDrive[] {
    return this.drives;
  }
  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
  public getSkillResources(): SkillResource[] {
    return this.skillResources;
  }

  // Set User Role / Identity
  public switchRole(role: UserRole) {
    if (role === 'student') {
      this.currentUser = INITIAL_USER_STUDENT;
    } else if (role === 'recruiter') {
      this.currentUser = INITIAL_USER_RECRUITER;
    } else if (role === 'admin') {
      this.currentUser = INITIAL_USER_ADMIN;
    }
    this.notify();
  }

  // Authentication & Session Management
  public setAuthSession(user: Partial<User> & { role: UserRole }, token?: string) {
    if (token) {
      setAuthToken(token, user.role);
    }

    let base = INITIAL_USER_STUDENT;
    if (user.role === 'recruiter') base = INITIAL_USER_RECRUITER;
    else if (user.role === 'admin') base = INITIAL_USER_ADMIN;

    this.currentUser = {
      ...base,
      ...user,
      id: user.id || base.id,
      name: user.name || base.name,
      email: user.email || base.email,
      role: user.role,
    };

    if (user.role === 'student') {
      this.studentProfile = {
        ...this.studentProfile,
        fullName: user.name || this.studentProfile.fullName,
        email: user.email || this.studentProfile.email,
      };
    }

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'AUTH_LOGIN',
      `Session ${this.currentUser.email}`,
      'Authenticated successfully into portal session.'
    );

    this.notify();
  }

  public clearAuthSession() {
    clearAuthToken();
    this.currentUser = INITIAL_USER_STUDENT;
    this.studentProfile = INITIAL_STUDENT_PROFILE;
    this.jobs = [];
    this.applications = [];
    this.interviews = [];
    this.notifications = [];
    this.notify();
  }

  public async checkAuthSession(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const me = await api.auth.getMe();
      if (me && me.role) {
        this.setAuthSession({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role as UserRole,
        }, token);
        return this.currentUser;
      }
      return null;
    } catch {
      clearAuthToken();
      return null;
    }
  }

  public login(user: Partial<User> & { role: UserRole }, token: string) {
    this.setAuthSession(user, token);
  }

  public logout() {
    this.clearAuthSession();
  }

  // Live Sync with Backend Server
  public syncStudentProfile(backendProfile: any) {
    if (!backendProfile) return;
    this.studentProfile = {
      ...this.studentProfile,
      id: backendProfile.id || this.studentProfile.id,
      fullName: backendProfile.name || this.studentProfile.fullName,
      email: backendProfile.email || this.studentProfile.email,
      branch: backendProfile.branch || this.studentProfile.branch,
      cgpa: typeof backendProfile.cgpa === 'number' ? backendProfile.cgpa : this.studentProfile.cgpa,
      graduationYear: backendProfile.graduation_year || this.studentProfile.graduationYear,
      activeBacklogs: typeof backendProfile.backlogs === 'number' ? backendProfile.backlogs : this.studentProfile.activeBacklogs,
      skills: Array.isArray(backendProfile.skills) ? backendProfile.skills : [],
      projects: Array.isArray(backendProfile.projects) ? backendProfile.projects : [],
      experience: Array.isArray(backendProfile.experience) ? backendProfile.experience : [],
      resume: backendProfile.resume_uploaded
        ? {
            fileName: backendProfile.resume_url ? backendProfile.resume_url.split('/').pop() || 'resume.pdf' : 'resume.pdf',
            fileSize: 'Uploaded PDF',
            uploadedAt: 'Verified by Directorate',
            parsingStatus: 'completed',
            parsedSkills: backendProfile.skills || [],
            parsedEducation: `${backendProfile.branch || 'Engineering'}, Class of ${backendProfile.graduation_year || 2027}`,
            parsedProjects: (backendProfile.projects || []).map((p: any) => typeof p === 'string' ? p : p.title || 'Project'),
            parsedExperience: 'Verified Experience',
          }
        : undefined,
    };
    this.notify();
  }

  public syncJobs(backendJobs: any[]) {
    if (!Array.isArray(backendJobs)) return;
    const mapped: JobOpportunity[] = backendJobs.map((j) => {
      const existing = this.jobs.find((orig) => orig.id === j.id);
      return {
        id: j.id,
        title: j.title || 'Software Engineer',
        company: j.company || 'Partner Enterprise',
        companyInitials: (j.company || 'PE').slice(0, 2).toUpperCase(),
        location: existing?.location || 'Campus / Multiple Locations',
        workArrangement: existing?.workArrangement || 'Hybrid',
        employmentType: existing?.employmentType || 'Full-time',
        deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '2026-12-31',
        publishedDate: j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '2026-09-01',
        salaryRange: existing?.salaryRange || 'Competitive',
        description: j.description || '',
        responsibilities: existing?.responsibilities || ['Develop technical solutions', 'Collaborate across teams'],
        requiredQualifications: existing?.requiredQualifications || [`Min CGPA ${j.min_cgpa || 7.0}`],
        requiredSkills: Array.isArray(j.required_skills) ? j.required_skills : (Array.isArray(j.requiredSkills) ? j.requiredSkills : []),
        preferredSkills: existing?.preferredSkills || [],
        eligibleBranches: Array.isArray(j.eligible_branches) ? j.eligible_branches : (Array.isArray(j.eligibleBranches) ? j.eligibleBranches : ['CSE', 'IT']),
        eligibleGradYears: [j.graduation_year || j.graduationYear || 2027],
        minCgpa: j.min_cgpa ?? j.minCgpa ?? 7.0,
        maxBacklogs: j.max_backlogs ?? j.maxBacklogs ?? 0,
        applicantsCount: j.applicant_count ?? existing?.applicantsCount ?? 0,
        shortlistedCount: existing?.shortlistedCount || 0,
        status: (j.status === 'open' ? 'Active' : 'Closed') as any,
        recruiterId: j.recruiter_id || j.recruiterId,
      };
    });

    this.jobs = mapped;
    this.notify();
  }

  public syncApplications(backendApps: any[]) {
    if (!Array.isArray(backendApps)) return;
    const mapped: Application[] = backendApps.map((a) => {
      const existing = this.applications.find((orig) => orig.id === a.id);
      const statusTitle: ApplicationStatus =
        a.status === 'interview_scheduled'
          ? 'Interview Scheduled'
          : a.status === 'shortlisted'
          ? 'Shortlisted'
          : a.status === 'selected'
          ? 'Selected'
          : a.status === 'rejected' || a.status === 'not_selected'
          ? 'Rejected'
          : a.status === 'withdrawn'
          ? 'Withdrawn'
          : 'Under Review';

      const updateDate = a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : (existing?.latestUpdateDate || '2026-10-01');

      return {
        id: a.id,
        jobId: a.job_id || a.jobId,
        studentId: a.student_id || a.studentId || this.studentProfile.id,
        studentName: a.student?.name || this.studentProfile.fullName,
        studentEmail: a.student?.user?.email || this.studentProfile.email,
        studentBranch: a.student?.branch || this.studentProfile.branch,
        studentCgpa: a.student?.cgpa ?? this.studentProfile.cgpa,
        studentGradYear: a.student?.graduationYear ?? this.studentProfile.graduationYear,
        jobTitle: a.job?.title || a.job_title || existing?.jobTitle || 'Role Candidacy',
        company: a.job?.company || a.company || existing?.company || 'Enterprise',
        appliedDate: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : (existing?.appliedDate || '2026-10-01'),
        status: statusTitle,
        matchScore: a.matchResult?.match_score ?? a.match_score ?? existing?.matchScore ?? 0,
        latestUpdateDate: updateDate,
        history: existing?.history || [
          {
            stage: statusTitle,
            date: updateDate,
            note: a.matchResult?.explanation || 'Status recorded in campus registry.',
          },
        ],
        recruiterNotes: a.notes || a.recruiterNotes,
        rejectionReason: a.rejectionReason,
      };
    });

    this.applications = mapped;
    this.notify();
  }

  public syncInterviews(backendInterviews: any[]) {
    if (!Array.isArray(backendInterviews)) return;
    const mapped: Interview[] = backendInterviews.map((iv) => {
      const modeVal: 'Video Call' | 'In-person' | 'Phone' =
        iv.mode === 'on_campus' ? 'In-person' : 'Video Call';

      return {
        id: iv.id,
        applicationId: iv.application_id || iv.applicationId || '',
        jobId: iv.application?.job_id || iv.jobId || '',
        studentId: iv.student_id || iv.studentId || this.studentProfile.id,
        studentName: iv.student?.name || this.studentProfile.fullName,
        studentEmail: iv.student?.user?.email || this.studentProfile.email,
        jobTitle: iv.application?.job?.title || 'Technical Interview',
        company: iv.application?.job?.company || 'Partner Enterprise',
        round: 'Technical Assessment',
        date: iv.scheduled_at ? new Date(iv.scheduled_at).toISOString().split('T')[0] : '2026-11-15',
        startTime: iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        endTime: '11:00 AM',
        timezone: 'EST',
        mode: modeVal,
        locationOrLink: iv.location || 'Building 4, Placement Hall',
        status: 'Scheduled',
        notes: iv.notes,
      };
    });

    this.interviews = mapped;
    this.notify();
  }

  public async loadStudentPortalData() {
    const token = getAuthToken();
    if (!token) return;

    try {
      const [prof, jobsRes, appsRes, ivRes] = await Promise.all([
        api.students.getMyProfile().catch(() => null),
        api.jobs.list({ open_only: true }).catch(() => null),
        api.applications.getMy().catch(() => null),
        api.interviews.getMy().catch(() => null),
      ]);

      if (prof) this.syncStudentProfile(prof);
      if (jobsRes && Array.isArray(jobsRes.jobs)) this.syncJobs(jobsRes.jobs);
      if (appsRes && Array.isArray(appsRes.applications)) this.syncApplications(appsRes.applications);
      if (ivRes && Array.isArray(ivRes.interviews)) this.syncInterviews(ivRes.interviews);
    } catch (e) {
      console.warn('loadStudentPortalData error:', e);
    }
  }

  public async loadRecruiterPortalData() {
    const token = getAuthToken();
    if (!token) return;

    try {
      const jobsRes = await api.jobs.list({ open_only: false }).catch(() => null);
      if (jobsRes && Array.isArray(jobsRes.jobs)) {
        this.syncJobs(jobsRes.jobs);

        const recruiterCompany = (this.currentUser.organization || 'Apex Systems').toLowerCase();
        const relevantJobs = jobsRes.jobs.filter(
          (j: any) => j.company.toLowerCase() === recruiterCompany || j.company.toLowerCase().includes('apex')
        );

        if (relevantJobs.length > 0) {
          const allApps: any[] = [];
          await Promise.all(
            relevantJobs.map(async (job: any) => {
              try {
                const appRes = await api.jobs.getApplicants(job.id);
                if (appRes && Array.isArray(appRes.applicants)) {
                  appRes.applicants.forEach((app: any) => {
                    allApps.push({
                      id: app.application_id,
                      job_id: job.id,
                      jobTitle: job.title,
                      company: job.company,
                      student_id: app.student.id,
                      student: app.student,
                      status: app.status,
                      created_at: app.applied_at,
                      matchResult: app.match_result,
                      match_score: app.match_result?.match_score,
                    });
                  });
                }
              } catch {
                // Ignore per-job applicant lookup errors
              }
            })
          );

          if (allApps.length > 0) {
            this.syncApplications(allApps);
          }
        }
      }
    } catch (e) {
      console.warn('loadRecruiterPortalData error:', e);
    }
  }

  // Student Profile Updates
  public updateStudentProfile(updates: Partial<StudentProfile>) {
    this.studentProfile = { ...this.studentProfile, ...updates };
    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'UPDATE_PROFILE',
      `Student ${this.studentProfile.fullName}`,
      'Updated student academic and personal dossier information.'
    );
    this.notify();
  }

  // Resume Parsing Simulation
  public uploadResume(fileName: string, fileSize: string) {
    this.studentProfile.resume = {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      parsingStatus: 'completed',
      parsedSkills: [...this.studentProfile.skills],
      parsedEducation: `${this.studentProfile.degree} in ${this.studentProfile.branch}, ${this.studentProfile.institution} (CGPA: ${this.studentProfile.cgpa})`,
      parsedProjects: this.studentProfile.projects.map(p => p.title),
      parsedExperience: this.studentProfile.experience.map(e => `${e.position} at ${e.organization}`).join('; '),
    };
    this.notify();
  }

  // Applications
  public applyToJob(jobId: string, matchScore: number): { success: boolean; message: string } {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found.' };

    const existing = this.applications.find(
      a => a.jobId === jobId && a.studentId === this.studentProfile.id && a.status !== 'Withdrawn'
    );
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this position.' };
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle: job.title,
      company: job.company,
      studentId: this.studentProfile.id,
      studentName: this.studentProfile.fullName,
      studentEmail: this.studentProfile.email,
      studentBranch: this.studentProfile.branch,
      studentCgpa: this.studentProfile.cgpa,
      studentGradYear: this.studentProfile.graduationYear,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: 'Applied',
      latestUpdateDate: new Date().toISOString().slice(0, 10),
      matchScore,
      history: [
        {
          stage: 'Applied',
          date: new Date().toISOString().slice(0, 10),
          note: 'Application dossier transmitted via Aarohan.',
        },
      ],
    };

    this.applications.unshift(newApp);
    job.applicantsCount += 1;

    this.addNotification({
      userId: this.studentProfile.id,
      title: 'Application Transmitted',
      message: `Your application for ${job.title} at ${job.company} has been received.`,
      category: 'application',
      link: `/student/applications/${newApp.id}`,
    });

    this.addAuditLog(
      this.studentProfile.fullName,
      'student',
      'SUBMIT_APPLICATION',
      `Application ${newApp.id} (${job.title})`,
      `Submitted formal campus placement application.`
    );

    this.notify();
    return { success: true, message: 'Application submitted successfully.' };
  }

  public updateApplicationStatus(
    applicationId: string,
    newStatus: Application['status'],
    notes?: string,
    rejectionReason?: string
  ) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;

    app.status = newStatus;
    app.latestUpdateDate = new Date().toISOString().slice(0, 10);
    if (notes) app.recruiterNotes = notes;
    if (rejectionReason) app.rejectionReason = rejectionReason;

    app.history.unshift({
      stage: newStatus,
      date: new Date().toISOString().slice(0, 10),
      note: notes || `Candidate application status advanced to ${newStatus}.`,
    });

    this.addNotification({
      userId: app.studentId,
      title: `Application Status: ${newStatus}`,
      message: `Your candidacy status for ${app.jobTitle} at ${app.company} has been updated to ${newStatus}.`,
      category: newStatus === 'Shortlisted' ? 'shortlist' : newStatus === 'Selected' ? 'system' : 'application',
      link: `/student/applications/${app.id}`,
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'STATUS_CHANGE',
      `Application ${app.id} (${app.studentName})`,
      `Advanced application lifecycle status to ${newStatus}.`
    );

    this.notify();
  }

  public withdrawApplication(applicationId: string) {
    this.updateApplicationStatus(applicationId, 'Withdrawn', 'Withdrawn by student candidate.');
  }

  // Jobs
  public createJob(jobData: Omit<JobOpportunity, 'id' | 'publishedDate' | 'applicantsCount' | 'shortlistedCount'>): JobOpportunity {
    const newJob: JobOpportunity = {
      ...jobData,
      id: `job_${Date.now()}`,
      publishedDate: new Date().toISOString().slice(0, 10),
      applicantsCount: 0,
      shortlistedCount: 0,
    };
    this.jobs.unshift(newJob);

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'CREATE_JOB',
      `Job ${newJob.id} (${newJob.title})`,
      `Published new recruitment listing with ${newJob.requiredSkills.length} prerequisite skills.`
    );

    this.notify();
    return newJob;
  }

  // Interviews
  public scheduleInterview(data: Omit<Interview, 'id' | 'status'>): Interview {
    const newInterview: Interview = {
      ...data,
      id: `int_${Date.now()}`,
      status: 'Scheduled',
    };
    this.interviews.unshift(newInterview);

    this.updateApplicationStatus(
      data.applicationId,
      'Interview Scheduled',
      `Interview confirmed for ${data.date} at ${data.startTime}.`
    );

    this.addNotification({
      userId: data.studentId,
      title: 'Interview Scheduled',
      message: `${data.company} has scheduled your ${data.round} on ${data.date} at ${data.startTime}.`,
      category: 'interview',
      link: `/student/interviews`,
    });

    this.notify();
    return newInterview;
  }

  public rescheduleInterview(interviewId: string, newDate: string, newStart: string, newEnd: string) {
    const interview = this.interviews.find(i => i.id === interviewId);
    if (!interview) return;

    interview.date = newDate;
    interview.startTime = newStart;
    interview.endTime = newEnd;
    interview.status = 'Rescheduled';

    this.addNotification({
      userId: interview.studentId,
      title: 'Interview Rescheduled',
      message: `Your interview with ${interview.company} has been rescheduled to ${newDate} at ${newStart}.`,
      category: 'interview',
      link: `/student/interviews`,
    });

    this.notify();
  }

  public cancelInterview(interviewId: string, reason?: string) {
    const interview = this.interviews.find(i => i.id === interviewId);
    if (!interview) return;

    interview.status = 'Cancelled';

    this.addNotification({
      userId: interview.studentId,
      title: 'Interview Cancelled',
      message: `Your interview with ${interview.company} on ${interview.date} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      category: 'interview',
      link: `/student/interviews`,
    });

    this.notify();
  }

  // Placement Drives
  public createDrive(driveData: Omit<PlacementDrive, 'id'>): PlacementDrive {
    const newDrive: PlacementDrive = {
      ...driveData,
      id: `drv_${Date.now()}`,
    };
    this.drives.unshift(newDrive);

    this.addNotification({
      userId: 'all',
      title: 'New Placement Drive Announced',
      message: `Registration has opened for ${newDrive.name}. Check your eligibility criteria.`,
      category: 'drive',
      link: '/opportunities',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'CREATE_DRIVE',
      `Drive ${newDrive.id} (${newDrive.name})`,
      `Created consortium recruitment initiative with ${newDrive.companies.length} employers.`
    );

    this.notify();
    return newDrive;
  }

  // Notifications
  public addNotification(notifData: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach(n => (n.read = true));
    this.notify();
  }

  // Audit Logs
  public addAuditLog(actor: string, actorRole: UserRole, action: string, entity: string, summary: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actor,
      actorRole,
      action,
      entity,
      summary,
    };
    this.auditLogs.unshift(log);
  }

  // Skill Resources
  public toggleSaveSkillResource(id: string) {
    const res = this.skillResources.find(r => r.id === id);
    if (res) {
      res.isSaved = !res.isSaved;
      this.notify();
    }
  }

  public toggleCompleteSkillResource(id: string) {
    const res = this.skillResources.find(r => r.id === id);
    if (res) {
      res.isCompleted = !res.isCompleted;
      this.notify();
    }
  }

  // Reset to clean defaults
  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aarohan_state');
      localStorage.removeItem('campuslink_state');
    }
    this.currentUser = INITIAL_USER_STUDENT;
    this.studentProfile = INITIAL_STUDENT_PROFILE;
    this.jobs = [];
    this.applications = [];
    this.interviews = [];
    this.drives = [];
    this.notifications = [];
    this.auditLogs = [];
    this.skillResources = INITIAL_SKILL_RESOURCES;
    this.notify();
  }
}

export const campusStore = new CampusStore();
