'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDeleteModal({ isOpen, onConfirm, onClose }: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="space-y-5">
        <p className="text-sm text-gray-400 leading-relaxed">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            Cancel
          </button>
          <Button
            onClick={onConfirm}
            variant="danger"
            className="flex-1 py-2.5"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { ConfirmDeleteModal };
