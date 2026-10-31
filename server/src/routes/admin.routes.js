import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import {
  getDrives,
  createDrive,
  getDriveById,
  updateDrive,
  patchDriveStatus,
} from '../controllers/admin.drive.controller.js';
import {
  getAdminApplications,
  getAdminPlacements,
} from '../controllers/admin.application.controller.js';
import {
  getAnalytics,
  getAuditLogs,
  getSettings,
  updateSettings,
  getCompanies,
  getRecruiterById,
  getStudentById,
} from '../controllers/admin.governance.controller.js';

const router = Router();

// All admin routes require authentication and role: admin
router.use(authenticate, requireRole('admin'));

// ── P0: Core Functionality ──────────────────────────────
router.get('/drives', getDrives);
router.post('/drives', createDrive);
router.get('/applications', getAdminApplications);
router.get('/placements', getAdminPlacements);

// ── P1: Advanced Functionality ──────────────────────────
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// ── P2: Additional Functionality ────────────────────────
router.get('/drives/:id', getDriveById);
router.put('/drives/:id', updateDrive);
router.patch('/drives/:id/status', patchDriveStatus);
router.get('/companies', getCompanies);
router.get('/recruiters/:id', getRecruiterById);
router.get('/students/:id', getStudentById);

export default router;
