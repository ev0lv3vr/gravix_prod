'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-[#94A3B8] leading-relaxed">
            Last updated: February 2026
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            By accessing or using Gravix (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Description of Service</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Gravix provides AI-powered failure analysis and material specification tools for industrial
            adhesives, sealants, and coatings. Our analyses are provided as engineering guidance and should
            be validated through appropriate testing before production implementation.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Disclaimer</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Gravix analyses are AI-generated recommendations and do not constitute professional engineering
            advice. Results should be verified through physical testing appropriate to your application.
            Gravix is not liable for production outcomes based on our recommendations.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. User Accounts</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials.
            You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Subscription and Billing</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Paid plans are billed monthly through Stripe. You may cancel your subscription at any time.
            Access continues until the end of your current billing period. Refunds are handled on a
            case-by-case basis.
          </p>
          <ul className="text-[#94A3B8] list-disc pl-6 space-y-1">
            <li>Free: 5 analyses/specs per month</li>
            <li>Pro ($49/mo): Unlimited analyses and specs</li>
            <li>Team ($149/mo): Unlimited analyses, 5 seats, shared workspace</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Intellectual Property</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            You retain ownership of all data you submit to Gravix. We retain the right to use anonymized,
            aggregated data to improve our models. The Gravix platform, including its AI models and
            interface, remains our intellectual property.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Limitation of Liability</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            To the maximum extent permitted by law, Gravix shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use of or inability to use the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Contact</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            For questions about these terms, contact us at{' '}
            <a href="mailto:legal@gravix.com" className="text-accent-500 hover:underline">legal@gravix.com</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
