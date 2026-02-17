'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Zap } from 'lucide-react';

/**
 * Post-analysis upgrade prompt for free tier users.
 * Non-blocking — results are fully visible beneath.
 * Dismissible with state persisted in localStorage for the session.
 */
export function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('gravix_upgrade_banner_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('gravix_upgrade_banner_dismissed', 'true');
  };

  return (
    <div className="relative bg-accent-500/10 border border-accent-500/20 rounded-lg px-4 py-3 mb-4">
      <div className="flex items-start gap-3 pr-8">
        <Zap className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">
            Upgrade to Pro for unlimited analyses, visual AI, and TDS-aware diagnostics.
          </p>
          <Link
            href="/pricing"
            className="text-sm text-accent-500 hover:text-accent-400 font-medium mt-1 inline-block"
          >
            See Plans →
          </Link>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-[#64748B] hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
