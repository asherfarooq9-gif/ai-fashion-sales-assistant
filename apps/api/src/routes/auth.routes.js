import { Router } from 'express';
import { loginSchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { login, me } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', requireAdmin, me);

export default authRouter;
