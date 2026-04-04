'use client';

import { useState, useRef } from 'react';
import { IProductSellerOutput, IProductFormData } from '@/types/product.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { resolveImageUrl } from '@/utils/resolve-image-url';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<IProductSellerOutput>;
  onSubmit: (data: IProductFormData) => void;
  isLoading: boolean;
}

function ProductForm({ mode, initialValues, onSubmit, isLoading }: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category_name ?? '');
  const [price, setPrice] = useState(initialValues?.price?.toString() ?? '');
  const [inventoryAmmount, setInventoryAmmount] = useState(initialValues?.inventory_ammount?.toString() ?? '');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(): string | null {
    if (!name.trim()) return 'Name is required.';
    if (!description.trim()) return 'Description is required.';
    if (!category.trim()) return 'Category is required.';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return 'Price must be greater than 0.';
    const inventoryNum = parseInt(inventoryAmmount, 10);
    if (isNaN(inventoryNum) || inventoryNum < 0) return 'Inventory amount must be a non-negative integer.';
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: parseFloat(price),
      inventory_ammount: parseInt(inventoryAmmount, 10),
      imageFile,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        disabled={isLoading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description"
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none transition-colors"
        />
      </div>

      <Input
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category name"
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          disabled={isLoading}
        />
        <Input
          label="Inventory Amount"
          type="number"
          value={inventoryAmmount}
          onChange={(e) => setInventoryAmmount(e.target.value)}
          placeholder="0"
          min="0"
          step="1"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Image <span className="text-gray-600">(optional)</span></label>
        {mode === 'edit' && initialValues?.image_url && (
          <div className="mb-2">
            <img
              src={resolveImageUrl(initialValues.image_url)}
              alt="Current product image"
              className="w-20 h-20 object-cover rounded-xl border border-white/10"
            />
          </div>
        )}
        <input
          id="product-image"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0])}
          disabled={isLoading}
          className="sr-only"
        />
        <label
          htmlFor="product-image"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-gray-300 cursor-pointer hover:bg-white/10 hover:text-white transition-all ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {imageFile ? imageFile.name : 'Choose image'}
        </label>
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
      </Button>
    </form>
  );
}

export { ProductForm };
