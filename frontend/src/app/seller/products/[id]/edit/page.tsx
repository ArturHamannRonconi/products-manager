'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { Toast } from '@/components/ui/Toast';
import { useProductsStore } from '@/store/products.store';
import { productsService } from '@/services/products.service';
import { IProductFormData } from '@/types/product.types';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { currentProduct } = useProductsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProduct) {
      router.replace('/seller/products');
    }
  }, [currentProduct, router]);

  if (!currentProduct) return null;

  async function handleSubmit(formData: IProductFormData) {
    setIsLoading(true);
    try {
      await productsService.update(id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        inventory_ammount: formData.inventory_ammount,
      });

      if (formData.imageFile) {
        await productsService.uploadImage(id, formData.imageFile);
      }

      router.push('/seller/products');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setToastMessage('Invalid session. Please log in again.');
      } else {
        setToastMessage('Failed to update product.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SellerLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Product</h1>
        <ProductForm
          mode="edit"
          initialValues={currentProduct}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </SellerLayout>
  );
}
