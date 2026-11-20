"use client";

import { useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAiWorkspace } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { useToast } from "@/components/toast";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import { AiActivity } from "./ai-activity";
import { istTodayIso } from "@/lib/plan/view-model";

/**
 * The full-page chat: history and activity in a left rail, the shared
 * transcript and composer in the center. One conversation with the sheet —
 * asking here, then opening the side panel, keeps the same turns.
 */
export function AskView() {
  const ai = useAiWorkspace();
  const planApi = usePlanData();
  const toast = useToast();
  const [input, setInput] = useState("");
  const [railOpen, setRailOpen] = useState(true);
  const enabled = Boolean(ai.aiStatus?.enabled);

  // Same context contract as the sheet: orientation only, never content.
  const screenContext = useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  const composerMeta = (
    <>
      <button
        type="button"
        aria-label="Clear conversation"
        title="Clear conversation"
        className="inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        disabled={ai.chat.streaming || !ai.chat.messages.length}
        onClick={ai.chat.clear}
      >
        <Trash2 size={14} aria-hidden />
      </button>
      {ai.aiStatus?.credential ? (
        <span className="max-w-[24ch] truncate text-[10px] text-muted">
          {ai.aiStatus.credential.model}
        </span>
      ) : null}
    </>
  );

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader
        title="Ask AI"
        description="One coach over your whole tracker. Answers read your aggregates and latest 20 full mocks — never notes or identity."
        icon={<Sparkles size={22} className="text-accent" aria-hidden />}
        meta={
          <button
            type="button"
            className="underline underline-offset-4 hover:text-ink"
            onClick={() => setRailOpen((open) => !open)}
          >
            {railOpen ? "Hide history" : "Show history"}
          </button>
        }
      />
      <div
        className={
          railOpen
            ? "grid min-h-0 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]"
            : "flex min-h-0 flex-1 flex-col"
        }
        style={{ height: "calc(100dvh - var(--app-header-h, 52px) - 11rem)", minHeight: "24rem" }}
      >
        {railOpen && (
          <aside
            aria-label="Conversation history and AI activity"
            className="hidden min-h-0 flex-col gap-5 border-r border-rule-soft pr-4 lg:flex"
          >
            <ConversationList
              history={ai.chat.history}
              streaming={ai.chat.streaming}
              className="max-h-[55%]"
            />
            <AiActivity
              refreshKey={ai.chat.messages.length}
              className="flex-1"
            />
          </aside>
        )}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ChatTranscript
            messages={ai.chat.messages}
            streaming={ai.chat.streaming}
            phase={ai.chat.phase}
            onRetry={() => ai.chat.retryLast()}
            onEditResend={(id, text) => ai.chat.editResend(id, text)}
            onRegenerate={() => ai.chat.regenerateLast()}
            taskApi={{ createPersonalTask: planApi.createPersonalTask }}
            onTaskAdded={() => toast.success("Task added to My Tasks")}
            error={ai.chat.error}
            className="px-1 sm:px-2"
            emptyState={
              enabled ? (
                <div className="flex flex-col gap-4 pt-6">
                  <p className="text-sm leading-relaxed text-muted">
                    Ask in your own words — “why did accuracy drop in English?”,
                    “plan my revision week”, or paste a question about any
                    saved mock.
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-xl rounded-control border border-rule bg-canvas p-5">
                  <h3 className="font-serif text-lg font-medium text-ink">
                    Set up your AI provider
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Ask AI runs on your own provider key. It is encrypted
                    before storage and never returned to this page.
                  </p>
                  <div className="mt-4">
                    <AiSettingsForm
                      variant="panel"
                      showHeading={false}
                      onChanged={() => void ai.refreshAiStatus()}
                    />
                  </div>
                </div>
              )
            }
          />
          {enabled && (
            <div className="shrink-0 pt-3">
              <ChatComposer
                value={input}
                onChange={setInput}
                onSubmit={(text, images) => {
                  ai.chat.send(text, screenContext, false, images);
                  setInput("");
                }}
                onStop={ai.chat.stop}
                streaming={ai.chat.streaming}
                visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
                placeholder="Ask about your mocks, targets, or plan…"
                meta={composerMeta}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
