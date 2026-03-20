'use client';

import { useEffect, useState } from 'react';

interface Stage {
  label: string;
  /** Time in seconds when this stage activates */
  at: number;
}

interface AnalysisProgressProps {
  active: boolean;
  stages: Stage[];
  /** Message shown after this many seconds (default 60) */
  slowThresholdSec?: number;
  slowMessage?: string;
}

function StepDot({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <div className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (active) {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-accent-500 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
      </div>
    );
  }
  return <div className="w-5 h-5 rounded-full border-2 border-[#334155] flex-shrink-0" />;
}

export function AnalysisProgress({
  active,
  stages,
  slowThresholdSec = 60,
  slowMessage = 'This analysis is taking longer than usual. Please wait…',
}: AnalysisProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      setCurrentStage(0);
      return;
    }

    const iv = setInterval(() => {
      setElapsed(t => {
        const next = t + 0.1;
        // Advance stage based on time
        for (let i = stages.length - 1; i >= 0; i--) {
          if (next >= stages[i].at) {
            setCurrentStage(i);
            break;
          }
        }
        return next;
      });
    }, 100);

    return () => clearInterval(iv);
  }, [active, stages]);

  if (!active) return null;

  const isSlow = elapsed >= slowThresholdSec;
  const progress = Math.min(
    ((currentStage + 1) / stages.length) * 95,
    95
  );

  return (
    <div className="h-full flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-md space-y-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-3">
            <StepDot done={currentStage > i} active={currentStage === i} />
            <span className={`text-sm transition-colors duration-300 ${
              currentStage === i ? 'text-white font-medium' :
              currentStage > i ? 'text-[#64748B]' : 'text-[#475569]'
            }`}>
              {stage.label}
            </span>
          </div>
        ))}

        <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-accent-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          {isSlow ? (
            <span className="text-xs text-amber-400">{slowMessage}</span>
          ) : (
            <span />
          )}
          <span className="text-xs font-mono text-[#64748B]">{elapsed.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

/** Pre-built stage configs */
export const FAILURE_STAGES: Stage[] = [
  { label: 'Analyzing failure description…', at: 0 },
  { label: 'Evaluating substrate compatibility…', at: 5 },
  { label: 'Identifying root causes…', at: 15 },
  { label: 'Generating recommendations…', at: 25 },
  { label: 'Finalizing report…', at: 40 },
];

export const SPEC_STAGES: Stage[] = [
  { label: 'Analyzing substrate pair…', at: 0 },
  { label: 'Processing requirements…', at: 5 },
  { label: 'Matching product database…', at: 15 },
  { label: 'Generating specification…', at: 25 },
  { label: 'Finalizing recommendations…', at: 40 },
];
