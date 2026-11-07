import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RouterProvider, useRouter } from './lib/router';
import { useCampusStore } from './lib/useStore';
import { getAuthToken } from './lib/api';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';
import { Button } from './components/ui';

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

function PageTransition({ children, routeKey }: { children: React.ReactNode; routeKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppRouter() {
  const { path, navigate } = useRouter();
  const { currentUser, actions } = useCampusStore();
  const token = getAuthToken();

  // Scroll to top on every navigation
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [path]);

  // Restore authenticated session from backend token on mount
  React.useEffect(() => {
    actions.checkAuthSession();
  }, [actions]);

  // Sync live backend data when in student or recruiter portal
  React.useEffect(() => {
    if (token) {
      if (currentUser.role === 'student' || path.startsWith('/student')) {
        actions.loadStudentPortalData();
      } else if (currentUser.role === 'recruiter' || path.startsWith('/recruiter')) {
        actions.loadRecruiterPortalData();
      }
    }
  }, [currentUser.role, path, actions, token]);

  // Helper for dynamic subroutes
  const isOpportunityDetail = path.startsWith('/opportunities/') && path !== '/opportunities';
  const isStudentAppDetail = path.startsWith('/student/applications/') && path !== '/student/applications';
  const isRecruiterApplicants = path.startsWith('/recruiter/jobs/') && path.endsWith('/applicants');

  // ==========================================
  // STUDENT PORTAL ROUTES
  // ==========================================
  if (path.startsWith('/student')) {
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

    let content = <StudentDashboard />;

    if (path === '/student/profile') {
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

    let content = <RecruiterDashboard />;

    if (path === '/recruiter/jobs/new') {
      content = <RecruiterNewJobPage />;
    } else if (isRecruiterApplicants) {
      content = <RecruiterApplicantsPage />;
    } else if (path === '/recruiter/jobs') {
      content = <RecruiterJobsPage />;
    } else if (path === '/recruiter/interviews') {
      content = <RecruiterInterviewsPage />;
    } else if (path === '/recruiter/calendar') {
      content = <StudentCalendarPage />;
    } else if (path === '/recruiter/reports') {
      content = <RecruiterReportsPage />;
    } else if (path === '/recruiter/settings') {
      content = <RecruiterSettingsPage />;
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

    if (currentUser.role && currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <PublicHeader />
          <main className="flex-1 max-w-xl mx-auto py-24 px-4 text-center space-y-4">
            <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 rounded-[2px] mx-auto flex items-center justify-center font-mono font-bold text-lg text-neutral-800">
              !
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111]">Administration Privilege Required</h1>
            <p className="text-sm text-[#666666]">
              This administrative module is restricted to verified central placement directorate administrators.
            </p>
            <div className="pt-4">
              <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                Return to Institutional Portal
              </Button>
            </div>
          </main>
          <PublicFooter />
        </div>
      );
    }

    let content = <AdminDashboard />;

    if (path === '/admin/students') {
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
  let publicContent = <LandingPage />;

  if (path === '/about') {
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
