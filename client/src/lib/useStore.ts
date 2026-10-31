import { useSyncExternalStore } from 'react';
import { campusStore } from './store';

export function useCampusStore() {
  const storeVersion = useSyncExternalStore(
    onStoreChange => campusStore.subscribe(onStoreChange),
    () => campusStore,
    () => campusStore
  );

  return {
    currentUser: storeVersion.getCurrentUser(),
    studentProfile: storeVersion.getStudentProfile(),
    jobs: storeVersion.getJobs(),
    applications: storeVersion.getApplications(),
    interviews: storeVersion.getInterviews(),
    drives: storeVersion.getDrives(),
    notifications: storeVersion.getNotifications(),
    auditLogs: storeVersion.getAuditLogs(),
    skillResources: storeVersion.getSkillResources(),
    actions: {
      setAuthSession: (user: Parameters<typeof storeVersion.setAuthSession>[0], token?: string) =>
        storeVersion.setAuthSession(user, token),
      clearAuthSession: () => storeVersion.clearAuthSession(),
      checkAuthSession: () => storeVersion.checkAuthSession(),
      login: (user: Parameters<typeof storeVersion.login>[0], token: string) =>
        storeVersion.login(user, token),
      logout: () => storeVersion.logout(),
      switchRole: (role: 'student' | 'recruiter' | 'admin') => storeVersion.switchRole(role),
      updateStudentProfile: (updates: Parameters<typeof storeVersion.updateStudentProfile>[0]) =>
        storeVersion.updateStudentProfile(updates),
      uploadResume: (name: string, size: string) => storeVersion.uploadResume(name, size),
      applyToJob: (jobId: string, matchScore: number) => storeVersion.applyToJob(jobId, matchScore),
      updateApplicationStatus: (
        appId: string,
        newStatus: Parameters<typeof storeVersion.updateApplicationStatus>[1],
        notes?: string,
        rejectionReason?: string
      ) => storeVersion.updateApplicationStatus(appId, newStatus, notes, rejectionReason),
      withdrawApplication: (appId: string) => storeVersion.withdrawApplication(appId),
      createJob: (job: Parameters<typeof storeVersion.createJob>[0]) => storeVersion.createJob(job),
      scheduleInterview: (data: Parameters<typeof storeVersion.scheduleInterview>[0]) =>
        storeVersion.scheduleInterview(data),
      rescheduleInterview: (id: string, date: string, start: string, end: string) =>
        storeVersion.rescheduleInterview(id, date, start, end),
      cancelInterview: (id: string, reason?: string) => storeVersion.cancelInterview(id, reason),
      createDrive: (data: Parameters<typeof storeVersion.createDrive>[0]) => storeVersion.createDrive(data),
      markNotificationAsRead: (id: string) => storeVersion.markNotificationAsRead(id),
      markAllNotificationsAsRead: () => storeVersion.markAllNotificationsAsRead(),
      toggleSaveSkillResource: (id: string) => storeVersion.toggleSaveSkillResource(id),
      toggleCompleteSkillResource: (id: string) => storeVersion.toggleCompleteSkillResource(id),
      resetToDefaults: () => storeVersion.resetToDefaults(),
    },
  };
}
