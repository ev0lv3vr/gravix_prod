'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleClose = () => {
    setIsSuccess(false);
    setEmail('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="text-2xl font-bold font-heading text-accent-500">
                  GRAVIX
                </div>
              </div>
              <DialogTitle className="text-center">Sign in to Gravix</DialogTitle>
              <DialogDescription className="text-center">
                Enter your email to receive a magic link
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Magic Link →'}
              </Button>

              <p className="text-xs text-text-tertiary text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent-500" />
              </div>
            </div>
            <DialogTitle className="mb-2">Check your inbox</DialogTitle>
            <DialogDescription>
              We sent a magic link to <strong>{email}</strong>
              <br />
              Click the link in the email to sign in.
            </DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="mt-6"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
