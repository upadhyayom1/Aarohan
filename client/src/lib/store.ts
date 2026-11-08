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
  name: '',
  email: '',
  role: 'student',
  studentId: '',
  organization: '',
};

export const INITIAL_USER_RECRUITER: User = {
  id: '',
  name: '',
  email: '',
  role: 'recruiter',
  organization: '',
};

export const INITIAL_USER_ADMIN: User = {
  id: '',
  name: '',
  email: '',
  role: 'admin',
  organization: '',
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  avatar: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  bio: '',
  institution: '',
  degree: '',
  branch: '',
  currentSemester: 1,
  cgpa: 0,
  graduationYear: new Date().getFullYear(),
  activeBacklogs: 0,
  skills: [],
  projects: [],
  experience: [],
  resume: undefined,
};

export const INITIAL_JOBS: JobOpportunity[] = [];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_INTERVIEWS: Interview[] = [];

export const INITIAL_DRIVES: PlacementDrive[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SKILL_RESOURCES: SkillResource[] = [];

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
  private authReady: boolean = false;
  private lastStudentFetch: number = 0;
  private lastRecruiterFetch: number = 0;
  private isFetchingStudentData: boolean = false;
  private isFetchingRecruiterData: boolean = false;

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      this.authReady = !token;
    } else {
      this.authReady = true;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        version: 6,
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
        if (
          !parsed.version ||
          parsed.version < 6 ||
          parsed.currentUser?.name === 'Aditi Rao' ||
          parsed.currentUser?.name === 'Adya Tripathi' ||
          parsed.currentUser?.name === 'Dev Sharma' ||
          parsed.studentProfile?.fullName === 'Aditi Rao' ||
          parsed.studentProfile?.fullName === 'Adya Tripathi' ||
          parsed.studentProfile?.fullName === 'Dev Sharma' ||
          parsed.studentProfile?.id?.startsWith('stu_')
        ) {
          this.currentUser = INITIAL_USER_STUDENT;
          this.studentProfile = INITIAL_STUDENT_PROFILE;
          this.jobs = [];
          this.applications = [];
          this.interviews = [];
          this.drives = [];
          this.notifications = [];
          this.auditLogs = [];
          this.skillResources = [];
          this.saveToStorage();
          return;
        }

        if (parsed.currentUser) this.currentUser = parsed.currentUser;
        if (parsed.studentProfile) this.studentProfile = parsed.studentProfile;
        if (parsed.jobs) this.jobs = parsed.jobs;
        if (parsed.applications) this.applications = parsed.applications;
        if (parsed.interviews) this.interviews = parsed.interviews;
        if (parsed.drives) this.drives = parsed.drives;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
        if (parsed.skillResources) this.skillResources = parsed.skillResources;
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
  public isAuthReady(): boolean {
    return this.authReady;
  }

  // Set User Role / Identity
  public switchRole(role: UserRole) {
    if (this.currentUser.role === role) return;
    this.currentUser = {
      ...this.currentUser,
      role,
    };
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

    const org = user.organization || (user.role === 'recruiter' ? user.name || base.organization : base.organization);

    this.currentUser = {
      ...base,
      ...user,
      id: user.id || base.id,
      name: user.name || base.name,
      email: user.email || base.email,
      role: user.role,
      organization: org,
    };

    if (user.role === 'student') {
      this.studentProfile = {
        ...this.studentProfile,
        id: this.studentProfile.id && !this.studentProfile.id.startsWith('stu_') ? this.studentProfile.id : (user.studentId || user.id || this.studentProfile.id),
        fullName: user.name || this.studentProfile.fullName,
        email: user.email || this.studentProfile.email,
      };
    }

    this.authReady = true;

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
    this.authReady = true;
    this.notify();
  }

  public async checkAuthSession(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) {
      this.authReady = true;
      this.notify();
      return null;
    }
    try {
      const me = await api.auth.getMe();
      if (me && me.role) {
        this.setAuthSession({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role as UserRole,
        }, token);

        if (me.role === 'student') {
          await this.loadStudentPortalData();
        } else if (me.role === 'recruiter') {
          await this.loadRecruiterPortalData();
        }
        return this.currentUser;
      }
    } catch {
      clearAuthToken();
    } finally {
      this.authReady = true;
      this.notify();
    }
    return null;
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
    const analysis = backendProfile.resume_analysis;
    const eduList = Array.isArray(analysis?.education) ? analysis.education : [];
    const expList = Array.isArray(analysis?.experience) ? analysis.experience : [];
    const projList = (Array.isArray(backendProfile.projects) && backendProfile.projects.length > 0)
      ? backendProfile.projects
      : (Array.isArray(analysis?.projects) ? analysis.projects : []);

    const parsedEdu = eduList.length > 0
      ? eduList.map((e: any) => typeof e === 'string' ? e : `${e.degree || ''} ${e.branch ? `in ${e.branch}` : ''}, ${e.institution || ''}${e.cgpa ? ` (CGPA: ${e.cgpa})` : ''}`.trim()).filter(Boolean).join('; ')
      : (backendProfile.branch ? `${backendProfile.branch}, Class of ${backendProfile.graduation_year || 2027}` : '');

    const parsedExp = expList.length > 0
      ? expList.map((e: any) => typeof e === 'string' ? e : `${e.role || e.position || ''} at ${e.company || e.organization || ''}`.trim()).filter(Boolean).join('; ')
      : '';

    const parsedProjs = projList.map((p: any) => typeof p === 'string' ? p : p.title || 'Project');

    this.studentProfile = {
      ...this.studentProfile,
      id: backendProfile.id || backendProfile.user_id || this.studentProfile.id,
      fullName: backendProfile.name || this.studentProfile.fullName,
      email: backendProfile.email || this.studentProfile.email,
      branch: backendProfile.branch || this.studentProfile.branch,
      institution: eduList[0]?.institution || this.studentProfile.institution,
      degree: eduList[0]?.degree || this.studentProfile.degree,
      cgpa: typeof backendProfile.cgpa === 'number' ? backendProfile.cgpa : this.studentProfile.cgpa,
      graduationYear: backendProfile.graduation_year || this.studentProfile.graduationYear,
      activeBacklogs: typeof backendProfile.backlogs === 'number' ? backendProfile.backlogs : this.studentProfile.activeBacklogs,
      skills: Array.isArray(backendProfile.skills) && backendProfile.skills.length > 0 ? backendProfile.skills : (analysis?.skills || []),
      projects: projList.map((p: any, idx: number) => ({
        id: p.id || `proj_${idx}`,
        title: typeof p === 'string' ? p : p.title || `Project ${idx + 1}`,
        description: typeof p === 'string' ? 'Extracted from resume' : p.description || 'Extracted from resume',
        techStack: Array.isArray(p.tech_stack) ? p.tech_stack : (Array.isArray(p.techStack) ? p.techStack : []),
        githubUrl: p.githubUrl || '',
        projectUrl: p.projectUrl || '',
      })),
      experience: expList.length > 0
        ? expList.map((e: any, idx: number) => ({
            id: `exp_${idx}`,
            position: e.role || e.position || 'Contributor / Intern',
            organization: e.company || e.organization || 'Organization',
            startDate: e.duration?.split(/[-–—]/)?.[0]?.trim() || '',
            endDate: e.duration?.split(/[-–—]/)?.[1]?.trim() || 'Present',
            description: e.description || '',
          }))
        : this.studentProfile.experience,
      resume: backendProfile.resume_uploaded
        ? {
            fileName: backendProfile.resume_url ? backendProfile.resume_url.split('/').pop() || 'resume.pdf' : 'resume.pdf',
            fileSize: 'Verified Institutional PDF',
            uploadedAt: 'Synced with Database',
            parsingStatus: 'completed',
            parsedSkills: (Array.isArray(backendProfile.skills) && backendProfile.skills.length > 0)
              ? backendProfile.skills
              : (analysis?.skills || []),
            parsedEducation: parsedEdu,
            parsedProjects: parsedProjs,
            parsedExperience: parsedExp,
          }
        : undefined,
    };
    this.notify();
  }

  public syncJobs(backendJobs: any[]) {
    if (!Array.isArray(backendJobs)) return;
    if (backendJobs.length === 0) {
      this.jobs = [];
      this.notify();
      return;
    }
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
        requiredSkills: Array.isArray(j.required_skills) ? j.required_skills : [],
        preferredSkills: existing?.preferredSkills || [],
        eligibleBranches: Array.isArray(j.eligible_branches) ? j.eligible_branches : ['CSE', 'IT'],
        eligibleGradYears: [j.graduation_year || 2026],
        minCgpa: j.min_cgpa ?? 7.0,
        maxBacklogs: j.max_backlogs ?? 0,
        applicantsCount: j.applicant_count ?? existing?.applicantsCount ?? 0,
        shortlistedCount: existing?.shortlistedCount || 0,
        status: (j.status === 'open' ? 'Active' : 'Closed') as any,
        recruiterId: j.recruiter_id,
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
        studentSkills: a.student?.skills || a.studentSkills || [],
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

      const scheduledDate = iv.scheduled_at ? new Date(iv.scheduled_at) : null;
      const formattedDate = scheduledDate ? scheduledDate.toISOString().split('T')[0] : '';
      const formattedTime = scheduledDate
        ? scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      return {
        id: iv.id,
        applicationId: iv.application_id || iv.applicationId || '',
        jobId: iv.job?.id || iv.application?.job?.id || iv.job_id || iv.jobId || '',
        studentId: iv.student?.id || iv.application?.student?.id || iv.student_id || iv.studentId || this.studentProfile.id,
        studentName: iv.student?.name || iv.application?.student?.name || this.studentProfile.fullName,
        studentEmail: iv.student?.email || iv.student?.user?.email || this.studentProfile.email,
        jobTitle: iv.job?.title || iv.application?.job?.title || iv.jobTitle || 'Technical Interview',
        company: iv.job?.company || iv.application?.job?.company || iv.company || 'Partner Enterprise',
        round: iv.round || (iv.notes ? iv.notes.split('(')[0]?.trim() : 'Technical Assessment') || 'Technical Assessment',
        date: formattedDate,
        startTime: formattedTime,
        endTime: '',
        timezone: 'Local',
        mode: modeVal,
        locationOrLink: iv.location || '',
        status: 'Scheduled',
        notes: iv.notes || '',
      };
    });

    this.interviews = mapped;
    this.notify();
  }

  public async loadStudentPortalData(force = false) {
    const token = getAuthToken();
    if (!token) return;
    const now = Date.now();
    if (!force && (now - this.lastStudentFetch < 12000 || this.isFetchingStudentData)) {
      return;
    }
    this.isFetchingStudentData = true;

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
      this.lastStudentFetch = Date.now();
    } catch (e) {
      console.warn('loadStudentPortalData error:', e);
    } finally {
      this.isFetchingStudentData = false;
    }
  }

  public async loadRecruiterPortalData(force = false) {
    const token = getAuthToken();
    if (!token) return;
    const now = Date.now();
    if (!force && (now - this.lastRecruiterFetch < 12000 || this.isFetchingRecruiterData)) {
      return;
    }
    this.isFetchingRecruiterData = true;

    try {
      const [jobsRes, ivRes] = await Promise.all([
        api.jobs.list({ open_only: false }).catch(() => null),
        api.interviews.getMy().catch(() => null),
      ]);

      if (jobsRes && Array.isArray(jobsRes.jobs)) {
        this.syncJobs(jobsRes.jobs);

        const currentRecruiterId = this.currentUser.id;
        const recruiterCompany = (this.currentUser.organization || this.currentUser.name || '').toLowerCase();

        const relevantJobs = jobsRes.jobs.filter((j: any) => {
          if (this.currentUser.role === 'admin') return true;
          if (currentRecruiterId && (j.recruiter_id === currentRecruiterId || j.recruiterId === currentRecruiterId)) {
            return true;
          }
          if (recruiterCompany && j.company.toLowerCase() === recruiterCompany) {
            return true;
          }
          return false;
        });

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

      if (ivRes && Array.isArray(ivRes.interviews)) {
        this.syncInterviews(ivRes.interviews);
      }
      this.lastRecruiterFetch = Date.now();
    } catch (e) {
      console.warn('loadRecruiterPortalData error:', e);
    } finally {
      this.isFetchingRecruiterData = false;
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
      parsingStatus: 'uploading',
      parsedSkills: [],
      parsedEducation: '',
      parsedProjects: [],
      parsedExperience: '',
    };
    this.notify();

    setTimeout(() => {
      if (this.studentProfile.resume) {
        this.studentProfile.resume.parsingStatus = 'processing';
        this.notify();
      }

      setTimeout(() => {
        if (this.studentProfile.resume) {
          this.studentProfile.resume.parsingStatus = 'completed';
          this.studentProfile.resume.parsedSkills = [...this.studentProfile.skills];
          this.studentProfile.resume.parsedEducation = `${this.studentProfile.degree} in ${this.studentProfile.branch}, ${this.studentProfile.institution} (CGPA: ${this.studentProfile.cgpa})`;
          this.studentProfile.resume.parsedProjects = this.studentProfile.projects.map(p => p.title);
          this.studentProfile.resume.parsedExperience = this.studentProfile.experience.map(e => `${e.position} at ${e.organization}`).join('; ');

          this.addNotification({
            userId: this.currentUser.id,
            title: 'Resume Processing Completed',
            message: `File ${fileName} was parsed. Found ${this.studentProfile.skills.length} technical skills and 3 projects.`,
            category: 'system',
            link: '/student/resume',
          });

          this.addAuditLog(
            this.currentUser.name,
            this.currentUser.role,
            'PARSE_RESUME',
            `Resume ${fileName}`,
            'Completed resume document extraction and verification.'
          );
          this.notify();
        }
      }, 900);
    }, 600);
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

    app.history.push({
      stage: newStatus,
      date: new Date().toISOString().slice(0, 10),
      note: notes || `Application moved to ${newStatus}.`,
    });

    // Notify student
    this.addNotification({
      userId: app.studentId,
      title: `Application Status: ${newStatus}`,
      message: `Your application for ${app.jobTitle} at ${app.company} is now ${newStatus}.`,
      category: newStatus === 'Shortlisted' ? 'shortlist' : 'application',
      link: `/student/applications/${app.id}`,
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'UPDATE_APPLICATION_STATUS',
      `Application ${app.id} (${app.studentName})`,
      `Updated status to ${newStatus}. Notes: ${notes || 'None'}`
    );

    this.notify();
  }

  public withdrawApplication(applicationId: string) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;
    app.status = 'Withdrawn';
    app.latestUpdateDate = new Date().toISOString().slice(0, 10);
    app.history.push({
      stage: 'Withdrawn',
      date: new Date().toISOString().slice(0, 10),
      note: 'Candidate voluntarily withdrew application dossier.',
    });
    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'WITHDRAW_APPLICATION',
      `Application ${app.id}`,
      'Voluntary candidate withdrawal.'
    );
    this.notify();
  }

  // Job Creation (Recruiter)
  public createJob(jobData: Omit<JobOpportunity, 'id' | 'applicantsCount' | 'shortlistedCount' | 'publishedDate'>): JobOpportunity {
    const initials = jobData.company
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'UN';

    const newJob: JobOpportunity = {
      ...jobData,
      id: `job_${Date.now()}`,
      companyInitials: initials,
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
      `Published new recruitment posting for ${newJob.company}.`
    );

    this.notify();
    return newJob;
  }

  // Interview Management
  public scheduleInterview(interviewData: Omit<Interview, 'id' | 'status'>): Interview {
    const newInterview: Interview = {
      ...interviewData,
      id: `int_${Date.now()}`,
      status: 'Scheduled',
    };

    this.interviews.unshift(newInterview);

    // Update application status if needed
    const app = this.applications.find(a => a.id === interviewData.applicationId);
    if (app && app.status !== 'Interview Scheduled') {
      this.updateApplicationStatus(
        app.id,
        'Interview Scheduled',
        `Interview scheduled for ${interviewData.date} at ${interviewData.startTime}.`
      );
    }

    this.addNotification({
      userId: interviewData.studentId,
      title: 'Interview Scheduled',
      message: `${interviewData.company} scheduled your ${interviewData.round} on ${interviewData.date} at ${interviewData.startTime}.`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'SCHEDULE_INTERVIEW',
      `Interview ${newInterview.id} (${interviewData.studentName})`,
      `Scheduled ${interviewData.round} with ${interviewData.company}.`
    );

    this.notify();
    return newInterview;
  }

  public rescheduleInterview(interviewId: string, newDate: string, newStartTime: string, newEndTime: string) {
    const item = this.interviews.find(i => i.id === interviewId);
    if (!item) return;

    item.date = newDate;
    item.startTime = newStartTime;
    item.endTime = newEndTime;
    item.status = 'Rescheduled';

    this.addNotification({
      userId: item.studentId,
      title: 'Interview Rescheduled',
      message: `Your ${item.round} with ${item.company} has been rescheduled to ${newDate} at ${newStartTime}.`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'RESCHEDULE_INTERVIEW',
      `Interview ${item.id}`,
      `Rescheduled interview to ${newDate} at ${newStartTime}.`
    );

    this.notify();
  }

  public cancelInterview(interviewId: string, reason?: string) {
    const item = this.interviews.find(i => i.id === interviewId);
    if (!item) return;
    item.status = 'Cancelled';
    if (reason) item.notes = `Cancelled: ${reason}`;

    this.addNotification({
      userId: item.studentId,
      title: 'Interview Cancelled',
      message: `Your interview with ${item.company} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      category: 'interview',
      link: '/student/interviews',
    });

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      'CANCEL_INTERVIEW',
      `Interview ${item.id}`,
      `Cancelled interview. Reason: ${reason || 'N/A'}`
    );

    this.notify();
  }

  // Drives (Admin)
  public createDrive(driveData: Omit<PlacementDrive, 'id'>): PlacementDrive {
    const newDrive: PlacementDrive = {
      ...driveData,
      id: `drv_${Date.now()}`,
    };
    this.drives.unshift(newDrive);

    this.addAuditLog(
      this.currentUser.name,
      'admin',
      'CREATE_DRIVE',
      `Placement Drive ${newDrive.name}`,
      `Created placement drive across ${driveData.companies.length} companies.`
    );

    this.notify();
    return newDrive;
  }

  // Notifications
  public addNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) {
    const newNotif: NotificationItem = {
      ...notif,
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

  // Reset to seed defaults
  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aarohan_state');
      localStorage.removeItem('campuslink_state');
    }
    this.currentUser = INITIAL_USER_STUDENT;
    this.studentProfile = INITIAL_STUDENT_PROFILE;
    this.jobs = INITIAL_JOBS;
    this.applications = INITIAL_APPLICATIONS;
    this.interviews = INITIAL_INTERVIEWS;
    this.drives = INITIAL_DRIVES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.skillResources = INITIAL_SKILL_RESOURCES;
    this.notify();
  }
}

export const campusStore = new CampusStore();
