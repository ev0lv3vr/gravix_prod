import * as React from 'react';
import { cn } from '../../lib/utils';
import { HTMLMotionProps, motion } from 'framer-motion';

const Card = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<"div">
>(({ className, ...props }, ref) => (
    <motion.div
        ref={ref}
        className={cn(
            "bg-gravix-slate border border-gravix-steel/30 rounded-lg p-6 hover:border-gravix-red/50 transition-colors shadow-lg",
            className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 mb-4", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("font-bold text-lg leading-none tracking-tight text-white", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-gravix-gray-400 text-sm", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
