'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface BlurOverlayProps {
  children: React.ReactNode;
  onUpgrade: () => void;
}

export function BlurOverlay({ children, onUpgrade }: BlurOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="filter blur-[6px] select-none pointer-events-none">
        {children}
      </div>

      {/* Overlay Card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="bg-brand-900/85 backdrop-blur-sm border border-accent-500/20 p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent-500" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-text-primary mb-3">
            Upgrade to Pro
          </h3>

          <p className="text-sm text-text-secondary mb-6">
            Get access to full executive summaries with detailed risk analysis,
            decision frameworks, and professional PDF reports.
          </p>

          <div className="space-y-3">
            <Button variant="primary" size="lg" onClick={onUpgrade} className="w-full">
              Unlock Full Analysis
            </Button>
            <div className="text-sm text-text-tertiary">
              $29/month • Unlimited analyses
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
