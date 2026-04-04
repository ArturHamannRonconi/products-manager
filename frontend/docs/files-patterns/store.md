> _**Observation:**_
> _You will need to replace "any"/"Any" with the correct names when writing the files._

## auth.store.ts — Auth store (with sessionStorage persistence): `store/auth.store.ts`
```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserType = "seller" | "customer";

interface AuthStore {
  accessToken: string | null;
  userType: UserType | null;
  setAccessToken: (token: string) => void;
  setAuth: (token: string, userType: UserType) => void;
  clear: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      userType: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setAuth: (token, userType) => set({ accessToken: token, userType }),
      clear: () => set({ accessToken: null, userType: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useAuthStore };
```

## cart.store.ts — Customer cart store: `store/cart.store.ts`
```ts
import { create } from "zustand";

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  ammount: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (product_id: string, ammount: number) => void;
  removeItem: (product_id: string) => void;
  clear: () => void;
  totalPrice: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.product_id === item.product_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id
              ? { ...i, ammount: i.ammount + item.ammount }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  updateQuantity: (product_id, ammount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product_id === product_id ? { ...i, ammount } : i
      ),
    })),

  removeItem: (product_id) =>
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== product_id),
    })),

  clear: () => set({ items: [] }),

  totalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.ammount, 0),
}));

export { useCartStore };
```

## Generic resource store: `store/any.store.ts`
```ts
import { create } from "zustand";
import { IAnyType } from "@/types/any.types";

interface AnyStore {
  anys: IAnyType[];
  setAnys: (anys: IAnyType[]) => void;
  addAny: (any: IAnyType) => void;
  updateAny: (id: string, updated: Partial<IAnyType>) => void;
  removeAny: (id: string) => void;
}

const useAnyStore = create<AnyStore>((set) => ({
  anys: [],
  setAnys: (anys) => set({ anys }),
  addAny: (any) => set((state) => ({ anys: [...state.anys, any] })),
  updateAny: (id, updated) =>
    set((state) => ({
      anys: state.anys.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    })),
  removeAny: (id) =>
    set((state) => ({ anys: state.anys.filter((a) => a.id !== id) })),
}));

export { useAnyStore };
```
