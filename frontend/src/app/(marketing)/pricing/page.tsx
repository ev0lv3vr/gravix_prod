'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, ChevronDown, ChevronUp, Star, Calculator, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

/* ──────────────────────────── plan data ──────────────────────────── */

interface PlanFeature {
  text: string;
  included: boolean;
  bold?: boolean;
}

interface PlanData {
  name: string;
  persona: string;
  price: number;
  period?: string;
  seatInfo?: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaAction: 'link' | 'checkout' | 'contact';
  ctaHref?: string;
  priceEnvKey?: string;
  accent: 'default' | 'blue' | 'purple' | 'ghost';
  badge?: string;
  popular?: boolean;
}

const PLANS: PlanData[] = [
  {
    name: 'Free',
    persona: 'For evaluation',
    price: 0,
    features: [
      { text: '5 failure analyses per month', included: true },
      { text: '5 spec analyses per month', included: true },
      { text: 'Account required', included: true },
      { text: 'No 8D', included: false },
      { text: 'No team features', included: false },
    ],
    ctaLabel: 'Start Free',
    ctaAction: 'link',
    ctaHref: '/tool',
    accent: 'default',
  },
  {
    name: 'Pro',
    persona: 'For individual engineers',
    price: 79,
    period: '/mo',
    features: [
      { text: 'Unlimited analyses', included: true, bold: true },
      { text: 'Unlimited spec analyses', included: true },
      { text: 'Visual AI analysis', included: true },
      { text: 'TDS-aware diagnostics', included: true },
      { text: 'Guided investigation', included: true },
      { text: 'Full analysis history', included: true },
      { text: 'PDF export', included: true },
      { text: 'No 8D', included: false },
      { text: 'No team features', included: false },
    ],
    ctaLabel: 'Start Pro →',
    ctaAction: 'checkout',
    priceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO',
    accent: 'blue',
    badge: '★ Most Popular',
    popular: true,
  },
  {
    name: 'Quality',
    persona: 'For quality teams running 8D',
    price: 299,
    period: '/mo',
    seatInfo: '3 seats included',
    features: [
      { text: 'Everything in Pro, plus:', included: true, bold: true },
      { text: '8D investigations', included: true },
      { text: '3 seats (+$79/ea extra)', included: true },
      { text: 'Photo annotation', included: true },
      { text: 'Team comments', included: true },
      { text: 'Audit log (view)', included: true },
      { text: '1 inbound email address', included: true },
      { text: 'Email + in-app notifications', included: true },
      { text: 'Generic 8D + 1 OEM template', included: true },
      { text: '5 shareable links', included: true },
    ],
    ctaLabel: 'Start Quality →',
    ctaAction: 'checkout',
    priceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_ID_QUALITY',
    accent: 'purple',
  },
  {
    name: 'Enterprise',
    persona: 'For quality departments',
    price: 799,
    period: '/mo',
    seatInfo: '10 seats included',
    features: [
      { text: 'Everything in Quality, plus:', included: true, bold: true },
      { text: '10 seats (+$49/ea extra)', included: true },
      { text: 'All OEM templates', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Pattern alerts', included: true },
      { text: 'Cross-vendor comparison', included: true },
      { text: 'API access', included: true },
      { text: 'SSO / SAML', included: true },
      { text: 'Dedicated support', included: true },
    ],
    ctaLabel: 'Contact Sales →',
    ctaAction: 'contact',
    ctaHref: 'mailto:sales@gravix.com?subject=Enterprise%20Plan%20Inquiry',
    accent: 'ghost',
  },
];

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What counts as an analysis?',
    answer:
      'Each failure diagnosis, spec request, or guided investigation session counts as one analysis. Photo uploads within an analysis don\'t count separately.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Cancel from Settings. You keep access until billing period ends.',
  },
  {
    question: "What's the difference between Pro and Quality?",
    answer:
      'Pro is for individual engineers running failure analyses and specs. Quality adds 8D investigation management, team collaboration (3 seats), OEM report templates, audit logging, and notifications — everything quality departments need for IATF 16949 and ISO 13485 compliance.',
  },
  {
    question: 'How do extra seats work?',
    answer:
      'Quality includes 3 seats ($79/ea additional). Enterprise includes 10 seats ($49/ea additional). Each seat is a full user who can run analyses and participate in investigations.',
  },
  {
    question: 'Is my data secure and compliant?',
    answer:
      'All data encrypted in transit (TLS 1.3) and at rest (AES-256). Audit log is immutable and append-only. SOC 2 Type II certification planned.',
  },
  {
    question: 'Do you integrate with our QMS?',
    answer:
      'Enterprise plans include API access for integration with existing Quality Management Systems. Contact us for specific integration requirements.',
  },
  {
    question: 'What OEM report templates are available?',
    answer:
      'Generic 8D, Ford Global 8D, VDA 8D, A3 Report, and AS9100 CAPA. Quality plans get Generic + 1 OEM template. Enterprise gets all templates + custom branding.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'Coming soon with 20% discount. Contact sales for early access to annual plans.',
  },
];

