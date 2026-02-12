'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-900 px-6">
      <div className="max-w-md w-full bg-brand-800 border border-[#1F2937] rounded-lg p-6">
        <h1 className="text-xl font-semibold text-white mb-2">Authentication Error</h1>
        <p className="text-sm text-[#94A3B8] mb-6">
          We couldn’t complete the authentication flow. This can happen if the link expired or the redirect URL is not allowed.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 rounded bg-accent-500 text-white hover:bg-accent-600 text-sm font-medium"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-4 rounded border border-[#374151] text-white hover:bg-brand-700 text-sm font-medium"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
