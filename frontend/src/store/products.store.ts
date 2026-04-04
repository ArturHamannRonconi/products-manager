import { create } from 'zustand';
import { IProductSellerOutput } from '@/types/product.types';

interface ProductsStore {
  currentProduct: IProductSellerOutput | null;
  setCurrentProduct: (product: IProductSellerOutput | null) => void;
}

const useProductsStore = create<ProductsStore>((set) => ({
  currentProduct: null,
  setCurrentProduct: (product) => set({ currentProduct: product }),
}));

export { useProductsStore };
