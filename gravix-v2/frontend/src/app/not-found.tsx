import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A1628] text-center px-6">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <h2 className="text-xl font-semibold text-[#94A3B8] mb-2">Page Not Found</h2>
      <p className="text-sm text-[#64748B] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/tool"
          className="px-6 py-3 border border-[#374151] text-[#94A3B8] hover:text-white hover:border-accent-500 rounded-lg text-sm font-medium transition-colors"
        >
          Spec Engine
        </Link>
      </div>
    </div>
  );
}
