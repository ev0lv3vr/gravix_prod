'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

// Mock case data (in real app, fetched by slug)
const CASE_DATA: Record<string, {
  title: string;
  industry: string;
  failureMode: string;
  material: string;
  tags: string[];
  summary: string;
  rootCause: string;
  solution: string;
  lessons: string[];
}> = {
  'ca-debonding-aluminum-abs': {
    title: 'Cyanoacrylate Debonding on Aluminum-ABS Assembly',
    industry: 'Automotive',
    failureMode: 'Adhesive Failure',
    material: 'Cyanoacrylate',
    tags: ['CA', 'aluminum', 'ABS', 'thermal cycling'],
    summary: 'A consumer electronics manufacturer experienced widespread bond failures in an aluminum-to-ABS plastic assembly. Bonds that initially passed quality testing began failing within 2 weeks of production, with clean separation at the aluminum interface indicating adhesive failure rather than cohesive failure.',
    rootCause: 'Root cause analysis revealed two contributing factors: (1) Residual oils from the aluminum stamping process were not fully removed by the solvent wipe step. The IPA wipe was insufficient for the specific machining lubricant used. (2) Thermal cycling during product use (-10°C to 60°C) created differential expansion stress at the bond interface, exploiting the weakened adhesion.',
    solution: 'Implemented a three-step surface preparation protocol: acetone degrease → IPA wipe → plasma treatment. The plasma treatment activated the aluminum surface and improved wetting. Additionally, switched from rigid CA to a toughened CA formulation (Loctite 480) to accommodate thermal expansion mismatch. Post-fix bond strength increased from 1,200 PSI to 2,800 PSI with zero field failures over 6 months.',
    lessons: [
      'IPA alone is often insufficient for removing machining oils — verify with water break test.',
      'Thermal cycling testing should be mandatory for any assembly with CTE mismatch >5 ppm/°C.',
      'Toughened CA formulations provide significantly better fatigue resistance than standard CA.',
      'Plasma treatment is cost-effective at scale and dramatically improves adhesion to metals.',
    ],
  },
  'epoxy-cracking-electronics': {
    title: 'Epoxy Cracking in High-Temperature Electronics',
    industry: 'Electronics',
    failureMode: 'Cohesive Failure',
    material: 'Epoxy',
    tags: ['epoxy', 'CTE', 'electronics'],
    summary: 'A structural epoxy bond between a ceramic substrate and aluminum heat sink developed cracks after 500 thermal cycles (-40°C to 125°C). The cracks originated within the adhesive layer, characteristic of cohesive failure under cyclic stress.',
    rootCause: 'The CTE mismatch between aluminum (23 ppm/°C) and ceramic (6-8 ppm/°C) created significant cyclic shear stress at the bond line. The rigid epoxy formulation (Tg 150°C) had insufficient elongation to accommodate the differential expansion, leading to fatigue cracking.',
    solution: 'Replaced the rigid epoxy with a flexible filled epoxy (Henkel EA 9394) that provides 5% elongation at break versus 1% for the original. The flexible formulation maintains adequate shear strength (2,200 PSI) while accommodating thermal cycling. Passed 2,000 thermal cycles without failure.',
    lessons: [
      'Always calculate expected shear strain from CTE mismatch before selecting adhesive.',
      'Flexible or toughened epoxies are essential when CTE mismatch exceeds 10 ppm/°C.',
      'Thermal cycling qualification should exceed expected service life by 2x minimum.',
    ],
  },
};

export default function CaseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const caseData = CASE_DATA[slug];

  if (!caseData) {
    return (
      <div className="container mx-auto px-6 py-10">
        <p className="text-[#94A3B8]">Case not found.</p>
        <Link href="/cases" className="text-accent-500 hover:underline mt-4 inline-block">← Back to Case Library</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#64748B] mb-8">
        <Link href="/cases" className="hover:text-white transition-colors">Case Library</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#94A3B8]">{caseData.title}</span>
      </nav>

      {/* Article layout */}
      <article className="max-w-[720px]">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{caseData.title}</h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-500/10 text-accent-500">{caseData.failureMode}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#94A3B8]">{caseData.industry}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#94A3B8]">{caseData.material}</span>
          {caseData.tags.map(t => (
            <span key={t} className="text-xs text-[#64748B]">#{t}</span>
          ))}
        </div>

        {/* Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{caseData.summary}</p>
        </section>

        {/* Root Cause */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Root Cause</h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{caseData.rootCause}</p>
        </section>

        {/* Solution */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Solution</h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{caseData.solution}</p>
        </section>

        {/* Lessons Learned */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Lessons Learned</h2>
          <ul className="space-y-2">
            {caseData.lessons.map((lesson, i) => (
              <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                <span className="text-success flex-shrink-0">•</span>
                {lesson}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 mt-12">
          <h3 className="text-lg font-semibold text-white mb-2">Have a similar failure?</h3>
          <p className="text-sm text-[#94A3B8] mb-4">Run a failure analysis to get personalized root causes and fixes for your specific situation.</p>
          <Link href="/failure" className="inline-block bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Diagnose a Failure →
          </Link>
        </div>
      </article>
    </div>
  );
}
