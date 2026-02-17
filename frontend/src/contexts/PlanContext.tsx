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

export type PlanTier = 'free' | 'pro' | 'quality' | 'enterprise' | 'admin';

interface PlanContextValue {
  plan: PlanTier;
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

function writeCache(plan: PlanTier, usage: UsageResponse | null): void {
  try {
    const data: PlanCache = { plan, usage, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
}

// ---------------------------------------------------------------------------
// Normalize plan string → PlanTier
// ---------------------------------------------------------------------------

function normalizePlan(
  rawPlan: string | undefined | null,
  role: string | undefined | null,
): PlanTier {
  if (role === 'admin') return 'admin';
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
  const { user } = useAuth();

  const [plan, setPlan] = useState<PlanTier>(() => {
    const cached = readCache();
    return cached?.plan ?? 'free';
  });
  const [usage, setUsage] = useState<UsageResponse | null>(() => {
    const cached = readCache();
    return cached?.usage ?? null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Track latest fetch to avoid stale responses overwriting newer data
  const fetchIdRef = useRef(0);

  const fetchPlan = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const [profile, usageResp] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getCurrentUserUsage().catch(() => null),
      ]);
      // Only apply if this is still the latest request
      if (id !== fetchIdRef.current) return;

      const normalized = normalizePlan(profile?.plan, profile?.role);
      setPlan(normalized);
      setUsage(usageResp);
      writeCache(normalized, usageResp);
    } catch {
      // keep existing state
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false);
    }
  }, []);

  // Reset when user logs out, fetch when user logs in
  useEffect(() => {
    if (!user) {
      setPlan('free');
      setUsage(null);
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    // Hydrate from cache instantly, then fetch fresh data
    const cached = readCache();
    if (cached) {
      setPlan(cached.plan);
      setUsage(cached.usage);
    }

    fetchPlan();
  }, [user, fetchPlan]);

  // Periodic re-poll (only when tab is visible)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPlan();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, fetchPlan]);

  const value: PlanContextValue = {
    plan,
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
