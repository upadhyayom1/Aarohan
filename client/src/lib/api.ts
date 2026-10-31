/**
 * CampusLink API Client
 * Centralized API integration layer matching api_contracts.md specifications.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/api/v1` : 'http://localhost:8000/api/v1');

const AI_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_AI_BASE_URL) ||
  'http://localhost:8001/api/v1/ai';

export interface ResumeAnalysis {
  skills: string[];
  education: Array<{
    degree?: string;
    branch?: string;
    institution?: string;
    graduation_year?: number;
    cgpa?: number;
  }>;
  experience: Array<{
    company?: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
  projects: Array<{
    title?: string;
    description?: string;
    tech_stack?: string[];
  }>;
  summary: string;
}

export interface MatchResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  eligible: boolean;
  eligibility_reasons: string[];
  keyword_score?: number;
  semantic_score?: number;
  breakdown?: {
    skill_score?: number;
    context_score?: number;
    evidence_score?: number;
    keyword_score?: number;
    semantic_score?: number;
  };
}

export interface AtsResult {
  ats_score: number;
  missing_keywords: string[];
  improvement_suggestions: string[];
  formatting_feedback: string[];
  overall_feedback: string;
  overall_score?: number;
}

export interface SkillRecommendation {
  skill: string;
  why: string;
  learn_from: string;
  estimated_time: string;
}

export interface SkillGapResult {
  missing_skills: string[];
  recommendations: SkillRecommendation[];
  job_id?: string;
  job_title?: string;
  company?: string;
}

export interface SkillDemandItem {
  skill: string;
  jobs_requiring: number;
  students_with_skill: number;
  gap: number;
}

export interface SkillDemandResult {
  open_jobs_only: boolean;
  skills: SkillDemandItem[];
}

export interface MatchComparison {
  student_id: string;
  job_id: string;
  embedding_backend: string;
  keyword_matched: string[];
  semantic_matched: string[];
  found_only_by_semantic: string[];
  keyword_score: number;
  semantic_score: number;
}

export interface BuildResumeResult {
  markdown: string;
  sections: Record<string, string>;
  suggestions: string[];
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>;
  eligibility_reasons?: string[];
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;
  eligibility_reasons?: string[];

  constructor(status: number, data: ApiErrorResponse) {
    super(data.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = data.code || 'UNKNOWN_ERROR';
    this.details = data.details;
    this.eligibility_reasons = data.eligibility_reasons;
  }
}

// Token storage helpers
const TOKEN_KEY = 'aarohan_token';
const LEGACY_TOKEN_KEY = 'campuslink_token';
const ROLE_KEY = 'aarohan_role';
const LEGACY_ROLE_KEY = 'campuslink_role';

const getStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined') {
    try {
      const s = (globalThis as any).localStorage;
      if (s && typeof s.getItem === 'function') return s;
    } catch {
      return null;
    }
  }
  return null;
};

export const getAuthToken = (): string | null => {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(TOKEN_KEY) || storage.getItem(LEGACY_TOKEN_KEY);
};

export const setAuthToken = (token: string, role?: string): void => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(LEGACY_TOKEN_KEY, token);
  if (role) {
    storage.setItem(ROLE_KEY, role);
    storage.setItem(LEGACY_ROLE_KEY, role);
  }
};

export const clearAuthToken = (): void => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(LEGACY_TOKEN_KEY);
  storage.removeItem(ROLE_KEY);
  storage.removeItem(LEGACY_ROLE_KEY);
};

export const getStoredRole = (): string | null => {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(ROLE_KEY) || storage.getItem(LEGACY_ROLE_KEY);
};

/**
 * Core HTTP Request Wrapper
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle binary responses (e.g. PDF downloads)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    if (!response.ok) {
      throw new ApiError(response.status, {
        code: 'FILE_ERROR',
        message: 'Failed to download file',
      });
    }
    return (await response.blob()) as unknown as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Session expired or unauthorized
    if (response.status === 401) {
      clearAuthToken();
    }
    throw new ApiError(response.status, data);
  }

  return data as T;
}

/**
 * AI Service Request Wrapper (FastAPI Port 8001)
 */
