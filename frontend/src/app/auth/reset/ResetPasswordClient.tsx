'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get('next') ?? '/dashboard', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured.');
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message || 'Failed to update password.');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = next;
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-900 px-6">
      <div className="max-w-md w-full bg-brand-800 border border-[#1F2937] rounded-lg p-6">
        <h1 className="text-xl font-semibold text-white mb-2">Set a new password</h1>
        <p className="text-sm text-[#94A3B8] mb-6">Choose a new password for your account.</p>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded p-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-success bg-success/10 border border-success/20 rounded p-3 mb-4">
            Password updated. Redirecting…
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">New password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Confirm password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white"
          >
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
