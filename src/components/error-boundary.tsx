"use client";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = { children: ReactNode; onReset?: () => void };
type State = { error: Error | null };

/**
 * Catches render-time errors in the subtree, logs them to the server (when
 * wired), and shows a recoverable fallback instead of a white screen.
 *
 * Server-side structured logging is intentionally NOT enabled here to avoid
 * coupling the boundary to a server logger; production should hook this up
 * to /api/client-error or an APM SDK. For now we console.error for dev.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

/**
 * The fallback is a separate function component because useRouter is a hook
 * and cannot be called on the class. "Reload view" re-runs the server
 * components and remounts the subtree — a full browser reload (the old
 * window.location.reload()) is never needed to recover a render error.
 */
function ErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-lg px-5 py-20" role="alert">
      <div className="rounded-2xl bg-card p-8 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <h1 className="mb-3 font-serif text-2xl leading-tight text-foreground">Something went wrong</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          The dashboard hit an unexpected error while rendering. Your data is
          safe — try reloading the view, or refresh the page if the issue
          persists.
        </p>
        <pre className="mb-6 max-h-48 overflow-auto rounded-xl bg-muted p-3 text-xs text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
          {error.message}
        </pre>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              onRetry();
              router.refresh();
            }}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reload view
          </button>
        </div>
      </div>
    </main>
  );
}
