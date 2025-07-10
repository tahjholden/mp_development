import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Button variants using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Solid variants
        primary: "bg-gold-500 text-black hover:bg-gold-600 focus-visible:ring-gold-500/50",
        danger: "bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500/50",
        success: "bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500/50",
        warning: "bg-warning-500 text-black hover:bg-warning-600 focus-visible:ring-warning-500/50",
        archive: "bg-archive-500 text-white hover:bg-archive-600 focus-visible:ring-archive-500/50",
        gray: "bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-500/50",
        
        // Outline variants
        primaryOutline: "border border-gold-500 text-gold-500 bg-transparent hover:bg-gold-500/10 focus-visible:ring-gold-500/50",
        dangerOutline: "border border-danger-500 text-danger-500 bg-transparent hover:bg-danger-500/10 focus-visible:ring-danger-500/50",
        successOutline: "border border-success-500 text-success-500 bg-transparent hover:bg-success-500/10 focus-visible:ring-success-500/50",
        warningOutline: "border border-warning-500 text-warning-500 bg-transparent hover:bg-warning-500/10 focus-visible:ring-warning-500/50",
        archiveOutline: "border border-archive-500 text-archive-500 bg-transparent hover:bg-archive-500/10 focus-visible:ring-archive-500/50",
        grayOutline: "border border-gray-500 text-gray-500 bg-transparent hover:bg-gray-500/10 focus-visible:ring-gray-500/50",
        
        // Ghost and text variants
        ghost: "bg-transparent text-gray-500 hover:bg-gray-500/10 hover:text-gray-700 focus-visible:ring-gray-500/50",
        text: "bg-transparent text-gold-500 hover:underline focus-visible:ring-gold-500/50 p-0",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Props interface extending button HTML attributes and variants
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// Base Button component with ref forwarding
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth ? "w-full" : "",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="mr-1">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && <span className="ml-1">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

// Create specialized button components
const UniversalButton = {
  // Base component for custom styling
  Base: Button,

  // Solid variants
  Primary: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="primary" ref={ref} {...props} />
  ),
  Danger: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="danger" ref={ref} {...props} />
  ),
  Success: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="success" ref={ref} {...props} />
  ),
  Warning: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="warning" ref={ref} {...props} />
  ),
  Archive: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="archive" ref={ref} {...props} />
  ),
  Gray: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="gray" ref={ref} {...props} />
  ),

  // Outline variants
  Secondary: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="primaryOutline" ref={ref} {...props} />
  ),
  DangerOutline: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="dangerOutline" ref={ref} {...props} />
  ),
  SuccessOutline: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="successOutline" ref={ref} {...props} />
  ),
  WarningOutline: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="warningOutline" ref={ref} {...props} />
  ),
  ArchiveOutline: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="archiveOutline" ref={ref} {...props} />
  ),
  GrayOutline: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="grayOutline" ref={ref} {...props} />
  ),

  // Ghost and text variants
  Ghost: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="ghost" ref={ref} {...props} />
  ),
  Text: forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
    (props, ref) => <Button variant="text" ref={ref} {...props} />
  ),
};

// Add display names for all components
Object.keys(UniversalButton).forEach((key) => {
  if (key !== "Base") {
    (UniversalButton as any)[key].displayName = `UniversalButton.${key}`;
  }
});

export { UniversalButton, buttonVariants };
export default UniversalButton;
