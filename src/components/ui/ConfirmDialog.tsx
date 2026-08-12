import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handle = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal open={!!state} onClose={() => handle(false)}>
        {state && (
          <div className="flex flex-col items-center text-center">
            <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${state.options.danger ? 'bg-stamp-light text-stamp-dark' : 'bg-brand-light text-brand-dark'}`}>
              <AlertTriangle size={22} />
            </span>
            <h3 className="font-display text-lg text-ink">{state.options.title}</h3>
            {state.options.description && (
              <p className="mt-1 text-sm text-ink-soft">{state.options.description}</p>
            )}
            <div className="mt-5 flex w-full gap-2">
              <button onClick={() => handle(false)} className="btn-ghost flex-1 justify-center">
                {state.options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                onClick={() => handle(true)}
                className={state.options.danger ? 'btn-primary flex-1 justify-center bg-stamp hover:bg-stamp-dark' : 'btn-primary flex-1 justify-center'}
              >
                {state.options.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
