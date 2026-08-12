import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X, Bell } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'notification';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  title?: string;
  onClick?: () => void;
}

interface ShowOptions {
  title?: string;
  duration?: number;
  onClick?: () => void;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, options?: ShowOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  notification: Bell,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-brand/40 bg-brand-light/90 text-brand-dark',
  error: 'border-stamp/40 bg-stamp-light/90 text-stamp-dark',
  info: 'border-line bg-white/90 text-ink',
  notification: 'border-brand/40 bg-white/90 text-ink',
};

const DEFAULT_DURATION = 3500;

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info', options?: ShowOptions) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant, title: options?.title, onClick: options?.onClick }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options?.duration ?? DEFAULT_DURATION);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Top-right, transparent/frosted cards — notification popups live here alongside action toasts */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto sm:top-4">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.variant];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                onClick={toast.onClick}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border-2 px-4 py-3 shadow-lg backdrop-blur-md ${STYLES[toast.variant]} ${toast.onClick ? 'cursor-pointer' : ''}`}
                role="status"
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
                  aria-label="Dismiss"
                  className="shrink-0 opacity-60 hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
