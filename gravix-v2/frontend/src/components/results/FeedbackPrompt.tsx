'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  api,
  type FeedbackSubmitData,
  type FeedbackCreateResponse,
} from '@/lib/api';

const OUTCOME_OPTIONS = [
  { value: 'resolved', label: 'Resolved' },
  { value: 'partially_resolved', label: 'Partially Resolved' },
  { value: 'not_resolved', label: 'Not Resolved' },
  { value: 'different_cause', label: 'Different Cause' },
  { value: 'still_testing', label: 'Still Testing' },
  { value: 'abandoned', label: 'Abandoned' },
] as const;

interface FeedbackPromptProps {
  analysisId?: string;
  specId?: string;
  /** Pre-select the outcome (e.g. from email link) */
  defaultOutcome?: string;
  /** Source hint (in_app | email) */
  feedbackSource?: string;
}

export function FeedbackPrompt({
  analysisId,
  specId,
  defaultOutcome,
  feedbackSource = 'in_app',
}: FeedbackPromptProps) {
  // Stage tracking
  const [stage, setStage] = useState<'thumbs' | 'details' | 'done'>('thumbs');
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [rootCauseConfirmed, setRootCauseConfirmed] = useState(0);
  const [outcome, setOutcome] = useState(defaultOutcome ?? '');
  const [whatWorked, setWhatWorked] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackCreateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleThumbClick = (helpful: boolean) => {
    setWasHelpful(helpful);
    setStage('details');
  };

  const handleSubmit = async () => {
    if (wasHelpful === null) return;
    setSubmitting(true);
    setError(null);

    const data: FeedbackSubmitData = {
      analysis_id: analysisId,
      spec_id: specId,
      was_helpful: wasHelpful,
      root_cause_confirmed: rootCauseConfirmed,
      outcome: outcome || undefined,
      what_worked: whatWorked || undefined,
      feedback_source: feedbackSource,
    };

    try {
      const res = await api.submitFeedback(data);
      setResult(res);
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  // Done state
  if (stage === 'done' && result) {
    return (
      <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">
          Thank you for your feedback!
        </h3>
        <p className="text-sm text-[#94A3B8]">
          Your input has improved{' '}
          <span className="text-accent-500 font-semibold">
            {result.cases_improved}
          </span>{' '}
          case{result.cases_improved !== 1 ? 's' : ''} in the knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
      {/* Stage 1: Thumbs up/down */}
      <h3 className="text-sm font-medium text-[#94A3B8] mb-4">
        Was this analysis helpful?
      </h3>
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleThumbClick(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
            wasHelpful === true
              ? 'border-green-500 bg-green-500/10 text-green-400'
              : 'border-[#374151] text-[#94A3B8] hover:border-green-500/50'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful
        </button>
        <button
          onClick={() => handleThumbClick(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
            wasHelpful === false
              ? 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-[#374151] text-[#94A3B8] hover:border-red-500/50'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          Not Helpful
        </button>
      </div>

      {/* Stage 2: Expanded details */}
      {stage === 'details' && (
        <div className="space-y-5 border-t border-[#1F2937] pt-5">
          {/* Root cause confirmation */}
          <div>
            <label className="text-[13px] font-medium text-[#94A3B8] mb-2 block">
              Which ranked root cause was correct?
            </label>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRootCauseConfirmed(n)}
                  className={`w-9 h-9 rounded-lg border-2 text-sm font-medium transition-all ${
                    rootCauseConfirmed === n
                      ? 'border-accent-500 bg-accent-500/10 text-accent-500'
                      : 'border-[#374151] text-[#94A3B8] hover:border-accent-500/50'
                  }`}
                >
                  {n === 0 ? '✕' : n}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              0 = none were correct, 1-5 = which ranked cause matched
            </p>
          </div>

          {/* Outcome select */}
          <div>
            <label className="text-[13px] font-medium text-[#94A3B8] mb-2 block">
              Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full bg-[#111827] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
            >
              <option value="">Select outcome…</option>
              {OUTCOME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* What worked textarea */}
          <div>
            <label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              {wasHelpful
                ? 'What worked? (optional)'
                : 'What could be improved? (optional)'}
            </label>
            <Textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder={
                wasHelpful
                  ? 'The recommended surface prep resolved the delamination…'
                  : 'The actual root cause was moisture ingress, not cure failure…'
              }
              rows={3}
              className="bg-[#111827] border-[#374151] rounded text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white h-11"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
