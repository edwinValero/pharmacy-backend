import { Presentation } from '../entity/Presentation';

export interface presentationsBody {
  productId: number;
  updatedBy: string;
  presentations: Presentation[];
}
