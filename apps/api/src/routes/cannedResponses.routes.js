import { Router } from 'express';
import { cannedResponseSchema, cannedResponseUpdateSchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  listCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
} from '../controllers/cannedResponses.controller.js';

export const cannedResponsesRouter = Router();

cannedResponsesRouter.use(requireAdmin);
cannedResponsesRouter.get('/', listCannedResponses);
cannedResponsesRouter.post('/', validate(cannedResponseSchema), createCannedResponse);
cannedResponsesRouter.patch('/:id', validate(cannedResponseUpdateSchema), updateCannedResponse);
cannedResponsesRouter.delete('/:id', deleteCannedResponse);

export default cannedResponsesRouter;
