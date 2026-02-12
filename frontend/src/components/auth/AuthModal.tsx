'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Mail, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'check-email' | 'reset-sent';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PasswordStrength({ password }: { password: string }) {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const allMet = hasMinLength && hasNumber;

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            hasMinLength ? (allMet ? 'bg-success' : 'bg-warning') : 'bg-[#374151]'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            allMet ? 'bg-success' : 'bg-[#374151]'
          }`}
        />
      </div>
      <div className="space-y-0.5">
        <StrengthRule met={hasMinLength} label="At least 8 characters" />
        <StrengthRule met={hasNumber} label="Contains a number" />
      </div>
    </div>
  );
}

function StrengthRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? (
        <Check className="w-3 h-3 text-success" />
      ) : (
        <XIcon className="w-3 h-3 text-[#64748B]" />
      )}
      <span className={met ? 'text-success' : 'text-[#64748B]'}>{label}</span>
    </div>
  );
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track email used for reset/signup so we can display it in success views
  const [submittedEmail, setSubmittedEmail] = useState('');
  // Resend timer for forgot-password
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setView('sign-in');
    setResendCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
    onOpenChange(false);
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setResendCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setView(newView);
  };

  // Start resend countdown
  const startResendCountdown = useCallback(() => {
    setResendCountdown(30);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message || 'Invalid email or password');
      setIsLoading(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError.message || 'Failed to create account');
      setIsLoading(false);
    } else {
      setSubmittedEmail(email);
      setView('check-email');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await resetPassword(email);

    if (authError) {
      setError(authError.message || 'Failed to send reset link');
      setIsLoading(false);
    } else {
      setSubmittedEmail(email);
      setView('reset-sent');
      setIsLoading(false);
      startResendCountdown();
    }
  };

  const handleResendResetLink = async () => {
    if (resendCountdown > 0 || !submittedEmail) return;
    setIsLoading(true);
    setError(null);

    const { error: authError } = await resetPassword(submittedEmail);
    setIsLoading(false);

    if (authError) {
      setError(authError.message || 'Failed to resend reset link');
    } else {
      startResendCountdown();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await signInWithGoogle();

    if (authError) {
      setError(authError.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const inputClass = 'h-11 bg-brand-900 border-[#374151] text-white placeholder:text-text-tertiary text-sm';

  const PasswordToggle = () => (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const GoogleButton = () => (
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
  );

  const ErrorMessage = () =>
    error ? (
      <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded p-3">
        {error}
      </div>
    ) : null;

  const OrDivider = () => (
    <div className="relative">
      <Separator className="bg-brand-600" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-brand-800 px-3 text-xs text-text-tertiary">or</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] bg-brand-800 border-brand-700 rounded-2xl p-10">
        {/* Sign In */}
        {view === 'sign-in' && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-2xl font-bold font-mono text-white">GRAVIX</div>
              <DialogTitle className="text-center text-white text-xl">
                Sign in to Gravix
              </DialogTitle>
            </div>

            <div className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
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
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-text-secondary">Password</Label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot-password')}
                      className="text-xs text-accent-500 hover:text-accent-400"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={inputClass + ' pr-10'}
                    />
                    <PasswordToggle />
                  </div>
                </div>

                <ErrorMessage />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <OrDivider />
              <GoogleButton />

              <p className="text-sm text-text-tertiary text-center">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchView('sign-up')}
                  className="text-accent-500 hover:text-accent-400 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}

        {/* Sign Up */}
        {view === 'sign-up' && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-2xl font-bold font-mono text-white">GRAVIX</div>
              <DialogTitle className="text-center text-white text-xl">
                Create your account
              </DialogTitle>
            </div>

            <div className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-text-secondary">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-text-secondary">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={inputClass + ' pr-10'}
                    />
                    <PasswordToggle />
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-text-secondary">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <ErrorMessage />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <OrDivider />
              <GoogleButton />

              <p className="text-sm text-text-tertiary text-center">
                Already have an account?{' '}
                <button
                  onClick={() => switchView('sign-in')}
                  className="text-accent-500 hover:text-accent-400 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}

        {/* Forgot Password */}
        {view === 'forgot-password' && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-2xl font-bold font-mono text-white">GRAVIX</div>
              <DialogTitle className="text-center text-white text-xl">
                Reset your password
              </DialogTitle>
              <DialogDescription className="text-center text-text-secondary text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </DialogDescription>
            </div>

            <div className="space-y-4 mt-4">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-text-secondary">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>

                <ErrorMessage />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <p className="text-sm text-text-tertiary text-center">
                <button
                  onClick={() => switchView('sign-in')}
                  className="text-accent-500 hover:text-accent-400 font-medium"
                >
                  ← Back to sign in
                </button>
              </p>
            </div>
          </>
        )}

        {/* Reset link sent (forgot-password success) */}
        {view === 'reset-sent' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent-500" />
              </div>
            </div>
            <DialogTitle className="mb-2 text-white text-xl">Check your inbox</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Password reset link sent to <strong className="text-white">{submittedEmail}</strong>.
              <br />
              Check your inbox and click the link to reset your password.
            </DialogDescription>

            <ErrorMessage />

            <div className="flex flex-col gap-3 items-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendResetLink}
                disabled={resendCountdown > 0 || isLoading}
                className="text-accent-500 hover:text-accent-400 disabled:text-text-tertiary"
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : isLoading
                    ? 'Sending…'
                    : 'Resend reset link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchView('sign-in')}
                className="text-text-secondary hover:text-white"
              >
                Back to sign in
              </Button>
            </div>
          </div>
        )}

        {/* Check Email (after sign up) */}
        {view === 'check-email' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent-500" />
              </div>
            </div>
            <DialogTitle className="mb-2 text-white text-xl">Verify your email</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Check your email to verify your account.
              <br />
              We sent a confirmation link to <strong className="text-white">{submittedEmail}</strong>.
            </DialogDescription>
            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchView('sign-in')}
                className="text-text-secondary hover:text-white"
              >
                Back to sign in
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
