'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type UsageResponse } from '@/lib/api';
import {
  notificationsApi,
  type NotificationPreferences,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download,
  ExternalLink,
  CheckCircle,
  Copy,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Plan helpers
// ---------------------------------------------------------------------------

type PlanTier = 'free' | 'pro' | 'quality' | 'enterprise';

function normalizePlan(raw: string | undefined): PlanTier {
  const p = (raw || 'free').toLowerCase();
  if (p === 'team' || p === 'quality') return 'quality';
  if (p === 'enterprise') return 'enterprise';
  if (p === 'pro') return 'pro';
  return 'free';
}

// ---------------------------------------------------------------------------
// Plan pricing helpers
// ---------------------------------------------------------------------------

const PLAN_PRICES: Record<PlanTier, number> = {
  free: 0,
  pro: 79,
  quality: 299,
  enterprise: 799,
};

const PLAN_SEATS: Record<PlanTier, number> = {
  free: 1,
  pro: 1,
  quality: 3,
  enterprise: 10,
};

const SEAT_COSTS: Record<PlanTier, number> = {
  free: 0,
  pro: 0,
  quality: 79,
  enterprise: 49,
};

// ---------------------------------------------------------------------------
// Notification Preferences Section (Quality+ only)
// ---------------------------------------------------------------------------

const NOTIFICATION_EVENTS = [
  { key: 'investigation_assigned', label: 'Investigation assigned' },
  { key: 'action_assigned', label: 'Action item assigned' },
  { key: 'action_due', label: 'Action item due' },
  { key: 'mentioned', label: '@Mentioned' },
  { key: 'status_changed', label: 'Status changed' },
  { key: 'investigation_closed', label: 'Investigation closed' },
  { key: 'pattern_alert', label: 'Pattern alert' },
  { key: 'share_link_accessed', label: 'Share link accessed' },
] as const;

// Map event keys to legacy pref keys for the API
function prefsToEventMap(prefs: NotificationPreferences): Record<string, { email: boolean; inApp: boolean }> {
  return {
    investigation_assigned: { email: prefs.email_enabled, inApp: true },
    action_assigned: { email: prefs.action_assigned, inApp: true },
    action_due: { email: prefs.action_due_soon, inApp: true },
    mentioned: { email: prefs.new_comments, inApp: true },
    status_changed: { email: prefs.status_changes, inApp: true },
    investigation_closed: { email: prefs.investigation_closed, inApp: true },
    pattern_alert: { email: prefs.email_enabled, inApp: true },
    share_link_accessed: { email: false, inApp: true },
  };
}

function NotificationPreferencesSection() {
  const [_prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local toggles
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [digestMode, setDigestMode] = useState(false);
  const [quietStart, setQuietStart] = useState('20:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [eventSettings, setEventSettings] = useState<Record<string, { email: boolean; inApp: boolean }>>({});

  useEffect(() => {
    notificationsApi
      .getPreferences()
      .then((p) => {
        setPrefs(p);
        setEmailEnabled(p.email_enabled);
        setEventSettings(prefsToEventMap(p));
      })
      .catch(() => {
        // Use defaults
        const defaults: Record<string, { email: boolean; inApp: boolean }> = {};
        NOTIFICATION_EVENTS.forEach((e) => {
          defaults[e.key] = {
            email: e.key !== 'status_changed' && e.key !== 'share_link_accessed',
            inApp: true,
          };
        });
        setEventSettings(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = (key: string, channel: 'email' | 'inApp') => {
    setEventSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key]?.[channel],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsApi.updatePreferences({
        email_enabled: emailEnabled,
        status_changes: eventSettings.status_changed?.email ?? false,
        new_comments: eventSettings.mentioned?.email ?? true,
        action_assigned: eventSettings.action_assigned?.email ?? true,
        action_due_soon: eventSettings.action_due?.email ?? true,
        team_member_added: true,
        investigation_closed: eventSettings.investigation_closed?.email ?? true,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 bg-[#1F2937] rounded" />
          <div className="h-8 w-48 bg-[#1F2937] rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
      <div className="space-y-6">
        {/* Master toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Email Notifications</p>
              <p className="text-xs text-[#64748B]">Receive notifications via email</p>
            </div>
            <button
              role="switch"
              aria-checked={emailEnabled}
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                emailEnabled ? 'bg-accent-500' : 'bg-[#374151]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  emailEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Digest Mode (daily at 8 AM)</p>
              <p className="text-xs text-[#64748B]">Combine notifications into a daily summary</p>
            </div>
            <button
              role="switch"
              aria-checked={digestMode}
              onClick={() => setDigestMode(!digestMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                digestMode ? 'bg-accent-500' : 'bg-[#374151]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  digestMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quiet hours */}
          <div>
            <p className="text-sm text-white mb-2">Quiet Hours</p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="bg-[#111827] border border-[#374151] rounded px-3 py-1.5 text-sm text-[#94A3B8] focus:outline-none focus:border-accent-500"
              />
              <span className="text-xs text-[#64748B]">to</span>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="bg-[#111827] border border-[#374151] rounded px-3 py-1.5 text-sm text-[#94A3B8] focus:outline-none focus:border-accent-500"
              />
            </div>
          </div>
        </div>

        {/* Event type checkboxes */}
        <div>
          <p className="text-sm font-medium text-white mb-3">Event Types</p>
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-4 py-2 border-b border-[#1F2937]">
              <span className="text-xs text-[#64748B]">Event</span>
              <span className="text-xs text-[#64748B] text-center">Email</span>
              <span className="text-xs text-[#64748B] text-center">In-app</span>
            </div>
            {NOTIFICATION_EVENTS.map((evt) => (
              <div
                key={evt.key}
                className="grid grid-cols-[1fr_60px_60px] gap-2 px-4 py-2.5 border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30"
              >
                <span className="text-sm text-[#94A3B8]">{evt.label}</span>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={eventSettings[evt.key]?.email ?? false}
                    onChange={() => toggleEvent(evt.key, 'email')}
                    disabled={!emailEnabled}
                    className="w-4 h-4 rounded border-[#374151] bg-[#111827] text-accent-500 focus:ring-accent-500"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={eventSettings[evt.key]?.inApp ?? true}
                    onChange={() => toggleEvent(evt.key, 'inApp')}
                    className="w-4 h-4 rounded border-[#374151] bg-[#111827] text-accent-500 focus:ring-accent-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {saved && (
          <div className="text-sm text-success bg-success/10 border border-success/20 rounded p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Notification preferences saved
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-500 hover:bg-accent-600 text-white"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </Button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Organization & Branding (Enterprise only)
// ---------------------------------------------------------------------------

function OrganizationBrandingSection() {
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1B365D');
  const [secondaryColor, setSecondaryColor] = useState('#C41E3A');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Report branding options
  const [useLogo, setUseLogo] = useState(true);
  const [useCustomColors, setUseCustomColors] = useState(true);
  const [hideGravixBranding, setHideGravixBranding] = useState(false);

  // Inbound email (mock for now)
  const inboundEmail = '8d@acme.gravix.io';

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gravix_branding');
      if (raw) {
        const b = JSON.parse(raw);
        setCompanyName(b.company_name || '');
        setPrimaryColor(b.primary_color || '#1B365D');
        setSecondaryColor(b.secondary_color || '#C41E3A');
        setLogoUrl(b.logo_url || '');
        setUseLogo(b.use_logo ?? true);
        setUseCustomColors(b.use_custom_colors ?? true);
        setHideGravixBranding(b.hide_footer ?? false);
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(inboundEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const branding = {
        company_name: companyName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        use_logo: useLogo,
        use_custom_colors: useCustomColors,
        hide_footer: hideGravixBranding,
      };
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
      <h2 className="text-lg font-semibold text-white mb-6">Organization & Branding</h2>
      <div className="space-y-5">
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Company Name</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
            className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
          />
        </div>

        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Company Logo</Label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-[#374151] cursor-pointer bg-transparent"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm w-28 font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Secondary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-[#374151] cursor-pointer bg-transparent"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm w-28 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Report Branding */}
        <div>
          <p className="text-[13px] font-medium text-[#94A3B8] mb-3">Report Branding</p>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useLogo}
                onChange={(e) => setUseLogo(e.target.checked)}
                className="w-4 h-4 rounded border-[#374151] bg-[#111827] text-accent-500"
              />
              <span className="text-sm text-[#94A3B8]">Use company logo on reports</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomColors}
                onChange={(e) => setUseCustomColors(e.target.checked)}
                className="w-4 h-4 rounded border-[#374151] bg-[#111827] text-accent-500"
              />
              <span className="text-sm text-[#94A3B8]">Use custom colors on reports</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hideGravixBranding}
                onChange={(e) => setHideGravixBranding(e.target.checked)}
                className="w-4 h-4 rounded border-[#374151] bg-[#111827] text-accent-500"
              />
              <span className="text-sm text-[#94A3B8]">Hide Gravix branding (white-label)</span>
            </label>
          </div>
        </div>

        {/* Inbound Email */}
        <div>
          <p className="text-[13px] font-medium text-[#94A3B8] mb-1.5">Inbound Email</p>
          <div className="flex items-center gap-2">
            <code className="bg-[#111827] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono flex-1">
              {inboundEmail}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyEmail}
              className="shrink-0"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Forward emails to this address to create investigations.{' '}
            <Link href="/settings" className="text-accent-500 hover:underline">
              Manage routing rules →
            </Link>
          </p>
        </div>

        {saved && (
          <div className="text-sm text-success bg-success/10 border border-success/20 rounded p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Organization settings saved
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-500 hover:bg-accent-600 text-white"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

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

  const plan = normalizePlan(profile?.plan);
  const isFreeUser = plan === 'free';
  const isQualityPlus = plan === 'quality' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';

  const usedAnalyses = usage?.analyses_used ?? 0;
  const limitAnalyses = usage?.analyses_limit ?? 5;
  const usagePct = Math.min((usedAnalyses / limitAnalyses) * 100, 100);

  // Seat info
  const totalSeats = PLAN_SEATS[plan];
  const usedSeats = 1; // Mock: actual seat count would come from API
  const seatCost = SEAT_COSTS[plan];
  const planPrice = PLAN_PRICES[plan];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({ name, company, job_title: role });
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
      : plan === 'quality'
        ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
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

      {/* Component 10.2: Subscription Section (enhanced) */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-6">Subscription</h2>
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
          {/* Plan + badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${planBadgeColor}`}
              >
                {planLabel} Plan
              </span>
              {!isFreeUser && (
                <span className="text-sm text-[#94A3B8] font-mono">
                  ${planPrice}/mo
                </span>
              )}
            </div>
            {isFreeUser && (
              <Link href="/pricing" className="text-sm text-accent-500 hover:underline">
                Upgrade
              </Link>
            )}
          </div>

          {/* Seat info for team plans */}
          {isQualityPlus && (
            <div className="mb-4 pb-4 border-b border-[#1F2937]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#94A3B8]">Seats</span>
                <span className="text-sm text-white font-mono">
                  {usedSeats} of {totalSeats} used
                </span>
              </div>
              <button
                onClick={handleManageSubscription}
                className="text-xs text-accent-500 hover:text-accent-400 transition-colors"
              >
                Add Seat — ${seatCost}/mo →
              </button>
            </div>
          )}

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

          {/* Next payment (for paid plans) */}
          {!isFreeUser && (
            <div className="mb-4 text-xs text-[#64748B]">
              <p>
                Next payment: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${planPrice}.00
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="flex-1"
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
              <Link href="/pricing" className="flex-1">
                <Button variant="ghost" className="w-full text-accent-500 hover:text-accent-400">
                  Change Plan
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {!isFreeUser && (
            <p className="text-xs text-[#64748B] mt-2 text-center">
              Opens Stripe billing portal
            </p>
          )}
        </div>
      </section>

      <hr className="border-[#1F2937] my-10" />

      {/* Component 10.4: Notification Preferences (Quality+ only) */}
      {isQualityPlus && (
        <>
          <NotificationPreferencesSection />
          <hr className="border-[#1F2937] my-10" />
        </>
      )}

      {/* Component 10.5: Organization & Branding (Enterprise only) */}
      {isEnterprise && (
        <>
          <OrganizationBrandingSection />
          <hr className="border-[#1F2937] my-10" />
        </>
      )}

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
