'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ open, onOpenChange, onUpgrade }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">You&apos;ve used your 5 free analyses this month</DialogTitle>
          <DialogDescription>
            Upgrade to Pro to unlock unlimited analyses, full executive summaries, and more.
          </DialogDescription>
        </DialogHeader>

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
            <div className="text-2xl font-bold text-text-primary mb-1">$49</div>
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
          <Button variant="primary" size="lg" onClick={onUpgrade} className="w-full">
            Start Pro — $49/mo
          </Button>
          <Button variant="ghost" size="md" onClick={() => onOpenChange(false)} className="w-full">
            I&apos;ll wait
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
