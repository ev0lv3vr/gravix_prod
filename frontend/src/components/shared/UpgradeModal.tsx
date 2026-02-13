'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ open, onOpenChange, onUpgrade }: UpgradeModalProps) {
  const { session } = useAuth();
  const { used, limit } = useUsageTracking();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    // If logged in, trigger checkout directly
    if (session?.access_token) {
      setIsLoading(true);
      try {
        const data = await api.createCheckoutSession({
          price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || undefined,
          success_url: `${window.location.origin}/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/dashboard?checkout=cancel`,
        });
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
      } catch {
        // Fall through to onUpgrade (navigate to /pricing)
      } finally {
        setIsLoading(false);
      }
    }

    // Fallback: not logged in or checkout failed
    onUpgrade();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">You&apos;ve reached your free limit</DialogTitle>
          <DialogDescription>
            You&apos;ve used {used}/{limit} free analyses this month. Upgrade to Pro to unlock unlimited analyses, full executive summaries, and more.
          </DialogDescription>
        </DialogHeader>

        {/* Usage indicator */}
        <div className="my-2">
          <div className="w-full h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1.5 text-center font-mono">
            {used} / {limit} analyses used
          </p>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* Free Column */}
          <div className="bg-surface-1 rounded p-4 border border-brand-600">
            <div className="font-semibold text-text-primary mb-3">Free</div>
            <div className="text-2xl font-bold text-text-primary mb-1">$0</div>
            <div className="text-sm text-text-tertiary mb-4">forever</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-text-secondary">5 analyses/month</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <span className="text-text-secondary">No executive summary</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <span className="text-text-secondary">Watermarked PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <span className="text-text-secondary">No history</span>
              </li>
            </ul>
          </div>

          {/* Pro Column */}
          <div className="bg-surface-1 rounded p-4 border-2 border-accent-500">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-text-primary">Pro</div>
              <div className="text-xs px-2 py-1 bg-accent-500/10 text-accent-500 rounded font-semibold">
                POPULAR
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">$79</div>
            <div className="text-sm text-text-tertiary mb-4">per month</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">Unlimited analyses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">Full executive summary</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">Clean PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">Full history</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading…' : 'Start Pro — $79/mo'}
          </Button>
          <Button variant="ghost" size="md" onClick={() => onOpenChange(false)} className="w-full">
            I&apos;ll wait
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
