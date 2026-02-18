'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGuidedSession,
  sendGuidedMessage,
  completeGuidedSession,
  createInvestigationFromGuided,
  type GuidedSession,
  type GuidedMessage,
} from '@/lib/products';

function ToolCallCard({ tool, result }: { tool: string; result?: Record<string, unknown> }) {
  const toolLabels: Record<string, string> = {
    lookup_product_tds: 'Checking product specifications…',
    search_similar_cases: 'Searching similar cases…',
    check_specification_compliance: 'Checking specification compliance…',
    generate_5why: 'Generating 5-Why analysis…',
  };

  const matchCount = (result as Record<string, unknown>)?.total_matches;

  return (
    <div className="bg-brand-800 border border-brand-600 rounded px-3 py-2 text-xs my-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
        <span className="text-accent-500 font-medium">{toolLabels[tool] || `Running ${tool}…`}</span>
      </div>
      {matchCount !== undefined && (
        <p className="text-text-tertiary mt-1 ml-4">Found {String(matchCount)} matching cases</p>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: GuidedMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[85%] rounded-lg px-4 py-3 text-sm',
        isUser
          ? 'bg-accent-500 text-white'
          : 'bg-brand-800 border border-brand-600 text-text-primary',
      )}>
        {/* Tool call cards */}
        {message.tool_calls?.map((tc, i) => (
          <ToolCallCard
            key={i}
            tool={tc.tool}
            result={message.tool_results?.[i]?.result}
          />
        ))}

        {/* Message content */}
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-h2:text-base prose-h2:font-semibold prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-[#94A3B8] prose-h3:text-sm prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1 prose-li:text-[#94A3B8] prose-strong:text-white prose-p:my-1.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <div className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-white/60' : 'text-text-tertiary',
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

const PHASES = [
  { num: 1, label: 'Problem' },
  { num: 2, label: 'Containment' },
  { num: 3, label: 'Data Collection' },
  { num: 4, label: 'Root Cause' },
  { num: 5, label: 'Verification' },
  { num: 6, label: 'Corrective Actions' },
];

function PhaseProgressBar({ currentPhase }: { currentPhase: string | undefined }) {
  const isComplete = currentPhase === 'complete';
  const phaseNum = isComplete ? 7 : Number(currentPhase) || 1;

  return (
    <div className="px-6 py-2 border-b border-brand-600">
      <div className="flex items-center gap-1">
        {PHASES.map((p) => (
          <div key={p.num} className="flex items-center gap-1 flex-1">
            <div className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              phaseNum >= p.num ? 'bg-accent-500' : 'bg-brand-700'
            )} />
            <span className={cn(
              'text-[10px] whitespace-nowrap hidden sm:inline',
              phaseNum >= p.num ? 'text-accent-500' : 'text-text-tertiary'
            )}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
      {isComplete && (
        <p className="text-xs text-success mt-1.5">
          ✓ Investigation complete — finalize and create an 8D report below.
        </p>
      )}
    </div>
  );
}

export default function GuidedInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<GuidedSession | null>(null);
  const [messages, setMessages] = useState<GuidedMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy Results');
  const [currentPhase, setCurrentPhase] = useState<string | undefined>('1');
  const [creatingInvestigation, setCreatingInvestigation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load session
  useEffect(() => {
    if (!authLoading && user) {
      getGuidedSession(sessionId)
        .then((s) => {
          setSession(s);
          setMessages(s.messages || []);
          // Extract current phase from last assistant message
          const lastPhaseMsg = (s.messages || [])
            .filter((m: GuidedMessage) => m.role === 'assistant' && m.phase)
            .at(-1);
          if (lastPhaseMsg?.phase) setCurrentPhase(lastPhaseMsg.phase);
        })
        .catch((e) => setError(e.message));
    }
  }, [sessionId, authLoading, user]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: GuidedMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendGuidedMessage(sessionId, userMessage.content);

      // Track phase from AI response
      if (response.phase) setCurrentPhase(response.phase);

      const assistantMessage: GuidedMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        phase: response.phase || undefined,
        tool_calls: response.tool_calls || undefined,
        tool_results: response.tool_results || undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Complete session
  const handleComplete = async () => {
    setCompleting(true);
    try {
      const result = await completeGuidedSession(sessionId, { create_investigation: false });
      setSummary(result.summary);
      setSession(prev => prev ? { ...prev, status: 'completed' } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete session');
    } finally {
      setCompleting(false);
    }
  };

  // Enter key handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auth guard early returns (after all hooks)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400" />
      </div>
    );
  }

  if (!user) return null;

  if (error && !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-danger text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.push('/failure')}>← Back to Analysis</Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary text-sm animate-pulse">Loading investigation…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-brand-600 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold font-mono text-white">Guided Investigation</h1>
          <p className="text-xs text-text-tertiary">
            Session: {sessionId.slice(0, 8)}…
            <span className={cn(
              'ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium',
              session.status === 'active' ? 'bg-success/20 text-success' : 'bg-brand-700 text-text-secondary',
            )}>
              {session.status}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {session.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={completing}
              className="text-xs border-brand-600"
            >
              {completing ? 'Completing…' : '✓ Complete Investigation'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/failure')}
            className="text-xs border-brand-600"
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <PhaseProgressBar currentPhase={currentPhase} />

      {/* Summary (after completion) */}
      {summary && (
        <div className="bg-brand-800 border border-success/30 mx-6 mt-4 rounded-lg p-4">
          <h3 className="text-sm font-bold text-success mb-2">Investigation Summary</h3>
          <div className="text-sm text-text-primary prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-white prose-li:text-[#94A3B8] prose-p:my-1.5">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={creatingInvestigation}
              onClick={async () => {
                setCreatingInvestigation(true);
                try {
                  const result = await createInvestigationFromGuided(sessionId);
                  router.push(`/investigations/${result.investigation_id}`);
                } catch {
                  // Fallback: navigate with session ID to pre-fill
                  router.push(`/investigations/new?guided_session_id=${sessionId}`);
                } finally {
                  setCreatingInvestigation(false);
                }
              }}
            >
              {creatingInvestigation ? 'Creating…' : 'Create 8D Investigation →'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={async () => {
                const text = messages
                  .filter(m => m.role === 'assistant')
                  .map(m => m.content)
                  .join('\n\n---\n\n');
                try {
                  await navigator.clipboard.writeText(text);
                  setCopyLabel('✓ Copied!');
                } catch {
                  setCopyLabel('⚠ Copy failed');
                }
                setTimeout(() => setCopyLabel('Copy Results'), 2000);
              }}
            >
              {copyLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-brand-800 border border-brand-600 rounded-lg px-4 py-3 text-sm text-text-tertiary animate-pulse">
              Thinking…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(session.status === 'active' || session.status === 'paused') && (
        <div className="border-t border-brand-600 px-6 py-4 shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response…"
              className="flex-1 h-11 bg-[#111827] border-[#374151] rounded text-sm"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="h-11 px-6 bg-accent-500 hover:bg-accent-600 text-white"
            >
              Send
            </Button>
          </div>
          {error && (
            <p className="text-danger text-xs mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
