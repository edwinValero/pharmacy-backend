import { NextFunction, Request, Response } from 'express';
import { BadRequest, HttpError } from 'http-errors';
import { Presentation } from '../entity/Presentation';
import { Product } from '../entity/Product';
import { presentationsBody } from '../interfaces/presentationsRequest';
import { savePresentations } from '../useCase/savePresentations';
import { get, getNumberFromQuery } from '../utils';

export class PresentationController {
  async all(req: Request, res: Response) {
    try {
      const limit = getNumberFromQuery(req.query, 'limit');
      const page = getNumberFromQuery(req.query, 'page');
      const skip = (page - 1) * limit;

      const [products, productsCount] = await Promise.all([
        Presentation.createQueryBuilder('presentation')
          .orderBy('presentation.id')
          .skip(skip)
          .take(limit)
          .getMany(),
        Presentation.count(),
      ]);
      return res.status(200).json({
        items: products,
        meta: {
          totalItems: productsCount,
          itemCount: products.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(productsCount / limit),
          currentPage: page,
        },
      });
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }
  async allByProduct(req: Request, res: Response, next: NextFunction) {
    const productId = get(req.query, 'productId');
    if (!productId) {
      return next();
    }
    try {
      const presentations = Presentation.createQueryBuilder('presentation')
        .leftJoin('presentation.productId', 'product')
        .where('presentation.product =:productId', {
          productId,
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

  async deletePresentation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await Presentation.delete({ id: parseInt(id) });

      if (result.affected === 0)
        return res.status(404).json({ message: 'Presentation not found' });

      return res.sendStatus(204);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }
}
