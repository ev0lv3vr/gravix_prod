import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">About Gravix</h1>
          <p className="text-xl text-muted-foreground mb-12">
            We're building the materials intelligence platform manufacturing engineers deserve.
          </p>

          <div className="space-y-8 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                When production stops because a bond failed, engineers need answers NOW — not
                in days, not after expensive lab tests, and definitely not from biased vendor
                reps. Gravix delivers instant, vendor-neutral root cause analysis and material
                specifications powered by AI and decades of materials science knowledge.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">The Problem We Solve</h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                Traditional approaches to adhesive, sealant, and coating failures are broken:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Vendor tech support</strong> blames your substrates or application
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Consultants</strong> cost $200-500/hr and take weeks to schedule
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Lab testing</strong> costs thousands and takes days or weeks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Google searches</strong> return generic advice that doesn't fit your
                    exact situation
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Gravix combines advanced AI (Claude from Anthropic) with a comprehensive materials
                science knowledge base to deliver instant, accurate analysis. Input your failure
                details, and within 15 seconds you get ranked root causes, recommended fixes, and a
                prevention plan — all vendor-neutral, all based on engineering data.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Answers in seconds, not days. Get back to production faster.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Unbiased</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Vendor-neutral recommendations based on data, not sales quotas.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Accurate</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                AI trained on 10,000+ failure patterns and materials database.
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Who We Serve</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Gravix is built for manufacturing engineers, process engineers, quality engineers,
              and product designers who work with adhesives, sealants, and coatings. Whether
              you're in automotive, aerospace, electronics, medical devices, or consumer products,
              we speak your language.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
