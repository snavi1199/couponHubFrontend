import { Outlet, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NotificationWatcher } from '@/features/notifications/NotificationWatcher';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AugustFAB } from '@/features/community/AugustAI';

export function Layout() {
  const location = useLocation();
  const hideCommunityFab = location.pathname === '/community';

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <NotificationWatcher />
      <Header />

      <main className="flex-1">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />

      {/*
        FAB stack — bottom-right corner.
        Community chat button: bottom-6 right-6 (lower)
        August AI button:      bottom-24 right-6 (above community, leaves room for chat window to open upward)
        The AugustFAB itself positions the chat window above itself via `bottom-[calc(100%+12px)]`
        instead of relying on a fixed offset that can clip the viewport.
      */}
      <AnimatePresence>
        {!hideCommunityFab && (
          <motion.div
            key="community-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="fixed bottom-6 right-6 z-30"
          >
            <Link
              to="/community"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg transition-shadow hover:shadow-xl"
              aria-label="Community chat & FAQ"
            >
              <MessageCircle size={22} className="text-paper transition-transform group-hover:scale-110" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* August AI — above the community FAB */}
      <AugustFAB bottomOffset={hideCommunityFab ? 24 : 88} />
    </div>
  );
}
