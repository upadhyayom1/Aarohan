import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { useCampusStore } from './lib/useStore';
import { getAuthToken } from './lib/api';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';
import { Button, PageLoader, RouteLoadingBoundary } from './components/ui';
import { PageTransition } from './components/transitions/PageTransition';
import { ShieldAlert, LogIn, Compass, ArrowRight } from 'lucide-react';

// Layout Shells
import { StudentShell } from './components/layout/StudentShell';
import { RecruiterShell } from './components/layout/RecruiterShell';
import { AdminShell } from './components/layout/AdminShell';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentResumePage } from './pages/student/StudentResumePage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentApplicationDetailPage } from './pages/student/StudentApplicationDetailPage';
import { StudentMatchesPage } from './pages/student/StudentMatchesPage';
import { StudentSkillsPage } from './pages/student/StudentSkillsPage';
import { StudentInterviewsPage } from './pages/student/StudentInterviewsPage';
import { StudentCalendarPage } from './pages/student/StudentCalendarPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { RecruiterNewJobPage } from './pages/recruiter/RecruiterNewJobPage';
import { RecruiterApplicantsPage } from './pages/recruiter/RecruiterApplicantsPage';
import { RecruiterInterviewsPage } from './pages/recruiter/RecruiterInterviewsPage';
import { RecruiterCalendarPage } from './pages/recruiter/RecruiterCalendarPage';
import { RecruiterReportsPage } from './pages/recruiter/RecruiterReportsPage';
import { RecruiterSettingsPage } from './pages/recruiter/RecruiterSettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminRecruitersPage } from './pages/admin/AdminRecruitersPage';
import { AdminDrivesPage } from './pages/admin/AdminDrivesPage';
import { AdminNewDrivePage } from './pages/admin/AdminNewDrivePage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminPlacementsPage } from './pages/admin/AdminPlacementsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function AccessDeniedView({
  requiredRole,
  userRole,
  onRedirect,
}: {
  requiredRole: string;
  userRole: string;
  onRedirect: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-5">
      <div className="w-12 h-12 bg-[#FAFAF9] border border-[#222222] rounded-[2px] flex items-center justify-center text-[#111111]">
        <ShieldAlert size={24} />
      </div>
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
          ACCESS CONTROL • PRIVILEGE BOUNDARY
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
          {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} Privilege Required
        </h2>
        <p className="text-xs text-[#666666] mt-2 leading-relaxed">
          Your authenticated session (Role: <code className="font-mono bg-[#F5F5F3] px-1 py-0.5 border border-[#E4E4E1]">{userRole}</code>) does not hold the permissions required to access this portal section.
        </p>
      </div>
      <div className="pt-2">
        <Button variant="primary" size="sm" onClick={onRedirect} icon={<ArrowRight size={13} />}>
          Navigate to Authorized Portal
        </Button>
      </div>
    </div>
  );
}

