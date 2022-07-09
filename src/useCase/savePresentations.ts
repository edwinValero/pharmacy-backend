import { Presentation } from '../entity/Presentation';
import { Product } from '../entity/Product';

export const savePresentations = async (
  product: Product,
  updatedBy: string,
  presentations: Presentation[]
) => {
  const prePromises = presentations.map((pre) => {
    const presentation = new Presentation();
    presentation.name = pre.name;
    presentation.amount = pre.amount;
    presentation.price = pre.price;
    presentation.updatedBy = updatedBy;
    presentation.product = product;

    return presentation.save();
  });

  return await Promise.all(prePromises);
};
