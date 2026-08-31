import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  listConversations,
  getConversation,
} from '../controllers/conversations.controller.js';

export const conversationsRouter = Router();

conversationsRouter.use(requireAdmin);
conversationsRouter.get('/', listConversations);
conversationsRouter.get('/:id', getConversation);

export default conversationsRouter;
