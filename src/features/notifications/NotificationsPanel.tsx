import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/api/notificationApi';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/lib/format';

export function NotificationsPanel() {
  const { data, isLoading } = useGetNotificationsQuery({ size: 20 }, { pollingInterval: 20000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data.content ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="ticket-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-lg text-ink">
          <Bell size={18} /> Notifications
        </p>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead()} disabled={markingAll} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
            <CheckCheck size={13} /> Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-brand" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="Requests, approvals, and updates on your coupons will show up here." />
      ) : (
        <AnimatePresence initial={false}>
          {notifications.map((n, i) => (
            <motion.button
              key={n.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.03 }}
              onClick={() => !n.read && markRead(n.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-brand-light/30 ${!n.read ? 'bg-brand-light/15' : ''}`}
            >
              {!n.read && <Circle size={8} className="mt-1.5 shrink-0 fill-stamp text-stamp" />}
              <div className={n.read ? 'ml-[20px]' : ''}>
                <p className="font-semibold text-ink">{n.title}</p>
                {n.message && <p className="mt-0.5 text-xs text-ink-soft">{n.message}</p>}
                <p className="mt-1 text-[11px] text-ink-soft/70">{timeAgo(n.createdAt)}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
