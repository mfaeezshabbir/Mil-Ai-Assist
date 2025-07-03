import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30 shadow-tactical",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/30",
        outline:
          "border border-primary/30 bg-background hover:bg-accent hover:text-accent-foreground shadow-tactical-inset",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-primary/20",
        ghost:
          "hover:bg-accent hover:text-accent-foreground border border-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        tactical:
          "bg-muted text-primary uppercase tracking-wide font-mono border border-primary/40 shadow-tactical",
        action:
          "bg-primary/20 text-primary uppercase tracking-wide font-mono border border-primary/50 shadow-tactical hover:bg-primary/30",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-sm",
        sm: "h-9 px-3 rounded-sm",
        lg: "h-11 px-8 rounded-sm",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
