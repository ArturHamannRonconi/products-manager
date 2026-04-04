import { Schema } from 'mongoose';

interface IOrderItemSchema {
  id: string;
  product_id: string;
  ammount: number;
  created_at: Date;
  updated_at: Date;
}

interface IOrderSchema {
  id: string;
  status: string;
  customer_id: string;
  products: IOrderItemSchema[];
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItemSchema>({
  id: { type: String, required: true },
  product_id: { type: String, required: true },
  ammount: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

const OrderSchema = new Schema<IOrderSchema>({
  id: { type: String, required: true },
  status: { type: String, required: true },
  customer_id: { type: String, required: true },
  products: { type: [OrderItemSchema], required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

OrderSchema.index({ id: 1 }, { unique: true });
OrderSchema.index({ customer_id: 1 });

export { OrderSchema, IOrderSchema, IOrderItemSchema };
