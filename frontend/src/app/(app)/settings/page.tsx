'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock user data
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@company.com',
    company: 'Acme Manufacturing',
    role: 'Process Engineer',
  });

  const userPlan = {
    name: 'free',
    displayName: 'Free',
    analysesThisMonth: 1,
    specsThisMonth: 0,
    analysesLimit: 2,
    specsLimit: 2,
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal and company details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Current Plan</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {userPlan.displayName} Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {userPlan.analysesThisMonth} of {userPlan.analysesLimit} analyses used
                  this month
                </p>
              </div>
              <Badge variant="secondary">{userPlan.displayName}</Badge>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Usage This Month:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Failure Analyses:
                  </span>
                  <span>
                    {userPlan.analysesThisMonth} / {userPlan.analysesLimit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spec Requests:</span>
                  <span>
                    {userPlan.specsThisMonth} / {userPlan.specsLimit}
                  </span>
                </div>
              </div>
            </div>

            {userPlan.name === 'free' && (
              <>
                <Separator />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upgrade to Pro for 15 analyses + 15 specs per month, full PDF
                    reports, and priority support.
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div className="flex gap-4">
              <Button asChild>
                <Link href="/pricing">
                  {userPlan.name === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </Link>
              </Button>
              {userPlan.name !== 'free' && (
                <Button variant="outline" asChild>
                  <Link href="/settings/billing">Manage Billing</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Contact support to delete your account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
