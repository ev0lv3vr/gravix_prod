'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthModal } from '@/components/auth/AuthModal';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Menu, X, User, ChevronDown, Settings, CreditCard, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan, type PlanTier } from '@/contexts/PlanContext';

const PLAN_BADGE_COLORS: Record<PlanTier, string> = {
  free: 'bg-[#374151] text-[#94A3B8]',
  pro: 'bg-accent-500/20 text-accent-500',
  quality: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  enterprise: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  admin: 'bg-red-500/20 text-red-400',
};

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const analyzeRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuth();
  const { plan } = usePlan();
  const showInvestigations = plan === 'quality' || plan === 'enterprise' || plan === 'admin';
  const isAdmin = plan === 'admin';

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close analyze dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (analyzeRef.current && !analyzeRef.current.contains(e.target as Node)) {
        setAnalyzeOpen(false);
      }
    }
    if (analyzeOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [analyzeOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const analyzeItems = user
    ? [
        { href: '/failure', label: 'Failure Analysis' },
        { href: '/tool', label: 'Spec Engine' },
        { href: '/failure?mode=guided', label: 'Guided Investigation' },
      ]
    : [
        { href: '/failure', label: 'Failure Analysis' },
        { href: '/tool', label: 'Spec Engine' },
      ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 bg-[#0A1628] border-b border-[#1F2937]">
        <div className="container mx-auto h-full flex items-center justify-between px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-lg font-bold font-mono text-white hover:text-accent-500 transition-colors"
            >
              GRAVIX
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {/* Analyze Dropdown */}
              <div ref={analyzeRef} className="relative">
                <button
                  onClick={() => setAnalyzeOpen(!analyzeOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                  Analyze
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${analyzeOpen ? 'rotate-180' : ''}`} />
                </button>
                {analyzeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-brand-800 border border-[#1F2937] rounded-lg shadow-xl py-1 z-50">
                    {analyzeItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-[#94A3B8] hover:text-white hover:bg-[#1F2937]/50 transition-colors"
                        onClick={() => setAnalyzeOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/products"
                className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link
                href="/cases"
                className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
              >
                {user ? 'Cases' : 'Case Library'}
              </Link>

              {!user && (
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              )}

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  {showInvestigations && (
                    <Link
                      href="/investigations"
                      className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                    >
                      Investigations
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right: Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#94A3B8] hover:text-white"
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
                  Get Started Free
                </Button>
              </>
            ) : (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-[#94A3B8] hover:text-white">
                      <User className="h-4 w-4" />
                      <span className="text-sm max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${PLAN_BADGE_COLORS[plan]}`}>
                        {plan}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile: Bell + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              className="text-white p-1"
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
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1628] md:hidden pt-16 overflow-y-auto">
          <nav className="flex flex-col p-6 gap-1">
            {/* Analyze Section */}
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold px-4 mb-2">Analyze</p>
              {analyzeItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Explore Section */}
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold px-4 mb-2">Explore</p>
              <Link
                href="/products"
                className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/cases"
                className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user ? 'Cases' : 'Case Library'}
              </Link>
              {!user && (
                <Link
                  href="/pricing"
                  className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
            </div>

            {/* Account Section (logged in) */}
            {user && (
              <div className="mb-2">
                <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold px-4 mb-2">Account</p>
                <Link
                  href="/dashboard"
                  className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {showInvestigations && (
                  <Link
                    href="/investigations"
                    className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Investigations
                  </Link>
                )}
                <Link
                  href="/notifications"
                  className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  href="/settings"
                  className="text-base font-medium py-3 px-4 rounded text-[#94A3B8] hover:text-white hover:bg-brand-800 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </div>
            )}

            {/* Auth Actions */}
            <div className="mt-4 flex flex-col gap-3 border-t border-[#1F2937] pt-4">
              {!user ? (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full text-[#94A3B8]"
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
                    Get Started Free
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-[#94A3B8]"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
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
