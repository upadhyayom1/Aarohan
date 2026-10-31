
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);

export default router;
