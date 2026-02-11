import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-[#050D1A] py-12 border-t border-[#1F2937]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="text-lg font-bold font-mono text-white mb-3">
              GRAVIX
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Industrial materials intelligence
            </p>
            <p className="text-xs text-text-tertiary">
              © 2026 Gravix. All rights reserved.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tool" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Spec Engine
                </Link>
              </li>
              <li>
                <Link href="/failure" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Failure Analysis
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Case Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@gravix.ai" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
