import { Router } from 'express';

import { query } from 'express-validator';
import { PresentationController } from '../controllers/presentation.controller';

const router = Router();
const presentationController = new PresentationController();

router.get(
  '/presentations',
  query('productId').isNumeric().notEmpty(),
  presentationController.allByProduct
);
router.post('/presentations', presentationController.createPresentations);

export default router;
