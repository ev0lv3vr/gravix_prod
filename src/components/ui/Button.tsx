import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {

        // Base styles
        const baseStyles = "inline-flex items-center justify-center rounded-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gravix-gray-400 disabled:pointer-events-none disabled:opacity-50";

        // Variants
        const variants = {
            primary: "bg-gravix-red text-white hover:bg-gravix-red-hover shadow-md",
            secondary: "bg-gravix-white text-gravix-slate hover:bg-gravix-gray-100 border border-gravix-gray-200",
            outline: "border border-gravix-steel text-gravix-gray-100 hover:bg-gravix-steel/10",
            ghost: "text-gravix-gray-400 hover:text-gravix-white hover:bg-white/5",
        };

        // Sizes
        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-8 text-base",
        };

        const Comp = motion.button;

        return (
            <Comp
                ref={ref as any}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                {...(props as any)}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
