import { Schema } from 'mongoose';

interface IProductSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seller_id: string;
  category_id: string;
  inventory_ammount: number;
  created_at: Date;
  updated_at: Date;
}

const ProductSchema = new Schema<IProductSchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image_url: { type: String, default: null },
  seller_id: { type: String, required: true },
  category_id: { type: String, required: true },
  inventory_ammount: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

ProductSchema.index({ id: 1 }, { unique: true });
ProductSchema.index({ seller_id: 1 });
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export { ProductSchema, IProductSchema };
