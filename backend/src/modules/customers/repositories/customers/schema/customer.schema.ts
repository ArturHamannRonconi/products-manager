import { Schema } from 'mongoose';

interface IRefreshTokenSchema {
  id: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface ICustomerSchema {
  id: string;
  name: string;
  email: string;
  password: string;
  refresh_tokens: IRefreshTokenSchema[];
  created_at: Date;
  updated_at: Date;
}

const RefreshTokenSchema = new Schema<IRefreshTokenSchema>(
  {
    id: { type: String, required: true },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  { _id: false },
);

const CustomerSchema = new Schema<ICustomerSchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  refresh_tokens: { type: [RefreshTokenSchema], required: true, default: [] },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

CustomerSchema.index({ id: 1 }, { unique: true });
CustomerSchema.index({ email: 1 }, { unique: true });

export { CustomerSchema, ICustomerSchema, RefreshTokenSchema, IRefreshTokenSchema };
