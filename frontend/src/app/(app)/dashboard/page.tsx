'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileSearch, FileText, History, BookOpen } from 'lucide-react';
import { PLAN_LIMITS } from '@/lib/constants';

export default function DashboardPage() {
  // Mock user data - in real app, fetch from API
  const user = {
    plan: 'free' as const,
    analysesThisMonth: 1,
    specsThisMonth: 0,
  };

  const limits = PLAN_LIMITS[user.plan];
  const analysesPercent = (user.analysesThisMonth / limits.analyses) * 100;
  const specsPercent = (user.specsThisMonth / limits.specs) * 100;

  // Mock recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'analysis',
      title: 'Cyanoacrylate debonding on aluminum-ABS',
      date: '2 hours ago',
      status: 'completed',
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your materials intelligence overview.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/analyze">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-primary" />
                    Diagnose Failure
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Get AI-powered root cause analysis in seconds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <Link href="/specify">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Generate Spec
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Create vendor-neutral material specifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Usage Meters */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failure Analyses</CardTitle>
            <CardDescription>
              {user.analysesThisMonth} of {limits.analyses} used this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={analysesPercent} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {limits.analyses - user.analysesThisMonth} remaining
            </p>
            {analysesPercent >= 100 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="h-4 w-4" />
                <span>Limit reached.</span>
                <Link href="/pricing" className="text-primary hover:underline">
                  Upgrade now
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spec Requests</CardTitle>
            <CardDescription>
              {user.specsThisMonth} of {limits.specs} used this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={specsPercent} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {limits.specs - user.specsThisMonth} remaining
            </p>
            {specsPercent >= 100 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="h-4 w-4" />
                <span>Limit reached.</span>
                <Link href="/pricing" className="text-primary hover:underline">
                  Upgrade now
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest analyses and specifications</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No activity yet</p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/analyze">Diagnose First Failure</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/cases">Browse Case Library</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {item.type === 'analysis' ? (
                      <FileSearch className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge>{item.status}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={
                          item.type === 'analysis'
                            ? `/analyze/${item.id}`
                            : `/specify/${item.id}`
                        }
                      >
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Info */}
      {user.plan === 'free' && (
        <Card className="mt-8 border-primary">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Get 15 analyses + 15 specs per month, full PDF reports, and priority support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
