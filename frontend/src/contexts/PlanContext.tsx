'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type UsageResponse } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlanTier = 'free' | 'pro' | 'quality' | 'enterprise';

interface PlanContextValue {
  plan: PlanTier;
  isAdmin: boolean;
  usage: UsageResponse | null;
  refreshPlan: () => Promise<void>;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Cache helpers  (key: gravix_plan_cache:${userId}, TTL 5 min)
// ---------------------------------------------------------------------------

const CACHE_PREFIX = 'gravix_plan_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PlanCache {
  userId: string;
  plan: PlanTier;
  isAdmin: boolean;
  usage: UsageResponse | null;
  cachedAt: number;
}

function getCacheKey(userId: string): string {
  return `${CACHE_PREFIX}:${userId}`;
}

function purgeMismatchedCache(currentUserId: string | null): void {
  try {
    // Remove legacy global key if present
    localStorage.removeItem(CACHE_PREFIX);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${CACHE_PREFIX}:`)) continue;
      if (!currentUserId || key !== getCacheKey(currentUserId)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

function readCache(userId: string): PlanCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return null;
    const data: PlanCache = JSON.parse(raw);

    // User mismatch guard — ignore stale cross-account cache
    if (!data?.userId || data.userId !== userId) return null;

    if (Date.now() - data.cachedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(userId: string, plan: PlanTier, isAdmin: boolean, usage: UsageResponse | null): void {
  try {
    const data: PlanCache = { userId, plan, isAdmin, usage, cachedAt: Date.now() };
    localStorage.setItem(getCacheKey(userId), JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
}

// ---------------------------------------------------------------------------
// Normalize plan string → PlanTier
// ---------------------------------------------------------------------------

function normalizePlan(rawPlan: string | undefined | null): PlanTier {
  const p = (rawPlan || 'free').toLowerCase();
  if (p === 'team' || p === 'quality') return 'quality';
  if (p === 'pro') return 'pro';
  if (p === 'enterprise') return 'enterprise';
  return 'free';
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 60_000; // 60 seconds

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [plan, setPlan] = useState<PlanTier>('free');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track latest fetch to avoid stale responses overwriting newer data
  const fetchIdRef = useRef(0);

  const hasDataRef = useRef(false);

  const fetchPlan = useCallback(async () => {
    if (!userId) return;

    const id = ++fetchIdRef.current;
    // Only show loading skeleton if we have no data yet
    if (!hasDataRef.current) setIsLoading(true);
    try {
      const [profile, usageResp] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getCurrentUserUsage().catch(() => null),
      ]);
      // Only apply if this is still the latest request
      if (id !== fetchIdRef.current) return;

      const normalized = normalizePlan(profile?.plan);
      const admin = profile?.role === 'admin';
      setPlan(normalized);
      setIsAdmin(admin);
      setUsage(usageResp);
      hasDataRef.current = true;
      writeCache(userId, normalized, admin, usageResp);
    } catch {
      // keep existing state
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false);
    }
  }, [userId]);

  // Reset when user logs out, hydrate cache + fetch when user logs in/switches
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      purgeMismatchedCache(null);
      setPlan('free');
      setIsAdmin(false);
      setUsage(null);
      hasDataRef.current = false;
      setIsLoading(false);
      return;
    }

    // User logged in or switched — keep only current user's cache
    purgeMismatchedCache(userId);

    // Hydrate from user-scoped cache (if valid)
    const cached = readCache(userId);
    if (cached) {
      setPlan(cached.plan);
      setIsAdmin(cached.isAdmin);
      setUsage(cached.usage);
      hasDataRef.current = true;
      setIsLoading(false);
    } else {
      setPlan('free');
      setIsAdmin(false);
      setUsage(null);
      hasDataRef.current = false;
      setIsLoading(true);
    }

    // Always fetch fresh in background
    fetchPlan();
  }, [userId, authLoading, fetchPlan]);

  // Periodic re-poll (only when tab is visible)
  useEffect(() => {
    if (!userId || authLoading) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPlan();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userId, authLoading, fetchPlan]);

  const value: PlanContextValue = {
    plan,
    isAdmin,
    usage,
    refreshPlan: fetchPlan,
    isLoading,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
