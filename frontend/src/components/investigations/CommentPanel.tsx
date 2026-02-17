'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  investigationsApi,
  type InvestigationComment,
} from '@/lib/investigations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Pin,
  CheckCircle,
  Reply,
  Trash2,
  Loader2,
  Send,
} from 'lucide-react';

const DISCIPLINES = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'] as const;

interface CommentPanelProps {
  investigationId: string;
  currentUserId: string;
  isLeadOrChampion: boolean;
}

export function CommentPanel({
  investigationId,
  currentUserId,
  isLeadOrChampion,
}: CommentPanelProps) {
  const [comments, setComments] = useState<InvestigationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDiscipline, setActiveDiscipline] = useState<string>('D1');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await investigationsApi.listComments(investigationId);
      setComments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [investigationId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await investigationsApi.createComment(investigationId, {
        discipline: activeDiscipline,
        comment_text: newComment.trim(),
        parent_comment_id: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await investigationsApi.deleteComment(investigationId, commentId);
      await fetchComments();
    } catch {
      // silently fail
    }
  };

  const handleTogglePin = async (commentId: string) => {
    try {
      await investigationsApi.togglePinComment(investigationId, commentId);
      await fetchComments();
    } catch {
      // silently fail
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    try {
      await investigationsApi.toggleResolveComment(investigationId, commentId);
      await fetchComments();
    } catch {
      // silently fail
    }
  };

  // Filter comments for active discipline
  const disciplineComments = comments.filter(
    (c) => c.discipline === activeDiscipline
  );

  // Separate top-level and replies
  const topLevel = disciplineComments.filter((c) => !c.parent_comment_id);
  const replies = disciplineComments.filter((c) => c.parent_comment_id);

  // Sort: pinned first, then by date
  const sortedTopLevel = [...topLevel].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const getReplies = (parentId: string) =>
    replies
      .filter((r) => r.parent_comment_id === parentId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

  // Count comments per discipline
  const getCounts = (d: string) => comments.filter((c) => c.discipline === d).length;

  const replyToComment = replyTo
    ? comments.find((c) => c.id === replyTo)
    : null;

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1F2937]">
        <MessageSquare className="w-4 h-4 text-accent-500" />
        <h3 className="text-sm font-semibold text-white">Comments</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {comments.length}
        </Badge>
      </div>

      <Tabs
        value={activeDiscipline}
        onValueChange={setActiveDiscipline}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="px-2 pt-2">
          <TabsList className="bg-[#0F1A2E] border border-[#1F2937] w-full grid grid-cols-8 h-8">
            {DISCIPLINES.map((d) => (
              <TabsTrigger
                key={d}
                value={d}
                className="text-[10px] px-1 data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-[#64748B]"
              >
                {d}
                {getCounts(d) > 0 && (
                  <span className="ml-0.5 text-accent-500">
                    {getCounts(d)}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DISCIPLINES.map((d) => (
          <TabsContent
            key={d}
            value={d}
            className="flex-1 overflow-y-auto px-3 py-2 space-y-3 mt-0"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#64748B]" />
              </div>
            ) : sortedTopLevel.length === 0 && d === activeDiscipline ? (
              <p className="text-xs text-[#64748B] text-center py-6">
                No comments yet on {d}.
              </p>
            ) : (
              d === activeDiscipline &&
              sortedTopLevel.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  replies={getReplies(comment.id)}
                  currentUserId={currentUserId}
                  isLeadOrChampion={isLeadOrChampion}
                  onReply={(id) => setReplyTo(id)}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  onToggleResolve={handleToggleResolve}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Composer */}
      <div className="border-t border-[#1F2937] p-3 space-y-2">
        {replyToComment && (
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#0F1A2E] rounded px-2 py-1">
            <Reply className="w-3 h-3" />
            <span className="truncate">
              Replying to: {replyToComment.comment_text.slice(0, 60)}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-auto text-[#64748B] hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add a comment on ${activeDiscipline}...`}
            rows={2}
            className="bg-[#0F1A2E] border-[#1F2937] text-white placeholder:text-[#64748B] text-sm resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            className="bg-accent-500 hover:bg-accent-600 text-white self-end"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentThread sub-component
// ---------------------------------------------------------------------------

interface CommentThreadProps {
  comment: InvestigationComment;
  replies: InvestigationComment[];
  currentUserId: string;
  isLeadOrChampion: boolean;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleResolve: (id: string) => void;
}

function CommentThread({
  comment,
  replies,
  currentUserId,
  isLeadOrChampion,
  onReply,
  onDelete,
  onTogglePin,
  onToggleResolve,
}: CommentThreadProps) {
  return (
    <div>
      <SingleComment
        comment={comment}
        currentUserId={currentUserId}
        isLeadOrChampion={isLeadOrChampion}
        onReply={onReply}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        onToggleResolve={onToggleResolve}
      />
      {replies.length > 0 && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#1F2937] pl-3">
          {replies.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isLeadOrChampion={isLeadOrChampion}
              onReply={onReply}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onToggleResolve={onToggleResolve}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SingleCommentProps {
  comment: InvestigationComment;
  currentUserId: string;
  isLeadOrChampion: boolean;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleResolve: (id: string) => void;
  isReply?: boolean;
}

function SingleComment({
  comment,
  currentUserId,
  isLeadOrChampion,
  onReply,
  onDelete,
  onTogglePin,
  onToggleResolve,
  isReply,
}: SingleCommentProps) {
  const isOwn = comment.user_id === currentUserId;
  const canDelete = isOwn || isLeadOrChampion;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={`rounded-md p-2 text-sm ${
        comment.is_resolution
          ? 'border border-success/30 bg-success/5'
          : 'bg-[#0F1A2E]'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono text-[#94A3B8]">
          {comment.user_id.slice(0, 8)}
        </span>
        <span className="text-[10px] text-[#64748B]">
          {timeAgo(comment.created_at)}
        </span>
        {comment.is_pinned && (
          <Pin className="w-3 h-3 text-warning" />
        )}
        {comment.is_resolution && (
          <Badge variant="default" className="text-[9px] py-0 bg-success/20 text-success border-success/30">
            Resolution
          </Badge>
        )}
      </div>
      <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">
        {comment.comment_text}
      </p>
      <div className="flex items-center gap-1 mt-1.5">
        {!isReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-[10px] text-[#64748B] hover:text-accent-500 flex items-center gap-0.5"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        )}
        {isLeadOrChampion && (
          <>
            <button
              onClick={() => onTogglePin(comment.id)}
              className={`text-[10px] flex items-center gap-0.5 ${
                comment.is_pinned
                  ? 'text-warning'
                  : 'text-[#64748B] hover:text-warning'
              }`}
            >
              <Pin className="w-3 h-3" />
              {comment.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => onToggleResolve(comment.id)}
              className={`text-[10px] flex items-center gap-0.5 ${
                comment.is_resolution
                  ? 'text-success'
                  : 'text-[#64748B] hover:text-success'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              {comment.is_resolution ? 'Unresolve' : 'Resolve'}
            </button>
          </>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-[10px] text-[#64748B] hover:text-danger flex items-center gap-0.5 ml-auto"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
