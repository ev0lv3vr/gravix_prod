import { Section } from '../layout/Section';
import { Network, TrendingUp, Briefcase, Handshake, ShieldCheck, Box } from 'lucide-react';

const pillars = [
    {
        icon: Box,
        title: "Batch-to-Batch Reliability",
        desc: "Predictable performance across every shipment"
    },
    {
        icon: TrendingUp,
        title: "Scalability",
        desc: "From pilot runs to full production volumes"
    },
    {
        icon: Network,
        title: "Portfolio Coverage",
        desc: "Complete viscosity range from a single supplier"
    },
    {
        icon: Handshake,
        title: "Procurement Alignment",
        desc: "Flexible terms, documentation support, agreements"
    },
    {
        icon: Briefcase,
        title: "Distributor Enablement",
        desc: "Channel support, training resources, co-marketing"
    },
    {
        icon: ShieldCheck,
        title: "Supply Security",
        desc: "Strategic inventory, backup production capacity"
    }
];

export function Partnership() {
    return (
        <Section id="partnership" className="bg-gravix-slate border-b border-gravix-charcoal">
            <div className="text-center mb-16">
                <span className="text-gravix-red font-bold tracking-widest text-xs uppercase mb-3 block">Partnership</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Manufacturers Choose GRAVIX</h2>
                <p className="text-gravix-gray-400 max-w-2xl mx-auto text-lg">
                    Adhesive supply isn't transactional—it's operational infrastructure. Gravix delivers the consistency, scalability, and partnership alignment that procurement teams require.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pillars.map((pillar, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-gravix-charcoal/30 border border-white/5 hover:border-gravix-red/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gravix-charcoal flex items-center justify-center mb-4 border border-gravix-steel/30 shadow-lg">
                            <pillar.icon className="w-6 h-6 text-gravix-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                        <p className="text-sm text-gravix-gray-400">{pillar.desc}</p>
                    </div>
                ))}
            </div>
        </Section>
    );
}
