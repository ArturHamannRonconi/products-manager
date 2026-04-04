import { Schema } from 'mongoose';

interface IRefreshTokenSchema {
  id: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface ISellerSchema {
  id: string;
  name: string;
  email: string;
  password: string;
  organization_name: string;
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

const SellerSchema = new Schema<ISellerSchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  organization_name: { type: String, required: true },
  refresh_tokens: { type: [RefreshTokenSchema], required: true, default: [] },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

SellerSchema.index({ id: 1 }, { unique: true });
SellerSchema.index({ email: 1 }, { unique: true });

export { SellerSchema, ISellerSchema, RefreshTokenSchema, IRefreshTokenSchema };
