'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await signIn(email);

    if (authError) {
      setError(authError.message || 'Failed to send magic link');
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setEmail('');
    setError(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleResend = async () => {
    if (email) {
      setIsSuccess(false);
      setIsLoading(true);
      setError(null);
      const { error: authError } = await signIn(email);
      if (authError) {
        setError(authError.message || 'Failed to send magic link');
      } else {
        setIsSuccess(true);
      }
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] bg-brand-800 border-brand-700 rounded-2xl p-10">
        {!isSuccess ? (
          <>
            <div className="flex flex-col items-center space-y-4">
              {/* Logo */}
              <div className="text-2xl font-bold font-mono text-white">
                GRAVIX
              </div>
              <DialogTitle className="text-center text-white text-xl">
                Sign in to Gravix
              </DialogTitle>
            </div>

            <div className="space-y-4 mt-4">
              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-11 bg-brand-900 border-[#374151] text-white placeholder:text-text-tertiary text-sm"
                  />
                </div>

                {error && (
                  <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <Separator className="bg-brand-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-brand-800 px-3 text-xs text-text-tertiary">or</span>
                </div>
              </div>

              {/* Google OAuth */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full border-brand-600 text-white hover:bg-brand-700 h-12"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-xs text-text-tertiary text-center">
                No account? We&apos;ll create one automatically.
              </p>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent-500" />
              </div>
            </div>
            <DialogTitle className="mb-2 text-white text-xl">Check your inbox</DialogTitle>
            <DialogDescription className="text-text-secondary">
              We sent a magic link to <strong className="text-white">{email}</strong>
              <br />
              Click the link in the email to sign in.
            </DialogDescription>
            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                className="text-text-secondary hover:text-white"
              >
                Resend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-text-secondary hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
