'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-[#94A3B8] leading-relaxed">
            Last updated: February 2026
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            When you use Gravix, we collect information you provide directly, including your email address,
            name, company information, and the technical data you submit for analysis (material types,
            failure descriptions, substrate information, etc.).
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            We use your information to provide and improve our services, including generating failure analyses
            and material specifications. Analysis data may be used in anonymized, aggregated form to improve
            our AI models. We never share your individual analysis data with third parties.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Data Security</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            All data is encrypted in transit (TLS 1.3) and at rest. We use Supabase for data storage with
            row-level security policies. Access to production data is restricted to authorized personnel only.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Retention</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Your analysis data is retained for the duration of your account. Free tier users&apos; analyses
            are retained for 90 days. You can request deletion of your data at any time by contacting us.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Third-Party Services</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            We use the following third-party services: Supabase (database and authentication),
            Anthropic Claude (AI analysis), Stripe (payment processing), and Vercel (hosting).
            Each service has its own privacy policy.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Your Rights</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            You have the right to access, correct, or delete your personal data. You can manage your account
            settings or contact us at privacy@gravix.ai for data requests.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Contact Us</h2>
          <p className="text-[#94A3B8] leading-relaxed">
            For questions about this privacy policy, please contact us at{' '}
            <a href="mailto:privacy@gravix.ai" className="text-accent-500 hover:underline">privacy@gravix.ai</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
