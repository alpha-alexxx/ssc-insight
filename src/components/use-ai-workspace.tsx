"use client";
import { chatBaseForSend } from "@/lib/ai/chat-history";
import {
  loadConversations,
  renameConversation,
  saveConversations,
  upsertConversation,
  type StoredConversation,
} from "@/lib/ai/conversations";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { aiKeys, aiStatusQueryOptions } from "@/lib/queries/ai";
import { useUiStore } from "@/stores/ui-store";
import { NdjsonDecoder, parseChatEvent } from "@/lib/ai/ndjson";
import type {
  AiScreenContext,
  ChatMessage,
  CoachMeta,
  CoachResponse,
} from "@/lib/ai/client-types";
import type { CoachInsight } from "@/lib/ai/schemas";
import { longDate } from "@/lib/format";

const AiWorkspaceContext = createContext<AiWorkspace | null>(null);

function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

/** Keep the prompt window tight: only the trailing exchanges, and never a
 * leading assistant turn (the API requires the history to start with a user
 * message). */
export function trimChatHistory(messages: ChatMessage[], lastN: number) {
  const history = [...messages]
    .map((message) => ({ role: message.role, content: message.content }))
    .filter((message) => message.content.trim())
    .slice(-lastN);
  while (history.length && history[0].role === "assistant") history.shift();
  return history;
}

/** The seeded user turn for dashboard-initiated insight generation. Exported
 * so the sheet's retry can route back to the coach endpoint instead of the
 * chat endpoint. */
export const INSIGHT_REQUEST_TEXT = "Generate an insight from my recent mocks.";

/** Render the structured coach insight as chat markdown — the sheet's
 * MessageContent supports ### headings, "-" bullets and **bold**, so the
 * reading experience matches the rest of the conversation. */
function insightToChatText(insight: CoachInsight, meta: CoachMeta | null) {
  const lines: string[] = [];
  lines.push(`### ${insight.headline}`);
  lines.push(insight.summary);
  lines.push("**Working well**");
  for (const item of insight.strengths) lines.push(`- ${item}`);
  lines.push("**Needs attention**");
  for (const item of insight.focusAreas) lines.push(`- ${item}`);
  lines.push("**Next actions**");
  insight.nextActions.forEach((item, index) =>
    lines.push(`${index + 1}. ${item}`),
  );
  for (const caveat of insight.caveats) lines.push(caveat);
  const dataDate = meta?.dataAsOf ? longDate(meta.dataAsOf) : null;
  lines.push(
    meta
      ? `Based on ${meta.coverage.totalAttempts} saved result${meta.coverage.totalAttempts === 1 ? "" : "s"} and ${meta.coverage.recentFullMocksIncluded} recent full mock${meta.coverage.recentFullMocksIncluded === 1 ? "" : "s"}${dataDate ? ` · data to ${dataDate}` : ""}.`
      : "Based on your saved results.",
  );
  return lines.join("\n");
}

/** API shape for the sheet's history panel: the stored list plus the
 * mutations it offers. */
export type ChatHistoryApi = {
  conversations: StoredConversation[];
  activeId: string | null;
  newChat: () => void;
  select: (id: string) => void;
  remove: (id: string) => void;
  rename: (id: string, title: string) => void;
};

/**
 * What the model is doing right now, derived from real stream evidence:
 * `connecting` until the server says anything, `thinking` while reasoning
 * (or pings) arrive with no answer text yet, `writing` once content flows.
 */
export type ChatPhase = "connecting" | "thinking" | "writing";

/**
 * Client state for the optional AI subsystem: availability status, the coach
 * insight card, and the streaming chat drawer. Finished conversations persist
 * to localStorage (lib/ai/conversations.ts) so the drawer restores its
 * history across reloads; the in-flight stream still aborts when the drawer
 * closes or the workspace unmounts. Everything here fails soft — AI must
 * never block the tracker.
 */
export type AiWorkspace = ReturnType<typeof useAiWorkspaceState>;

/**
 * The ONE AI workspace instance for the workspace shell.
 *
 * This must be a provider, not a plain hook. It was a plain hook until the
 * folder-routing shift put two call sites in the tree (the chrome's AI sheet and
 * the dashboard's coach card), and a hook called twice is two independent
 * `useState` trees: the dashboard would generate an insight into a transcript
 * the sheet never renders, and both would write the whole conversation list to
 * localStorage from their own snapshot, so the last writer clobbered the other.
 *
 * Mounted once by the (workspace) layout, above both consumers.
 */
export function useAiWorkspace(): AiWorkspace {
  const value = useContext(AiWorkspaceContext);
  if (!value)
    throw new Error("useAiWorkspace must be used inside <AiWorkspaceProvider>");
  return value;
}

