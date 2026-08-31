import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { exportEntity } from '../controllers/export.controller.js';

export const exportRouter = Router();

exportRouter.use(requireAdmin);
exportRouter.get('/:entity/:format', exportEntity);

export default exportRouter;
