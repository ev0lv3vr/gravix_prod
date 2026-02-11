import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-brand-700 bg-brand-900 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand + Tagline */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold font-heading text-text-primary hover:text-accent-500 transition-colors"
            >
              GRAVIX
            </Link>
            <p className="mt-3 text-sm text-text-secondary max-w-xs">
              Industrial adhesive specification platform powered by AI. Trusted by engineers worldwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tool"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Spec Tool
                </Link>
              </li>
              <li>
                <Link
                  href="/failure"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Failure Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-brand-700">
          <p className="text-sm text-text-tertiary text-center">
            © {currentYear} Gravix is a product of GLUE MASTERS LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
