import { Section } from '../layout/Section';
import { Container, ClipboardCheck, Factory } from 'lucide-react';
import { motion } from 'framer-motion';

const philosophyPoints = [
    {
        icon: Container,
        title: "100% Fill Rate Guarantee",
        desc: "We are not a drop-shipper. We are a warehouse partner. Through our VMI (Vendor Managed Inventory) program, we physically segregate 3 months of your specific adhesive usage in our facility. It sits in a cage with your name on it, ready for same-day dispatch."
    },
    {
        icon: ClipboardCheck,
        title: "Batch-Certified Consistency",
        desc: "Inconsistent viscosity destroys automated lines. We hold strict manufacturing tolerances on every batch of CA. Every industrial shipment includes a Certificate of Analysis (COA) verifying cure speed, viscosity, and shear strength. No surprises on the factory floor."
    },
    {
        icon: Factory,
        title: "Direct-to-Factory Pricing",
        desc: "Cut out the distributor markup. By partnering directly with GRAVIX, you gain access to 55-gallon drums, 5-gallon pails, and case-packed gallons at volume pricing that competes with—and beats—generic imports."
    }
];

export function WhyGravix() {
    return (
        <Section variant="alternate" className="bg-gravix-gray-100 border-b border-gravix-gray-200">
            <div className="text-center mb-16">
                <div className="inline-block mb-4 px-3 py-1 rounded bg-gravix-slate/10 border border-gravix-slate/20">
                    <span className="text-xs font-bold text-gravix-slate uppercase tracking-wider">Our Core Promise</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-gravix-slate tracking-tight">THE PHILOSOPHY</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {philosophyPoints.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex flex-col items-center text-center group"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white border border-gravix-gray-200 shadow-lg flex items-center justify-center mb-6 group-hover:border-gravix-red/30 group-hover:shadow-gravix-red/10 transition-all duration-300">
                            <item.icon className="w-10 h-10 text-gravix-charcoal group-hover:text-gravix-red transition-colors duration-300 stroke-[1.5]" />
                        </div>
                        <h3 className="text-xl font-bold text-gravix-charcoal mb-4">{item.title}</h3>
                        <p className="text-gravix-steel leading-relaxed text-sm md:text-base">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
