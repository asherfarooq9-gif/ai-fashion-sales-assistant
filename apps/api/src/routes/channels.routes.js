import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireInternal } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMessage } from '../services/channels/index.js';

const sendSchema = z.object({
  to: z.string().min(1),
  text: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const channelsRouter = Router();

channelsRouter.post(
  '/:channel/send',
  requireInternal,
  validate(sendSchema),
  asyncHandler(async (req, res) => {
    const result = await sendMessage(req.params.channel, req.body.to, {
      text: req.body.text,
      images: req.body.images,
    });
    res.json({ data: result });
  })
);

export default channelsRouter;
