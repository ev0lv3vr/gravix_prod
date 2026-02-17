'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi, type Notification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const NOTIFICATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'comment', label: 'Comment' },
  { value: 'action_assigned', label: 'Action Assigned' },
  { value: 'action_due', label: 'Action Due' },
  { value: 'mention', label: 'Mentioned' },
  { value: 'investigation_closed', label: 'Investigation Closed' },
  { value: 'pattern_alert', label: 'Pattern Alert' },
  { value: 'share_link_accessed', label: 'Share Link Accessed' },
];

const DATE_FILTERS = [
  { value: '', label: 'All Time' },
  { value: '1', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ limit: 200 });
      setNotifications(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
    }
  }, [authLoading, user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await handleMarkRead(n.id);
    }
    if (n.action_url) {
      router.push(n.action_url);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  // Filter notifications
  const filtered = useMemo(() => {
    let result = notifications;

    // Type filter
    if (typeFilter) {
      result = result.filter((n) => n.notification_type === typeFilter);
    }

    // Date filter
    if (dateFilter) {
      const days = parseInt(dateFilter, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      result = result.filter((n) => new Date(n.created_at).getTime() >= cutoff);
    }

    return result;
  }, [notifications, typeFilter, dateFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, dateFilter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-[#94A3B8] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-accent-500" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-danger text-white">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-accent-500 hover:text-accent-400"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-[#64748B]" />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#111827] border border-[#374151] rounded px-3 py-1.5 text-sm text-[#94A3B8] focus:outline-none focus:border-accent-500"
        >
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-[#111827] border border-[#374151] rounded px-3 py-1.5 text-sm text-[#94A3B8] focus:outline-none focus:border-accent-500"
        >
          {DATE_FILTERS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {(typeFilter || dateFilter) && (
          <button
            onClick={() => {
              setTypeFilter('');
              setDateFilter('');
            }}
            className="text-xs text-accent-500 hover:text-accent-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-12 text-center">
          <Bell className="w-10 h-10 text-[#374151] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">
            {typeFilter || dateFilter ? 'No notifications match your filters' : 'No notifications yet'}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            You&apos;ll be notified about investigation updates, comments, and assigned actions.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left bg-brand-800 border rounded-lg p-4 hover:bg-[#1F2937]/50 transition-colors ${
                  !n.is_read
                    ? 'border-accent-500/30 bg-accent-500/5'
                    : 'border-[#1F2937]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.is_read ? 'bg-accent-500' : 'bg-[#374151]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-[#94A3B8]'}`}>
                        {n.title}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 text-[#64748B]">
                        {n.notification_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {n.message && (
                      <p className="text-xs text-[#94A3B8] mb-1">{n.message}</p>
                    )}
                    <span className="text-[10px] text-[#64748B]">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-xs text-[#64748B]">
                Page {page} of {totalPages} · {filtered.length} notifications
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
