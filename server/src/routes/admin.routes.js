import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { getDrives, createDrive } from '../controllers/admin.drive.controller.js';

const router = Router();

// All admin routes require authentication and role: admin
router.use(authenticate, requireRole('admin'));

router.get('/drives', getDrives);
router.post('/drives', createDrive);

export default router;