function AppRouter() {
  const { path, navigate } = useRouter();
  const { authReady, currentUser, actions } = useCampusStore();
  const token = getAuthToken();

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [path]);

  // Restore authenticated session on mount
  useEffect(() => {
    actions.checkAuthSession();
  }, [actions]);

  // Load portal data once when authorized session is ready
  useEffect(() => {
    if (token && authReady) {
      if (currentUser.role === 'student') {
        actions.loadStudentPortalData();
      } else if (currentUser.role === 'recruiter') {
        actions.loadRecruiterPortalData();
      }
    }
  }, [currentUser.role, actions, token, authReady]);

  // Dynamic route matchers
  const isOpportunityDetail = path.startsWith('/opportunities/') && path !== '/opportunities';
  const isStudentAppDetail = path.startsWith('/student/applications/') && path !== '/student/applications';
  const isRecruiterApplicants =
    path === '/recruiter/applicants' ||
    (path.startsWith('/recruiter/jobs/') && path.endsWith('/applicants'));

  // ==========================================
  // STUDENT PORTAL ROUTES
  // ==========================================
  if (path.startsWith('/student')) {
    // 1. Wait for auth restoration
    if (!authReady) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <PageLoader message="Verifying student academic credentials..." />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 2. Unauthenticated check
    if (!token) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1">
            <PageTransition routeKey="/login">
              <LoginPage />
            </PageTransition>
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 3. Role restriction check
    if (currentUser.role !== 'student' && currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <AccessDeniedView
              requiredRole="student"
              userRole={currentUser.role}
              onRedirect={() => navigate('/recruiter/dashboard')}
            />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 4. Resolve Student Route
    let content: React.ReactNode = null;

    if (path === '/student' || path === '/student/dashboard') {
      content = <StudentDashboard />;
    } else if (path === '/student/profile') {
      content = <StudentProfilePage />;
    } else if (path === '/student/resume') {
      content = <StudentResumePage />;
    } else if (path === '/student/opportunities') {
      content = <OpportunitiesPage isStudentPortal={true} />;
    } else if (isStudentAppDetail) {
      content = <StudentApplicationDetailPage />;
    } else if (path === '/student/applications') {
      content = <StudentApplicationsPage />;
    } else if (path === '/student/matches') {
      content = <StudentMatchesPage />;
    } else if (path === '/student/skills') {
      content = <StudentSkillsPage />;
    } else if (path === '/student/interviews') {
      content = <StudentInterviewsPage />;
    } else if (path === '/student/calendar') {
      content = <StudentCalendarPage />;
    } else if (path === '/student/notifications') {
      content = <StudentNotificationsPage />;
    } else if (path === '/student/settings') {
      content = <StudentSettingsPage />;
    } else {
      content = <NotFoundPage />;
    }

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <StudentShell>
          <PageTransition routeKey={path}>{content}</PageTransition>
        </StudentShell>
      </div>
    );
  }

  // ==========================================
  // RECRUITER PORTAL ROUTES
  // ==========================================
  if (path.startsWith('/recruiter')) {
    // 1. Wait for auth restoration
    if (!authReady) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <PageLoader message="Verifying corporate recruiter credentials..." />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 2. Unauthenticated check
    if (!token) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1">
            <PageTransition routeKey="/login">
              <LoginPage />
            </PageTransition>
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 3. Role restriction check
    if (currentUser.role !== 'recruiter' && currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <AccessDeniedView
              requiredRole="recruiter"
              userRole={currentUser.role}
              onRedirect={() => navigate('/student/dashboard')}
            />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 4. Resolve Recruiter Route
    let content: React.ReactNode = null;

    if (path === '/recruiter' || path === '/recruiter/dashboard') {
      content = <RecruiterDashboard />;
    } else if (path === '/recruiter/jobs/new') {
      content = <RecruiterNewJobPage />;
    } else if (isRecruiterApplicants) {
      content = <RecruiterApplicantsPage />;
    } else if (path === '/recruiter/jobs') {
      content = <RecruiterJobsPage />;
    } else if (path === '/recruiter/interviews') {
      content = <RecruiterInterviewsPage />;
    } else if (path === '/recruiter/calendar') {
      content = <RecruiterCalendarPage />;
    } else if (path === '/recruiter/reports') {
      content = <RecruiterReportsPage />;
    } else if (path === '/recruiter/settings') {
      content = <RecruiterSettingsPage />;
    } else {
      content = <NotFoundPage />;
    }

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <RecruiterShell>
          <PageTransition routeKey={path}>{content}</PageTransition>
        </RecruiterShell>
      </div>
    );
  }

  // ==========================================
  // ADMIN PORTAL ROUTES
  // ==========================================
  if (path.startsWith('/admin')) {
    // 1. Wait for auth restoration
    if (!authReady) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <PageLoader message="Verifying Directorate administration credentials..." />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 2. Unauthenticated check
    if (!token) {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1">
            <PageTransition routeKey="/login">
              <LoginPage />
            </PageTransition>
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 3. Role restriction check (Admin only)
    if (currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 flex items-center justify-center">
            <AccessDeniedView
              requiredRole="admin"
              userRole={currentUser.role}
              onRedirect={() => navigate(currentUser.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard')}
            />
          </main>
          <PublicFooter />
        </div>
      );
    }

    // 4. Resolve Admin Route
    let content: React.ReactNode = null;

    if (path === '/admin' || path === '/admin/dashboard') {
      content = <AdminDashboard />;
    } else if (path === '/admin/students' || path.startsWith('/admin/students/')) {
      content = <AdminStudentsPage />;
    } else if (path === '/admin/recruiters' || path === '/admin/companies') {
      content = <AdminRecruitersPage />;
    } else if (path === '/admin/drives/new') {
      content = <AdminNewDrivePage />;
    } else if (path === '/admin/drives') {
      content = <AdminDrivesPage />;
    } else if (path === '/admin/applications') {
      content = <AdminApplicationsPage />;
    } else if (path === '/admin/placements') {
      content = <AdminPlacementsPage />;
    } else if (path === '/admin/analytics') {
      content = <AdminAnalyticsPage />;
    } else if (path === '/admin/audit-logs') {
      content = <AdminAuditLogsPage />;
    } else if (path === '/admin/settings') {
      content = <AdminSettingsPage />;
    } else {
      content = <NotFoundPage />;
    }

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AdminShell>
          <PageTransition routeKey={path}>{content}</PageTransition>
        </AdminShell>
      </div>
    );
  }

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  let publicContent: React.ReactNode = null;

  if (path === '/') {
    publicContent = <LandingPage />;
  } else if (path === '/about') {
    publicContent = <AboutPage />;
  } else if (path === '/login') {
    publicContent = <LoginPage />;
  } else if (path === '/register') {
    publicContent = <RegisterPage />;
  } else if (path === '/forgot-password') {
    publicContent = <ForgotPasswordPage />;
  } else if (isOpportunityDetail) {
    publicContent = <OpportunityDetailPage />;
  } else if (path === '/opportunities') {
    publicContent = <OpportunitiesPage />;
  } else {
    // 404 for any other unrecognized public URL
    publicContent = <NotFoundPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <PageTransition routeKey={path}>{publicContent}</PageTransition>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppRouter />
    </RouterProvider>
  );
}
