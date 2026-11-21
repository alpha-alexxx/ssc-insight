"use client";

import { useMemo, useState } from "react";
import { History, Shield, Sparkles, Trash2 } from "lucide-react";
import { aiUsageLabel, useAiWorkspace } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { useToast } from "@/components/toast";
import { AiSettingsForm } from "@/components/ai-settings-form";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHandle,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ChatEmptyState } from "@/components/shared/ai/chat-empty-state";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import { UsageFooter } from "@/components/shared/ai/usage-footer";
import { AiActivity } from "./ai-activity";
import { istTodayIso } from "@/lib/plan/view-model";
import { cn } from "@/lib/utils";

const FOLLOW_UPS = [
  "Show my weakest subject",
  "How is my trend?",
  "Plan my revision",
];

/**
 * The full-page chat in a measured three-column grid: conversations and the
 * usage footer in the left rail, the shared transcript and composer in the
 * middle, and the read ledger in its own right rail from xl up (lg parks a
 * compact copy under the list). One conversation with the sheet — asking
 * here, then opening the side panel, keeps the same turns. Below lg the rail
 * becomes a bottom drawer (the calendar's phone pattern), so history is
 * reachable at every width.
 */
export function AskView() {
  const ai = useAiWorkspace();
  const planApi = usePlanData();
  const toast = useToast();
  const [input, setInput] = useState("");
  const [railOpen, setRailOpen] = useState(true);
  const [railDrawerOpen, setRailDrawerOpen] = useState(false);
  const enabled = Boolean(ai.aiStatus?.enabled);

  // Same context contract as the sheet: orientation only, never content.
  const screenContext = useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  const usage = aiUsageLabel(ai.aiStatus ?? null);

  const composerMeta = (
    <>
      <button
        type="button"
        aria-label="Clear conversation"
        title="Clear conversation"
        className="tap-target inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        disabled={ai.chat.streaming || !ai.chat.messages.length}
        onClick={ai.chat.clear}
      >
        <Trash2 size={14} aria-hidden />
      </button>
      {ai.aiStatus?.credential ? (
        <span className="max-w-[24ch] truncate rounded-pill border border-rule-soft px-2 py-0.5 text-[11px] text-muted">
          {ai.aiStatus.credential.model} · read-only
        </span>
      ) : null}
      {usage ? (
        <span className="tabular-nums text-[11px] text-muted">{usage}</span>
      ) : null}
    </>
  );

  const conversationList = (
    <ConversationList
      history={ai.chat.history}
      streaming={ai.chat.streaming}
    />
  );

  return (
    // The exact height the workspace frame leaves this page: the sticky app
    // header plus the one workspace-content padding (py-4, md:py-5). The
    // compact header takes one row; only the transcript scrolls.
    <div className="flex h-[calc(100dvh-var(--app-header-h,52px)-2rem)] min-h-0 flex-col md:h-[calc(100dvh-var(--app-header-h,52px)-2.5rem)]">
      {/* A chat header, not a page header: one quiet row, so returning
          readers land on their conversation instead of re-reading an
          introduction. The grounding sentence rides the chip's tooltip;
          the full pledge lives in the empty state and the usage footer. */}
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-rule-soft pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-control bg-accent-soft text-accent"
          >
            <Sparkles size={15} />
          </span>
          <h1 className="font-serif text-[1.125rem] font-medium leading-tight tracking-[-0.01em] text-ink">
            Ask AI
          </h1>
          <span
            title="Answers read your aggregates and latest 20 full mocks — never notes or identity."
            className="hidden items-center gap-1 rounded-pill border border-rule-soft px-2 py-0.5 text-[0.625rem] font-medium text-muted sm:inline-flex"
          >
            <Shield size={10} aria-hidden className="text-accent" />
            Read-only
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Desktop toggles the inline rail; below lg the same content
              opens as a bottom drawer, so no width ships a dead toggle. */}
          <button
            type="button"
            aria-expanded={railOpen}
            className="tap-target hidden items-center gap-1.5 rounded-control border border-rule px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink lg:inline-flex"
            onClick={() => setRailOpen((open) => !open)}
          >
            <History size={14} aria-hidden />
            {railOpen ? "Hide history" : "Show history"}
          </button>
          <button
            type="button"
            aria-label="Conversation history"
            className="tap-target inline-flex size-9 items-center justify-center rounded-control border border-rule text-ink transition-colors hover:border-ink lg:hidden"
            onClick={() => setRailDrawerOpen(true)}
          >
            <History size={15} aria-hidden />
          </button>
        </div>
      </header>
      <div
        className={cn(
          "min-h-0 flex-1",
          railOpen
            ? "grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_15.5rem]"
            : "flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_15.5rem] xl:gap-5",
        )}
      >
        {railOpen && (
          <aside
            aria-label="Conversation history and AI activity"
            className="hidden min-h-0 flex-col border-r border-rule-soft pr-4 lg:flex"
          >
            <ConversationList
              history={ai.chat.history}
              streaming={ai.chat.streaming}
              className="min-h-0 flex-1"
            />
            {/* lg keeps a compact ledger under the list; xl gives it a full
                rail of its own on the right. */}
            <AiActivity
              refreshKey={ai.chat.messages.length}
              className="mt-4 h-52 shrink-0 xl:hidden"
            />
            <UsageFooter status={ai.aiStatus ?? null} className="mt-3" />
          </aside>
        )}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* The measured column keeps answers and the composer at a readable
              line length on wide screens instead of running edge to edge. */}
          <div className="mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col">
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
              emptyState={
                enabled ? (
                  <ChatEmptyState
                    onSend={(text) => ai.chat.send(text, screenContext, false)}
                  />
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
                  followUps={ai.chat.messages.length > 0 ? FOLLOW_UPS : undefined}
                  onFollowUp={(text) => {
                    ai.chat.send(text, screenContext, false);
                    setInput("");
                  }}
                />
              </div>
            )}
          </div>
        </section>
        <aside
          aria-label="AI read ledger"
          className="hidden min-h-0 flex-col border-l border-rule-soft pl-4 xl:flex"
        >
          <AiActivity
            refreshKey={ai.chat.messages.length}
            className="flex-1 pt-1"
          />
        </aside>
      </div>

      <Drawer open={railDrawerOpen} onOpenChange={setRailDrawerOpen}>
        <DrawerContent className="h-[72dvh]">
          <DrawerHandle />
          <DrawerTitle className="sr-only">
            Conversation history and AI activity
          </DrawerTitle>
          <DrawerBody className="flex flex-col gap-5">
            {conversationList}
            <AiActivity
              refreshKey={ai.chat.messages.length}
              className="min-h-0 flex-1"
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
