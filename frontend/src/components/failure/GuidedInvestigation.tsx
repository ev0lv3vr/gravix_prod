'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Pause, FileText, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import ReactMarkdown from 'react-markdown';
import {
  sendGuidedMessage,
  startGuidedSession,
  completeGuidedSession,
  pauseGuidedSession,
  uploadDefectPhoto,
  createInvestigationFromGuided,
  type GuidedMessageResponse,
} from '@/lib/products';

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  toolCalls?: Array<{ tool: string; label: string }>;
  isToolIndicator?: boolean;
  photoUrl?: string;
}

// ============================================================================
// Mock initial message & responses (used when no API)
// ============================================================================

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    "I'll help you diagnose this adhesive failure step by step. Start by describing what happened — what failed, when, and what it looked like.",
  timestamp: new Date().toISOString(),
  quickReplies: [
    'Bond failed after months in service',
    'Failure during assembly/curing',
    'Field failure at customer site',
    'Recurring production defect',
  ],
};

function generateMockResponse(_userMessage: string, turnNumber: number): ChatMessage {
  const responses: ChatMessage[] = [
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        "Thanks for the details. I'm searching for similar cases in our database to provide more context.",
      timestamp: new Date().toISOString(),
      toolCalls: [{ tool: 'search_similar_cases', label: 'Searching similar cases...' }],
      quickReplies: [],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        'I found several similar cases. A few targeted questions to narrow down the root cause:\n\nWhat surface preparation did you use before bonding?',
      timestamp: new Date().toISOString(),
      quickReplies: ['IPA Wipe', 'Abrasion', 'Plasma', 'Primer', 'None'],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        'What type of adhesive were you using, and do you know the specific product?',
      timestamp: new Date().toISOString(),
      quickReplies: ['Cyanoacrylate', 'Epoxy', 'Polyurethane', 'Methacrylate', 'Not sure'],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        "What were the environmental conditions during service? This is important because many adhesive failures are environment-related.",
      timestamp: new Date().toISOString(),
      quickReplies: [
        'High humidity',
        'UV/Outdoor',
        'Thermal cycling',
        'Chemical exposure',
        'Normal indoor',
      ],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        'Can you describe the failure surface? What did the broken bond look like? If possible, upload a photo of the fracture surface — this helps our visual AI classify the failure mode.',
      timestamp: new Date().toISOString(),
      quickReplies: [
        'Clean surface — adhesive on one side only',
        'Adhesive torn/ripped',
        'Mix of both',
        "I'll upload a photo",
      ],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        "Were there any process deviations before the failure? For example: different batch of adhesive, new operator, temperature change, etc.",
      timestamp: new Date().toISOString(),
      quickReplies: [
        'New adhesive batch/lot',
        'Different operator',
        'Process change',
        'No changes noticed',
      ],
    },
    {
      id: `ai-${turnNumber}`,
      role: 'assistant',
      content:
        "How long after bonding did the failure occur?",
      timestamp: new Date().toISOString(),
      quickReplies: [
        'During assembly',
        'Hours',
        'Days',
        'Weeks',
        '1–6 months',
        '6+ months',
      ],
    },
  ];

  // Cycle through responses
  const idx = Math.min(turnNumber - 1, responses.length - 1);
  return { ...responses[idx], id: `ai-${Date.now()}` };
}

// ============================================================================
// Sub-components
// ============================================================================

function ToolCallIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
      <span className="text-sm italic text-[#64748B]">🔍 {label}</span>
    </div>
  );
}

