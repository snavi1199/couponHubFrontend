import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/api/notificationApi';
import { timeAgo } from '@/lib/format';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: countData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data, isLoading } = useGetNotificationsQuery({ size: 6 }, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unread = countData?.data ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-stamp px-1 text-[10px] font-bold text-white"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border-2 border-line bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-line/60 p-3">
                <p className="font-display text-sm text-ink">Notifications</p>
                {unread > 0 && (
                  <button onClick={() => markAllRead()} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <p className="p-4 text-center text-sm text-ink-soft">Loading…</p>
                ) : data && data.data.content.length > 0 ? (
                  data.data.content.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markRead(n.id);
                        if (n.linkUrl) { setOpen(false); navigate(n.linkUrl); }
                      }}
                      className={`block w-full border-b border-line/40 px-4 py-3 text-left text-sm transition-colors hover:bg-brand-light/40 ${!n.read ? 'bg-brand-light/20' : ''}`}
                    >
                      <p className="font-semibold text-ink">{n.title}</p>
                      {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{n.message}</p>}
                      <p className="mt-1 text-[11px] text-ink-soft/70">{timeAgo(n.createdAt)}</p>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-ink-soft">No notifications yet</p>
                )}
              </div>

              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block border-t border-line/60 p-2.5 text-center text-xs font-semibold text-brand hover:bg-brand-light/40"
              >
                View all in Dashboard
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
