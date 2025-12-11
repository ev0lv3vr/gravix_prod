import * as React from 'react';
import { Section } from '../layout/Section';
import { Button } from '../ui/Button';
import { ContactModal } from '../ui/ContactModal';

export function CTABlock() {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalTopic, setModalTopic] = React.useState("General Inquiry");

    const openModal = (topic: string) => {
        setModalTopic(topic);
        setModalOpen(true);
    };

    return (
        <>
            <Section className="bg-gravix-red relative overflow-hidden">
                {/* Texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>

                <div className="relative z-10 text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to Discuss Your Adhesive Requirements?</h2>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10 font-light">
                        Whether you're evaluating suppliers, scaling production, or exploring private label opportunities—our team is ready to support your procurement process.
                    </p>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6 max-w-4xl mx-auto">
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                            <h3 className="font-bold text-lg mb-2">Request Pricing Access</h3>
                            <p className="text-sm opacity-80 mb-4">Get distributor-tier pricing and availability</p>
                            <Button variant="secondary" className="w-full" onClick={() => openModal("Pricing Access")}>Get Access</Button>
                        </div>

                        <div className="flex-1 bg-gravix-charcoal text-left p-6 rounded-lg border border-gravix-charcoal shadow-xl transform md:scale-105 z-10">
                            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gravix-red text-white mb-2">MOST POPULAR</div>
                            <h3 className="font-bold text-lg text-white mb-2">Distributor Inquiry</h3>
                            <p className="text-sm text-gravix-gray-400 mb-4">Become a GRAVIX channel partner</p>
                            <Button variant="primary" className="w-full" onClick={() => openModal("Distributor Inquiry")}>Apply Now</Button>
                        </div>

                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                            <h3 className="font-bold text-lg mb-2">Private Label</h3>
                            <p className="text-sm opacity-80 mb-4">Custom formulations and packaging</p>
                            <Button variant="secondary" className="w-full" onClick={() => openModal("Private Label")}>Learn More</Button>
                        </div>
                    </div>

                </div>
            </Section>

            <ContactModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                defaultTopic={modalTopic}
            />
        </>
    );
}
