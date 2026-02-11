'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, UserX, DollarSign, Clock, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <SolutionSection />
      <DifferentiatorSection />
      <HowItWorks />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ============================================================
   Component 1.1: Hero Section
   ============================================================ */
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3B82F6 1px, transparent 1px),
            linear-gradient(to bottom, #3B82F6 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 text-center px-6 py-20">
        {/* Headline */}
        <h1 className="text-[32px] md:text-[48px] font-bold text-white max-w-[720px] mx-auto leading-tight mb-6">
          Specify industrial adhesives with confidence. Diagnose failures in minutes.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-[#94A3B8] max-w-[560px] mx-auto leading-relaxed mb-8">
          AI-powered materials intelligence that learns from every analysis. Backed by real production data, not just textbook theory.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link
            href="/tool"
            className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white text-base font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Try Spec Engine →
          </Link>
          <Link
            href="/failure"
            className="inline-flex items-center justify-center border border-accent-500 text-[#94A3B8] hover:text-white text-base font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Diagnose a Failure
          </Link>
        </div>

        {/* Microcopy */}
        <p className="text-sm text-[#64748B] mt-4">
          Free to start • No credit card
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.2: Social Proof Bar
   ============================================================ */
function SocialProofBar() {
  const [stats, setStats] = useState([
    { number: '847+', label: 'analyses completed' },
    { number: '30+', label: 'substrate combinations' },
    { number: '7', label: 'adhesive families' },
    { number: '73%', label: 'resolution rate' },
  ]);

  useEffect(() => {
    api
      .getPublicStats()
      .then((data) => {
        setStats([
          { number: `${data.analysesCompleted || 847}+`, label: 'analyses completed' },
          { number: `${data.substrateCombinations || 30}+`, label: 'substrate combinations' },
          { number: `${data.adhesiveFamilies || 7}`, label: 'adhesive families' },
          { number: `${data.resolutionRate || 73}%`, label: 'resolution rate' },
        ]);
      })
      .catch(() => {
        // Keep hardcoded fallback
      });
  }, []);

  return (
    <section className="w-full bg-brand-800/50 border-t border-b border-[#1F2937] py-4">
      <div className="container mx-auto px-6">
        {/* Desktop: single row */}
        <div className="hidden md:flex items-center justify-center gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#94A3B8] font-semibold">{stat.number}</span>
                <span className="text-sm text-[#64748B]">{stat.label}</span>
              </div>
              {i < stats.length - 1 && (
                <span className="text-[#374151]">•</span>
              )}
            </div>
          ))}
        </div>
        {/* Mobile: 2x2 grid */}
        <div className="md:hidden grid grid-cols-2 gap-4 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <span className="font-mono text-[#94A3B8] font-semibold block">{stat.number}</span>
              <span className="text-xs text-[#64748B]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.3: Problem Section
   ============================================================ */
function ProblemSection() {
  const problems = [
    {
      icon: Search,
      title: 'Generic search results',
      body: 'Google gives you blog posts and forum guesses. Not engineering-grade analysis.',
    },
    {
      icon: UserX,
      title: 'Vendor bias & delays',
      body: 'Adhesive vendors recommend their own products. Responses take days.',
    },
    {
      icon: DollarSign,
      title: 'Expensive testing cycles',
      body: 'Lab testing runs $500-5,000 per round. Multiple rounds add up fast.',
    },
    {
      icon: Clock,
      title: 'Consultant bottleneck',
      body: 'Specialists charge $200-500/hr and take weeks to schedule. Production can\'t wait.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[32px] font-bold text-white text-center mb-12">
          Engineers waste weeks on adhesive failures
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={i}
                className="bg-brand-800 border border-[#1F2937] rounded-lg p-6"
              >
                <Icon className="w-8 h-8 text-text-tertiary mb-4" />
                <h3 className="text-base font-semibold text-white mb-2">{problem.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{problem.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.4: Solution Section — "How Gravix Works"
   ============================================================ */
function SolutionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 space-y-24 md:space-y-24 lg:space-y-[96px]">
        {/* Feature Block 1: Spec Engine (text left, visual right) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
              SPEC ENGINE
            </span>
            <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
              Specify the right adhesive in 60 seconds
            </h3>
            <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
              Tell us your substrates, environment, and requirements. Get a vendor-neutral specification with application guidance and alternatives.
            </p>
            <ul className="space-y-2">
              {['Vendor-neutral recommendations', 'Surface prep instructions per substrate', 'Risk warnings and alternatives'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <SpecEngineMockup />
        </div>

        {/* Feature Block 2: Failure Analysis (visual left, text right) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="lg:order-2">
            <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
              FAILURE ANALYSIS
            </span>
            <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
              Diagnose failures with ranked root causes
            </h3>
            <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
              Describe your failure — substrates, conditions, timeline. Get ranked root causes with confidence scores and specific fix recommendations.
            </p>
            <ul className="space-y-2">
              {['Root causes ranked by probability', 'Immediate + long-term fixes', 'Prevention plan'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:order-1">
            <FailureAnalysisMockup />
          </div>
        </div>

        {/* Feature Block 3: Self-Learning (text left, visual right) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
              SELF-LEARNING AI
            </span>
            <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
              Gets smarter with every analysis
            </h3>
            <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
              Unlike generic AI tools, Gravix accumulates empirical data from real production outcomes. Every confirmed fix makes the next diagnosis more accurate.
            </p>
            <ul className="space-y-2">
              {['Backed by real production data', 'Confidence scores calibrated by outcomes', 'Solutions ranked by confirmed success rate'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <KnowledgeFlywheelDiagram />
        </div>
      </div>
    </section>
  );
}

/* Spec Engine result preview mockup */
function SpecEngineMockup() {
  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-text-tertiary mb-1">Recommended</div>
          <div className="text-xl font-bold text-white">Two-Part Structural Epoxy</div>
          <div className="text-sm text-text-tertiary mt-1">Bisphenol A / Amine Hardener</div>
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-success flex items-center justify-center">
          <span className="text-sm font-mono font-bold text-success">92%</span>
        </div>
      </div>
      <div className="border-t border-[#1F2937] pt-4 space-y-2 font-mono text-sm">
        <div className="flex justify-between"><span className="text-text-tertiary">Shear Strength</span><span className="text-white">3,200 PSI</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Service Temp</span><span className="text-white">-40°C to 150°C</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Cure Time</span><span className="text-white">24h @ RT</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Gap Fill</span><span className="text-white">Up to 5mm</span></div>
      </div>
      <div className="border-t border-[#1F2937] pt-4">
        <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">Surface Prep — Aluminum 6061</div>
        <ol className="text-xs text-[#94A3B8] space-y-1 list-decimal list-inside">
          <li>Solvent wipe with IPA</li>
          <li>Abrade with 180-grit sandpaper</li>
          <li>Apply primer coat, allow 10 min dry</li>
        </ol>
      </div>
    </div>
  );
}

/* Failure Analysis result preview mockup */
function FailureAnalysisMockup() {
  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-text-tertiary mb-1">Primary Root Cause</div>
          <div className="text-lg font-bold text-white">Inadequate Surface Preparation</div>
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-accent-500 flex items-center justify-center">
          <span className="text-sm font-mono font-bold text-accent-500">87%</span>
        </div>
      </div>
      {/* Ranked causes */}
      <div className="space-y-2">
        {[
          { rank: 1, cause: 'Inadequate surface prep', conf: '87%', color: 'bg-accent-500' },
          { rank: 2, cause: 'CTE mismatch stress', conf: '62%', color: 'bg-accent-500/60' },
          { rank: 3, cause: 'Moisture contamination', conf: '41%', color: 'bg-accent-500/30' },
        ].map((rc) => (
          <div key={rc.rank} className="flex items-center gap-3 p-2 bg-brand-900/50 rounded">
            <span className={`w-6 h-6 rounded-full ${rc.color} flex items-center justify-center text-xs font-bold text-white`}>
              {rc.rank}
            </span>
            <span className="flex-1 text-sm text-white">{rc.cause}</span>
            <span className="text-sm font-mono text-text-tertiary">{rc.conf}</span>
          </div>
        ))}
      </div>
      {/* Immediate action */}
      <div className="border-l-[3px] border-danger pl-3 py-1">
        <div className="text-xs font-semibold text-danger uppercase tracking-wide mb-1">Do This Now</div>
        <p className="text-xs text-[#94A3B8]">Clean substrates with IPA, abrade to 180-grit, reapply within 30 min of prep.</p>
      </div>
    </div>
  );
}

/* Knowledge flywheel diagram */
function KnowledgeFlywheelDiagram() {
  return (
    <div className="flex items-center justify-center p-8">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
        {/* Central circle */}
        <circle cx="150" cy="150" r="40" fill="#3B82F6" opacity="0.15" />
        <text x="150" y="145" textAnchor="middle" className="fill-accent-500 text-[11px] font-semibold">Gravix</text>
        <text x="150" y="160" textAnchor="middle" className="fill-accent-500 text-[9px]">Knowledge</text>

        {/* Nodes */}
        {/* Top: "Your Analysis" */}
        <circle cx="150" cy="40" r="32" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="150" y="37" textAnchor="middle" className="fill-white text-[9px] font-medium">Your</text>
        <text x="150" y="48" textAnchor="middle" className="fill-white text-[9px] font-medium">Analysis</text>

        {/* Right: "Confirmed Fix" */}
        <circle cx="255" cy="190" r="32" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="255" y="187" textAnchor="middle" className="fill-white text-[9px] font-medium">Confirmed</text>
        <text x="255" y="198" textAnchor="middle" className="fill-white text-[9px] font-medium">Fix</text>

        {/* Left: "Better Analysis" */}
        <circle cx="45" cy="190" r="32" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="45" y="187" textAnchor="middle" className="fill-white text-[9px] font-medium">Better</text>
        <text x="45" y="198" textAnchor="middle" className="fill-white text-[9px] font-medium">Analysis</text>

        {/* Arrows (curved) */}
        {/* Top → Right */}
        <path d="M 178 55 Q 240 80 248 158" fill="none" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />
        {/* Right → Left (bottom) */}
        <path d="M 223 205 Q 150 260 77 205" fill="none" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />
        {/* Left → Top */}
        <path d="M 52 158 Q 60 80 122 55" fill="none" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ============================================================
   Component 1.5: Differentiator — "Why Not Just Use ChatGPT?"
   ============================================================ */
function DifferentiatorSection() {
  const rows = [
    { generic: 'Different answer every time', gravix: 'Consistent, structured output you can attach to an ECO' },
    { generic: 'Knows textbooks only', gravix: 'Knows textbooks + real production outcomes' },
    { generic: 'Guesses at confidence', gravix: 'Confidence scores calibrated against confirmed cases' },
    { generic: 'Chat transcript output', gravix: 'Professional PDF report for engineering review' },
    { generic: 'Forgets everything', gravix: 'Accumulates institutional knowledge over time' },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[32px] font-bold text-white text-center mb-12">
          Why engineers choose Gravix over generic AI
        </h2>

        <div className="max-w-[800px] mx-auto bg-brand-800 border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            {/* Column headers */}
            <div className="p-4 bg-brand-800 border-b border-[#1F2937]">
              <span className="text-sm font-semibold text-text-tertiary">Generic AI (ChatGPT)</span>
            </div>
            <div className="p-4 bg-brand-800/80 border-b border-[#1F2937] border-l-2 border-l-accent-500">
              <span className="text-sm font-semibold text-accent-500">Gravix</span>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div key={i} className="contents">
                <div className={`p-4 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-text-tertiary mt-0.5">○</span>
                    <span className="text-sm text-text-tertiary">{row.generic}</span>
                  </div>
                </div>
                <div className={`p-4 border-l-2 border-l-accent-500 bg-brand-800/80 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{row.gravix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.6: How It Works — 3 Steps
   ============================================================ */
function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Describe your problem',
      body: 'Fill out the structured intake form. Takes 2-3 minutes.',
    },
    {
      number: '2',
      title: 'Get your analysis',
      body: 'AI generates ranked root causes with confidence scores and specific fixes.',
    },
    {
      number: '3',
      title: 'Track & improve',
      body: 'Report your outcome. Your feedback makes the next analysis smarter for everyone.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting dashed line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[20%] right-[20%] border-t-2 border-dashed border-[#374151]" />

            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="text-[48px] font-bold font-mono text-accent-500 mb-4 relative z-10 bg-[#0A1628] inline-block px-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#94A3B8]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.7: Pricing Preview
   ============================================================ */
function PricingPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-[32px] font-bold text-white mb-2">Simple pricing</h2>
        <p className="text-base text-[#94A3B8] mb-12">
          Start free. Upgrade when you need full reports.
        </p>

        {/* Cards: On mobile, Pro first (flex-col-reverse) */}
        <div className="flex flex-col-reverse md:flex-row gap-8 justify-center max-w-[760px] mx-auto">
          {/* Free */}
          <div className="w-full md:max-w-[360px] bg-brand-800 border border-[#1F2937] rounded-lg p-8 text-left">
            <h3 className="text-xl font-bold text-white mb-1">Free</h3>
            <div className="text-3xl font-bold text-white mb-6">$0</div>
            <ul className="space-y-3 mb-8">
              {[
                { included: true, text: '5 analyses/month' },
                { included: true, text: 'Full AI results' },
                { included: true, text: 'Watermarked PDF' },
                { included: false, text: 'Preview exec summary' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {item.included ? (
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-text-tertiary flex-shrink-0">○</span>
                  )}
                  <span className={item.included ? 'text-white' : 'text-text-tertiary'}>{item.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/tool"
              className="block w-full text-center border border-accent-500 text-[#94A3B8] hover:text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="w-full md:max-w-[360px] bg-brand-800 border border-accent-500 border-t-[3px] border-t-accent-500 rounded-lg p-8 text-left">
            <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
            <div className="text-3xl font-bold text-white mb-1">$49<span className="text-base font-normal text-text-tertiary">/mo</span></div>
            <ul className="space-y-3 mb-8 mt-6">
              {[
                'Unlimited analyses',
                'Full exec summary',
                'Clean PDF export',
                'Full analysis history',
                'Similar cases detail',
                'Priority processing',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="block w-full text-center bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <Link href="/pricing" className="inline-block mt-8 text-sm text-accent-500 hover:underline">
          Need team access? → See all plans
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.8: Final CTA
   ============================================================ */
function FinalCTA() {
  return (
    <section className="w-full bg-brand-800/50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-[32px] font-bold text-white mb-4">
          Ready to stop guessing?
        </h2>
        <p className="text-base text-[#94A3B8] mb-8">
          Start with 5 free analyses. No credit card required.
        </p>
        <Link
          href="/tool"
          className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white text-base font-medium px-10 py-4 rounded-lg transition-colors"
        >
          Try Gravix Free →
        </Link>
      </div>
    </section>
  );
}
