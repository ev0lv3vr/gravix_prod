'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // E2E test bypass: if a test session is injected via addInitScript,
    // use it directly instead of going through Supabase auth.
    if (typeof window !== 'undefined' && (window as any).__GRAVIX_TEST_SESSION__) {
      const testSession = (window as any).__GRAVIX_TEST_SESSION__ as Session;
      setSession(testSession);
      setUser(testSession.user);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Redirect to dashboard on sign in (handles both password and OAuth)
      if (event === 'SIGNED_IN' && session) {
        // Use setTimeout to let Supabase finish URL cleanup first
        setTimeout(() => {
          const path = window.location.pathname;
          if (path === '/' || path === '') {
            window.location.href = '/dashboard';
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const maybeHoldoutTestAuth = async (email: string): Promise<{ error: AuthError | null } | null> => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isPreviewHost = host.includes('.vercel.app');
    const testMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true' || isPreviewHost;
    const normalized = email.trim().toLowerCase();
    const isAllowed = normalized.startsWith('test-') && normalized.endsWith('@gravix.com');
    if (!testMode || !isAllowed) return null;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';
      const res = await fetch(`${API_URL}/api/auth/test/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, mode: 'signin' }),
      });
      if (!res.ok) {
        return { error: { message: 'Test auth unavailable' } as AuthError };
      }

      const json = await res.json();
      const accessToken = json.access_token as string;
      const userId = json.user?.id as string;
      const plan = (json.plan || 'free') as string;

      const fakeSession = {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'holdout-refresh-token',
        user: {
          id: userId,
          email: normalized,
          app_metadata: { provider: 'holdout-test' },
          user_metadata: { plan, holdout_test: true },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
        },
      } as Session;

      // Keep compatibility with existing AuthContext bypass
      (window as any).__GRAVIX_TEST_SESSION__ = fakeSession;

      // Keep compatibility with ApiClient localStorage fast-path auth header
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
      if (ref) {
        localStorage.setItem(
          `sb-${ref}-auth-token`,
          JSON.stringify({
            access_token: accessToken,
            expires_at: fakeSession.expires_at,
            token_type: 'bearer',
          })
        );
      }

      setSession(fakeSession);
      setUser(fakeSession.user as User);
      setLoading(false);

      return { error: null };
    } catch {
      return { error: { message: 'Test auth failed' } as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    const test = await maybeHoldoutTestAuth(email);
    if (test) return test;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const test = await maybeHoldoutTestAuth(email);
    if (test) return test;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // After verifying the recovery token, route user to the password reset UI.
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // noop
    }
    if (typeof window !== 'undefined') {
      delete (window as any).__GRAVIX_TEST_SESSION__;
    }
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signInWithGoogle, resetPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
