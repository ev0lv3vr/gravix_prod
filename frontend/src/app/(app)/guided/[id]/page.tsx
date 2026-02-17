'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getGuidedSession,
  sendGuidedMessage,
  completeGuidedSession,
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
        <div className="whitespace-pre-wrap">{message.content}</div>

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

export default function GuidedInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<GuidedSession | null>(null);
  const [messages, setMessages] = useState<GuidedMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load session
  useEffect(() => {
    getGuidedSession(sessionId)
      .then((s) => {
        setSession(s);
        setMessages(s.messages || []);
      })
      .catch((e) => setError(e.message));
  }, [sessionId]);

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

      const assistantMessage: GuidedMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
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

      {/* Summary (after completion) */}
      {summary && (
        <div className="bg-brand-800 border border-success/30 mx-6 mt-4 rounded-lg p-4">
          <h3 className="text-sm font-bold text-success mb-2">Investigation Summary</h3>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{summary}</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => router.push('/investigations/new')}
            >
              Create 8D Investigation →
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
      {session.status === 'active' && (
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
