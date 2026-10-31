export type UserRole = 'student' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  studentId?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  institution: string;
  degree: string;
  branch: string;
  currentSemester: number;
  cgpa: number;
  graduationYear: number;
  activeBacklogs: number;
  skills: string[];
  projects: {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    projectUrl?: string;
    githubUrl?: string;
  }[];
  experience: {
    id: string;
    position: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  resume?: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    parsingStatus: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
    parsedSkills: string[];
    parsedEducation: string;
    parsedProjects: string[];
    parsedExperience: string;
  };
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  employmentType: 'Full-time' | 'Internship' | 'Co-op';
  deadline: string;
  publishedDate: string;
  salaryRange?: string;
  description: string;
  responsibilities: string[];
  requiredQualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  eligibleBranches: string[];
  eligibleGradYears: number[];
  minCgpa: number;
  maxBacklogs: number;
  applicantsCount: number;
  shortlistedCount: number;
  status: 'Active' | 'Draft' | 'Closed' | 'Archived';
  recruiterId?: string;
  recruiterName?: string;
  recruiterEmail?: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationHistoryItem {
  stage: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBranch: string;
  studentCgpa: number;
  studentGradYear: number;
  appliedDate: string;
  status: ApplicationStatus;
  latestUpdateDate: string;
  history: ApplicationHistoryItem[];
  matchScore: number;
  recruiterNotes?: string;
  rejectionReason?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  round: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  mode: 'Video Call' | 'In-person' | 'Phone';
  locationOrLink: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes?: string;
}

export interface PlacementDrive {
  id: string;
  name: string;
  companies: string[];
  jobOpeningsCount: number;
  registrationDeadline: string;
  eventStartDate: string;
  eventEndDate: string;
  rounds: string[];
  eligibleBranches: string[];
  minCgpa: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  description?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'application' | 'shortlist' | 'interview' | 'drive' | 'system';
  read: boolean;
  timestamp: string;
  link: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  summary: string;
  details?: string;
}

export interface SkillResource {
  id: string;
  title: string;
  provider: string;
  relevantSkill: string;
  resourceType: 'Course' | 'Documentation' | 'Practice' | 'Tutorial';
  duration: string;
  url: string;
  isSaved?: boolean;
  isCompleted?: boolean;
}

export interface MatchResult {
  jobId: string;
  overallScore: number;
  isEligible: boolean;
  eligibilityReasons: { rule: string; passed: boolean; message: string }[];
  matchedSkills: string[];
  relatedSkills: { studentSkill: string; relatedTo: string }[];
  missingRequiredSkills: string[];
  matchExplanation: string;
  breakdown: {
    skillFitScore: number;
    academicFitScore: number;
    experienceFitScore: number;
  };
}
