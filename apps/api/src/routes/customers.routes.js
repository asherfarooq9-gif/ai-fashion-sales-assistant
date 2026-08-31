import { Router } from 'express';
import { customerUpdateSchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  listCustomers,
  getCustomer,
  updateCustomer,
} from '../controllers/customers.controller.js';

export const customersRouter = Router();

customersRouter.use(requireAdmin);
customersRouter.get('/', listCustomers);
customersRouter.get('/:id', getCustomer);
customersRouter.patch('/:id', validate(customerUpdateSchema), updateCustomer);

export default customersRouter;
