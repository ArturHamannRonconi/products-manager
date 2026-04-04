import { create } from 'zustand';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  ammount: number;
  seller_id: string;
  seller_name: string;
}

type AddItemResult = { success: true } | { success: false; reason: 'different_seller' };

interface CartStore {
  items: CartItem[];
  cartSellerId: string | null;
  cartSellerName: string | null;
  addItem: (item: CartItem) => AddItemResult;
  updateQuantity: (product_id: string, ammount: number) => void;
  removeItem: (product_id: string) => void;
  clear: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  cartSellerId: null,
  cartSellerName: null,

  addItem: (item: CartItem): AddItemResult => {
    const { items, cartSellerId } = get();

    if (items.length > 0 && item.seller_id !== cartSellerId) {
      return { success: false, reason: 'different_seller' };
    }

    set((state) => {
      const existing = state.items.find((i) => i.product_id === item.product_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id
              ? { ...i, ammount: i.ammount + item.ammount }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, item],
        cartSellerId: item.seller_id,
        cartSellerName: item.seller_name,
      };
    });

    return { success: true };
  },

  updateQuantity: (product_id: string, ammount: number) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.product_id === product_id ? { ...i, ammount } : i,
      ),
    }));
  },

  removeItem: (product_id: string) => {
    set((state) => {
      const remaining = state.items.filter((i) => i.product_id !== product_id);
      return {
        items: remaining,
        cartSellerId: remaining.length === 0 ? null : state.cartSellerId,
        cartSellerName: remaining.length === 0 ? null : state.cartSellerName,
      };
    });
  },

  clear: () => set({ items: [], cartSellerId: null, cartSellerName: null }),

  totalPrice: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.ammount, 0);
  },
}));
