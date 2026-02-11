'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, isApiConfigured } from '@/lib/api';

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  isExhausted: boolean;
}

const FREE_TIER_LIMIT = 5;

export function useUsageTracking(): UsageData {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(FREE_TIER_LIMIT);

  useEffect(() => {
    if (user && isApiConfigured()) {
      // Authenticated user: fetch real usage from the API
      api
        .getUserUsage()
        .then((usage) => {
          const totalUsed = (usage.analyses_used ?? 0) + (usage.specs_used ?? 0);
          const totalLimit = (usage.analyses_limit ?? FREE_TIER_LIMIT) + (usage.specs_limit ?? FREE_TIER_LIMIT);
          setUsed(totalUsed);
          setLimit(totalLimit);
        })
        .catch(() => {
          // API failed — fall back to localStorage
          loadLocalStorage(user.id);
        });
    } else if (user) {
      // Authenticated but no API — use user-scoped localStorage
      loadLocalStorage(user.id);
    } else {
      // Anonymous user: use localStorage
      loadLocalStorage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadLocalStorage = useCallback(
    (userId: string | null) => {
      const storageKey = userId ? `gravix_usage_${userId}` : 'gravix_usage';
      const stored = localStorage.getItem(storageKey);
      const currentMonth = new Date().toISOString().slice(0, 7);

      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.month === currentMonth) {
            setUsed(data.count || 0);
          } else {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ month: currentMonth, count: 0 })
            );
            setUsed(0);
          }
        } catch {
          setUsed(0);
        }
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ month: currentMonth, count: 0 })
        );
        setUsed(0);
      }
      setLimit(FREE_TIER_LIMIT * 2); // analyses + specs combined for local tracking
    },
    []
  );

  const remaining = Math.max(0, limit - used);
  const isExhausted = used >= limit;

  return {
    used,
    limit,
    remaining,
    isExhausted,
  };
}

export function incrementUsage(user: { id: string } | null): void {
  const storageKey = user ? `gravix_usage_${user.id}` : 'gravix_usage';
  const stored = localStorage.getItem(storageKey);
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.month === currentMonth) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ month: currentMonth, count: (data.count || 0) + 1 })
        );
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ month: currentMonth, count: 1 })
        );
      }
    } catch {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ month: currentMonth, count: 1 })
      );
    }
  } else {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ month: currentMonth, count: 1 })
    );
  }
}
