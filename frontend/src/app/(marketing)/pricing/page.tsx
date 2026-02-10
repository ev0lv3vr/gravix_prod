import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PRICING_TIERS } from '@/lib/constants';
import { CheckCircle } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade as you grow. All plans include full access to our AI engine.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={tier.popular ? 'border-primary shadow-lg scale-105' : ''}
            >
              {tier.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground text-sm ml-2">
                      {tier.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-4">
                  {typeof tier.analyses === 'number'
                    ? `${tier.analyses} analyses`
                    : tier.analyses}{' '}
                  +{' '}
                  {typeof tier.specs === 'number'
                    ? `${tier.specs} specs`
                    : tier.specs}
                  /month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={tier.name === 'Free' ? '/signup' : '/contact'}>
                    {tier.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  What counts as an analysis or spec?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Each submission of a failure analysis form or spec request form
                  counts as one use. You can view and download results unlimited times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Can I upgrade or downgrade anytime?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Yes! You can change your plan anytime. Upgrades take effect immediately.
                  Downgrades take effect at the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Do unused analyses roll over?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  No, your monthly allocation resets on your billing date. We recommend
                  upgrading if you consistently hit your limit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What about Enterprise?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Enterprise plans include unlimited usage, SSO, custom integrations,
                  dedicated support, and SLA guarantees. Contact sales for custom pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
