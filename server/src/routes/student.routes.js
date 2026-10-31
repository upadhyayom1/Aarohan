import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getStudentById,
} from '../controllers/student.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateStudentProfileSchema } from '../validators/student.validator.js';

const router = Router();

// Student-specific profile routes
router.get('/me', authenticate, authorizeRole('student'), getMyProfile);
router.put('/me', authenticate, authorizeRole('student'), validate(updateStudentProfileSchema), updateMyProfile);

// Recruiter / Admin lookup by student id
router.get('/:student_id', authenticate, authorizeRole('recruiter', 'admin'), getStudentById);

export default router;

