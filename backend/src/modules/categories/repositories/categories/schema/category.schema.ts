import { Schema } from 'mongoose';

interface ICategorySchema {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

const CategorySchema = new Schema<ICategorySchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

CategorySchema.index({ id: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });

export { CategorySchema, ICategorySchema };
