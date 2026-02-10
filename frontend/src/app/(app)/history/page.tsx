'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileSearch, FileText, Search, Download } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, fetch from API
  const analyses = [
    {
      id: '1',
      title: 'Cyanoacrylate debonding on aluminum-ABS',
      date: '2024-02-09T10:30:00Z',
      status: 'completed',
      confidence: 0.85,
    },
    {
      id: '2',
      title: 'Epoxy cracking on polycarbonate',
      date: '2024-02-08T14:20:00Z',
      status: 'completed',
      confidence: 0.72,
    },
  ];

  const specs = [
    {
      id: '1',
      title: 'Stainless steel to polycarbonate bonding',
      date: '2024-02-07T09:15:00Z',
      status: 'completed',
    },
  ];

  const filteredAnalyses = analyses.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSpecs = specs.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">
          View and download your past failure analyses and material specifications
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your history..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="analyses">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyses">
            Failure Analyses ({analyses.length})
          </TabsTrigger>
          <TabsTrigger value="specs">
            Spec Requests ({specs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyses" className="mt-6">
          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No analyses found</p>
                <Button asChild>
                  <Link href="/analyze">Create Your First Analysis</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <Card key={analysis.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileSearch className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{analysis.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatRelativeTime(analysis.date)}</span>
                          <Badge variant="secondary">{analysis.status}</Badge>
                          <span className="text-primary font-medium">
                            {Math.round(analysis.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/api/reports/analysis/${analysis.id}/pdf`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/analyze/${analysis.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="specs" className="mt-6">
          {filteredSpecs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No spec requests found</p>
                <Button asChild>
                  <Link href="/specify">Create Your First Spec</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSpecs.map((spec) => (
                <Card key={spec.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{spec.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatRelativeTime(spec.date)}</span>
                          <Badge variant="secondary">{spec.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/api/reports/spec/${spec.id}/pdf`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/specify/${spec.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
