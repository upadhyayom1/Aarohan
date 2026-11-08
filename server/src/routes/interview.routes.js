import { Router } from 'express';
import {
  scheduleInterview,
  listMyInterviews,
  rescheduleInterview,
  cancelInterview,
} from '../controllers/interview.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
} from '../validators/interview.validator.js';

const router = Router();

// Schedule interview: POST /interviews (recruiter only)
router.post(
  '/',
  authenticate,
  authorizeRole('recruiter', 'admin'),
  validate(scheduleInterviewSchema),
  scheduleInterview
);

// List interviews: GET /interviews/my (student or recruiter or admin)
router.get('/my', authenticate, listMyInterviews);

// Reschedule interview: PATCH /interviews/:interview_id (recruiter owner or admin)
router.patch(
  '/:interview_id',
  authenticate,
  authorizeRole('recruiter', 'admin'),
  validate(rescheduleInterviewSchema),
  rescheduleInterview
);

// Cancel interview: DELETE /interviews/:interview_id (recruiter owner or admin)
router.delete(
  '/:interview_id',
  authenticate,
  authorizeRole('recruiter', 'admin'),
  cancelInterview
);

export default router;

