import { Router } from 'express';
import { verifyMetaSignature } from '../middleware/verifyMetaSignature.js';
import { verifyWebhook, receiveWebhook } from '../controllers/webhooks.controller.js';

export const webhooksRouter = Router();

webhooksRouter.get('/:channel', verifyWebhook);
webhooksRouter.post('/:channel', verifyMetaSignature, receiveWebhook);

export default webhooksRouter;
