import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Card variants using class-variance-authority
const cardVariants = cva(
  "rounded-lg transition-all overflow-hidden",
  {
    variants: {
      variant: {
        // Style variants
        default: "bg-zinc-900 border border-zinc-800",
        bordered: "bg-transparent border",
        elevated: "bg-zinc-900 border border-zinc-800 shadow-md",
        flat: "bg-zinc-900",
      },
      color: {
        // Color variants
        default: "border-zinc-800",
        gold: "border-gold-500/50",
        danger: "border-danger-500/50",
        success: "border-success-500/50",
        warning: "border-warning-500/50",
        archive: "border-archive-500/50",
        gray: "border-gray-500/50",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      hover: {
        none: "",
        highlight: "hover:border-gold-500/70 hover:shadow-gold-sm",
        scale: "hover:scale-[1.01] hover:shadow-md",
        border: "hover:border-gold-500",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        half: "w-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "md",
      hover: "none",
      width: "full",
    },
  }
);

// Header variants
const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5 p-4",
  {
    variants: {
      color: {
        default: "",
        gold: "border-b border-gold-500/50 bg-gold-500/10",
        danger: "border-b border-danger-500/50 bg-danger-500/10",
        success: "border-b border-success-500/50 bg-success-500/10",
        warning: "border-b border-warning-500/50 bg-warning-500/10",
        archive: "border-b border-archive-500/50 bg-archive-500/10",
        gray: "border-b border-gray-500/50 bg-gray-500/10",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
);

// Footer variants
const cardFooterVariants = cva(
  "flex items-center p-4 pt-0",
  {
    variants: {
      color: {
        default: "",
        gold: "border-t border-gold-500/50 bg-gold-500/5",
        danger: "border-t border-danger-500/50 bg-danger-500/5",
        success: "border-t border-success-500/50 bg-success-500/5",
        warning: "border-t border-warning-500/50 bg-warning-500/5",
        archive: "border-t border-archive-500/50 bg-archive-500/5",
        gray: "border-t border-gray-500/50 bg-gray-500/5",
      },
      align: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
      }
    },
    defaultVariants: {
      color: "default",
      align: "between",
    },
  }
);

// Props interface for the Card component
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  footerAlign?: "left" | "center" | "right" | "between";
}

// Base Card component with ref forwarding
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      color,
      size,
      hover,
      width,
      children,
      title,
      subtitle,
      header,
      footer,
      headerClassName,
      footerClassName,
      contentClassName,
      footerAlign = "between",
      ...props
    },
    ref
  ) => {
    // Determine if we need to render a header
    const hasHeader = header || title || subtitle;
    
    // Determine if we need to render a footer
    const hasFooter = footer !== undefined;

    return (
      <div
        className={cn(cardVariants({ variant, color, size, hover, width }), className)}
        ref={ref}
        {...props}
      >
        {/* Card Header */}
        {hasHeader && (
          <div className={cn(cardHeaderVariants({ color }), headerClassName)}>
            {header || (
              <>
                {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
                {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
              </>
            )}
          </div>
        )}
        
        {/* Card Content */}
        <div className={cn("p-4", size === "sm" ? "p-2" : "", contentClassName)}>
          {children}
        </div>
        
        {/* Card Footer */}
        {hasFooter && (
          <div className={cn(cardFooterVariants({ color, align: footerAlign }), footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

// Create specialized card components
const UniversalCard = {
  // Base component for custom styling
  Base: Card,

  // Style variants
  Default: forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
    (props, ref) => <Card variant="default" ref={ref} {...props} />
  ),
  Bordered: forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
    (props, ref) => <Card variant="bordered" ref={ref} {...props} />
  ),
  Elevated: forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
    (props, ref) => <Card variant="elevated" ref={ref} {...props} />
  ),
  Flat: forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
    (props, ref) => <Card variant="flat" ref={ref} {...props} />
  ),

  // Color variants
  Gold: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="gold" ref={ref} {...props} />
  ),
  Danger: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="danger" ref={ref} {...props} />
  ),
  Success: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="success" ref={ref} {...props} />
  ),
  Warning: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="warning" ref={ref} {...props} />
  ),
  Archive: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="archive" ref={ref} {...props} />
  ),
  Gray: forwardRef<HTMLDivElement, Omit<CardProps, "color">>(
    (props, ref) => <Card color="gray" ref={ref} {...props} />
  ),

  // Interactive variants
  Hoverable: forwardRef<HTMLDivElement, Omit<CardProps, "hover">>(
    (props, ref) => <Card hover="highlight" ref={ref} {...props} />
  ),
  Scalable: forwardRef<HTMLDivElement, Omit<CardProps, "hover">>(
    (props, ref) => <Card hover="scale" ref={ref} {...props} />
  ),

  // Size variants
  Small: forwardRef<HTMLDivElement, Omit<CardProps, "size">>(
    (props, ref) => <Card size="sm" ref={ref} {...props} />
  ),
  Medium: forwardRef<HTMLDivElement, Omit<CardProps, "size">>(
    (props, ref) => <Card size="md" ref={ref} {...props} />
  ),
  Large: forwardRef<HTMLDivElement, Omit<CardProps, "size">>(
    (props, ref) => <Card size="lg" ref={ref} {...props} />
  ),
  ExtraLarge: forwardRef<HTMLDivElement, Omit<CardProps, "size">>(
    (props, ref) => <Card size="xl" ref={ref} {...props} />
  ),

  // Specialized cards
  PlayerCard: forwardRef<HTMLDivElement, Omit<CardProps, "variant" | "color">>(
    (props, ref) => <Card variant="elevated" color="gold" hover="highlight" ref={ref} {...props} />
  ),
  StatCard: forwardRef<HTMLDivElement, Omit<CardProps, "variant" | "size">>(
    (props, ref) => <Card variant="bordered" size="sm" ref={ref} {...props} />
  ),
  EmptyState: forwardRef<HTMLDivElement, Omit<CardProps, "variant" | "className">>(
    (props, ref) => (
      <Card 
        variant="bordered" 
        className="flex flex-col items-center justify-center text-center p-8" 
        ref={ref} 
        {...props} 
      />
    )
  ),
};

// Add display names for all components
Object.keys(UniversalCard).forEach((key) => {
  if (key !== "Base") {
    (UniversalCard as any)[key].displayName = `UniversalCard.${key}`;
  }
});

// Card subcomponents
const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { color?: "default" | "gold" | "danger" | "success" | "warning" | "archive" | "gray" }
>(({ className, color = "default", ...props }, ref) => (
  <div ref={ref} className={cn(cardHeaderVariants({ color }), className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { 
    color?: "default" | "gold" | "danger" | "success" | "warning" | "archive" | "gray",
    align?: "left" | "center" | "right" | "between"
  }
>(({ className, color = "default", align = "between", ...props }, ref) => (
  <div ref={ref} className={cn(cardFooterVariants({ color, align }), className)} {...props} />
));
CardFooter.displayName = "CardFooter";

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-zinc-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { 
  UniversalCard, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardFooterVariants
};
export default UniversalCard;
