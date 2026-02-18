'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, Factory, Plane, Heart, Cpu, HardHat } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <SolutionSection />
      <DifferentiatorSection />
      <EnterpriseSocialProof />
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
  const handleScrollToSolution = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('solution-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        <h1 className="text-[32px] md:text-[48px] font-bold text-white max-w-[800px] mx-auto leading-tight mb-6">
          The adhesive intelligence platform for manufacturing quality teams.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-[#94A3B8] max-w-[640px] mx-auto leading-relaxed mb-8">
          AI-powered failure analysis, 8D investigation management, and cross-case pattern detection — backed by real production data, not just textbook theory.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link
            href="/failure"
            className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white text-base font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Analyze a Failure
          </Link>
          <button
            onClick={handleScrollToSolution}
            className="inline-flex items-center justify-center border border-[#374151] text-[#94A3B8] hover:text-white hover:border-[#4B5563] text-base font-medium px-8 py-3 rounded-lg transition-colors"
          >
            See How It Works ↓
          </button>
        </div>

        {/* Microcopy */}
        <p className="text-sm text-[#64748B] mt-4">
          Free to start • No credit card required
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
    { number: '2,400+', label: 'analyses completed' },
    { number: '150+', label: 'substrate pairs' },
    { number: '89%', label: 'resolution rate' },
  ]);
  const [industryText] = useState('Used by automotive, aerospace & medical device teams');

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';
    fetch(`${API_URL}/v1/stats/public`)
      .then(res => res.json())
      .then(data => {
        const analysesCount = data.analyses_completed_count || 0;
        const specsCount = data.specs_completed_count || 0;
        const totalCount = analysesCount + specsCount;
        const substrateCombos = data.substrate_combinations_count || 0;
        const resRate = data.resolution_rate;

        if (totalCount > 0 || substrateCombos > 0) {
          setStats([
            { number: totalCount > 2400 ? `${totalCount.toLocaleString()}+` : '2,400+', label: 'analyses completed' },
            { number: substrateCombos > 150 ? `${substrateCombos}+` : '150+', label: 'substrate pairs' },
            { number: resRate != null ? `${Math.round(resRate * 100)}%` : '89%', label: 'resolution rate' },
          ]);
        }
      })
      .catch(() => { /* keep fallback stats */ });
  }, []);

  return (
    <section className="w-full bg-brand-800/50 border-t border-b border-[#1F2937] py-4">
      <div className="container mx-auto px-6">
        {/* Desktop: single row */}
        <div className="hidden md:flex items-center justify-center gap-6">
          <span className="text-[#94A3B8]">📊</span>
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#94A3B8] font-semibold">{stat.number}</span>
                <span className="text-sm text-[#64748B]">{stat.label}</span>
              </div>
              <span className="text-[#374151]">•</span>
            </div>
          ))}
          <span className="text-sm text-[#64748B]">{industryText}</span>
        </div>
        {/* Mobile: stacked */}
        <div className="md:hidden flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="font-mono text-[#94A3B8] font-semibold text-sm">{stat.number}</span>
                <span className="text-xs text-[#64748B]">{stat.label}</span>
                {i < stats.length - 1 && <span className="text-[#374151] ml-2">•</span>}
              </div>
            ))}
          </div>
          <span className="text-xs text-[#64748B] text-center">{industryText}</span>
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
      icon: '🔍',
      title: 'Root cause guessing',
      body: 'Engineers try Google and ChatGPT. Different answers every time. Nothing audit-ready.',
    },
    {
      icon: '📋',
      title: '8D reports in Word templates',
      body: 'Quality teams spend 15-40 hours per 8D using blank templates. OEMs reject 20-30% for weak root cause analysis.',
    },
    {
      icon: '🏝️',
      title: 'Knowledge trapped in silos',
      body: 'Every failure is diagnosed from scratch. No institutional memory of what worked last time.',
    },
    {
      icon: '⏱️',
      title: 'Reactive, not predictive',
      body: 'Same failures repeat across facilities. No cross-case pattern detection. No early warning system.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white text-center mb-4 max-w-[800px] mx-auto">
          Adhesive failures cost manufacturing teams millions in scrap, delays, and customer complaints
        </h2>
        <p className="text-base text-[#64748B] text-center mb-12 max-w-[600px] mx-auto">
          Sound familiar?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="bg-brand-800 border border-[#1F2937] rounded-lg p-6"
            >
              <span className="text-2xl mb-4 block">{problem.icon}</span>
              <h3 className="text-base font-semibold text-white mb-2">{problem.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{problem.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.4: Solution Section — 5 Feature Blocks
   ============================================================ */
function SolutionSection() {
  return (
    <section id="solution-section" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white text-center mb-4">
          One platform for adhesive intelligence
        </h2>
        <p className="text-base text-[#94A3B8] text-center mb-16 max-w-[640px] mx-auto">
          From failure diagnosis to 8D reports to pattern detection — everything quality teams need.
        </p>

        <div className="space-y-24 md:space-y-24 lg:space-y-[96px] max-w-[1200px] mx-auto">
          {/* Feature Block 1: AI Failure Analysis (text left, visual right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
                FAILURE ANALYSIS
              </span>
              <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
                Diagnose adhesive failures in minutes, not weeks
              </h3>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                Describe the failure, upload defect photos, specify the product used. Get ranked root causes with confidence scores calibrated against real production outcomes.
              </p>
              <ul className="space-y-3">
                {[
                  'Visual AI analyzes fracture surface photos',
                  'TDS-aware — knows your product\'s specifications',
                  'Confidence backed by confirmed case outcomes',
                  'Guided investigation mode asks the right questions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <FailureAnalysisPreview />
          </div>

          {/* Feature Block 2: 8D Investigation Management (visual left, text right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <span className="inline-block px-3 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
                8D INVESTIGATIONS
              </span>
              <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
                Complete 8D reports that OEMs actually accept
              </h3>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                AI-powered root cause analysis fills D4 — the hardest part. Photo annotation, team comments, electronic signatures, and full audit trail for regulatory compliance.
              </p>
              <ul className="space-y-3">
                {[
                  'Ford Global 8D, VDA 8D, A3, AS9100 CAPA templates',
                  'Immutable audit log for IATF 16949 / ISO 13485',
                  'Action item tracking with due date reminders',
                  'One-click PDF/DOCX report generation',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <EightDPreview />
            </div>
          </div>

          {/* Feature Block 3: Self-Learning Intelligence (text left, visual right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
                SELF-LEARNING AI
              </span>
              <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
                Gets smarter with every resolved case
              </h3>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                Unlike generic AI, Gravix accumulates empirical data from real production outcomes. Every confirmed fix improves the next diagnosis for everyone on the platform.
              </p>
              <ul className="space-y-3">
                {[
                  'Backed by confirmed production outcomes',
                  'Confidence scores improve as data grows',
                  'Cross-case pattern detection spots emerging trends',
                  'Product performance pages built from real field data',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <KnowledgeFlywheelDiagram />
          </div>

          {/* Feature Block 4: Pattern Intelligence (visual left, text right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <span className="inline-block px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
                PATTERN INTELLIGENCE
              </span>
              <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
                Catch problems before they become recalls
              </h3>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                Weekly AI analysis across all cases detects statistical anomalies — product lot issues, seasonal patterns, geographic clusters. Get alerts before scattered incidents become systematic quality events.
              </p>
              <ul className="space-y-3">
                {[
                  'Automated cross-case pattern detection',
                  'Product lot and seasonal cluster analysis',
                  'Proactive alerts to affected teams',
                  'Enterprise trend intelligence dashboard',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <PatternAlertPreview />
            </div>
          </div>

          {/* Feature Block 5: Adhesive Specification Engine (text left, visual right) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold rounded mb-4">
                SPEC ENGINE
              </span>
              <h3 className="text-[28px] lg:text-[32px] font-bold text-white mb-4">
                Find the right adhesive with field-proven data
              </h3>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                Tell us your substrates, environment, and requirements. Get vendor-neutral specs with risk warnings based on real failure data — not just manufacturer claims.
              </p>
              <ul className="space-y-3">
                {[
                  'Vendor-neutral recommendations',
                  'Risk warnings from field failure database',
                  'Surface prep instructions per substrate',
                  'Cross-linked to failure case library',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <SpecEnginePreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Mini-UI Preview: AI Failure Analysis ── */
function FailureAnalysisPreview() {
  const causes = [
    { rank: 1, label: 'Surface contamination', pct: 89, color: '#3B82F6' },
    { rank: 2, label: 'Inadequate cure', pct: 67, color: '#3B82F6' },
    { rank: 3, label: 'UV degradation', pct: 34, color: '#3B82F6' },
  ];
  return (
    <div className="bg-[#0F1B2E] border border-[#1F2937] rounded-xl p-5 min-h-[280px] select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold text-white">Root Cause Analysis</span>
        <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full font-medium">High confidence</span>
      </div>
      {/* Ranked causes */}
      <div className="space-y-3 mb-4">
        {causes.map((c) => (
          <div key={c.rank}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[#94A3B8]">{c.rank}. {c.label}</span>
              <span className="text-[11px] font-mono text-white">{c.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 1 - (c.rank - 1) * 0.25 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Visual analysis tag */}
      <div className="flex items-center gap-2 mb-3 bg-[#1F2937]/60 rounded-lg px-3 py-2">
        <div className="w-8 h-8 rounded bg-[#1F2937] flex items-center justify-center flex-shrink-0">
          <span className="text-[12px]">📸</span>
        </div>
        <span className="text-[10px] text-[#94A3B8] leading-snug">Visual: Adhesive failure detected — cohesive fracture pattern</span>
      </div>
      {/* Badge */}
      <div className="flex items-center justify-center">
        <span className="text-[10px] text-[#64748B] bg-[#1F2937]/50 px-3 py-1 rounded-full">Based on 23 similar cases</span>
      </div>
    </div>
  );
}

/* ── Mini-UI Preview: 8D Investigation ── */
function EightDPreview() {
  const steps = ['D1','D2','D3','D4','D5','D6','D7','D8'];
  const completed = [0,1,2]; // indices
  const active = 3;
  return (
    <div className="bg-[#0F1B2E] border border-[#1F2937] rounded-xl p-5 min-h-[280px] select-none">
      {/* Stepper */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {steps.map((s, i) => {
          const done = completed.includes(i);
          const isCurrent = i === active;
          return (
            <div
              key={s}
              className={`flex items-center justify-center px-2 py-1 rounded text-[10px] font-medium flex-shrink-0 ${
                isCurrent
                  ? 'bg-[#3B82F6] text-white'
                  : done
                  ? 'bg-[#10B981]/15 text-[#10B981]'
                  : 'bg-[#1F2937] text-[#64748B]'
              }`}
            >
              {done ? `${s} ✓` : s}
            </div>
          );
        })}
      </div>
      {/* Active step heading */}
      <h4 className="text-[13px] font-semibold text-white mb-3">D4: Root Cause Analysis</h4>
      {/* 5-Why snippet */}
      <div className="bg-[#1F2937]/50 rounded-lg px-3 py-2.5 mb-4">
        <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block mb-1.5">5-Why Analysis</span>
        <div className="flex items-center gap-1 flex-wrap">
          {['Bond failed','Surface contamination','Cleaning skipped','SOP not updated','Training gap'].map((why, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-[10px] text-[#94A3B8]">Why {i+1}: {why}</span>
              {i < 4 && <span className="text-[10px] text-[#64748B]">→</span>}
            </span>
          ))}
        </div>
      </div>
      {/* Footer badges */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] bg-[#8B5CF6]/15 text-[#8B5CF6] px-2 py-0.5 rounded-full font-medium">Ford Global 8D</span>
        <span className="text-[10px] text-[#64748B]">👥 2 team members</span>
      </div>
    </div>
  );
}

/* ── Mini-UI Preview: Pattern Alert ── */
function PatternAlertPreview() {
  const bars = [20, 25, 30, 28, 55, 70, 85, 95]; // relative heights
  return (
    <div className="bg-[#0F1B2E] border border-[#1F2937] rounded-xl p-5 min-h-[280px] select-none border-l-4 border-l-[#EF4444]">
      {/* Severity badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] bg-[#EF4444]/15 text-[#EF4444] px-2 py-0.5 rounded-full font-semibold">🔴 Critical</span>
        <span className="text-[10px] text-[#64748B]">Pattern Alert</span>
      </div>
      {/* Title */}
      <h4 className="text-[13px] font-semibold text-white mb-1">Loctite 401 Failure Spike — Midwest</h4>
      <p className="text-[11px] text-[#94A3B8] mb-4">15 failures in 8 weeks (340% above avg)</p>
      {/* Sparkline bar chart */}
      <div className="flex items-end gap-1.5 h-12 mb-4 px-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              backgroundColor: i >= 5 ? '#EF4444' : '#1F2937',
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] text-[#64748B]">8 weeks ago</span>
        <span className="text-[9px] text-[#64748B]">This week</span>
      </div>
      {/* Action */}
      <button className="w-full text-[11px] font-medium border border-[#EF4444]/40 text-[#EF4444] rounded-lg py-1.5 hover:bg-[#EF4444]/10 transition-colors cursor-default">
        Acknowledge
      </button>
    </div>
  );
}

/* ── Mini-UI Preview: Spec Engine ── */
function SpecEnginePreview() {
  const compat = [
    { label: 'Aluminum', color: '#10B981' },
    { label: 'Steel', color: '#10B981' },
    { label: 'ABS', color: '#F59E0B' },
  ];
  return (
    <div className="bg-[#0F1B2E] border border-[#1F2937] rounded-xl p-5 min-h-[280px] select-none">
      {/* Top badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full font-medium">Top Match</span>
      </div>
      {/* Product name */}
      <h4 className="text-[15px] font-semibold text-white mb-1">Recommended: 3M DP460</h4>
      <p className="text-[11px] text-[#94A3B8] mb-4">Epoxy • 31 MPa shear • -55°C to 120°C</p>
      {/* Risk warning */}
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg px-3 py-2 mb-4">
        <span className="text-[11px] text-[#F59E0B]">⚠️ 2 known failures on ABS substrate</span>
      </div>
      {/* Compatibility grid */}
      <div className="mb-2">
        <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block mb-2">Substrate Compatibility</span>
        <div className="flex items-center gap-4">
          {compat.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] text-[#94A3B8]">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Specs row */}
      <div className="mt-4 flex items-center gap-3">
        <div className="bg-[#1F2937]/50 rounded px-2 py-1">
          <span className="text-[9px] text-[#64748B] block">Cure</span>
          <span className="text-[10px] text-[#94A3B8] font-medium">24h @ 23°C</span>
        </div>
        <div className="bg-[#1F2937]/50 rounded px-2 py-1">
          <span className="text-[9px] text-[#64748B] block">Mix ratio</span>
          <span className="text-[10px] text-[#94A3B8] font-medium">2:1</span>
        </div>
        <div className="bg-[#1F2937]/50 rounded px-2 py-1">
          <span className="text-[9px] text-[#64748B] block">Viscosity</span>
          <span className="text-[10px] text-[#94A3B8] font-medium">Paste</span>
        </div>
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
        <circle cx="150" cy="150" r="45" fill="#3B82F6" opacity="0.12" />
        <text x="150" y="143" textAnchor="middle" className="fill-accent-500 text-[10px] font-semibold">Gravix</text>
        <text x="150" y="156" textAnchor="middle" className="fill-accent-500 text-[8px]">Knowledge</text>
        <text x="150" y="167" textAnchor="middle" className="fill-accent-500 text-[8px]">Base</text>

        {/* Nodes */}
        {/* Top: "Analysis" */}
        <circle cx="150" cy="35" r="30" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="150" y="38" textAnchor="middle" className="fill-white text-[9px] font-medium">Analysis</text>

        {/* Top Right: "Visual AI" */}
        <circle cx="260" cy="100" r="30" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="260" y="97" textAnchor="middle" className="fill-white text-[9px] font-medium">Visual AI</text>
        <text x="260" y="108" textAnchor="middle" className="fill-white text-[9px] font-medium">+ TDS</text>

        {/* Bottom Right: "Feedback" */}
        <circle cx="230" cy="240" r="30" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="230" y="243" textAnchor="middle" className="fill-white text-[9px] font-medium">Feedback</text>

        {/* Bottom Left: "Better Analysis" */}
        <circle cx="70" cy="240" r="30" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
        <text x="70" y="237" textAnchor="middle" className="fill-white text-[9px] font-medium">Better</text>
        <text x="70" y="248" textAnchor="middle" className="fill-white text-[9px] font-medium">Analysis</text>

        {/* Top Left: "Pattern Detection" */}
        <circle cx="40" cy="100" r="30" fill="#111827" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="40" y="97" textAnchor="middle" className="fill-[#F59E0B] text-[8px] font-medium">Pattern</text>
        <text x="40" y="108" textAnchor="middle" className="fill-[#F59E0B] text-[8px] font-medium">Detection</text>

        {/* Arrows */}
        <path d="M 175 50 Q 220 60 240 78" fill="none" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 268 130 Q 265 175 245 215" fill="none" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 200 245 Q 150 265 100 245" fill="none" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 55 215 Q 40 175 40 132" fill="none" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 55 78 Q 80 55 125 42" fill="none" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

        {/* Pattern detection branch from center */}
        <path d="M 110 138 Q 80 125 65 118" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowheadAmber)" />

        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
          </marker>
          <marker id="arrowheadAmber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ============================================================
   Component 1.5: Differentiator — 3-Column Comparison
   ============================================================ */
function DifferentiatorSection() {
  const rows = [
    {
      generic: 'Different answer every time',
      manual: '15-40 hrs per 8D report',
      gravix: 'Consistent, structured output',
    },
    {
      generic: 'Knows textbooks only',
      manual: 'Zero AI-powered root cause help',
      gravix: 'Knows textbooks + 5,000+ real cases',
    },
    {
      generic: 'Guesses at confidence',
      manual: 'No confidence scoring',
      gravix: 'Confidence calibrated by confirmed outcomes',
    },
    {
      generic: 'Chat transcript output',
      manual: 'Static Word doc with no AI',
      gravix: 'OEM-ready 8D PDF with audit trail',
    },
    {
      generic: 'Forgets everything',
      manual: 'Knowledge locked in one person\'s head',
      gravix: 'Cross-case pattern detection across your entire organization',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white text-center mb-4 max-w-[800px] mx-auto">
          Why engineering teams choose Gravix over generic AI and manual processes
        </h2>
        <p className="text-base text-[#64748B] text-center mb-12">
          See how Gravix compares
        </p>

        {/* Desktop: 3-column */}
        <div className="hidden md:block max-w-[1000px] mx-auto bg-brand-800 border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="grid grid-cols-3">
            {/* Headers */}
            <div className="p-4 bg-brand-800 border-b border-[#1F2937]">
              <span className="text-sm font-semibold text-[#64748B]">Generic AI (ChatGPT, etc.)</span>
            </div>
            <div className="p-4 bg-brand-800 border-b border-[#1F2937] border-l border-[#1F2937]">
              <span className="text-sm font-semibold text-[#64748B]">Manual / Templates</span>
            </div>
            <div className="p-4 bg-brand-800/80 border-b border-[#1F2937] border-l-2 border-l-accent-500">
              <span className="text-sm font-semibold text-accent-500">Gravix</span>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div key={i} className="contents">
                <div className={`p-4 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-[#64748B] mt-0.5">○</span>
                    <span className="text-sm text-[#64748B]">{row.generic}</span>
                  </div>
                </div>
                <div className={`p-4 border-l border-[#1F2937] ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-[#64748B] mt-0.5">○</span>
                    <span className="text-sm text-[#64748B]">{row.manual}</span>
                  </div>
                </div>
                <div className={`p-4 border-l-2 border-l-accent-500 bg-brand-800/80 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{row.gravix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: 2-column (Generic AI vs Gravix) */}
        <div className="md:hidden max-w-[600px] mx-auto bg-brand-800 border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-3 bg-brand-800 border-b border-[#1F2937]">
              <span className="text-xs font-semibold text-[#64748B]">Generic AI</span>
            </div>
            <div className="p-3 bg-brand-800/80 border-b border-[#1F2937] border-l-2 border-l-accent-500">
              <span className="text-xs font-semibold text-accent-500">Gravix</span>
            </div>

            {rows.map((row, i) => (
              <div key={i} className="contents">
                <div className={`p-3 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#64748B] mt-0.5 text-xs">○</span>
                    <span className="text-xs text-[#64748B]">{row.generic}</span>
                  </div>
                </div>
                <div className={`p-3 border-l-2 border-l-accent-500 bg-brand-800/80 ${i < rows.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-white">{row.gravix}</span>
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
   Component 1.9: Enterprise Social Proof
   ============================================================ */
function EnterpriseSocialProof() {
  const industries = [
    { icon: Factory, label: 'Automotive' },
    { icon: Plane, label: 'Aerospace' },
    { icon: Heart, label: 'Medical Device' },
    { icon: Cpu, label: 'Electronics' },
    { icon: HardHat, label: 'Construction' },
  ];

  return (
    <section className="py-12 bg-brand-800/30">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-8">
          Trusted by quality teams in
        </p>

        {/* Industry icons */}
        <div className="flex items-center justify-center gap-8 md:gap-12 mb-10 flex-wrap">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Icon className="w-8 h-8 text-[#94A3B8]" />
                <span className="text-xs text-[#64748B]">{ind.label}</span>
              </div>
            );
          })}
        </div>

        {/* Testimonial */}
        <div className="max-w-[600px] mx-auto">
          <p className="text-lg italic text-[#94A3B8] mb-3">
            &ldquo;Gravix cut our 8D turnaround from 2 weeks to 3 days.&rdquo;
          </p>
          <p className="text-sm text-[#64748B]">
            — Quality Manager, Tier 1 Automotive Supplier
          </p>
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
      body: 'Paste your failure description. Upload photos. Select your adhesive product. 2-3 minutes.',
    },
    {
      number: '2',
      title: 'AI diagnoses and investigates',
      body: 'Ranked root causes with confidence scores. TDS-aware analysis. Guided investigation asks follow-up questions.',
    },
    {
      number: '3',
      title: 'Track, learn, and improve',
      body: 'Report outcomes. Your data improves the next analysis. Cross-case patterns emerge. 8D workflow for teams.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white text-center mb-12">
          How it works
        </h2>

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
                <p className="text-sm text-[#94A3B8] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Component 1.7: Pricing Preview — 4 Tiers
   ============================================================ */
function PricingPreview() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      highlight: '5/month analyses',
      cta: 'Start Free',
      ctaLink: '/failure',
      ctaStyle: 'border border-[#374151] text-[#94A3B8] hover:text-white hover:border-[#4B5563]',
      borderStyle: 'border-[#1F2937]',
      badge: null,
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/mo',
      highlight: 'Unlimited analyses',
      cta: 'Start Pro →',
      ctaLink: '/pricing',
      ctaStyle: 'bg-accent-500 hover:bg-accent-600 text-white',
      borderStyle: 'border-accent-500',
      badge: '★ Most Popular',
    },
    {
      name: 'Quality',
      price: '$299',
      period: '/mo',
      highlight: '3 seats + 8D investigations',
      cta: 'Start Quality →',
      ctaLink: '/pricing',
      ctaStyle: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white',
      borderStyle: 'border-[#8B5CF6]',
      badge: null,
    },
    {
      name: 'Enterprise',
      price: '$799',
      period: '/mo',
      highlight: '10 seats + all features + API',
      cta: 'Contact Sales →',
      ctaLink: '/pricing',
      ctaStyle: 'border border-[#374151] text-[#94A3B8] hover:text-white hover:border-[#4B5563]',
      borderStyle: 'border-[#1F2937]',
      badge: null,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white mb-4">
          Plans for every team size
        </h2>
        <p className="text-base text-[#94A3B8] mb-12">
          Start free. Scale to your entire quality organization.
        </p>

        {/* 4 cards — mobile 2x2, desktop 4-col */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-[1080px] mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative bg-brand-800 border ${tier.borderStyle} rounded-xl p-5 md:p-6 text-left flex flex-col`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {tier.badge}
                </span>
              )}
              <p className="text-sm font-semibold text-white mb-1">{tier.name}</p>
              <p className="mb-3">
                <span className="text-[32px] md:text-[36px] font-bold font-mono text-white">{tier.price}</span>
                {tier.period && <span className="text-sm text-[#64748B]">{tier.period}</span>}
              </p>
              <p className="text-sm text-[#94A3B8] mb-6 flex-1">{tier.highlight}</p>
              <Link
                href={tier.ctaLink}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${tier.ctaStyle}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <Link href="/pricing" className="inline-block mt-8 text-sm text-accent-500 hover:underline">
          See full plan comparison →
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
        <h2 className="text-[28px] md:text-[32px] font-bold text-white mb-4">
          Ready to stop guessing at root causes?
        </h2>
        <p className="text-base text-[#94A3B8] mb-2">
          Start with 5 free analyses. No credit card required.
        </p>
        <p className="text-base text-[#94A3B8] mb-8">
          Quality teams: get audit-ready 8D reports in hours, not days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/failure"
            className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white text-base font-medium px-10 py-4 rounded-lg transition-colors"
          >
            Start Free →
          </Link>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-500/20 bg-accent-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
          </span>
          <span className="text-sm text-[#94A3B8]">
            Alpha — early access for a limited number of users
          </span>
        </div>
      </div>
    </section>
  );
}
