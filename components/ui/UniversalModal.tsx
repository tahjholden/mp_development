import React, { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { UniversalButton } from "./UniversalButton";

// Modal variants using class-variance-authority
const modalVariants = cva(
  "fixed z-50 gap-4 bg-zinc-900 p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] sm:rounded-lg",
  {
    variants: {
      variant: {
        default: "border-2 border-gold-500/50",
        danger: "border-2 border-danger-500/50",
        success: "border-2 border-success-500/50",
        warning: "border-2 border-warning-500/50",
        archive: "border-2 border-archive-500/50",
        gray: "border-2 border-gray-500/50",
      },
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Header variants
const modalHeaderVariants = cva(
  "flex flex-col space-y-1.5 text-left",
  {
    variants: {
      variant: {
        default: "border-b border-gold-500/30 pb-4 mb-4",
        danger: "border-b border-danger-500/30 pb-4 mb-4",
        success: "border-b border-success-500/30 pb-4 mb-4",
        warning: "border-b border-warning-500/30 pb-4 mb-4",
        archive: "border-b border-archive-500/30 pb-4 mb-4",
        gray: "border-b border-gray-500/30 pb-4 mb-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Title variants
const modalTitleVariants = cva(
  "text-lg font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "text-gold-500",
        danger: "text-danger-500",
        success: "text-success-500",
        warning: "text-warning-500",
        archive: "text-archive-500",
        gray: "text-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Footer variants
const modalFooterVariants = cva(
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 pt-4",
  {
    variants: {
      variant: {
        default: "border-t border-gold-500/30",
        danger: "border-t border-danger-500/30",
        success: "border-t border-success-500/30",
        warning: "border-t border-warning-500/30",
        archive: "border-t border-archive-500/30",
        gray: "border-t border-gray-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Base modal props
interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: "default" | "danger" | "success" | "warning" | "archive" | "gray";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showCloseButton?: boolean;
}

// Confirmation modal props
interface ConfirmationModalProps extends BaseModalProps {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

// Form modal props
interface FormModalProps extends BaseModalProps {
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
}

// Basic modal component
const GoldModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "default",
  size = "md",
  className,
  showCloseButton = true,
}: BaseModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(modalVariants({ variant, size }), className)}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className={modalHeaderVariants({ variant })}>
          <DialogTitle className={modalTitleVariants({ variant })}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-zinc-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {showCloseButton && (
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-zinc-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-800"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Confirmation modal component
const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  children,
  ...props
}: ConfirmationModalProps & { children?: ReactNode }) => {
  // Map variant to button variant
  const buttonVariantMap = {
    default: "primary",
    danger: "danger",
    success: "success",
    warning: "warning",
    archive: "archive",
    gray: "gray",
  } as const;

  const buttonVariant = buttonVariantMap[variant] || "primary";

  return (
    <GoldModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      showCloseButton={false}
      {...props}
    >
      {children}
      <DialogFooter className={modalFooterVariants({ variant })}>
        {onCancel && (
          <UniversalButton.Ghost
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            size="sm"
          >
            {cancelText}
          </UniversalButton.Ghost>
        )}
        <UniversalButton.Base
          variant={buttonVariant}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          loading={loading}
          size="sm"
        >
          {confirmText}
        </UniversalButton.Base>
      </DialogFooter>
    </GoldModal>
  );
};

// Form modal component
const FormModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  disabled = false,
  ...props
}: FormModalProps) => {
  // Map variant to button variant
  const buttonVariantMap = {
    default: "primary",
    danger: "danger",
    success: "success",
    warning: "warning",
    archive: "archive",
    gray: "gray",
  } as const;

  const buttonVariant = buttonVariantMap[variant] || "primary";

  return (
    <GoldModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      showCloseButton={false}
      {...props}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
          onOpenChange(false);
        }}
      >
        {children}
        <DialogFooter className={modalFooterVariants({ variant })}>
          {onCancel && (
            <UniversalButton.Ghost
              type="button"
              onClick={() => {
                onCancel();
                onOpenChange(false);
              }}
              size="sm"
            >
              {cancelText}
            </UniversalButton.Ghost>
          )}
          <UniversalButton.Base
            type="submit"
            variant={buttonVariant}
            loading={loading}
            disabled={disabled}
            size="sm"
          >
            {submitText}
          </UniversalButton.Base>
        </DialogFooter>
      </form>
    </GoldModal>
  );
};

// Unified modal component
export const UniversalModal = {
  // Basic modal for content display
  Basic: GoldModal,

  // Confirmation modal for user confirmations
  Confirm: ConfirmationModal,

  // Form modal for data entry
  Form: FormModal,

  // Unified API for all modal types
  Dialog: ({
    type = "basic",
    variant = "default",
    ...props
  }: BaseModalProps & {
    type?: "basic" | "confirmation" | "form";
  } & Partial<ConfirmationModalProps> &
    Partial<FormModalProps>) => {
    switch (type) {
      case "confirmation":
        return (
          <ConfirmationModal
            variant={variant}
            {...(props as ConfirmationModalProps)}
          />
        );
      case "form":
        return (
          <FormModal
            variant={variant}
            {...(props as FormModalProps)}
          />
        );
      default:
        return (
          <GoldModal
            variant={variant}
            {...(props as BaseModalProps)}
          />
        );
    }
  },
};

// Convenience components for common use cases
export const Modal = {
  // Delete confirmation modal
  Delete: ({
    open,
    onOpenChange,
    title = "Confirm Deletion",
    description,
    onConfirm,
    onCancel,
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    children,
    ...props
  }: Omit<ConfirmationModalProps, 'variant'> & { children?: ReactNode }) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "Are you sure you want to delete this item? This action cannot be undone."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="danger"
        loading={loading}
        {...props}
      >
        {children}
      </UniversalModal.Confirm>
    );
  },

  // Archive confirmation modal
  Archive: ({
    open,
    onOpenChange,
    title = "Archive Item",
    description,
    onConfirm,
    onCancel,
    confirmText = "Archive",
    cancelText = "Cancel",
    loading = false,
    children,
    ...props
  }: Omit<ConfirmationModalProps, 'variant'> & { children?: ReactNode }) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "Are you sure you want to archive this item? You can restore it later."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="archive"
        loading={loading}
        {...props}
      >
        {children}
      </UniversalModal.Confirm>
    );
  },

  // Success confirmation modal
  Success: ({
    open,
    onOpenChange,
    title = "Success",
    description,
    onConfirm,
    onCancel,
    confirmText = "Continue",
    cancelText = "Close",
    loading = false,
    children,
    ...props
  }: Omit<ConfirmationModalProps, 'variant'> & { children?: ReactNode }) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "The operation completed successfully."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="success"
        loading={loading}
        {...props}
      >
        {children}
      </UniversalModal.Confirm>
    );
  },

  // Warning confirmation modal
  Warning: ({
    open,
    onOpenChange,
    title = "Warning",
    description,
    onConfirm,
    onCancel,
    confirmText = "Proceed",
    cancelText = "Cancel",
    loading = false,
    children,
    ...props
  }: Omit<ConfirmationModalProps, 'variant'> & { children?: ReactNode }) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "This action may have unintended consequences. Are you sure you want to proceed?"}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="warning"
        loading={loading}
        {...props}
      >
        {children}
      </UniversalModal.Confirm>
    );
  },

  // Add form modal
  Add: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitText = "Add",
    cancelText = "Cancel",
    loading = false,
    disabled = false,
    ...props
  }: Omit<FormModalProps, 'variant'>) => {
    return (
      <UniversalModal.Form
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={submitText}
        cancelText={cancelText}
        variant="default"
        loading={loading}
        disabled={disabled}
        {...props}
      >
        {children}
      </UniversalModal.Form>
    );
  },

  // Edit form modal
  Edit: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitText = "Save Changes",
    cancelText = "Cancel",
    loading = false,
    disabled = false,
    ...props
  }: Omit<FormModalProps, 'variant'>) => {
    return (
      <UniversalModal.Form
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={submitText}
        cancelText={cancelText}
        variant="default"
        loading={loading}
        disabled={disabled}
        {...props}
      >
        {children}
      </UniversalModal.Form>
    );
  },

  // Info modal
  Info: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    variant = "default",
    size = "md",
    ...props
  }: BaseModalProps) => {
    return (
      <UniversalModal.Basic
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </UniversalModal.Basic>
    );
  },
};

// Export the main components
export default UniversalModal;
