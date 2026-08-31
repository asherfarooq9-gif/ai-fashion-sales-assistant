import { Router } from 'express';
import { chatMessageSchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireInternal } from '../middleware/auth.js';
import { ingest, stream } from '../controllers/chat.controller.js';

export const chatRouter = Router();

chatRouter.post('/ingest', requireInternal, validate(chatMessageSchema), ingest);
chatRouter.get('/stream', stream);

export default chatRouter;
