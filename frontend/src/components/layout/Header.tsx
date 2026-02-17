'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthModal } from '@/components/auth/AuthModal';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, signOut } = useAuth();
  const { used, limit } = useUsageTracking();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    api.getCurrentUser().then((u) => {
      setIsAdmin(u?.role === 'admin');
    }).catch(() => {
      setIsAdmin(false);
    });
  }, [user]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    { href: '/tool', label: 'Spec Engine' },
    { href: '/failure', label: 'Failure Analysis' },
    ...(user ? [{ href: '/investigations', label: 'Investigations' }] : []),
    { href: '/pricing', label: 'Pricing' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 bg-[#0A1628] border-b border-[#1F2937]">
        <div className="container mx-auto h-full flex items-center justify-between px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-lg font-bold font-mono text-white hover:text-accent-500 transition-colors"
            >
              GRAVIX
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-accent-500 hover:bg-accent-600 text-white"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Try Free →
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="font-mono text-xs text-text-secondary border-brand-600">
                  {used}/{limit} analyses
                </Badge>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/history">History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
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

      {/* Mobile Menu Overlay — full-screen */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1628] md:hidden pt-16">
          <nav className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium py-4 px-4 rounded text-text-secondary hover:text-white hover:bg-brand-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {!user ? (
                <>
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
                    variant="default"
                    size="lg"
                    className="w-full bg-accent-500 hover:bg-accent-600"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Try Free →
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="font-mono w-fit border-brand-600">
                    {used}/{limit} analyses
                  </Badge>
                  <Link
                    href="/settings"
                    className="text-lg font-medium py-4 px-4 rounded text-text-secondary hover:text-white hover:bg-brand-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/history"
                    className="text-lg font-medium py-4 px-4 rounded text-text-secondary hover:text-white hover:bg-brand-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    History
                  </Link>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={handleSignOut}
                  >
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
