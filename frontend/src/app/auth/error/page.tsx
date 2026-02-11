import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] px-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-6">🔐</div>
        <h1 className="text-2xl font-bold text-white mb-3">Authentication Error</h1>
        <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
          We couldn&apos;t verify your login link. This can happen if the link
          has expired or has already been used.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full text-center bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Go to Home
          </Link>
          <p className="text-xs text-[#64748B]">
            Try signing in again from the home page. Magic links expire after 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}
