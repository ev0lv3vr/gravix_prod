const trimEnv = (value: string | undefined, fallback = ''): string => {
  const trimmed = value?.trim();
  return trimmed || fallback.trim();
};

const trimUrl = (value: string | undefined, fallback: string): string =>
  trimEnv(value, fallback).replace(/\/+$/, '');

export const API_URL = trimUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'https://gravix-prod.onrender.com'
);

export const APP_URL = trimUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  'https://gravix.com'
);

export const SUPABASE_URL = trimUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  ''
);

export const SUPABASE_ANON_KEY = trimEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ''
);

export const TEST_MODE = trimEnv(process.env.NEXT_PUBLIC_TEST_MODE, '') === 'true';
