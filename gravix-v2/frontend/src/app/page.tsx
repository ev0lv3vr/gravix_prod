'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UserX, FileWarning, DollarSign, Clock, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-900">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  );
}

function HeroSection() {
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !mockupRef.current) return;

    setTimeout(() => {
      mockupRef.current?.classList.add('animate-in');
    }, 300);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900" />

      {/* Grid Pattern Overlay */}
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

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="space-y-6">
            {/* Badge */}
            <Badge
              variant="accent"
              className="inline-block px-4 py-2 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold"
            >
              Vendor-Neutral Adhesive Intelligence
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary max-w-[640px] leading-tight">
              Specify industrial adhesives in seconds.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-text-secondary max-w-[520px]">
              AI-powered spec engine and failure analysis. No vendor bias. No guesswork.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" size="xl" asChild>
                <Link href="/tool">
                  Try Spec Tool <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="xl" asChild>
                <Link href="/failure">Diagnose a Failure</Link>
              </Button>
            </div>

            {/* Trust Line */}
            <p className="text-xs text-text-tertiary pt-2">
              Free. No signup required for first 3 analyses.
            </p>
          </div>

          {/* Right Side: Mockup Card (Desktop Only) */}
          <div className="hidden lg:block">
            <div
              ref={mockupRef}
              className="opacity-0 translate-x-20 transition-all duration-[600ms] ease-out-crisp"
              style={{
                perspective: '1000px',
              }}
            >
              <div
                className="transform"
                style={{
                  transform: 'rotateY(-5deg) rotateX(2deg)',
                }}
              >
                <Card className="bg-surface-1 border-t-[3px] border-t-accent-500 p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-text-tertiary mb-1">
                        Recommended Adhesive
                      </div>
                      <div className="text-xl font-bold text-text-primary">
                        Two-Part Epoxy
                      </div>
                    </div>
                    <Badge variant="success" className="font-mono font-semibold">
                      94%
                    </Badge>
                  </div>

                  {/* Properties */}
                  <div className="space-y-2 font-mono text-sm border-t border-brand-600 pt-4">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Cure Time:</span>
                      <span className="text-text-primary">24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Max Temp:</span>
                      <span className="text-text-primary">150°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Tensile Str:</span>
                      <span className="text-text-primary">3,200 PSI</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
}

function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.current.querySelectorAll('.problem-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-brand-800 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Why adhesive decisions fail
          </h2>
          <p className="text-base text-text-secondary">
            The current process is broken
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Problem Card 1 */}
          <div className="problem-card opacity-0 translate-y-5 transition-all duration-slow ease-out-crisp">
            <Card className="bg-surface-1 border-t-2 border-t-danger p-6 h-full">
              <UserX className="h-8 w-8 text-danger mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Vendor Bias
              </h3>
              <p className="text-sm text-text-secondary">
                Sales reps recommend what they sell, not what you need. Objective advice is impossible.
              </p>
            </Card>
          </div>

          {/* Problem Card 2 */}
          <div className="problem-card opacity-0 translate-y-5 transition-all duration-slow ease-out-crisp" style={{ transitionDelay: '100ms' }}>
            <Card className="bg-surface-1 border-t-2 border-t-danger p-6 h-full">
              <FileWarning className="h-8 w-8 text-danger mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Incomplete Data
              </h3>
              <p className="text-sm text-text-secondary">
                Technical datasheets vary wildly. Critical properties are missing or buried in footnotes.
              </p>
            </Card>
          </div>

          {/* Problem Card 3 */}
          <div className="problem-card opacity-0 translate-y-5 transition-all duration-slow ease-out-crisp" style={{ transitionDelay: '200ms' }}>
            <Card className="bg-surface-1 border-t-2 border-t-danger p-6 h-full">
              <DollarSign className="h-8 w-8 text-danger mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Costly Failures
              </h3>
              <p className="text-sm text-text-secondary">
                Average adhesive failure costs $12K-$150K in downtime, scrap, and rework. Small mistakes, huge impact.
              </p>
            </Card>
          </div>

          {/* Problem Card 4 */}
          <div className="problem-card opacity-0 translate-y-5 transition-all duration-slow ease-out-crisp" style={{ transitionDelay: '300ms' }}>
            <Card className="bg-surface-1 border-t-2 border-t-danger p-6 h-full">
              <Clock className="h-8 w-8 text-danger mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Slow Resolution
              </h3>
              <p className="text-sm text-text-secondary">
                Consultants take weeks to schedule. Lab tests take days. Production sits idle while you wait.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .problem-card.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="bg-brand-900 py-20">
      <div className="container mx-auto px-6 space-y-20">
        {/* Feature 1: Spec Engine */}
        <FeatureBlock
          badge="SPEC ENGINE"
          title="Instant adhesive specifications"
          description="Enter your substrates, environment, and constraints. Get a vendor-neutral spec with confidence scores in under 15 seconds."
          ctaText="Try the Spec Tool →"
          ctaHref="/tool"
          imagePosition="right"
        />

        {/* Feature 2: Failure Analysis */}
        <FeatureBlock
          badge="FAILURE ANALYSIS"
          title="Root cause in minutes, not weeks"
          description="Describe the failure, substrates, and conditions. AI ranks root causes by probability with detailed explanations and immediate actions."
          ctaText="Diagnose a Failure →"
          ctaHref="/failure"
          imagePosition="left"
        />

        {/* Feature 3: Executive Summary */}
        <FeatureBlock
          badge="EXECUTIVE SUMMARY"
          title="Decisions your VP can approve"
          description="Download professional PDF reports with methodology, confidence intervals, and risk analysis. Built for engineering change orders."
          ctaText="See Pricing →"
          ctaHref="/pricing"
          imagePosition="right"
        />
      </div>
    </section>
  );
}

