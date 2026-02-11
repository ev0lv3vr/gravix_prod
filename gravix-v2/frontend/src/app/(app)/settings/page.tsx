'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { user } = useAuth();
  const { used, limit } = useUsageTracking();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: API call to save profile
    await new Promise(r => setTimeout(r, 500));
    setIsSaving(false);
  };

  const usagePct = Math.min((used / limit) * 100, 100);

  return (
    <div className="container mx-auto px-6 py-10 max-w-[640px]">
      <h1 className="text-2xl font-bold text-white mb-10">Settings</h1>

      {/* Component 10.1: Profile Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-6">Profile</h2>
        <div className="space-y-5">
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Email</Label>
            <Input
              value={user?.email || ''}
              readOnly
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-[#64748B] mt-1">Email cannot be changed</p>
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Company</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Role / Title</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Manufacturing Engineer"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-accent-500 hover:bg-accent-600 text-white">
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </section>

      <hr className="border-[#1F2937] my-10" />

      {/* Component 10.2: Subscription Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-6">Subscription</h2>
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-accent-500/10 text-accent-500 text-xs font-semibold rounded-full uppercase">
              Free Plan
            </span>
            <Link href="/pricing" className="text-sm text-accent-500 hover:underline">Upgrade</Link>
          </div>

          {/* Usage bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
              <span>Usage this month</span>
              <span className="font-mono">{used} / {limit}</span>
            </div>
            <div className="w-full h-2 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          <Button variant="outline" className="w-full" disabled>
            Manage Subscription
          </Button>
          <p className="text-xs text-[#64748B] mt-2 text-center">
            Stripe billing portal available for Pro and Team plans
          </p>
        </div>
      </section>

      <hr className="border-[#1F2937] my-10" />

      {/* Component 10.3: Data Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-6">Data</h2>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Export My Data (JSON)
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
              <p className="text-sm text-white mb-3">
                Are you sure? This will permanently delete your account and all analysis data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[#94A3B8]"
                >
                  Cancel
                </Button>
                <Button variant="danger" size="sm">
                  Delete My Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
