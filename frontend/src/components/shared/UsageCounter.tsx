'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';

/**
 * Usage counter shown above the analysis form for free-tier users.
 * Reads real usage from PlanContext (backend-backed via /users/me/usage).
 *
 * "3 of 5 free analyses remaining this month [Pro →]"
 *
 * Hidden for paid plans (pro/quality/enterprise) — they have unlimited analyses.
 */
export function UsageCounter() {
  const { user } = useAuth();
  const { plan, usage, isAdmin } = usePlan();

  // Only show for logged-in free-tier users
  if (!user) return null;
  if (isAdmin) return null;
  if (plan !== 'free') return null;

  // Still loading usage from backend
  if (!usage) return null;

  const used = usage.analyses_used ?? 0;
  const limit = usage.analyses_limit ?? 5;
  const remaining = Math.max(0, limit - used);
  const isExhausted = used >= limit;

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
