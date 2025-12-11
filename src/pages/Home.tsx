import {
    Hero,
    About,
    Markets,
    WhyGravix,
    Products,
    Partnership,
    CTABlock
} from '../components/sections';

export function Home() {
    return (
        <main>
            <Hero />
            <About />
            <Markets />
            <WhyGravix />
            <Products />
            <Partnership />
            <CTABlock />
        </main>
    );
}
