import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded font-medium transition-all duration-normal ease-out-crisp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-accent-500 text-white hover:bg-accent-600 hover:scale-[1.01] active:bg-accent-700 active:scale-[0.99]',
        primary: 'bg-accent-500 text-white hover:bg-accent-600 hover:scale-[1.01] active:bg-accent-700 active:scale-[0.99]',
        secondary: 'border-2 border-accent-500 text-accent-500 bg-transparent hover:bg-accent-500/10 hover:scale-[1.01] active:scale-[0.99]',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-brand-700 active:scale-[0.99]',
        danger: 'bg-danger text-white hover:bg-[#DC2626] hover:scale-[1.01] active:scale-[0.99]',
        success: 'bg-success text-white hover:bg-[#059669] hover:scale-[1.01] active:scale-[0.99]',
        link: 'text-accent-500 underline-offset-4 hover:underline',
        // Legacy variants for backward compatibility
        outline: 'border-2 border-accent-500 text-accent-500 bg-transparent hover:bg-accent-500/10 hover:scale-[1.01] active:scale-[0.99]',
        destructive: 'bg-danger text-white hover:bg-[#DC2626] hover:scale-[1.01] active:scale-[0.99]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',     // 32px
        md: 'h-10 px-4 text-base',   // 40px
        lg: 'h-12 px-6 text-lg',     // 48px
        xl: 'h-14 px-8 text-xl',     // 56px
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
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
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
