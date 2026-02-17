'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type UsageResponse } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, ExternalLink, CheckCircle } from 'lucide-react';

function BrandingSection() {
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1e40af');
  const [hideFooter, setHideFooter] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gravix_branding');
      if (raw) {
        const b = JSON.parse(raw);
        setCompanyName(b.company_name || '');
        setPrimaryColor(b.primary_color || '#1e40af');
        setHideFooter(b.hide_footer || false);
        setLogoUrl(b.logo_url || '');
      }
    } catch { /* ignore */ }
  }, []);

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      if (!supabase) return;
      const ext = file.name.split('.').pop() || 'png';
      const path = `branding/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('public').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) return;
      const { data } = supabase.storage.from('public').getPublicUrl(path);
      if (data?.publicUrl) setLogoUrl(data.publicUrl);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const branding = { company_name: companyName, primary_color: primaryColor, hide_footer: hideFooter, logo_url: logoUrl };
      localStorage.setItem('gravix_branding', JSON.stringify(branding));
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
        const raw = ref ? localStorage.getItem(`sb-${ref}-auth-token`) : null;
        const token = raw ? JSON.parse(raw)?.access_token : null;
        if (token) {
          await fetch(`${API_URL}/v1/users/me/branding`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(branding),
          });
        }
      } catch { /* best-effort */ }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-6">Enterprise Branding</h2>
      <div className="space-y-5">
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Company Name</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name (shown on reports)" className="h-11 bg-[#111827] border-[#374151] rounded text-sm" />
        </div>

        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Logo</Label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f);
              }}
              className="text-xs text-[#94A3B8]"
              disabled={uploadingLogo}
            />
            {uploadingLogo && <span className="text-xs text-[#64748B]">Uploading…</span>}
          </div>
          {logoUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Company logo" className="h-10 w-auto rounded bg-white p-1" />
            </div>
          )}
        </div>

        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Primary Color</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border border-[#374151] cursor-pointer bg-transparent" />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-11 bg-[#111827] border-[#374151] rounded text-sm w-32 font-mono" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="hideFooter" checked={hideFooter} onChange={(e) => setHideFooter(e.target.checked)} className="w-4 h-4 rounded border-[#374151] bg-[#111827]" />
          <Label htmlFor="hideFooter" className="text-[13px] text-[#94A3B8] cursor-pointer">Remove &quot;Generated by Gravix&quot; footer from reports</Label>
        </div>
        {saved && (
          <div className="text-sm text-success bg-success/10 border border-success/20 rounded p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />Branding settings saved
          </div>
        )}
        <Button onClick={handleSave} disabled={saving} className="bg-accent-500 hover:bg-accent-600 text-white">{saving ? 'Saving…' : 'Save Branding'}</Button>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile / plan / usage from API
  const [profile, setProfile] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Billing actions
  const [billingLoading, setBillingLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  // Load profile + usage on mount
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      try {
        const [profileData, usageData] = await Promise.all([
          api.getCurrentUser(),
          api.getCurrentUserUsage(),
        ]);
        if (cancelled) return;

        setProfile(profileData);
        setUsage(usageData);

        // Populate form fields
        if (profileData) {
          setName(profileData.name || '');
          setCompany(profileData.company || '');
          setRole(profileData.role || '');
        }
      } catch {
        // Silently fail; form fields stay empty
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [loading, user]);

  const plan = profile?.plan ?? 'free';
  const isFreeUser = plan === 'free';

  const usedAnalyses = usage?.analyses_used ?? 0;
  const limitAnalyses = usage?.analyses_limit ?? 5;
  const usagePct = Math.min((usedAnalyses / limitAnalyses) * 100, 100);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({ name, company, role });
      if (updated) setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSubscription = useCallback(async () => {
    if (isFreeUser) {
      window.location.href = '/pricing';
      return;
    }
    setBillingLoading(true);
    try {
      const data = await api.createBillingPortalSession();
      if (data.portal_url) window.location.href = data.portal_url;
    } catch {
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  }, [isFreeUser]);

  const handleExportData = useCallback(async () => {
    setExportLoading(true);
    try {
      const [specs, failures] = await Promise.all([
        api.listSpecRequests(),
        api.listFailureAnalyses(),
      ]);

      const exportPayload = {
        exported_at: new Date().toISOString(),
        user_email: user?.email,
        spec_requests: specs,
        failure_analyses: failures,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gravix-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }, [user]);

  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      'This will permanently delete your account and all data. This cannot be undone. Continue?'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.deleteMyAccount();
      // End local session and return home
      await signOut();
    } catch {
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [signOut]);

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const planBadgeColor =
    plan === 'pro'
      ? 'bg-accent-500/10 text-accent-500'
      : plan === 'team'
        ? 'bg-success/10 text-success'
        : plan === 'enterprise'
          ? 'bg-warning/10 text-warning'
          : 'bg-[#374151]/50 text-[#94A3B8]';

  if (loading || !user) {
    return null;
  }

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
              placeholder={profileLoading ? 'Loading…' : 'Your name'}
              disabled={profileLoading}
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
              placeholder={profileLoading ? 'Loading…' : 'Your company'}
              disabled={profileLoading}
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Role / Title</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={profileLoading ? 'Loading…' : 'e.g., Manufacturing Engineer'}
              disabled={profileLoading}
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>

          {saveError && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded p-3">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="text-sm text-success bg-success/10 border border-success/20 rounded p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Profile saved successfully
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving || profileLoading}
            className="bg-accent-500 hover:bg-accent-600 text-white"
          >
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
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${planBadgeColor}`}
            >
              {planLabel} Plan
            </span>
            {isFreeUser && (
              <Link href="/pricing" className="text-sm text-accent-500 hover:underline">
                Upgrade
              </Link>
            )}
          </div>

          {/* Usage bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
              <span>Analyses this month</span>
              <span className="font-mono">
                {usedAnalyses} / {limitAnalyses === -1 ? '∞' : limitAnalyses}
              </span>
            </div>
            {limitAnalyses !== -1 && (
              <div className="w-full h-2 bg-[#1F2937] rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={billingLoading}
            onClick={handleManageSubscription}
          >
            {billingLoading ? (
              'Loading…'
            ) : isFreeUser ? (
              <>
                Upgrade to Pro
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </>
            ) : (
              <>
                Manage Subscription
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </>
            )}
          </Button>
          {!isFreeUser && (
            <p className="text-xs text-[#64748B] mt-2 text-center">
              Opens Stripe billing portal
            </p>
          )}
        </div>
      </section>

      <hr className="border-[#1F2937] my-10" />

      {/* Enterprise Branding */}
      <BrandingSection />

      <hr className="border-[#1F2937] my-10" />

      {/* Component 10.3: Data Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-6">Data</h2>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={exportLoading}
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? 'Exporting…' : 'Export My Data (JSON)'}
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
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete My Account'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
