import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />
      <div className="container mx-auto px-6 py-20 max-w-[720px] flex-1">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-[#94A3B8]">
          <p>
            <strong className="text-white">Effective Date:</strong> January 1, 2026
          </p>
          <p>
            By using Gravix (&quot;the Service&quot;), you agree to these terms. If you do not
            agree, please do not use the Service.
          </p>
          <h2 className="text-lg font-semibold text-white">Use of Service</h2>
          <p>
            Gravix provides AI-powered adhesive specification and failure analysis tools.
            Results are advisory and should be verified by qualified engineers before
            implementation in production environments.
          </p>
          <h2 className="text-lg font-semibold text-white">Account Responsibility</h2>
          <p>
            You are responsible for maintaining the security of your account credentials
            and for all activity under your account.
          </p>
          <h2 className="text-lg font-semibold text-white">Limitation of Liability</h2>
          <p>
            Gravix is provided &quot;as is&quot; without warranty. We are not liable for
            production decisions made based on our analysis outputs. Always validate
            recommendations through appropriate testing.
          </p>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            Questions about these terms? Email us at{' '}
            <a href="mailto:legal@gravix.ai" className="text-accent-500 hover:underline">
              legal@gravix.ai
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
