import { Router } from 'express';
import {
  listJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
} from '../controllers/job.controller.js';
import { getJobApplicants } from '../controllers/application.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createJobSchema, updateJobStatusSchema } from '../validators/job.validator.js';

const router = Router();

router.get('/', authenticate, listJobs);
router.get('/:job_id/applicants', authenticate, authorizeRole('recruiter', 'admin'), getJobApplicants);
router.get('/:job_id', authenticate, getJobById);
router.post('/', authenticate, authorizeRole('recruiter', 'admin'), validate(createJobSchema), createJob);
router.put('/:job_id', authenticate, authorizeRole('recruiter', 'admin'), validate(createJobSchema), updateJob);
router.patch('/:job_id/status', authenticate, authorizeRole('recruiter', 'admin'), validate(updateJobStatusSchema), updateJobStatus);

export default router;
