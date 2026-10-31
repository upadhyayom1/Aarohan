import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/application.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  applyJobSchema,
  updateApplicationStatusSchema,
} from '../validators/application.validator.js';

const router = Router();

// Student apply for a job: POST /applications
router.post('/', authenticate, authorizeRole('student'), validate(applyJobSchema), applyForJob);

// Student get own applications: GET /applications/my
router.get('/my', authenticate, authorizeRole('student'), getMyApplications);

// Recruiter get single application detail: GET /applications/:application_id
router.get('/:application_id', authenticate, authorizeRole('recruiter', 'admin'), getApplicationById);

// Recruiter update application status: PATCH /applications/:application_id/status
router.patch(
  '/:application_id/status',
  authenticate,
  authorizeRole('recruiter', 'admin'),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

// Recruiter get applicants for a job via applications router: GET /applications/job/:job_id
router.get('/job/:job_id', authenticate, authorizeRole('recruiter', 'admin'), getJobApplicants);

export default router;

