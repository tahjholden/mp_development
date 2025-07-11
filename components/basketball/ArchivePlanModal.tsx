'use client';

import React from 'react';
import UniversalModal from '@/components/ui/UniversalModal';
import UniversalButton from '@/components/ui/UniversalButton';

interface ArchivePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ArchivePlanModal: React.FC<ArchivePlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Archive Current Plan',
  message = 'This will close the current development plan and archive all of its associated observations.',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-zinc-900 border border-zinc-800 p-0 w-full max-w-md"
    >
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      
      <div className="p-6">
        <p className="text-zinc-300 mb-8">{message}</p>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <UniversalButton.Secondary
            onClick={onClose}
            className="sm:order-1"
          >
            Cancel
          </UniversalButton.Secondary>
          
          <UniversalButton.Primary
            onClick={handleConfirm}
            className="sm:order-2"
          >
            Confirm & Continue
          </UniversalButton.Primary>
        </div>
      </div>
    </UniversalModal>
  );
};

export default ArchivePlanModal;
