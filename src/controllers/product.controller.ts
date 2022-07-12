import { Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { Product } from '../entity/Product';
import { savePresentations } from '../useCase/savePresentations';
import { get, getNumberFromQuery } from '../utils';

export class ProductController {
  constructor() {}
  async all(req: Request, res: Response) {
    try {
      const limit = getNumberFromQuery(req.query, 'limit');
      const page = getNumberFromQuery(req.query, 'page');
      const skip = (page - 1) * limit;

      const [products, productsCount] = await Promise.all([
        Product.createQueryBuilder('product')
          .leftJoinAndSelect('product.presentations', 'presentations')
          .orderBy('product.id')
          .skip(skip)
          .take(limit)
          .getMany(),
        Product.count(),
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

  async createProduct(req: Request<unknown, unknown, Product>, res: Response) {
    try {
      const { name, barCode, tax, updatedBy, presentations } = req.body;
      const product = new Product();
      product.name = name;
      product.barCode = barCode;
      product.tax = tax;
      product.updatedBy = updatedBy;
      await product.save();
      if (presentations.length > 0) {
        await savePresentations(product, updatedBy, presentations);
      }
      return res.json(product);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await Product.delete({ id: parseInt(id) });

      if (result.affected === 0)
        return res.status(404).json({ message: 'Product not found' });

      return res.sendStatus(204);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json({ error: get(e, 'message') });
      }
      return res.status(500).json({ error: get(e, 'message') });
    }
  }
}
