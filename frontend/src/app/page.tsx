import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PRICING_TIERS } from '@/lib/constants';
import { ArrowRight, CheckCircle, Zap, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 md:py-32">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Materials Intelligence
        </Badge>

        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Specify industrial materials
          <br />
          with confidence.
        </h1>

        <p className="max-w-2xl text-center text-xl text-muted-foreground">
          Diagnose adhesive, sealant, and coating failures in minutes. Generate
          vendor-neutral specifications for your next project.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/cases">Browse Case Library</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Free tier: 2 analyses + 2 specs per month. No credit card required.
        </p>
      </section>

      {/* Problem Statement */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">
              When production stops, you need answers NOW
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Traditional approaches waste time and money:
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">❌ Old Way</CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-2 text-sm">
                  <p>• Call adhesive vendor (biased, blame-shifting)</p>
                  <p>• Google search (generic, unreliable)</p>
                  <p>• Internal testing ($500-5000+, days/weeks)</p>
                  <p>• Hire consultant ($200-500/hr, weeks to schedule)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">✅ Gravix</CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-2 text-sm">
                  <p>• AI-powered analysis in &lt;15 seconds</p>
                  <p>• Vendor-neutral recommendations</p>
                  <p>• Ranked root causes with confidence %</p>
                  <p>• Starting at $0/month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid gap-12 md:grid-cols-2">
          {/* Failure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Failure Analysis Engine</CardTitle>
              <CardDescription>
                Something broke? Get root cause analysis instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Describe the failure</h4>
                  <p className="text-sm text-muted-foreground">
                    Multi-step form captures material type, failure mode,
                    substrates, and environmental conditions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI analyzes instantly</h4>
                  <p className="text-sm text-muted-foreground">
                    Claude AI cross-references 10,000+ failure patterns and
                    material properties.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get actionable results</h4>
                  <p className="text-sm text-muted-foreground">
                    Ranked root causes, recommended fixes, prevention plan, and
                    downloadable PDF report.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spec Engine */}
          <Card>
            <CardHeader>
              <CardTitle>Specification Engine</CardTitle>
              <CardDescription>
                New project? Generate vendor-neutral specs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Input requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Substrates, bond strength, temperature range, cure
                    constraints, production volume.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI generates spec</h4>
                  <p className="text-sm text-muted-foreground">
                    Claude AI recommends optimal material chemistry and product
                    characteristics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Download spec sheet</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete specification with application guidance, warnings,
                    and alternative approaches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Manufacturing Engineers
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Instant Analysis</CardTitle>
                <CardDescription>
                  Get root cause analysis in under 15 seconds. No waiting for
                  consultants or lab tests.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Vendor-Neutral</CardTitle>
                <CardDescription>
                  Unbiased recommendations based on engineering data, not sales
                  pitches.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>24/7 Availability</CardTitle>
                <CardDescription>
                  Production failure at 2 AM? Get answers immediately without
                  calling anyone.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-muted-foreground mb-12">
          Start free. Upgrade as you grow.
        </p>
        <div className="grid gap-8 md:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <Card key={tier.name} className={tier.popular ? 'border-primary' : ''}>
              {tier.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
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
                    : tier.specs}{' '}
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
                  <Link href={tier.name === 'Free' ? '/signup' : '/pricing'}>
                    {tier.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Guessing. Start Knowing.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join engineers who diagnose failures in minutes, not days.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
