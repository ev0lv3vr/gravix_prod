'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

export default function PricingPage() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleProCheckout = async () => {
    setIsLoading(true);
    try {
      const token = session?.access_token;
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || undefined,
          success_url: `${window.location.origin}/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/pricing?checkout=cancel`,
        }),
      });
      if (!response.ok) throw new Error('Checkout failed');
      const data = await response.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20">
        {/* Component 4.1: Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-base text-[#94A3B8] max-w-xl mx-auto">
            Start free. Upgrade when you need full reports and unlimited analyses.
          </p>
        </div>

        {/* Component 4.2: Pricing Cards (3 cards) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-[1080px] mx-auto mb-16">
          {/* Free */}
          <div className="bg-brand-800 border border-[#1F2937] rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
            </div>
            <p className="text-sm text-[#94A3B8] mb-6">5 analyses/month</p>
            <ul className="space-y-3 mb-8">
              <PricingFeature included text="Full AI results" />
              <PricingFeature included text="Watermarked PDF" />
              <PricingFeature included text="Last 5 analyses" />
              <PricingFeature included={false} text="Preview exec summary" />
            </ul>
            <Link href="/tool" className="block w-full text-center border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500 py-3 rounded-lg text-sm font-medium transition-colors">
              Start Free
            </Link>
          </div>

          {/* Pro — highlighted */}
          <div className="bg-brand-800 border-2 border-accent-500 rounded-xl p-8 relative scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-sm text-[#64748B] ml-1">/mo</span>
            </div>
            <p className="text-sm text-[#94A3B8] mb-6">Unlimited analyses</p>
            <ul className="space-y-3 mb-8">
              <PricingFeature included text="Everything in Free, plus:" bold />
              <PricingFeature included text="Full exec summary" />
              <PricingFeature included text="Clean PDF" />
              <PricingFeature included text="Full history" />
              <PricingFeature included text="Similar cases detail" />
              <PricingFeature included text="Priority processing" />
            </ul>
            <button
              onClick={handleProCheckout}
              disabled={isLoading}
              className="block w-full text-center bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading…' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Team */}
          <div className="bg-brand-800 border border-[#1F2937] rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Team</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$149</span>
              <span className="text-sm text-[#64748B] ml-1">/mo</span>
            </div>
            <p className="text-sm text-[#94A3B8] mb-6">Unlimited analyses</p>
            <ul className="space-y-3 mb-8">
              <PricingFeature included text="Everything in Pro, plus:" bold />
              <PricingFeature included text="5 team seats" />
              <PricingFeature included text="Shared workspace" />
              <PricingFeature included text="API access" />
              <PricingFeature included text="Branded reports" />
            </ul>
            <a href="mailto:sales@gravix.ai" className="block w-full text-center border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500 py-3 rounded-lg text-sm font-medium transition-colors">
              Contact Sales
            </a>
          </div>
        </div>

        {/* Component 4.3: Enterprise CTA */}
        <div className="text-center mb-20">
          <p className="text-base text-[#94A3B8]">
            Need unlimited access, SSO, or dedicated support?{' '}
            <a href="mailto:enterprise@gravix.ai" className="text-accent-500 hover:underline">Contact us for Enterprise pricing →</a>
          </p>
        </div>

        {/* Component 4.4: FAQ Accordion */}
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <FAQItem
              question="What counts as an analysis?"
              answer="Each submission of a failure analysis form or spec request form counts as one analysis. You can view and download results unlimited times after generation."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription anytime. Your access continues until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. All payments are secure and encrypted."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. All data is encrypted in transit and at rest. We never share your analysis data with third parties. Analysis data used to improve models is fully anonymized."
            />
            <FAQItem
              question="What's in the executive summary?"
              answer="The executive summary includes a professional overview suitable for engineering change orders: methodology, confidence analysis, risk factors, and recommended next steps."
            />
            <FAQItem
              question="Do you offer annual billing?"
              answer="Annual billing is coming soon with a 20% discount. Contact us if you'd like to be notified when it's available."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PricingFeature({ included, text, bold = false }: { included: boolean; text: string; bold?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-success flex-shrink-0" />
      ) : (
        <span className="w-4 h-4 flex items-center justify-center text-[#64748B] flex-shrink-0">○</span>
      )}
      <span className={included ? (bold ? 'text-white font-medium' : 'text-white') : 'text-[#64748B]'}>{text}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left flex items-center justify-between hover:bg-[#1F2937] transition-colors">
        <span className="font-semibold text-white pr-4">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#64748B] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#64748B] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-[#94A3B8] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
