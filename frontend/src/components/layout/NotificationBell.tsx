'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  notificationsApi,
  type Notification,
} from '@/lib/notifications';

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch unread count (poll every 30s)
  const fetchUnread = useCallback(async () => {
    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // When dropdown opens, fetch recent notifications
  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const data = await notificationsApi.list({ limit: 10 });
        setNotifications(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleClickNotification = async (n: Notification) => {
    // Mark as read
    if (!n.is_read) {
      try {
        await notificationsApi.markAsRead(n.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, is_read: true } : item
          )
        );
      } catch {
        // silently fail
      }
    }
    // Navigate
    if (n.action_url) {
      router.push(n.action_url);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch {
      // silently fail
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-[#94A3B8] hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-brand-800 border border-[#1F2937] rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-accent-500 hover:text-accent-400"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#1F2937] border-t-accent-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-[#64748B] text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#1F2937]/50 transition-colors border-b border-[#1F2937] last:border-0 ${
                    !n.is_read ? 'bg-accent-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {n.message}
                        </p>
                      )}
                      <span className="text-[10px] text-[#64748B] mt-0.5 block">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#1F2937] px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-[#94A3B8] hover:text-white"
              onClick={() => {
                router.push('/notifications');
                setOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
