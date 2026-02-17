'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';

/**
 * Usage counter shown above the analysis form for free-tier users.
 * Shows remaining analyses and a link to upgrade.
 *
 * "3 of 5 free analyses remaining this month [Pro →]"
 */
export function UsageCounter() {
  const { user } = useAuth();
  const { limit, remaining, isExhausted } = useUsageTracking();

  // Only show for free tier users (no subscription / free plan)
  // For now we don't have plan info on client; show for all authenticated users
  // who are tracked against the free limit. Hidden if limit is > FREE_TIER_LIMIT
  // (i.e., paid users with unlimited won't see this since limit stays at 5 for free).
  // TODO: Check actual plan once available in auth context.

  if (!user) return null;

  if (isExhausted) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between text-sm">
        <span className="text-red-400">
          Monthly limit reached.
        </span>
        <Link
          href="/pricing"
          className="text-accent-500 hover:text-accent-400 font-medium ml-2 whitespace-nowrap"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between text-sm">
      <span className="text-[#94A3B8]">
        <span className="font-mono font-semibold text-white">{remaining}</span>
        {' '}of{' '}
        <span className="font-mono font-semibold text-white">{limit}</span>
        {' '}free analyses remaining this month
      </span>
      <Link
        href="/pricing"
        className="text-accent-500 hover:text-accent-400 font-medium ml-2 whitespace-nowrap"
      >
        Pro →
      </Link>
    </div>
  );
}
