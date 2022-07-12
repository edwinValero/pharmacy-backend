import { Router } from 'express';

import { query, param } from 'express-validator';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

router.get(
  '/products',
  query('limit').isNumeric().default(10),
  query('page').isNumeric().default(1),
  productController.all
);

router.post('/products', productController.createProduct);
router.delete(
  '/products/:id',
  param('id').isNumeric().notEmpty(),
  productController.deleteProduct
);

export default router;
