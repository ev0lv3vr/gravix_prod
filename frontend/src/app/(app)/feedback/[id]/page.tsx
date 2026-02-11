'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

export default function FeedbackPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const [outcome, setOutcome] = useState<'helpful' | 'not_helpful' | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock analysis summary
  const analysisSummary = {
    type: 'Failure Analysis',
    date: '2024-12-10',
    primaryCause: 'Inadequate Surface Preparation',
    substrates: 'Aluminum 6061 → ABS',
  };

  const handleSubmit = async () => {
    // TODO: POST to /v1/feedback/{analysisId}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-[560px] text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">Thank you for your feedback!</h1>
          <p className="text-sm text-[#94A3B8] mb-6">
            Your outcome data helps improve future analyses for all engineers.
          </p>
          <Link href="/dashboard" className="text-sm text-accent-500 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div className="max-w-[560px] w-full">
        {/* Analysis Summary */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 mb-8">
          <div className="text-xs text-[#64748B] mb-1">Analysis #{analysisId}</div>
          <h2 className="text-lg font-semibold text-white mb-2">{analysisSummary.primaryCause}</h2>
          <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">{analysisSummary.type}</span>
            <span>{analysisSummary.substrates}</span>
            <span className="text-[#64748B]">{analysisSummary.date}</span>
          </div>
        </div>

        {/* Feedback Prompt */}
        <h1 className="text-xl font-bold text-white mb-6">How did it go?</h1>

        {/* Outcome buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setOutcome('helpful')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-all ${
              outcome === 'helpful'
                ? 'border-success bg-success/10 text-success'
                : 'border-[#374151] text-[#94A3B8] hover:border-success/50'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="font-medium">Helpful</span>
          </button>
          <button
            onClick={() => setOutcome('not_helpful')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-all ${
              outcome === 'not_helpful'
                ? 'border-danger bg-danger/10 text-danger'
                : 'border-[#374151] text-[#94A3B8] hover:border-danger/50'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-medium">Not Helpful</span>
          </button>
        </div>

        {/* Details textarea */}
        {outcome && (
          <div className="mb-6">
            <label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              {outcome === 'helpful' ? 'What worked? (optional)' : 'What was wrong? (optional)'}
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={outcome === 'helpful'
                ? 'The recommended fix resolved the issue...'
                : 'The root cause was actually...'
              }
              rows={4}
              className="bg-[#111827] border-[#374151] rounded text-sm resize-none"
            />
          </div>
        )}

        {/* Submit */}
        {outcome && (
          <Button
            onClick={handleSubmit}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white h-12"
          >
            Submit Feedback
          </Button>
        )}

        <p className="text-xs text-[#64748B] text-center mt-4">
          Your feedback is anonymized and helps improve analysis accuracy for everyone.
        </p>
      </div>
    </div>
  );
}
