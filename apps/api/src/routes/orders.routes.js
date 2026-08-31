import { Router } from 'express';
import { orderCreateSchema, orderUpdateSchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireInternal } from '../middleware/auth.js';
import {
  listOrders,
  getOrder,
  createOrderHandler,
  updateOrder,
} from '../controllers/orders.controller.js';

export const ordersRouter = Router();

ordersRouter.get('/', requireAdmin, listOrders);
ordersRouter.get('/:id', requireAdmin, getOrder);
ordersRouter.post('/', requireInternal, validate(orderCreateSchema), createOrderHandler);
ordersRouter.patch('/:id', requireAdmin, validate(orderUpdateSchema), updateOrder);

export default ordersRouter;
