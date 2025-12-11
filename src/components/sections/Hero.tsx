import * as React from 'react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ContactModal } from '../ui/ContactModal';

export function Hero() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center bg-gravix-charcoal overflow-hidden pt-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container-width text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gravix-steel/30 bg-gravix-slate/30 backdrop-blur-sm">
                        <span className="text-sm font-medium text-gravix-gray-400 tracking-wide uppercase">Industrial Bonding Systems</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-8">
                        Precision Adhesives Engineered for <span className="text-gravix-gray-400">Production Environments</span>
                    </h1>

                    <p className="text-xl text-gravix-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Gravix delivers cyanoacrylate bonding systems built for manufacturing reliability—where bond integrity, cure consistency, and supply chain dependability matter.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto h-14 text-lg" onClick={() => setIsModalOpen(true)}>
                            SECURE PRODUCTION SUPPLY
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gravix-charcoal to-transparent pointer-events-none"></div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                variant="distributor"
                defaultTopic="Distributor Access Request"
            />
        </div>
    );
}
