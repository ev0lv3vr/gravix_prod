import { Section } from '../layout/Section';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import productImage from '../../assets/product_lineup_v2.png';

const products = [
    {
        name: "Thin",
        viscosity: "5 cps",
        desc: "Deep penetration, wicking, instant cure. (Wood repair, fossils, hairline fractures).",
        color: "bg-blue-400"
    },
    {
        name: "Medium",
        viscosity: "100–500 cps",
        desc: "The general assembly workhorse. Zero-bloom formulas available for luxury packaging.",
        color: "bg-green-400"
    },
    {
        name: "Thick",
        viscosity: "1500+ cps",
        desc: "Gap filling and vertical applications. Ideal for millwork and cabinet installation.",
        color: "bg-yellow-400"
    },
    {
        name: "Black",
        viscosity: "Rubber-Toughened",
        desc: "High-impact resistance for gasketing, O-rings, and speaker assembly.",
        tag: "Coming Soon - Inquire for Specs",
        color: "bg-gravix-gray-400"
    }
];

export function Products() {
    return (
        <Section id="product-range" className="bg-gravix-charcoal">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                    <div className="inline-block mb-4 px-3 py-1 rounded border border-gravix-steel/30">
                        <span className="text-xs font-bold text-gravix-gray-400 uppercase tracking-wider">Product Range</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">BUILT FOR SCALE.</h2>
                    <p className="text-gravix-gray-400 text-lg leading-relaxed max-w-xl">
                        Industrial adhesive systems available in bulk configurations. From 55-gallon drums to case-packed bottles, we supply the volume you need for uninterrupted production.
                    </p>
                </div>
                <div className="relative h-[300px] lg:h-[400px] rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <img
                        src={productImage}
                        alt="Gravix Bulk Packaging: Drum, Pail, and Bottles"
                        className="absolute inset-0 w-full h-full object-contain p-8"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col bg-gravix-slate border-gravix-steel/30 relative overflow-hidden group hover:border-gravix-steel/50 transition-colors">
                            <div className={`absolute top-0 left-0 w-1 h-full ${product.color} opacity-60`}></div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                    <span className="text-xs font-mono py-1 px-2 rounded bg-gravix-charcoal border border-gravix-steel/50 text-gravix-gray-400">
                                        {product.viscosity}
                                    </span>
                                </div>

                                <p className="text-sm text-gravix-gray-100 mb-4 flex-grow leading-relaxed">
                                    {product.desc}
                                </p>

                                {product.tag && (
                                    <div className="mt-auto pt-4 border-t border-white/10">
                                        <span className="text-xs font-bold text-gravix-red uppercase tracking-wider">{product.tag}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
