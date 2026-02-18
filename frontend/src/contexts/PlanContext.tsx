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
// Cache helpers  (key: gravix_plan_cache, TTL 5 min)
// ---------------------------------------------------------------------------

const CACHE_KEY = 'gravix_plan_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PlanCache {
  plan: PlanTier;
  isAdmin: boolean;
  usage: UsageResponse | null;
  cachedAt: number;
}

function readCache(): PlanCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: PlanCache = JSON.parse(raw);
    if (Date.now() - data.cachedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(plan: PlanTier, isAdmin: boolean, usage: UsageResponse | null): void {
  try {
    const data: PlanCache = { plan, isAdmin, usage, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
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

  const [plan, setPlan] = useState<PlanTier>(() => {
    const cached = readCache();
    return cached?.plan ?? 'free';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const cached = readCache();
    return cached?.isAdmin ?? false;
  });
  const [usage, setUsage] = useState<UsageResponse | null>(() => {
    const cached = readCache();
    return cached?.usage ?? null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have fresh cache, show it immediately — no loading state
    return readCache() === null;
  });

  // Track latest fetch to avoid stale responses overwriting newer data
  const fetchIdRef = useRef(0);

  const hasDataRef = useRef(readCache() !== null);

  const fetchPlan = useCallback(async () => {
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
      writeCache(normalized, admin, usageResp);
    } catch {
      // keep existing state
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false);
    }
  }, []);

  // Reset when user logs out, fetch when user logs in
  useEffect(() => {
    // Auth still resolving — if we have cache, don't block on it
    if (authLoading) {
      // Cache already hydrated via useState initializers — nothing to do
      return;
    }

    if (!user) {
      setPlan('free');
      setIsAdmin(false);
      setUsage(null);
      hasDataRef.current = false;
      setIsLoading(false);
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    // User is authenticated — fetch fresh data in background
    // Cache was already applied via useState initializers, so no flash
    if (!hasDataRef.current) {
      setIsLoading(true); // No cache — show skeleton
    }

    fetchPlan();
  }, [user, authLoading, fetchPlan]);

  // Periodic re-poll (only when tab is visible)
  useEffect(() => {
    if (!user || authLoading) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPlan();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, authLoading, fetchPlan]);

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
