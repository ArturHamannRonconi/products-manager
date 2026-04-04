'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { Toast } from '@/components/ui/Toast';
import { productsService } from '@/services/products.service';
import { IProductFormData } from '@/types/product.types';

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleSubmit(formData: IProductFormData) {
    setIsLoading(true);
    try {
      const result = await productsService.create([
        {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          inventory_ammount: formData.inventory_ammount,
        },
      ]);

      if (formData.imageFile && result.products[0]) {
        await productsService.uploadImage(result.products[0].id, formData.imageFile);
      }

      router.push('/seller/products');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setToastMessage('Invalid session. Please log in again.');
      } else {
        setToastMessage('Failed to create product.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SellerLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Create Product</h1>
        <ProductForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </SellerLayout>
  );
}
