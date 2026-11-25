"use client";
import { Panel } from "./dashboard-panels";
import { Button } from "./button";
import { Alert } from "./alert";
import { PlainIcon } from "./icon";
import type { AiStatus } from "@/lib/ai/client-types";
import type { CoachInsight } from "@/lib/ai/schemas";

/**
 * The dashboard's coach launcher. Generation runs against the coach endpoint
 * and the result streams into the AI chat sheet — this card stays a compact
 * entry point: last headline as a teaser, errors, and usage. The full reading
 * lives in the conversation, where follow-up questions continue from it.
 */
export function AiCoachCard({
  status,
  insight,
  busy,
  error,
  onGenerate,
  onOpenChat,
}: {
  status: AiStatus;
  insight: CoachInsight | null;
  busy: boolean;
  error: string;
  onGenerate: () => void;
  onOpenChat: () => void;
}) {
  const usage = status.usage;
  return (
    <Panel
      icon="sparkles"
      title="AI coach"
      description="Guidance from your recent mocks, in the chat panel."
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerate}
          disabled={busy}
          loading={busy}
          icon={!busy ? <PlainIcon name="sparkles" size={13} /> : undefined}
        >
          {busy ? "Reading…" : insight ? "Regenerate" : "Generate insight"}
        </Button>
      }
    >
      <div className="px-4 pb-4 sm:px-6 sm:pb-5">
        {error && (
          <Alert tone="warning" title={error} className="mb-4" />
        )}

        {insight ? (
          <button
            type="button"
            onClick={onOpenChat}
            className="block w-full rounded-[14px] bg-background px-4 py-3 text-left shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              <PlainIcon name="sparkles" size={11} tone="primary" /> Latest insight
            </span>
            <span className="mt-1.5 block truncate font-serif text-[15px] font-medium leading-snug text-foreground">
              {insight.headline}
            </span>
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              Open the chat to read the full breakdown
            </span>
          </button>
        ) : (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {busy
              ? "Reading your saved mocks — the insight opens in the chat panel."
              : "Generate a short, evidence-based read of your preparation. It opens in the chat panel, where you can ask follow-ups."}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Only aggregates and the latest 20 full mocks are sent to the
            configured AI provider. Notes, email, and user identity are never
            sent.
          </p>
          <Button size="sm" variant="outline" onClick={onOpenChat} icon={<PlainIcon name="chat" size={13} />}>
            Ask a question
          </Button>
        </div>

        {usage && (
          <p className="mt-3 text-[12px] tabular-nums text-muted-foreground">
            Today:{" "}
            {Number.isFinite(usage.limits.requests)
              ? `${usage.requests} / ${usage.limits.requests} requests`
              : `${usage.requests} requests · unlimited`}{" "}
            · {usage.tokens.toLocaleString("en-IN")} tokens charged
          </p>
        )}
      </div>
    </Panel>
  );
}
