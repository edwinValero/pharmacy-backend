import { Request, Response } from 'express';
import { BadRequest, HttpError } from 'http-errors';
import { Presentation } from '../entity/Presentation';
import { Product } from '../entity/Product';
import { presentationsBody } from '../interfaces/presentationsRequest';
import { savePresentations } from '../useCase/savePresentations';
import { get } from '../utils';

export class PresentationController {
  async allByProduct(req: Request, res: Response) {
    try {
      const presentations = Presentation.createQueryBuilder('presentation')
        .leftJoin('presentation.productId', 'product')
        .where('presentation.product =:productId', {
          productId: req.query.productId,
        })
        .getMany();
      return res.status(200).json(presentations);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }

  async createPresentations(
    req: Request<unknown, unknown, presentationsBody>,
    res: Response
  ) {
    try {
      const { productId, presentations, updatedBy } = req.body;

      const product = await Product.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new BadRequest('ProductId should exist');
      }

      const results = await savePresentations(
        product,
        updatedBy,
        presentations
      );
      return res.json(results);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }
}
