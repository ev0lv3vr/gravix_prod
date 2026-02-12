'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (!user) {
      // Anonymous user: use localStorage
      const storageKey = 'gravix_usage';
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          
          if (data.month === currentMonth) {
            setUsed(data.count || 0);
          } else {
            // New month, reset
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
        // Initialize
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem(
          storageKey,
          JSON.stringify({ month: currentMonth, count: 0 })
        );
        setUsed(0);
      }
    } else {
      // Authenticated user: fetch from Supabase
      // TODO: Implement Supabase usage tracking
      // For now, use localStorage as fallback
      const storageKey = `gravix_usage_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const currentMonth = new Date().toISOString().slice(0, 7);
          
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
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem(
          storageKey,
          JSON.stringify({ month: currentMonth, count: 0 })
        );
        setUsed(0);
      }
    }
  }, [user]);

  const remaining = Math.max(0, FREE_TIER_LIMIT - used);
  const isExhausted = used >= FREE_TIER_LIMIT;

  return {
    used,
    limit: FREE_TIER_LIMIT,
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
        // New month
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
