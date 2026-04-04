'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { IProductCustomerOutput } from '@/types/product.types';

interface AddToCartModalProps {
  isOpen: boolean;
  product: IProductCustomerOutput;
  onConfirm: (ammount: number) => void;
  onClose: () => void;
}

function AddToCartModal({ isOpen, product, onConfirm, onClose }: AddToCartModalProps) {
  const [ammount, setAmmount] = useState(1);

  function handleConfirm() {
    onConfirm(ammount);
    setAmmount(1);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to order">
      <div className="space-y-5">
        <p className="text-sm text-gray-400">
          Adding <span className="font-medium text-white">{product.name}</span> to your order.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Quantity</label>
          <QuantitySelector value={ammount} min={1} onChange={setAmmount} />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/5">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-base font-bold text-indigo-400">${(product.price * ammount).toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            Cancel
          </button>
          <Button onClick={handleConfirm} className="flex-1 py-2.5">
            Add to order
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { AddToCartModal };
