'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  isExhausted: boolean;
}

/**
 * Usage tracking hook — reads from PlanContext (backend-backed /users/me/usage).
 *
 * Free-tier users see their real server-side counts.
 * Paid users (pro/quality/enterprise) and admins always get { isExhausted: false }.
 *
 * NOTE: incrementUsage() is kept for backwards compat but is now a no-op.
 * The backend increments on /analyze and /specify calls. PlanContext polls
 * /users/me/usage every 60s to refresh.
 */
export function useUsageTracking(): UsageData {
  const { user } = useAuth();
  const { plan, usage, isAdmin } = usePlan();

  // Not logged in — can't track, defer to auth gating
  if (!user) {
    return { used: 0, limit: 5, remaining: 5, isExhausted: false };
  }

  // Admins and paid plans — unlimited
  if (isAdmin || plan !== 'free') {
    return { used: 0, limit: 999999, remaining: 999999, isExhausted: false };
  }

  // Free tier — read from backend via PlanContext
  if (usage) {
    const used = usage.analyses_used ?? 0;
    const limit = usage.analyses_limit ?? 5;
    const remaining = Math.max(0, limit - used);
    return {
      used,
      limit,
      remaining,
      isExhausted: used >= limit,
    };
  }

  // Usage not loaded yet — default to non-exhausted so we don't block the form
  return { used: 0, limit: 5, remaining: 5, isExhausted: false };
}

/**
 * @deprecated No-op. Backend increments usage on /analyze and /specify.
 * PlanContext polls /users/me/usage every 60s for fresh counts.
 * Kept for backwards compat — callers can remove this.
 */
export function incrementUsage(_user: { id: string } | null): void {
  void _user; // suppress unused warning
  // No-op — backend handles incrementing.
  // PlanContext.refreshPlan() will pick up the new count on next poll.
}
