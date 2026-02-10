'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;

  // Mock case data - in real app, fetch from API
  const caseData = {
    id: caseId,
    title: 'Cyanoacrylate Debonding on Aluminum-ABS Assembly',
    summary:
      'Production failure where CA bonds failed within 2 weeks of assembly. Investigation revealed surface contamination combined with thermal cycling stress as root causes.',
    materialCategory: 'adhesive',
    materialSubcategory: 'Cyanoacrylate (CA)',
    failureMode: 'Debonding',
    industry: 'Automotive',
    applicationType: 'Structural assembly',
    rootCause: 'Surface contamination + thermal cycling stress',
    contributingFactors: [
      'Inadequate surface preparation',
      'No surface cleanliness verification',
      'Operating temperature range exceeded CA specification',
    ],
    solution:
      'Implemented documented surface prep SOP: (1) Solvent wipe with IPA, (2) Light abrasion of aluminum, (3) Final IPA wipe, (4) Water break test verification. Additionally switched to rubber-toughened CA for improved thermal cycling resistance.',
    preventionTips:
      'Always verify surface cleanliness before bonding. For dissimilar substrates with wide temperature ranges, consider switching to more flexible adhesives (rubber-toughened CA, flexible epoxy, or polyurethane). Implement environmental testing during product qualification.',
    lessonsLearned:
      'Standard cyanoacrylates are brittle and sensitive to thermal cycling, especially with dissimilar CTE substrates. Surface contamination from handling oils is extremely common on aluminum parts. A simple documented cleaning procedure prevents 90% of adhesive failures.',
    tags: ['thermal-cycling', 'surface-contamination', 'aluminum', 'ABS'],
    views: 1243,
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/cases">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{caseData.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{caseData.industry}</Badge>
              <Badge variant="secondary">{caseData.failureMode}</Badge>
              <Badge variant="outline">{caseData.materialSubcategory}</Badge>
              <span className="text-sm text-muted-foreground">
                {caseData.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{caseData.summary}</p>
      </div>

      <div className="space-y-6">
        {/* Root Cause */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Root Cause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">{caseData.rootCause}</p>
            {caseData.contributingFactors.length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                <ul className="space-y-2">
                  {caseData.contributingFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* Solution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Solution Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{caseData.solution}</p>
          </CardContent>
        </Card>

        {/* Prevention Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Prevention Tips
            </CardTitle>
            <CardDescription>
              How to avoid this failure mode in your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">{caseData.preventionTips}</p>
            {caseData.lessonsLearned && (
              <>
                <Separator />
                <div>
                  <p className="font-medium mb-2">Lessons Learned:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseData.lessonsLearned}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Context */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium mb-1">Industry</dt>
                <dd className="text-muted-foreground">{caseData.industry}</dd>
              </div>
              <div>
                <dt className="font-medium mb-1">Application Type</dt>
                <dd className="text-muted-foreground">
                  {caseData.applicationType}
                </dd>
              </div>
              <div>
                <dt className="font-medium mb-1">Material Category</dt>
                <dd className="text-muted-foreground">
                  {caseData.materialCategory}
                </dd>
              </div>
              <div>
                <dt className="font-medium mb-1">Material Type</dt>
                <dd className="text-muted-foreground">
                  {caseData.materialSubcategory}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Tags */}
        {caseData.tags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Related Topics:</p>
            <div className="flex gap-2 flex-wrap">
              {caseData.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <Button asChild>
          <Link href="/analyze">Analyze Similar Failure</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cases">Browse More Cases</Link>
        </Button>
      </div>
    </div>
  );
}
