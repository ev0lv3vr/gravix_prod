import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        accent: 'bg-accent-500/10 text-accent-500 border border-accent-500/20',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warning/10 text-warning border border-warning/20',
        danger: 'bg-danger/10 text-danger border border-danger/20',
        info: 'bg-info/10 text-info border border-info/20',
        default: 'bg-brand-700 text-text-secondary border border-brand-600',
        // Legacy variants for backward compatibility
        outline: 'bg-brand-700 text-text-secondary border border-brand-600',
        secondary: 'bg-brand-700 text-text-secondary border border-brand-600',
        destructive: 'bg-danger/10 text-danger border border-danger/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
