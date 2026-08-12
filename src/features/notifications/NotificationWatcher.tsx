import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery } from '@/api/notificationApi';
import { useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/ui/toast';

/**
 * Mounted once at the app root. Polls notifications in the background (independent of whether
 * the bell dropdown is open) and pops a toast for anything new — the badge count alone was easy
 * to miss. The first fetch after mount/login just establishes a baseline silently, so someone
 * with 20 old unread notifications doesn't get 20 toasts firing at once on page load.
 */
export function NotificationWatcher() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const navigate = useNavigate();
  const toast = useToast();
  const seenIds = useRef<Set<string> | null>(null);

  const { data } = useGetNotificationsQuery({ size: 10 }, { skip: !isAuthenticated, pollingInterval: 15000 });

  useEffect(() => {
    if (!data) return;
    const current = data.data.content;

    if (seenIds.current === null) {
      // First fetch — just record what's already there, don't toast the backlog.
      seenIds.current = new Set(current.map((n) => n.id));
      return;
    }

    for (const notification of current) {
      if (!seenIds.current.has(notification.id)) {
        seenIds.current.add(notification.id);
        toast.show(notification.message ?? '', 'notification', {
          title: notification.title,
          duration: 10000,
          onClick: notification.linkUrl ? () => navigate(notification.linkUrl!) : undefined,
        });
      }
    }
  }, [data, toast, navigate]);

  useEffect(() => {
    if (!isAuthenticated) seenIds.current = null;
  }, [isAuthenticated]);

  return null;
}
