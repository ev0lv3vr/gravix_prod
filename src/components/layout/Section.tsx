import * as React from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'default' | 'alternate' | 'dark';
    container?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ className, variant = 'default', container = true, children, ...props }, ref) => {

        const variants = {
            default: "bg-gravix-charcoal border-b border-gravix-slate/50",
            alternate: "bg-gravix-slate/30 border-b border-gravix-slate/50",
            dark: "bg-black border-b border-gravix-slate/50",
        };

        return (
            <section
                ref={ref}
                className={cn("py-16 md:py-24", variants[variant], className)}
                {...props}
            >
                {container ? (
                    <div className="container-width">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </section>
        );
    }
);
Section.displayName = "Section";

export { Section };
