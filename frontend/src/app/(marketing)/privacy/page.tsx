import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />
      <div className="container mx-auto px-6 py-20 max-w-[720px] flex-1">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-[#94A3B8]">
          <p>
            <strong className="text-white">Effective Date:</strong> January 1, 2026
          </p>
          <p>
            Gravix (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting
            your privacy. This policy explains how we collect, use, and safeguard
            your information when you use our platform.
          </p>
          <h2 className="text-lg font-semibold text-white">Data We Collect</h2>
          <p>
            We collect the information you provide when creating an account (email address),
            submitting analyses (material data, failure descriptions), and using our services.
          </p>
          <h2 className="text-lg font-semibold text-white">How We Use Your Data</h2>
          <p>
            Your data is used to provide AI-powered analysis results, improve our models
            (anonymized only), and manage your account. We never sell your data to third
            parties.
          </p>
          <h2 className="text-lg font-semibold text-white">Data Security</h2>
          <p>
            All data is encrypted in transit (TLS) and at rest. We use industry-standard
            security practices and regularly audit our infrastructure.
          </p>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            Questions about this policy? Email us at{' '}
            <a href="mailto:privacy@gravix.ai" className="text-accent-500 hover:underline">
              privacy@gravix.ai
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
