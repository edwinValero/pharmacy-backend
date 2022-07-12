import { Router } from 'express';

import { param, query } from 'express-validator';
import { PresentationController } from '../controllers/presentation.controller';

const router = Router();
const presentationController = new PresentationController();

router.get(
  '/presentations',
  query('limit').isNumeric().default(10),
  query('page').isNumeric().default(1),
  presentationController.allByProduct,
  presentationController.all
);
router.post('/presentations', presentationController.createPresentations);
router.delete(
  '/presentations/:id',
  param('id').isNumeric().notEmpty(),
  presentationController.deletePresentation
);

export default router;
