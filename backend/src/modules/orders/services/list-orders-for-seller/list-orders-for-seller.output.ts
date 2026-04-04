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

interface IListOrdersForSellerServiceOutput {
  orders: IOrderForSellerItem[];
  total_orders: number;
  skipped_orders: number;
  remaining_orders: number;
  hasNextPage: boolean;
}

export { IOrderProductForSellerOutput, IOrderForSellerItem, IListOrdersForSellerServiceOutput };
