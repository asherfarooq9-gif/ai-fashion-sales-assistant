import { Router } from 'express';
import { productSchema, productUpdateSchema, productQuerySchema } from '@afsa/shared/schemas';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', validate(productQuerySchema, 'query'), listProducts);
productsRouter.get('/:id', getProduct);
productsRouter.post('/', requireAdmin, validate(productSchema), createProduct);
productsRouter.patch('/:id', requireAdmin, validate(productUpdateSchema), updateProduct);
productsRouter.delete('/:id', requireAdmin, deleteProduct);

export default productsRouter;
