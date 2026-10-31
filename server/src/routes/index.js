import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import resumeRoutes from './resume.routes.js';
import jobRoutes from './job.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/resume', resumeRoutes);
router.use('/jobs', jobRoutes);

export default router;
