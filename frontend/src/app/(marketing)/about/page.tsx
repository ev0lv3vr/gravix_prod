'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">About Gravix</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-[#94A3B8] leading-relaxed text-base">
            Gravix is an AI-powered industrial materials intelligence platform built for engineers,
            manufacturers, and adhesive professionals who need answers — not guesswork.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">The Problem</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Industrial adhesive selection is still mostly trial-and-error. Engineers waste weeks testing
            the wrong products, manufacturers deal with costly bond failures on the production line, and
            generic AI tools don&apos;t understand the nuances of substrate chemistry, cure profiles, or
            real-world environmental stresses.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Our Solution</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Gravix combines deep materials science knowledge with a self-learning AI engine. Every
            confirmed production outcome — every success, every failure — makes our recommendations
            smarter. Unlike generic chatbots, Gravix is purpose-built for industrial adhesive
            applications, with structured analysis that accounts for substrate pairs, environmental
            conditions, load types, and regulatory requirements.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">What We Offer</h2>
          <ul className="space-y-3 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span><strong className="text-white">Spec Engine</strong> — Get precise adhesive specifications for any substrate pair and application</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span><strong className="text-white">Failure Analysis</strong> — Diagnose bond failures with root cause identification and corrective actions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span><strong className="text-white">Case Library</strong> — Browse real-world industrial bonding cases and learn from proven solutions</span>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Built by Practitioners</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Gravix was founded by people who&apos;ve lived this problem — years of experience in
            industrial adhesives, manufacturing, and materials science. We built the tool we wished
            existed.
          </p>

          <div className="mt-12 pt-8 border-t border-[#1F2937]">
            <p className="text-[#94A3B8] leading-relaxed">
              Questions? Reach out at{' '}
              <a href="mailto:hello@gravix.com" className="text-accent-500 hover:underline">hello@gravix.com</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