/* ──────────────────────────── page ──────────────────────────── */

export default function PricingPage() {
  const { session } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingCheckoutRef = useRef<{ priceEnvKey: string } | null>(null);

  const handleCheckout = useCallback(
    async (priceEnvKey: string) => {
      setLoadingPlan(priceEnvKey);
      try {
        const token = session?.access_token;
        if (!token) {
          pendingCheckoutRef.current = { priceEnvKey };
          setShowAuthModal(true);
          setLoadingPlan(null);
          return;
        }
        const response = await fetch(`${API_URL}/billing/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price_id: process.env[priceEnvKey] || undefined,
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
        setLoadingPlan(null);
      }
    },
    [session?.access_token],
  );

  // After auth completes, retry the pending checkout
  useEffect(() => {
    if (session?.access_token && pendingCheckoutRef.current) {
      const { priceEnvKey } = pendingCheckoutRef.current;
      pendingCheckoutRef.current = null;
      setShowAuthModal(false);
      handleCheckout(priceEnvKey);
    }
  }, [session?.access_token, handleCheckout]);

  const handlePlanCTA = (plan: PlanData) => {
    if (plan.ctaAction === 'link' && plan.ctaHref) {
      window.location.href = plan.ctaHref;
    } else if (plan.ctaAction === 'contact' && plan.ctaHref) {
      window.location.href = plan.ctaHref;
    } else if (plan.ctaAction === 'checkout' && plan.priceEnvKey) {
      handleCheckout(plan.priceEnvKey);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <Header />

      <div className="container mx-auto px-6 py-20">
        {/* ─── Page Header (Component 4.1) ─── */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4 max-w-2xl mx-auto leading-tight">
            Plans for individual engineers and quality departments
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-xl mx-auto">
            Start free. Scale to your entire quality organization.
          </p>
        </div>

        {/* ─── Pricing Cards (Component 4.2) ─── */}
        {/* Mobile: vertical stack Pro first. Tablet: 2×2. Desktop: 4 cols */}
        <div className="max-w-[1200px] mx-auto mb-16">
          {/* Mobile order: Pro, Quality, Free, Enterprise */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Render in desktop order, use CSS order for mobile */}
            {PLANS.map((plan, idx) => {
              const mobileOrder =
                plan.name === 'Pro' ? 1 :
                plan.name === 'Quality' ? 2 :
                plan.name === 'Free' ? 3 :
                4;
              const isLoading = loadingPlan === plan.priceEnvKey;

              return (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  mobileOrder={mobileOrder}
                  desktopOrder={idx + 1}
                  isLoading={isLoading}
                  onCTA={() => handlePlanCTA(plan)}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Enterprise ROI CTA (Component 4.3) ─── */}
        <div className="max-w-[800px] mx-auto mb-20">
          <div className="bg-brand-800/50 border border-[#1F2937] rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <Calculator className="w-8 h-8 text-accent-500" />
            </div>
            <p className="text-base text-[#94A3B8] max-w-xl mx-auto mb-6 leading-relaxed">
              <span className="text-white font-semibold">💡 One Gravix-diagnosed failure</span> preventing
              a production line shutdown saves $5,000–50,000. Pro pays for itself with a single
              avoided incident.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="mailto:sales@gravix.com?subject=ROI%20Calculation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Calculate your ROI →
              </Link>
              <Link
                href="mailto:sales@gravix.com?subject=Demo%20Request"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500 rounded-lg text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book a demo →
              </Link>
            </div>
          </div>
        </div>

        {/* ─── FAQ Accordion (Component 4.4) ─── */}
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}

/* ──────────────────────────── Pricing Card ──────────────────────────── */

function PricingCard({
  plan,
  mobileOrder,
  desktopOrder: _desktopOrder,
  isLoading,
  onCTA,
}: {
  plan: PlanData;
  mobileOrder: number;
  desktopOrder: number;
  isLoading: boolean;
  onCTA: () => void;
}) {
  const borderClass =
    plan.accent === 'blue'
      ? 'border-2 border-[#3B82F6]'
      : plan.accent === 'purple'
        ? 'border border-[#8B5CF6]'
        : 'border border-[#1F2937]';

  const scaleClass = plan.popular ? 'lg:scale-[1.02]' : '';

  const ctaClass =
    plan.accent === 'blue'
      ? 'bg-accent-500 hover:bg-accent-600 text-white'
      : plan.accent === 'purple'
        ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
        : plan.accent === 'ghost'
          ? 'border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500'
          : 'border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500';

  return (
    <div
      className={`bg-brand-800 rounded-xl p-8 relative flex flex-col ${borderClass} ${scaleClass}`}
      style={{ order: `var(--mobile-order, ${mobileOrder})` } as React.CSSProperties}
    >
      <style jsx>{`
        @media (max-width: 767px) {
          div { --mobile-order: ${mobileOrder}; order: ${mobileOrder}; }
        }
        @media (min-width: 768px) {
          div { order: 0; }
        }
      `}</style>

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 whitespace-nowrap">
          <Star className="w-3 h-3" /> {plan.badge.replace('★ ', '')}
        </div>
      )}

      {/* Plan Name */}
      <p className="text-sm uppercase tracking-wider text-[#64748B] font-medium">{plan.name}</p>

      {/* Persona */}
      <p className="text-[13px] italic text-[#64748B] mb-4">{plan.persona}</p>

      {/* Price */}
      <div className="mb-2">
        <span className="text-[48px] font-bold text-white font-mono leading-none">
          ${plan.price}
        </span>
        {plan.period && (
          <span className="text-sm text-[#64748B] ml-1">{plan.period}</span>
        )}
      </div>

      {/* Seat info */}
      {plan.seatInfo && (
        <p className="text-sm text-[#94A3B8] mb-4">{plan.seatInfo}</p>
      )}
      {!plan.seatInfo && <div className="mb-4" />}

      {/* Feature list */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <PricingFeature key={f.text} included={f.included} text={f.text} bold={f.bold} />
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCTA}
        disabled={isLoading}
        data-testid={`upgrade-${plan.name.toLowerCase()}`}
        className={`block w-full text-center py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${ctaClass}`}
      >
        {isLoading ? 'Loading…' : plan.ctaLabel}
      </button>
    </div>
  );
}

/* ──────────────────────────── helpers ──────────────────────────── */

function PricingFeature({ included, text, bold = false }: { included: boolean; text: string; bold?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <span className="w-4 h-4 flex items-center justify-center text-[#64748B] flex-shrink-0 mt-0.5">○</span>
      )}
      <span className={included ? (bold ? 'text-white font-medium' : 'text-white') : 'text-[#64748B]'}>
        {text}
      </span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left flex items-center justify-between hover:bg-[#1F2937] transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[#64748B] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#64748B] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-[#94A3B8] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
