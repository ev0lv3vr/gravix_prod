'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { user, signOut } = useAuth();
  const { used, limit, remaining } = useUsageTracking();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/tool', label: 'Spec Tool' },
    { href: '/failure', label: 'Failure Analysis' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full h-16 border-b border-brand-700 transition-all duration-normal ease-out-crisp',
          isScrolled
            ? 'bg-brand-900/90 backdrop-blur-lg'
            : 'bg-brand-900'
        )}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-xl font-bold font-heading text-text-primary hover:text-accent-500 transition-colors"
            >
              GRAVIX
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors relative pb-1',
                    isActive(link.href)
                      ? 'text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-500'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <>
                <Badge variant="accent" className="font-mono text-xs">
                  {remaining}/{limit} free
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  Get Started
                </Button>
              </>
            )}
            
            {user && (
              <>
                <Badge variant="accent" className="font-mono text-xs">
                  {used}/{limit} used
                </Badge>
                <div className="text-sm text-text-secondary">
                  {user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-900 md:hidden pt-16">
          <nav className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-lg font-medium py-4 px-4 rounded transition-colors',
                  isActive(link.href)
                    ? 'text-text-primary bg-brand-800'
                    : 'text-text-secondary hover:text-text-primary hover:bg-brand-800'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {!user ? (
                <>
                  <Badge variant="accent" className="font-mono w-fit">
                    {remaining}/{limit} free analyses remaining
                  </Badge>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="accent" className="font-mono w-fit">
                    {used}/{limit} analyses used
                  </Badge>
                  <div className="text-sm text-text-secondary px-4">
                    {user.email}
                  </div>
                  <Button variant="ghost" size="lg" className="w-full" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