async function aiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${AI_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    // If direct connection fails (e.g. CORS/network), try through Vite dev proxy
    if (typeof window !== 'undefined' && !url.includes('/ai-api')) {
      const proxyUrl = `/ai-api/api/v1/ai${cleanEndpoint}`;
      response = await fetch(proxyUrl, { ...options, headers });
    } else {
      throw netErr;
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data);
  }
  return data as T;
}

export const api = {
  // 1. Auth Endpoints
  auth: {
    register: (body: { name: string; email: string; password: string; role: 'student' | 'recruiter' | 'admin' }) =>
      request<{ id: string; name: string; email: string; role: string; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      request<{ id: string; name: string; email: string; role: string; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMe: () =>
      request<{ id: string; name: string; email: string; role: string }>('/auth/me'),
  },

  // 2. Student Profile Endpoints
  students: {
    getMyProfile: () => request<any>('/students/me'),

    updateMyProfile: (data: any) =>
      request<any>('/students/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getById: (studentId: string) => request<any>(`/students/${studentId}`),
  },

  // 3. Resume Endpoints
  resume: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<{ message: string; resume_url: string; analysis: any }>('/students/resume', {
        method: 'POST',
        body: formData,
      });
    },

    downloadMyResume: () => request<Blob>('/students/resume/file'),

    downloadCandidateResume: (studentId: string) =>
      request<Blob>(`/students/${studentId}/resume`),
  },

  // 4. Jobs Endpoints
  jobs: {
    list: (params?: { page?: number; limit?: number; branch?: string; open_only?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.branch) query.set('branch', params.branch);
      if (params?.open_only !== undefined) query.set('open_only', params.open_only.toString());
      const qs = query.toString();
      return request<{ total: number; page: number; limit: number; jobs: any[] }>(`/jobs${qs ? `?${qs}` : ''}`);
    },

    getById: (jobId: string) => request<any>(`/jobs/${jobId}`),

    create: (data: any) =>
      request<any>('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (jobId: string, data: any) =>
      request<any>(`/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (jobId: string, status: 'open' | 'closed') =>
      request<any>(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getApplicants: (jobId: string, params?: { status?: string; eligible_only?: boolean; sort_by?: string; order?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.eligible_only !== undefined) query.set('eligible_only', params.eligible_only.toString());
      if (params?.sort_by) query.set('sort_by', params.sort_by);
      if (params?.order) query.set('order', params.order);
      const qs = query.toString();
      return request<{ job_id: string; total: number; applicants: any[] }>(`/jobs/${jobId}/applicants${qs ? `?${qs}` : ''}`);
    },
  },

  // 5. Applications Endpoints
  applications: {
    apply: (jobId: string) =>
      request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId }),
      }),

    getMy: () => request<{ applications: any[] }>('/applications/my'),

    getById: (applicationId: string) => request<any>(`/applications/${applicationId}`),

    updateStatus: (
      applicationId: string,
      status: 'shortlisted' | 'rejected' | 'interview_scheduled' | 'selected' | 'not_selected'
    ) =>
      request<{ id: string; status: string; updated_at: string }>(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // 7. Interviews Endpoints
  interviews: {
    schedule: (data: {
      application_id: string;
      scheduled_at: string;
      mode: 'online' | 'on_campus';
      location: string;
      notes?: string;
    }) =>
      request<any>('/interviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMy: (params?: { upcoming?: boolean; past?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.upcoming !== undefined) query.set('upcoming', params.upcoming.toString());
      if (params?.past !== undefined) query.set('past', params.past.toString());
      const qs = query.toString();
      return request<{ interviews: any[] }>(`/interviews/my${qs ? `?${qs}` : ''}`);
    },
  },

  // 8. Admin Endpoints
  admin: {
    getStudents: () =>
      request<{
        total: number;
        students: Array<{
          id: string;
          name: string;
          branch: string;
          cgpa: number;
          graduation_year: number;
          resume_uploaded: boolean;
          applications_count: number;
          shortlisted_count: number;
        }>;
      }>('/admin/students'),

    getRecruiters: () =>
      request<{
        total: number;
        recruiters: Array<{
          id: string;
          name: string;
          email: string;
          company: string;
          jobs_posted: number;
        }>;
      }>('/admin/recruiters'),

    getStats: () =>
      request<{
        total_students: number;
        students_placed: number;
        total_jobs: number;
        open_jobs: number;
        total_applications: number;
        shortlisted: number;
        interviews_scheduled: number;
      }>('/admin/stats'),

    getAnalytics: () =>
      request<{
        kpis: {
          total_applications: number;
          interview_conversion_rate: number;
          selection_conversion_rate: number;
          department_breadth: number;
        };
        department_performance: Array<{
          branch: string;
          applicants: number;
          placed: number;
          rate: number;
        }>;
        in_demand_skills: Array<{ skill: string; count: number }>;
        hiring_funnel: {
          applied: number;
          under_review: number;
          shortlisted: number;
          interview_scheduled: number;
          selected: number;
        };
      }>('/admin/analytics'),

    getDrives: () => request<{ total: number; drives: any[] }>('/admin/drives'),

    createDrive: (data: any) =>
      request<any>('/admin/drives', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getApplications: (params?: { page?: number; limit?: number; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return request<any>(`/admin/applications${qs ? `?${qs}` : ''}`);
    },

    getPlacements: (params?: { branch?: string }) => {
      const query = new URLSearchParams();
      if (params?.branch) query.set('branch', params.branch);
      const qs = query.toString();
      return request<any>(`/admin/placements${qs ? `?${qs}` : ''}`);
    },

    getAuditLogs: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.role) query.set('role', params.role);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<any>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
    },

    getSettings: () =>
      request<{
        placement_year?: string;
        default_min_cgpa?: number;
        max_backlogs_allowed?: number;
        [key: string]: any;
      }>('/admin/settings'),

    updateSettings: (data: {
      placement_year?: string;
      default_min_cgpa?: number;
      max_backlogs_allowed?: number;
      [key: string]: any;
    }) =>
      request<any>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // 9. AI Endpoints (Port 8001 AI Server)
  ai: {
    analyzeResume: (studentId: string) =>
      aiRequest<ResumeAnalysis>('/analyze-resume', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
      }),

    matchResume: (studentId: string, jobId: string) =>
      aiRequest<MatchResult>('/match-resume', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, job_id: jobId }),
      }),

    getAtsAnalysis: (studentId: string, jobId?: string) =>
      aiRequest<AtsResult>('/ats-analysis', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, job_id: jobId || null }),
      }),

    getSkillGaps: (studentId: string, jobId: string) =>
      aiRequest<SkillGapResult>('/skill-gaps', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, job_id: jobId }),
      }),

    buildResume: (studentId: string) =>
      aiRequest<BuildResumeResult>('/build-resume', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
      }),

    compareMatching: (studentId: string, jobId: string) =>
      aiRequest<any>('/compare-matching', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, job_id: jobId }),
      }),

    matchJobApplicants: (jobId: string, explain: boolean = false) =>
      aiRequest<{
        job_id: string;
        total: number;
        results: Array<{
          application_id: string;
          student_id: string;
          student_name: string;
          status: string;
          match_result: MatchResult;
        }>;
      }>(`/match-job-applicants?explain=${explain}`, {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId }),
      }),

    getSkillDemand: (params?: { limit?: number; open_only?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.open_only !== undefined) query.set('open_only', params.open_only.toString());
      const qs = query.toString();
      return aiRequest<any>(`/analytics/skill-demand${qs ? `?${qs}` : ''}`);
    },
  },
};

export default api;

