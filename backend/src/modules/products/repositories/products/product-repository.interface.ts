import { IdValueObject } from 'ddd-tool-kit';
import { ProductAggregate } from '../../domain/product.aggregate-root';

interface IProductSellerView {
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

interface IProductCustomerView {
  id: string;
  name: string;
  image_url: string | null;
  description: string;
  price: number;
  category: string;
  seller_name: string;
  seller_id: string;
}

interface ProductRepository {
  findById(id: IdValueObject): Promise<ProductAggregate | null>;
  findIdsBySellerId(sellerId: string): Promise<string[]>;
  save(product: ProductAggregate): Promise<void>;
  delete(id: IdValueObject): Promise<void>;
  findForSellers(params: {
    sellerId: string;
    page: number;
    size: number;
    searchByText?: string;
    sortBy: string;
    order: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ products: IProductSellerView[]; total: number }>;
  findForCustomers(params: {
    page: number;
    size: number;
    searchByText?: string;
    sortBy: string;
    order: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ products: IProductCustomerView[]; total: number }>;
  countByCategoryId(categoryId: IdValueObject): Promise<number>;
}

export { ProductRepository, IProductSellerView, IProductCustomerView };
