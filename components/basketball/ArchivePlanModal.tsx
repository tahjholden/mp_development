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
  return (
    <UniversalModal.Confirm
      open={isOpen}
      onOpenChange={onClose}
      onConfirm={onConfirm}
      onCancel={onClose}
      title={title}
      description={message}
      confirmText="Confirm & Continue"
      cancelText="Cancel"
      variant="warning"
    />
  );
};

export default ArchivePlanModal;
