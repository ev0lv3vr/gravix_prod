import * as React from 'react';
import { cn } from '../../lib/utils';


// Actually I'll use simple implementation for now to avoid extra deps not in initial list.

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'secondary' | 'accent';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-gravix-slate text-gravix-gray-100",
        secondary: "border-transparent bg-gravix-gray-100 text-gravix-charcoal",
        outline: "text-gravix-gray-100 border-gravix-steel",
        accent: "border-transparent bg-gravix-red/20 text-gravix-red border border-gravix-red/30",
    };

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gravix-gray-400 focus:ring-offset-2",
            variants[variant],
            className
        )} {...props} />
    );
}

export { Badge };