function ChatBubble({
  message,
  onQuickReply,
}: {
  message: ChatMessage;
  onQuickReply?: (text: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-accent-500/20 border border-accent-500/30 text-white'
            : 'bg-brand-800 border border-[#1F2937] text-white'
        )}
      >
        {/* Tool call indicators */}
        {message.toolCalls?.map((tc, i) => (
          <ToolCallIndicator key={i} label={tc.label} />
        ))}

        {/* Photo attachment */}
        {message.photoUrl && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.photoUrl}
              alt="Uploaded defect photo"
              className="w-40 h-40 object-cover rounded border border-[#374151]"
            />
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-white prose-h2:text-base prose-h2:font-semibold prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-[#94A3B8] prose-h3:text-sm prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1 prose-li:text-[#94A3B8] prose-strong:text-white prose-p:my-1.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Quick replies */}
        {message.quickReplies && message.quickReplies.length > 0 && onQuickReply && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply(reply)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1F2937] hover:bg-[#374151] text-white border border-[#374151] transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsCard({
  onOpenInvestigation,
  showInvestigationButton,
  rootCause,
  confidence,
  actions,
  onExport,
  exportDone,
  creatingInvestigation,
}: {
  onOpenInvestigation: () => void;
  showInvestigationButton: boolean;
  rootCause: string;
  confidence: number | null;
  actions: string[];
  onExport: () => void;
  exportDone: boolean;
  creatingInvestigation?: boolean;
}) {
  return (
    <div className="bg-brand-800 border border-accent-500/30 rounded-lg p-5 w-full">
      <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-accent-500" />
        Investigation Complete
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">
            Primary Root Cause
          </p>
          <p className="text-white">
            {rootCause || 'See summary above for root cause analysis.'}
          </p>
        </div>

        {confidence !== null && (
          <div>
            <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">
              Confidence
            </p>
            <p className="text-accent-500 font-mono font-bold">{confidence}%</p>
          </div>
        )}

        {actions.length > 0 && (
          <div>
            <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">
              Immediate Actions
            </p>
            <ul className="text-[#94A3B8] list-disc list-inside space-y-1">
              {actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#1F2937]">
        {showInvestigationButton && (
          <Button
            onClick={onOpenInvestigation}
            disabled={creatingInvestigation}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm disabled:opacity-50"
          >
            {creatingInvestigation ? 'Creating…' : 'Create 8D Investigation →'}
          </Button>
        )}
        <Button
          variant="outline"
          className="border-[#374151] text-[#94A3B8] hover:text-white text-sm"
          onClick={onExport}
        >
          {exportDone ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Phase Progress Bar
// ============================================================================

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
    <div className="px-4 md:px-8 py-2 border-b border-[#1F2937]">
      <div className="flex items-center gap-1">
        {PHASES.map((p) => (
          <div key={p.num} className="flex items-center gap-1 flex-1">
            <div className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              phaseNum >= p.num ? 'bg-accent-500' : 'bg-brand-700'
            )} />
            <span className={cn(
              'text-[10px] whitespace-nowrap hidden sm:inline',
              phaseNum >= p.num ? 'text-accent-500' : 'text-[#64748B]'
            )}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
      {isComplete && (
        <p className="text-xs text-green-400 mt-1.5">
          ✓ Investigation complete — finalize and create an 8D report below.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function GuidedInvestigation() {
  const router = useRouter();
  const { user } = useAuth();
  const { plan: userPlanFromContext, isAdmin } = usePlan();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [useApi, setUseApi] = useState(true);
  const [exportDone, setExportDone] = useState(false);
  const [showPhotoUpgrade, setShowPhotoUpgrade] = useState(false);

  // Completion data (Patch 2 — dynamic summary card)
  const [completionRootCause, setCompletionRootCause] = useState('');
  const [completionConfidence, setCompletionConfidence] = useState<number | null>(null);
  const [completionActions, setCompletionActions] = useState<string[]>([]);

  // Phase tracking
  const [currentPhase, setCurrentPhase] = useState<string | undefined>('1');
  const [creatingInvestigation, setCreatingInvestigation] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Plan-based feature gating
  const canUploadPhotos = isAdmin || (userPlanFromContext !== 'free');
  const isFree = userPlanFromContext === 'free' && !isAdmin;
  const isQualityPlus = ['quality', 'team', 'enterprise'].includes(userPlanFromContext) || isAdmin;
  const maxTurns = isFree ? 10 : 999;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`; // max 4 rows ~96px
    }
  }, [input]);

  // Initialize session with API (optional)
  useEffect(() => {
    if (sessionId || !user) return;

    startGuidedSession({ initial_context: {} })
      .then((session) => {
        setSessionId(session.id);
        if (session.messages && session.messages.length > 0) {
          const mapped = session.messages.map((m, i) => ({
            id: `api-${i}`,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
            quickReplies: m.suggestions ?? undefined,
          }));
          setMessages(mapped);
        }
      })
      .catch(() => {
        setUseApi(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Send message
  const sendMessage = async (text: string) => {
    if (!text.trim() || sending || isCompleted) return;
    if (turnCount >= maxTurns) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Remove quick replies from last assistant message
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.role === 'assistant'
          ? { ...m, quickReplies: undefined }
          : m
      )
    );

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      let response: GuidedMessageResponse | null = null;
      let newTurn = turnCount;

      if (useApi && sessionId) {
        try {
          response = await sendGuidedMessage(sessionId, text.trim());
          // Only increment after successful API call
          newTurn = turnCount + 1;
          setTurnCount(newTurn);
        } catch {
          // Fall back to mock
          setUseApi(false);
        }
      }

      if (!response && !useApi) {
        // Mock fallback — still increment
        newTurn = turnCount + 1;
        setTurnCount(newTurn);
      }

      if (response) {
        // Track phase from AI response
        if (response.phase) setCurrentPhase(response.phase);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          toolCalls: response.tool_calls?.map((tc) => ({
            tool: tc.tool,
            label: getToolLabel(tc.tool),
          })),
          quickReplies: response.suggestions ?? undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Mock response
        const mockResponse = generateMockResponse(text, newTurn);
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMessages((prev) => [...prev, mockResponse]);
      }

      // Warn before turn limit (Patch 0B)
      if (newTurn === maxTurns - 2 && isFree) {
        const warningMsg: ChatMessage = {
          id: `system-warning-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ You have ${maxTurns - newTurn} turns remaining on the free tier. I'd recommend we wrap up the investigation — I can generate a summary of our findings now, or you can continue for ${maxTurns - newTurn} more turns.`,
          timestamp: new Date().toISOString(),
          quickReplies: ['Generate summary now', 'Continue investigating'],
        };
        setMessages(prev => [...prev, warningMsg]);
      }

      // Check completion
      if (newTurn >= maxTurns) {
        await handleComplete();
      }
    } catch (err) {
      console.error('Guided message error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // Handle photo upload — sends to backend for real Claude visual analysis
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!sessionId || !useApi) return;

    setSending(true);

    try {
      // Upload to Supabase storage
      let photoUrl: string;
      try {
        const result = await uploadDefectPhoto(file);
        photoUrl = result.url;
      } catch {
        photoUrl = URL.createObjectURL(file);
      }

      // Show photo in chat as user message
      const photoMsg: ChatMessage = {
        id: `user-photo-${Date.now()}`,
        role: 'user',
        content: 'Uploaded defect photo for analysis',
        timestamp: new Date().toISOString(),
        photoUrl,
      };
      setMessages((prev) => [...prev, photoMsg]);

      // Send to backend WITH the photo URL — let Claude actually analyze it
      const response = await sendGuidedMessage(
        sessionId,
        'Please analyze this defect photo',
        [photoUrl]
      );

      // Track phase from AI response
      if (response.phase) setCurrentPhase(response.phase);

      const aiResponse: ChatMessage = {
        id: `ai-photo-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        toolCalls: response.tool_calls?.map((tc) => ({
          tool: tc.tool,
          label: getToolLabel(tc.tool),
        })),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Increment turn count after successful API call
      const newTurn = turnCount + 1;
      setTurnCount(newTurn);

      if (newTurn >= maxTurns) {
        await handleComplete();
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      const errorMsg: ChatMessage = {
        id: `err-photo-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I could not analyze the photo. Please try again or describe the failure surface in text.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Helper: parse root cause / actions from last assistant message
  const extractFromMessages = useCallback((msgs: ChatMessage[]) => {
    const assistantMsgs = msgs.filter(m => m.role === 'assistant');
    if (assistantMsgs.length === 0) return;
    const last = assistantMsgs[assistantMsgs.length - 1].content;

    // Try to extract a root cause sentence
    const rcMatch = last.match(/(?:root cause|primary cause|systemic root cause)[:\s]*([^\n.]+)/i);
    if (rcMatch) setCompletionRootCause(rcMatch[1].trim());

    // Try to extract confidence
    const confMatch = last.match(/(?:confidence)[:\s]*(\d{1,3})%/i);
    if (confMatch) setCompletionConfidence(parseInt(confMatch[1], 10));

    // Try to extract action items (lines starting with - or numbered)
    const actionLines = last.match(/^[\s]*[-•*\d]+[.)]\s+(.+)/gm);
    if (actionLines && actionLines.length > 0) {
      setCompletionActions(actionLines.slice(0, 5).map(l => l.replace(/^[\s]*[-•*\d]+[.)]\s+/, '').trim()));
    }
  }, []);

  // Complete session
  const handleComplete = async () => {
    setIsCompleted(true);

    if (useApi && sessionId) {
      try {
        const result = await completeGuidedSession(sessionId);
        // Try to extract structured data from the summary
        if (result.summary) {
          // Parse root cause from summary
          const rcMatch = result.summary.match(/(?:root cause|primary cause)[:\s]*([^\n.]+)/i);
          if (rcMatch) setCompletionRootCause(rcMatch[1].trim());

          // Parse confidence from summary
          const confMatch = result.summary.match(/(?:confidence)[:\s]*(\d{1,3})%/i);
          if (confMatch) setCompletionConfidence(parseInt(confMatch[1], 10));

          // Parse actions from summary
          const actionLines = result.summary.match(/^[\s]*[-•*\d]+[.)]\s+(.+)/gm);
          if (actionLines && actionLines.length > 0) {
            setCompletionActions(actionLines.slice(0, 5).map(l => l.replace(/^[\s]*[-•*\d]+[.)]\s+/, '').trim()));
          }
        }
      } catch {
        // Fall back to parsing from conversation messages
        extractFromMessages(messages);
      }
    } else {
      extractFromMessages(messages);
    }
  };

  // Pause & Save (Patch 0C — call backend)
  const handlePauseAndSave = async () => {
    if (useApi && sessionId) {
      try {
        await pauseGuidedSession(sessionId);
      } catch {
        // Fall back to localStorage if backend fails
        try {
          localStorage.setItem(
            'gravix_guided_session',
            JSON.stringify({
              sessionId,
              messages,
              turnCount,
              savedAt: new Date().toISOString(),
            })
          );
        } catch {
          // noop
        }
      }
    } else {
      try {
        localStorage.setItem(
          'gravix_guided_session',
          JSON.stringify({
            sessionId,
            messages,
            turnCount,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // noop
      }
    }
    router.push('/dashboard');
  };

  // Patch 4: Copy results to clipboard
  const handleExportResults = async () => {
    const text = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2000);
    }
  };

  // Quick reply handler
  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px-32px)] bg-[#0A1628]">
      {/* Phase Progress Bar */}
      <PhaseProgressBar currentPhase={currentPhase} />

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onQuickReply={
              !isCompleted && !sending
                ? handleQuickReply
                : undefined
            }
          />
        ))}

        {/* Sending indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#64748B] italic">
                <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                Analyzing...
              </div>
            </div>
          </div>
        )}

        {/* Results card on completion */}
        {isCompleted && (
          <ResultsCard
            showInvestigationButton={isQualityPlus}
            onOpenInvestigation={async () => {
              if (!sessionId) {
                router.push('/investigations/new');
                return;
              }
              setCreatingInvestigation(true);
              try {
                const result = await createInvestigationFromGuided(sessionId);
                router.push(`/investigations/${result.investigation_id}`);
              } catch {
                router.push(`/investigations/new?guided_session_id=${sessionId}`);
              } finally {
                setCreatingInvestigation(false);
              }
            }}
            rootCause={completionRootCause}
            confidence={completionConfidence}
            actions={completionActions}
            onExport={handleExportResults}
            exportDone={exportDone}
            creatingInvestigation={creatingInvestigation}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      {!isCompleted && (
        <div className="border-t border-[#1F2937] px-4 md:px-8 py-4 bg-brand-800/50 shrink-0">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            {/* Photo upload */}
            <button
              onClick={() => {
                if (!canUploadPhotos) {
                  setShowPhotoUpgrade(true);
                  return;
                }
                photoInputRef.current?.click();
              }}
              className="shrink-0 p-2.5 rounded-lg text-[#64748B] hover:text-accent-500 hover:bg-[#1F2937] transition-colors"
              title="Upload defect photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {showPhotoUpgrade && (
              <div className="absolute bottom-20 left-4 z-10 bg-brand-800 border border-accent-500/30 rounded-lg p-4 max-w-xs shadow-xl">
                <p className="text-sm text-white font-medium mb-1">📸 Photo analysis requires Pro</p>
                <p className="text-xs text-[#94A3B8] mb-3">
                  Visual AI defect analysis is available on Pro ($49/mo) and above.
                </p>
                <div className="flex gap-2">
                  <a
                    href="/pricing"
                    className="px-3 py-1.5 text-xs font-medium bg-accent-500 hover:bg-accent-600 text-white rounded transition-colors"
                  >
                    Upgrade →
                  </a>
                  <button
                    onClick={() => setShowPhotoUpgrade(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isFree && turnCount >= maxTurns
                  ? 'Turn limit reached — upgrade for unlimited messages'
                  : 'Type your answer or click a suggestion...'
              }
              rows={1}
              className="flex-1 bg-[#111827] border border-[#374151] text-white text-sm rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:border-accent-500 transition-colors placeholder:text-[#64748B]"
              style={{ maxHeight: '96px' }}
              disabled={sending || (isFree && turnCount >= maxTurns)}
            />

            {/* Send button */}
            <Button
              onClick={() => sendMessage(input)}
              disabled={sending || !input.trim() || (isFree && turnCount >= maxTurns)}
              className="shrink-0 h-10 w-10 p-0 bg-accent-500 hover:bg-accent-600 text-white rounded-lg disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Bar — Turn counter + Complete + Pause */}
      <div className="border-t border-[#1F2937] px-4 md:px-8 py-2 bg-brand-800/30 flex items-center justify-between shrink-0">
        <div>
          {isFree && !isCompleted && (
            <span className={cn(
              'text-xs',
              turnCount >= maxTurns ? 'text-red-400' :
              turnCount >= maxTurns - 2 ? 'text-yellow-400' :
              'text-[#64748B]'
            )}>
              Turn {turnCount} of {maxTurns}
              {turnCount >= maxTurns - 2 && turnCount < maxTurns && (
                <span className="ml-1">
                  · {maxTurns - turnCount} remaining.{' '}
                  <a href="/pricing" className="text-accent-500 hover:underline">Upgrade for unlimited</a>
                </span>
              )}
              {turnCount >= maxTurns && (
                <span className="ml-1">
                  · Limit reached.{' '}
                  <a href="/pricing" className="text-accent-500 hover:underline">Upgrade for unlimited →</a>
                </span>
              )}
              {turnCount < maxTurns - 2 && (
                <span className="text-[#4B5563]"> (Free tier)</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && turnCount >= 3 && (
            <Button
              onClick={handleComplete}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              ✓ Complete Investigation
            </Button>
          )}
          {!isCompleted && (
            <button
              onClick={handlePauseAndSave}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    search_similar_cases: 'Searching similar cases...',
    lookup_product_tds: 'Checking product specifications...',
    check_specification_compliance: 'Checking specification compliance...',
    generate_5why: 'Generating 5-Why analysis...',
    visual_analysis: 'Analyzing fracture surface photo...',
  };
  return labels[tool] || `Running ${tool}...`;
}
