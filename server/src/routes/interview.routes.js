import { Router } from 'express';
import {
  scheduleInterview,
  listMyInterviews,
} from '../controllers/interview.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { scheduleInterviewSchema } from '../validators/interview.validator.js';

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

export default router;

