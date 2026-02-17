'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ limit: 100 });
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
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

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
      <div className="flex items-center justify-between mb-8">
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-12 text-center">
          <Bell className="w-10 h-10 text-[#374151] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">No notifications yet</p>
          <p className="text-xs text-[#64748B] mt-1">
            You&apos;ll be notified about investigation updates, comments, and assigned actions.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
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
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
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
      )}
    </div>
  );
}
