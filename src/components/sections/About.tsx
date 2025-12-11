import { Section } from '../layout/Section';
import { motion } from 'framer-motion';
import labImage from '../../assets/chemical_wet_lab.png';

export function About() {
    return (
        <Section id="about" className="bg-gravix-gray-100 border-b border-gravix-gray-200">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block mb-4 px-3 py-1 rounded bg-gravix-slate/10 border border-gravix-slate/20">
                        <span className="text-xs font-bold text-gravix-slate uppercase tracking-wider">About Gravix</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gravix-slate mb-6">
                        Industrial Bonding Systems.<br />
                        <span className="text-gravix-charcoal">Strategic Supply Partnership.</span>
                    </h2>
                    <p className="text-gravix-steel mb-6 leading-relaxed">
                        GRAVIX™ operates from our Eastern European manufacturing base, engineering cyanoacrylate adhesive systems purpose-built for industrial and commercial applications. As part of the GlueMasters Industrial Solutions portfolio, we combine precision chemistry with scalable supply infrastructure.
                    </p>
                    <p className="text-gravix-steel mb-8 leading-relaxed">
                        Our formulations are developed for production environments—where cure dynamics, viscosity control, and batch consistency directly impact operational output. Gravix exists to solve bonding problems at scale, not sell products.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gravix-gray-200">
                        {[
                            { label: "Industrial Verticals", value: "12+" },
                            { label: "Manufacturing", value: "ISO-Aligned" },
                            { label: "Supply", value: "Consistent" }
                        ].map((stat, index) => (
                            <div key={index}>
                                <div className="text-2xl font-bold text-gravix-charcoal">{stat.value}</div>
                                <div className="text-sm text-gravix-steel font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative h-full min-h-[400px] bg-gravix-slate rounded-lg overflow-hidden shadow-xl"
                >
                    {/* Realistic Industrial Lab Image */}
                    <div className="relative h-full min-h-[400px]">
                        <img
                            src={labImage}
                            alt="Industrial Adhesive Laboratory"
                            className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gravix-charcoal/80 to-transparent"></div>

                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded border border-white/10">
                            <div className="text-xs font-mono text-gravix-red mb-1">R&D FACILITY</div>
                            <div className="text-sm text-white font-light">Advanced formulation and stress testing environment.</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Section>
    );
}
