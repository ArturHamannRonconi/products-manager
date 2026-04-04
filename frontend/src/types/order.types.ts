interface IOrderItemInput {
  product_id: string;
  ammount: number;
}

interface ICreateOrderInput {
  customer_id: string;
  products: IOrderItemInput[];
}

interface IOrderCreatedOutput {
  id: string;
  status: string;
  products: IOrderItemInput[];
}

interface IOrderProductOutput {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seller_name: string;
  category: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface IOrderOutput {
  id: string;
  status: OrderStatus;
  total_price: number;
  products: IOrderProductOutput[];
}

interface IOrderStatusUpdateResponse {
  id: string;
  status: string;
  total_price: number;
  products: IOrderProductOutput[];
}

interface IOrderListResponse {
  orders: IOrderOutput[];
  total_orders: number;
  skipped_orders: number;
  remaining_orders: number;
  hasNextPage: boolean;
}

interface IOrderProductForSellerOutput {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  ammount: number;
}

interface IOrderForSellerItem {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  customer_id: string;
  products: IOrderProductForSellerOutput[];
}

interface IListOrdersForSellerResponse {
  orders: IOrderForSellerItem[];
  total_orders: number;
  skipped_orders: number;
  remaining_orders: number;
  hasNextPage: boolean;
}

export type {
  OrderStatus,
  IOrderItemInput,
  ICreateOrderInput,
  IOrderCreatedOutput,
  IOrderProductOutput,
  IOrderOutput,
  IOrderStatusUpdateResponse,
  IOrderListResponse,
  IOrderProductForSellerOutput,
  IOrderForSellerItem,
  IListOrdersForSellerResponse,
};
