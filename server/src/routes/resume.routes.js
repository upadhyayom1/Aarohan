import { Router } from 'express';
import {
  uploadResume,
  getMyResumeFile,
  getStudentResumeFile,
} from '../controllers/resume.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { handleResumeUpload } from '../middlewares/upload.middleware.js';

const router = Router();

// Upload resume: POST /students/resume (or /resume)
router.post('/', authenticate, authorizeRole('student'), handleResumeUpload, uploadResume);

// Download current student's resume: GET /students/resume/file (or /resume/file)
router.get('/file', authenticate, authorizeRole('student'), getMyResumeFile);

// Recruiter download candidate resume by student ID: GET /students/:student_id/resume (or /resume/:student_id)
router.get('/:student_id', authenticate, authorizeRole('recruiter', 'admin'), getStudentResumeFile);

export default router;

