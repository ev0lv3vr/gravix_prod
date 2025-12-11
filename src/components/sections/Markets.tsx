import { Section } from '../layout/Section';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Layers, Cuboid as Grid, Factory, Droplets, Wrench, Hammer } from 'lucide-react';

const markets = [
    {
        title: "Cabinetry & Woodworking",
        icon: Layers,
        desc: "Structural assemblies, edge bonding, veneer applications"
    },
    {
        title: "Flooring Installation",
        icon: Grid,
        desc: "Subfloor prep, transition bonding, repair systems"
    },
    {
        title: "Manufacturing & Assembly",
        icon: Factory,
        desc: "Production line adhesives, component bonding, fixture assembly"
    },
    {
        title: "Aquascaping & Structural",
        icon: Droplets,
        desc: "Hardscape bonding, coral fragging, underwater-cure formulations"
    },
    {
        title: "Repair & Maintenance",
        icon: Wrench,
        desc: "MRO applications, field repairs, equipment maintenance"
    },
    {
        title: "Fabrication Shops",
        icon: Hammer,
        desc: "Custom builds, prototyping, mixed-material assemblies"
    }
];

export function Markets() {
    return (
        <Section id="industries" variant="dark">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Markets We Serve</h2>
                <p className="text-gravix-gray-400 max-w-2xl mx-auto">
                    From high-speed production lines to precision field repairs, Gravix engineers solutions for diverse industrial requirements.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map((market, index) => (
                    <Card key={index} className="group hover:-translate-y-1 transition-all duration-300">
                        <CardHeader>
                            <div className="mb-4 w-12 h-12 rounded bg-gravix-slate/50 flex items-center justify-center border border-gravix-steel/20 group-hover:border-gravix-red/50 transition-colors">
                                <market.icon className="w-6 h-6 text-gravix-gray-400 group-hover:text-gravix-red transition-colors" />
                            </div>
                            <CardTitle className="mb-2">{market.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {market.desc}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
