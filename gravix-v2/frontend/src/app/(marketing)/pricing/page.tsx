'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://gravix-prod.onrender.com';

export default function PricingPage() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleProCheckout = async () => {
    setIsLoading(true);

    try {
      const token = session?.access_token;
      const response = await fetch(`${BACKEND_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tier: 'pro',
          success_url: `${window.location.origin}/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/pricing?checkout=cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-900">
      <Header />

      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Start free. Upgrade as you grow. All plans include full access to our AI engine.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {/* Free Card */}
          <Card className="bg-surface-1 border border-brand-600">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-text-primary">$0</span>
                <span className="text-text-tertiary text-sm ml-2">forever</span>
              </div>
              <CardDescription className="mt-4 text-base">
                3 analyses per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary">Full spec results</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary">Root cause analysis</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <X className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Watermarked PDF exports</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <X className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <span className="text-text-secondary">No executive summary</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <X className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <span className="text-text-secondary">No analysis history</span>
                </li>
              </ul>
              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link href="/tool">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Card */}
          <Card className="bg-surface-2 border-t-[3px] border-t-accent-500 border-x border-b border-brand-600 relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-accent-500 text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
            </div>

            <CardHeader className="pt-8">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-text-primary">$29</span>
                <span className="text-text-tertiary text-sm ml-2">per month</span>
              </div>
              <CardDescription className="mt-4 text-base">
                Unlimited analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Unlimited analyses</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Full executive summary</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Clean PDF reports</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Full analysis history</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">Priority support</span>
                </li>
              </ul>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleProCheckout}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Start Pro Trial'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}

function FAQSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        <FAQItem
          question="What counts as an analysis?"
          answer="Each submission of a failure analysis form or spec request form counts as one use. You can view and download results unlimited times after generation."
        />
        <FAQItem
          question="Can I upgrade or downgrade anytime?"
          answer="Yes! You can change your plan anytime. Upgrades take effect immediately. Downgrades take effect at the end of your billing period."
        />
        <FAQItem
          question="Do unused analyses roll over?"
          answer="No, your monthly allocation resets on your billing date. We recommend upgrading if you consistently hit your limit."
        />
        <FAQItem
          question="What's included in the executive summary?"
          answer="The executive summary includes detailed risk analysis, decision frameworks, cost-benefit analysis, and professional formatting suitable for engineering change orders and management approval."
        />
        <FAQItem
          question="How does billing work?"
          answer="We use Stripe for secure billing. You'll be charged monthly on the date you subscribe. Cancel anytime with no long-term commitment."
        />
        <FAQItem
          question="What about Enterprise plans?"
          answer="Enterprise plans include unlimited usage, SSO, custom integrations, dedicated support, and SLA guarantees. Contact sales for custom pricing."
        />
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-surface-1 border border-brand-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-brand-700 transition-colors rounded"
      >
        <span className="font-semibold text-text-primary pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-secondary shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-secondary shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-text-secondary">{answer}</p>
        </div>
      )}
    </Card>
  );
}
