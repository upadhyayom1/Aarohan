import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, updateMeSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validate(updateMeSchema), updateMe);

export default router;

