'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-[#94A3B8] leading-relaxed text-base">
            Have questions about Gravix, need help with your account, or want to discuss an enterprise plan?
            We&apos;d love to hear from you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-[#0F1D32] rounded-lg p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-2">General Inquiries</h3>
              <a href="mailto:hello@gravix.com" className="text-accent-500 hover:underline text-sm">
                hello@gravix.com
              </a>
            </div>

            <div className="bg-[#0F1D32] rounded-lg p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-2">Technical Support</h3>
              <a href="mailto:support@gravix.com" className="text-accent-500 hover:underline text-sm">
                support@gravix.com
              </a>
            </div>

            <div className="bg-[#0F1D32] rounded-lg p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-2">Enterprise &amp; API</h3>
              <a href="mailto:sales@gravix.com" className="text-accent-500 hover:underline text-sm">
                sales@gravix.com
              </a>
            </div>

            <div className="bg-[#0F1D32] rounded-lg p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-2">Privacy &amp; Data</h3>
              <a href="mailto:privacy@gravix.com" className="text-accent-500 hover:underline text-sm">
                privacy@gravix.com
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#1F2937]">
            <h2 className="text-xl font-semibold text-white mb-4">Response Times</h2>
            <p className="text-[#94A3B8] leading-relaxed">
              We typically respond within 24 hours on business days. Enterprise and API inquiries
              are prioritized.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
