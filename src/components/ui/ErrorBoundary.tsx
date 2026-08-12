import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log so the developer can see what went wrong in the console
    console.error('[ErrorBoundary caught]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stamp-light">
            <AlertTriangle size={24} className="text-stamp-dark" />
          </span>
          <h2 className="font-display text-xl text-ink">Something went wrong</h2>
          <p className="max-w-sm text-sm text-ink-soft">
            {this.state.error.message ?? 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload page
          </button>
          {/* Show stack in dev, hide in production */}
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-2xl overflow-auto rounded-xl bg-line/20 p-4 text-left text-xs text-ink-soft">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