/**
 * Provider for the single AI workspace. Consumers use `useAiWorkspace()`.
 */
export function AiWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useAiWorkspaceState();
  return (
    <AiWorkspaceContext.Provider value={value}>
      {children}
    </AiWorkspaceContext.Provider>
  );
}

function useAiWorkspaceState() {
  const queryClient = useQueryClient();
  // Availability status is the only cacheable AI resource; it lives in the
  // query cache (lib/queries/ai.ts). A status failure must never block the
  // dashboard — the query error simply keeps aiStatus null, which every
  // consumer already treats as "AI disabled".
  const aiStatusQuery = useQuery(aiStatusQueryOptions);
  const aiStatus = aiStatusQuery.data ?? null;
  const [coachInsight, setCoachInsight] = useState<CoachInsight | null>(null);
  const [coachMeta, setCoachMeta] = useState<CoachMeta | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [coachError, setCoachError] = useState("");
  // Drawer visibility lives in the UI store (header, dashboard cards, the
  // palette, and the shell all open it); messages and streaming stay local.
  const chatOpen = useUiStore((s) => s.aiChatOpen);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase | null>(null);
  const [chatError, setChatError] = useState("");
  const chatAbort = useRef<AbortController | null>(null);
  // Conversation history: React state mirrors refs so turn handlers never
  // read stale closures, and persistence never runs inside a state updater
  // (StrictMode would run it twice). The saved list hydrates in the state
  // initializers — safe because the workspace shell is client-hydrated with
  // the drawer closed, so the stored transcript never reaches server HTML.
  const [boot] = useState(() => loadConversations());
  const [conversations, setConversations] =
    useState<StoredConversation[]>(boot);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(() => boot[0]?.id ?? null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    () => boot[0]?.messages ?? [],
  );
  const conversationsRef = useRef<StoredConversation[]>(boot);
  const activeIdRef = useRef<string | null>(boot[0]?.id ?? null);
  const messagesRef = useRef<ChatMessage[]>(boot[0]?.messages ?? []);

  // Revalidates after quota-consuming actions (coach/chat completion) — the
  // quota ledger may have moved.
  const refreshAiStatus = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: aiKeys.status() });
  }, [queryClient]);
  useEffect(
    () => () => {
      chatAbort.current?.abort();
    },
    [],
  );

  const applyMessages = useCallback(
    (updater: (current: ChatMessage[]) => ChatMessage[]) => {
      const next = updater(messagesRef.current);
      messagesRef.current = next;
      setChatMessages(next);
    },
    [],
  );

  /** Commit the current transcript into the conversation list and storage.
   * Runs at turn boundaries only, so a streaming token never touches storage.
   * An empty transcript removes the active conversation instead of storing
   * an empty shell. */
  const persistTurn = useCallback(() => {
    const { list, activeId } = upsertConversation(
      conversationsRef.current,
      activeIdRef.current,
      messagesRef.current,
    );
    conversationsRef.current = list;
    activeIdRef.current = activeId;
    setConversations(list);
    setActiveConversationId(activeId);
    saveConversations(list);
  }, []);

  const clearCoach = useCallback(() => {
    setCoachInsight(null);
    setCoachMeta(null);
  }, []);

  /**
   * One shared abort controller covers coach and chat: Stop, tab changes,
   * closing the Sheet, and unmount all cancel whichever request is active.
   * `requestKind` records what produced the in-flight turn so Retry replays
   * the correct endpoint.
   */
  const requestKindRef = useRef<"coach" | "chat" | null>(null);

  const generateCoach = useCallback(async () => {
    if (chatAbort.current) return; // a stream is already in flight
    setChatError("");
    useUiStore.getState().setAiChatOpen(true);
    setChatStreaming(true);
    const requestId = newId();
    const assistantId = newId();
    // The request lands in the visible transcript: the chat context the model
    // sees on follow-ups includes what the insight covered.
    applyMessages((current) => [
      ...chatBaseForSend(current, false),
      {
        id: requestId,
        role: "user",
        content: INSIGHT_REQUEST_TEXT,
        at: new Date().toISOString(),
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        at: new Date().toISOString(),
      },
    ]);
    setCoachBusy(true);
    setCoachError("");
    const abort = new AbortController();
    chatAbort.current = abort;
    requestKindRef.current = "coach";
    try {
      const result = await api<CoachResponse>("/api/ai/coach", {
        method: "POST",
        body: "{}",
        signal: abort.signal,
      });
      setCoachInsight(result.insight);
      setCoachMeta(result.meta);
      applyMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: insightToChatText(result.insight, result.meta),
              }
            : message,
        ),
      );
    } catch (e) {
      const aborted = abort.signal.aborted;
      const message = aborted
        ? "Insight generation was cancelled."
        : e instanceof Error
          ? e.message
          : "Could not generate an insight";
      if (!aborted) setCoachError(message);
      applyMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: aborted
                  ? "Insight generation was cancelled."
                  : "I could not read your saved mocks just now. The error shows on the dashboard coach card; try again from there.",
              }
            : message,
        ),
      );
    } finally {
      setChatStreaming(false);
      setCoachBusy(false);
      if (chatAbort.current === abort) {
        chatAbort.current = null;
        requestKindRef.current = null;
      }
      persistTurn();
      void refreshAiStatus();
    }
  }, [applyMessages, persistTurn, refreshAiStatus]);

  const openChat = useCallback(() => {
    setChatError("");
    useUiStore.getState().setAiChatOpen(true);
  }, []);

  const setChatOpenSafe = useCallback((open: boolean) => {
    if (!open) chatAbort.current?.abort();
    useUiStore.getState().setAiChatOpen(open);
  }, []);

  const stopChat = useCallback(() => {
    chatAbort.current?.abort();
  }, []);

  const startFreshConversation = useCallback(() => {
    chatAbort.current?.abort();
    applyMessages(() => []);
    activeIdRef.current = null;
    setActiveConversationId(null);
    setChatError("");
  }, [applyMessages]);

  /** Composer trash button: drop the current conversation from history and
   * open a clean one. */
  const clearChat = useCallback(() => {
    const doomed = activeIdRef.current;
    startFreshConversation();
    if (!doomed) return;
    const next = conversationsRef.current.filter(
      (conversation) => conversation.id !== doomed,
    );
    conversationsRef.current = next;
    setConversations(next);
    saveConversations(next);
  }, [startFreshConversation]);

  const newChat = useCallback(() => {
    startFreshConversation();
    // An untouched transcript is not stored; an existing one keeps its turns
    // (persistTurn already saved them). Opening history right away would
    // otherwise lose the just-cleared view — the sheet handles that.
    if (messagesRef.current.length) persistTurn();
  }, [persistTurn, startFreshConversation]);

  const selectConversation = useCallback(
    (id: string) => {
      if (id === activeIdRef.current) return;
      chatAbort.current?.abort();
      const conversation = conversationsRef.current.find(
        (entry) => entry.id === id,
      );
      if (!conversation) return;
      activeIdRef.current = id;
      setActiveConversationId(id);
      applyMessages(() => conversation.messages);
      setChatError("");
    },
    [applyMessages],
  );

  const removeConversation = useCallback(
    (id: string) => {
      chatAbort.current?.abort();
      const next = conversationsRef.current.filter(
        (conversation) => conversation.id !== id,
      );
      conversationsRef.current = next;
      setConversations(next);
      saveConversations(next);
      if (activeIdRef.current === id) {
        activeIdRef.current = null;
        setActiveConversationId(null);
        applyMessages(() => []);
      }
    },
    [applyMessages],
  );

  const renameConversationById = useCallback((id: string, title: string) => {
    const next = renameConversation(conversationsRef.current, id, title);
    conversationsRef.current = next;
    setConversations(next);
    saveConversations(next);
  }, []);

  const sendChat = useCallback(
    async (text: string, screen?: AiScreenContext | null, retry = false) => {
      if (chatAbort.current) return; // a stream is already in flight
      const base = chatBaseForSend(messagesRef.current, retry);
      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        content: text,
        at: new Date().toISOString(),
      };
      const assistantId = newId();
      // The user's own setting caps the prompt window; the server still
      // enforces its hard maximum, so a stale value cannot overflow it.
      const turns = aiStatus?.credential?.historyTurns ?? 8;
      const history = trimChatHistory([...base, userMessage], turns);
      applyMessages(() => [
        ...base,
        userMessage,
        { id: assistantId, role: "assistant", content: "", at: userMessage.at },
      ]);
      setChatStreaming(true);
      setChatPhase("connecting");
      setChatError("");
      const abort = new AbortController();
      chatAbort.current = abort;
      requestKindRef.current = "chat";
      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            ...(screen ? { context: screen } : {}),
          }),
          signal: abort.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (response.status === 401)
            window.dispatchEvent(new Event("ssc:session-ended"));
          if (body?.error?.code === "AUTH_UNAVAILABLE")
            window.dispatchEvent(new Event("ssc:auth-unavailable"));
          throw new Error(
            body?.error?.message ?? "The coach could not answer. Try again.",
          );
        }
        if (!response.body)
          throw new Error("The coach returned an empty answer.");
        const reader = response.body.getReader();
        const decoder = new NdjsonDecoder();
        let finished = false;
        let writing = false;
        let reasoningStartedAt: number | null = null;
        const handle = (line: string) => {
          const event = parseChatEvent(line);
          if (!event) return;
          if (event.type === "ping") {
            // Keepalive only: proof the connection is alive while the model
            // thinks. The phase moves forward, nothing is appended.
            if (!writing) setChatPhase("thinking");
            return;
          }
          if (event.type === "reasoning") {
            if (reasoningStartedAt == null) reasoningStartedAt = Date.now();
            if (!writing) setChatPhase("thinking");
            applyMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      reasoning: (message.reasoning ?? "") + event.text,
                    }
                  : message,
              ),
            );
            return;
          }
          if (event.type === "delta") {
            if (!writing) {
              writing = true;
              setChatPhase("writing");
              if (reasoningStartedAt != null) {
                const seconds = Math.max(
                  1,
                  Math.round((Date.now() - reasoningStartedAt) / 1000),
                );
                applyMessages((current) =>
                  current.map((message) =>
                    message.id === assistantId
                      ? { ...message, reasoningSeconds: seconds }
                      : message,
                  ),
                );
              }
            }
            applyMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + event.text }
                  : message,
              ),
            );
          } else if (event.type === "error") {
            setChatError(event.message);
            finished = true;
          } else if (event.type === "done") {
            if (event.truncated) {
              applyMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, truncated: true }
                    : message,
                ),
              );
            }
            finished = true;
          }
        };
        while (!finished) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.push(value)) {
            handle(line);
            if (finished) break;
          }
        }
        for (const line of decoder.flush()) {
          handle(line);
          if (finished) break;
        }
        await reader.cancel().catch(() => undefined);
      } catch (e) {
        if (!abort.signal.aborted)
          setChatError(
            e instanceof Error ? e.message : "The coach could not answer.",
          );
      } finally {
        setChatStreaming(false);
        setChatPhase(null);
        if (chatAbort.current === abort) {
          chatAbort.current = null;
          requestKindRef.current = null;
        }
        persistTurn();
        void refreshAiStatus();
      }
    },
    [aiStatus, applyMessages, persistTurn, refreshAiStatus],
  );

  /** Edit a previously sent user message: everything after it is discarded
   * and the new text is sent in its place. The full replacement history is
   * persisted when the re-sent turn settles. */
  const editAndResend = useCallback(
    (messageId: string, text: string) => {
      if (chatAbort.current) return;
      const index = messagesRef.current.findIndex(
        (message) => message.id === messageId && message.role === "user",
      );
      if (index < 0) return;
      applyMessages((current) => current.slice(0, index));
      void sendChat(text, null, false);
    },
    [applyMessages, sendChat],
  );

  /** Retry replays the request kind that produced the last turn: a coach
   * insight re-runs the coach endpoint, a chat turn re-sends the question. */
  const retryLast = useCallback(() => {
    const kind = requestKindRef.current;
    if (kind === "coach") {
      void generateCoach();
      return;
    }
    if (kind === "chat") {
      const lastUser = messagesRef.current.findLast(
        (message) => message.role === "user",
      );
      if (lastUser) void sendChat(lastUser.content, null, true);
    }
  }, [generateCoach, sendChat]);

  /** Regenerate the last answer on demand (not only after an error): the
   * latest exchange is dropped and replayed against its original endpoint. */
  const regenerateLast = useCallback(() => {
    if (chatAbort.current) return;
    const kind = requestKindRef.current ?? "chat";
    if (kind === "coach") {
      void generateCoach();
      return;
    }
    const lastUser = messagesRef.current.findLast(
      (message) => message.role === "user",
    );
    if (!lastUser) return;
    const assistantIndex = messagesRef.current.findIndex(
      (message) => message.id === lastUser.id,
    );
    // Drop everything after the question, then replay it.
    applyMessages((current) => current.slice(0, assistantIndex + 1));
    void sendChat(lastUser.content, null, true);
  }, [applyMessages, generateCoach, sendChat]);

  const history: ChatHistoryApi = {
    conversations,
    activeId: activeConversationId,
    newChat,
    select: selectConversation,
    remove: removeConversation,
    rename: renameConversationById,
  };

  return {
    aiStatus,
    refreshAiStatus,
    coach: {
      insight: coachInsight,
      meta: coachMeta,
      busy: coachBusy,
      error: coachError,
      generate: generateCoach,
      clear: clearCoach,
      open: openChat,
    },
    chat: {
      open: chatOpen,
      setOpen: setChatOpenSafe,
      messages: chatMessages,
      streaming: chatStreaming,
      phase: chatPhase,
      error: chatError,
      send: sendChat,
      stop: stopChat,
      clear: clearChat,
      retryLast,
      regenerateLast,
      editResend: editAndResend,
      history,
    },
  };
}