function FeatureBlock({
  badge,
  title,
  description,
  ctaText,
  ctaHref,
  imagePosition,
}: {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imagePosition: 'left' | 'right';
}) {
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !blockRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(blockRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className={`grid lg:grid-cols-2 gap-12 items-center opacity-0 translate-y-5 transition-all duration-slow ease-out-crisp ${
        imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
      }`}
    >
      {/* Content */}
      <div className={imagePosition === 'left' ? 'lg:order-2' : ''}>
        <Badge
          variant="accent"
          className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 uppercase text-xs tracking-[1.5px] font-semibold mb-4"
        >
          {badge}
        </Badge>
        <h3 className="text-3xl font-bold text-text-primary mb-4">{title}</h3>
        <p className="text-lg text-text-secondary mb-6">{description}</p>
        <Button variant="secondary" size="lg" asChild>
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      </div>

      {/* Mockup */}
      <div className={imagePosition === 'left' ? 'lg:order-1' : ''}>
        <Card className="bg-surface-1 border-t-[3px] border-t-accent-500 p-6">
          <div className="aspect-video bg-brand-700 rounded flex items-center justify-center">
            <div className="text-text-tertiary text-sm">Feature Mockup</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SocialProofSection() {
  return (
    <section className="bg-brand-800 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-[32px] font-mono font-bold text-text-primary mb-2">
              30+
            </div>
            <div className="text-sm text-text-secondary">substrates</div>
          </div>
          <div>
            <div className="text-[32px] font-mono font-bold text-text-primary mb-2">
              7
            </div>
            <div className="text-sm text-text-secondary">adhesive categories</div>
          </div>
          <div>
            <div className="text-[32px] font-mono font-bold text-text-primary mb-2">
              150+
            </div>
            <div className="text-sm text-text-secondary">failure mode patterns</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-800 via-brand-900 to-brand-900" />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Stop guessing. Start specifying.
        </h2>

        {/* Email Capture */}
        <div className="max-w-[480px] mx-auto mb-4">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="engineer@company.com"
              className="flex-1 h-12 px-4 bg-brand-800 border border-brand-600 rounded text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </div>
        </div>

        {/* Alternative CTA */}
        <Link
          href="/tool"
          className="inline-block text-sm text-accent-500 hover:text-accent-600 transition-colors"
        >
          Or try the tool now — no signup needed
        </Link>
      </div>
    </section>
  );
}
