import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import { Modal } from './Modal';

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  required?: boolean;
}

interface PromptContextValue {
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextValue | null>(null);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ options: PromptOptions; resolve: (v: string | null) => void } | null>(null);
  const [value, setValue] = useState('');

  const prompt = useCallback((options: PromptOptions) => {
    setValue('');
    return new Promise<string | null>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const submit = () => {
    if (state?.options.required && !value.trim()) return;
    state?.resolve(value.trim() || null);
    setState(null);
  };

  const cancel = () => {
    state?.resolve(null);
    setState(null);
  };

  return (
    <PromptContext.Provider value={{ prompt }}>
      {children}
      <Modal open={!!state} onClose={cancel}>
        {state && (
          <div className="flex flex-col items-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <MessageSquare size={22} />
            </span>
            <h3 className="font-display text-lg text-ink">{state.options.title}</h3>
            {state.options.description && <p className="mt-1 text-sm text-ink-soft">{state.options.description}</p>}
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={state.options.placeholder}
              className="input-field mt-4 min-h-20 w-full"
            />
            <div className="mt-4 flex w-full gap-2">
              <button onClick={cancel} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={submit} className="btn-primary flex-1 justify-center">
                {state.options.confirmLabel ?? 'Submit'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error('usePrompt must be used within PromptProvider');
  return ctx.prompt;
}
