interface IProductSellerOutput {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  seller_name: string;
  seller_id: string;
  category_name: string;
  category_id: string;
  inventory_ammount: number;
}

interface IProductCustomerOutput {
  id: string;
  name: string;
  image_url: string | null;
  description: string;
  price: number;
  category: string;
  seller_name: string;
  seller_id: string;
}

interface ICreateProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  inventory_ammount: number;
}

interface IProductCreatedOutput {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory_ammount: number;
}

interface IProductListResponse<T> {
  products: T[];
  total_products: number;
  skipped_products: number;
  remaining_products: number;
  hasNextPage: boolean;
}

interface IProductFormData extends ICreateProductInput {
  imageFile?: File;
}

export type {
  IProductSellerOutput,
  IProductCustomerOutput,
  ICreateProductInput,
  IProductCreatedOutput,
  IProductListResponse,
  IProductFormData,
};
