'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Pause, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  sendGuidedMessage,
  startGuidedSession,
  completeGuidedSession,
  uploadDefectPhoto,
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
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

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
}: {
  onOpenInvestigation: () => void;
  showInvestigationButton: boolean;
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
            Moisture degradation of cyanoacrylate bond in high-humidity environment
          </p>
        </div>

        <div>
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">
            Confidence
          </p>
          <p className="text-accent-500 font-mono font-bold">87%</p>
        </div>

        <div>
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">
            Immediate Actions
          </p>
          <ul className="text-[#94A3B8] list-disc list-inside space-y-1">
            <li>Switch to rubber-toughened cyanoacrylate (Loctite 480) for humidity resistance</li>
            <li>Apply SF 770 primer for low-surface-energy substrates</li>
            <li>Control application environment to &lt;50% RH</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#1F2937]">
        {showInvestigationButton && (
          <Button
            onClick={onOpenInvestigation}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm"
          >
            Open 8D Investigation →
          </Button>
        )}
        <Button
          variant="outline"
          className="border-[#374151] text-[#94A3B8] hover:text-white text-sm"
          onClick={() => {
            // TODO: export results
          }}
        >
          Export Results
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function GuidedInvestigation() {
  const router = useRouter();
  const { user } = useAuth();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [useApi, setUseApi] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Determine plan (mock — in production, use actual plan from user context)
  const userPlan = (user as unknown as { plan?: string })?.plan || 'free';
  const isFree = userPlan === 'free' || !user;
  const isQualityPlus = userPlan === 'quality' || userPlan === 'enterprise';
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

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

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

      if (useApi && sessionId) {
        try {
          response = await sendGuidedMessage(sessionId, text.trim());
        } catch {
          // Fall back to mock
          setUseApi(false);
        }
      }

      if (response) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          toolCalls: response.tool_calls?.map((tc) => ({
            tool: tc.tool,
            label: getToolLabel(tc.tool),
          })),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Mock response
        const mockResponse = generateMockResponse(text, newTurn);
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMessages((prev) => [...prev, mockResponse]);
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

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);

    try {
      let photoUrl: string;
      try {
        const result = await uploadDefectPhoto(file);
        photoUrl = result.url;
      } catch {
        // Fallback: create local URL
        photoUrl = URL.createObjectURL(file);
      }

      const photoMsg: ChatMessage = {
        id: `user-photo-${Date.now()}`,
        role: 'user',
        content: 'Uploaded defect photo',
        timestamp: new Date().toISOString(),
        photoUrl,
      };

      setMessages((prev) => [...prev, photoMsg]);

      // AI responds to photo
      const newTurn = turnCount + 1;
      setTurnCount(newTurn);

      await new Promise((resolve) => setTimeout(resolve, 600));

      const aiResponse: ChatMessage = {
        id: `ai-photo-${Date.now()}`,
        role: 'assistant',
        content:
          "I can see the fracture surface. Let me analyze the failure pattern...\n\nThe photo shows clean substrate on one side with full adhesive transfer to the other, which is consistent with an adhesive failure mode. This typically indicates a surface energy or preparation issue rather than a cohesive (adhesive material) failure.\n\nWas any surface treatment applied before bonding?",
        timestamp: new Date().toISOString(),
        toolCalls: [
          { tool: 'visual_analysis', label: 'Analyzing fracture surface photo...' },
        ],
        quickReplies: ['IPA wipe only', 'Abrasion + solvent', 'Primer applied', 'No treatment'],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setSending(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Complete session
  const handleComplete = async () => {
    setIsCompleted(true);

    if (useApi && sessionId) {
      try {
        await completeGuidedSession(sessionId);
      } catch {
        // Silent fail — UI still shows completion
      }
    }
  };

  // Pause & Save
  const handlePauseAndSave = () => {
    // Save session state to localStorage
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
    router.push('/dashboard');
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
            onOpenInvestigation={() => router.push('/investigations/new')}
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
              onClick={() => photoInputRef.current?.click()}
              className="shrink-0 p-2.5 rounded-lg text-[#64748B] hover:text-accent-500 hover:bg-[#1F2937] transition-colors"
              title="Upload defect photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>
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
              placeholder="Type your answer or click a suggestion..."
              rows={1}
              className="flex-1 bg-[#111827] border border-[#374151] text-white text-sm rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:border-accent-500 transition-colors placeholder:text-[#64748B]"
              style={{ maxHeight: '96px' }}
              disabled={sending}
            />

            {/* Send button */}
            <Button
              onClick={() => sendMessage(input)}
              disabled={sending || !input.trim()}
              className="shrink-0 h-10 w-10 p-0 bg-accent-500 hover:bg-accent-600 text-white rounded-lg disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Bar — Turn counter + Pause */}
      <div className="border-t border-[#1F2937] px-4 md:px-8 py-2 bg-brand-800/30 flex items-center justify-between shrink-0">
        <div>
          {isFree && !isCompleted && (
            <span className="text-xs text-[#64748B]">
              Turn {turnCount} of {maxTurns}{' '}
              <span className="text-[#4B5563]">(Free tier)</span>
            </span>
          )}
        </div>

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
