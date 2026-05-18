import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

// Avoid failing Next.js build/prerender when env vars aren't injected.
// In production, these MUST be set; otherwise auth/API calls will fail at runtime.
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : (null as unknown as ReturnType<typeof createBrowserClient>);
