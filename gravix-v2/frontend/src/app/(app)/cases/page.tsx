'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, ArrowRight } from 'lucide-react';
import { MATERIAL_CATEGORIES, FAILURE_MODES } from '@/lib/constants';

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [failureModeFilter, setFailureModeFilter] = useState('all');

  // Mock case data
  const cases = [
    {
      id: '1',
      title: 'Cyanoacrylate Debonding on Aluminum-ABS Assembly',
      summary:
        'Production failure where CA bonds failed within 2 weeks. Root cause: surface contamination combined with thermal cycling.',
      materialCategory: 'adhesive',
      failureMode: 'Debonding',
      rootCause: 'Surface contamination + thermal cycling stress',
      industry: 'Automotive',
      views: 1243,
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Epoxy Cracking in High-Temperature Electronics',
      summary:
        'Structural epoxy developed cracks after thermal cycling. Switched to flexible epoxy formulation.',
      materialCategory: 'adhesive',
      failureMode: 'Cracking',
      rootCause: 'CTE mismatch + rigid epoxy',
      industry: 'Electronics',
      views: 892,
      isFeatured: true,
    },
    {
      id: '3',
      title: 'Silicone Sealant Discoloration from UV Exposure',
      summary:
        'Outdoor silicone sealant turned yellow after 6 months. Solution: UV-stabilized formulation.',
      materialCategory: 'sealant',
      failureMode: 'Discoloration',
      rootCause: 'UV degradation',
      industry: 'Construction',
      views: 654,
      isFeatured: false,
    },
    {
      id: '4',
      title: 'Polyurethane Adhesive Softening in Chemical Environment',
      summary:
        'PU adhesive degraded when exposed to gasoline. Switched to chemical-resistant epoxy.',
      materialCategory: 'adhesive',
      failureMode: 'Softening',
      rootCause: 'Chemical incompatibility',
      industry: 'Automotive',
      views: 521,
      isFeatured: false,
    },
  ];

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || c.materialCategory === categoryFilter;
    const matchesFailureMode =
      failureModeFilter === 'all' || c.failureMode === failureModeFilter;
    return matchesSearch && matchesCategory && matchesFailureMode;
  });

  const featuredCases = filteredCases.filter((c) => c.isFeatured);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Case Library</h1>
        <p className="text-muted-foreground">
          Learn from anonymized real-world failure cases and solutions
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Filter Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={failureModeFilter} onValueChange={setFailureModeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Failure Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Failure Modes</SelectItem>
                {FAILURE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Cases */}
      {featuredCases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Featured Cases
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredCases.map((caseItem) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge>{caseItem.industry}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {caseItem.views.toLocaleString()} views
                      </span>
                    </div>
                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                    <CardDescription>{caseItem.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{caseItem.failureMode}</Badge>
                        <Badge variant="outline">
                          {caseItem.materialCategory}
                        </Badge>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Cases */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          All Cases ({filteredCases.length})
        </h2>
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
              <Card className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{caseItem.title}</CardTitle>
                      </div>
                      <CardDescription className="mb-3">
                        {caseItem.summary}
                      </CardDescription>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{caseItem.industry}</Badge>
                        <Badge variant="outline">{caseItem.failureMode}</Badge>
                        <Badge variant="outline">
                          {caseItem.materialCategory}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {caseItem.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground ml-4" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
