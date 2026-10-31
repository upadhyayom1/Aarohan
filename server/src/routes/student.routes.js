import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getStudentById,
} from '../controllers/student.controller.js';
import { getStudentResumeFile } from '../controllers/resume.controller.js';
import resumeRoutes from './resume.routes.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateStudentProfileSchema } from '../validators/student.validator.js';

const router = Router();

// Student profile routes
router.get('/me', authenticate, authorizeRole('student'), getMyProfile);
router.put('/me', authenticate, authorizeRole('student'), validate(updateStudentProfileSchema), updateMyProfile);

// Mount resume routes under /students/resume (POST /students/resume, GET /students/resume/file)
router.use('/resume', resumeRoutes);

// Candidate resume lookup: GET /students/:student_id/resume
router.get('/:student_id/resume', authenticate, authorizeRole('recruiter', 'admin'), getStudentResumeFile);

// Candidate profile lookup: GET /students/:student_id
router.get('/:student_id', authenticate, authorizeRole('recruiter', 'admin'), getStudentById);

export default router;
