"use client";
import {
  beginChatRequest,
  chatBaseForSend,
  invalidateChatRequest,
  isCurrentChatRequest,
  preserveAnswerVersion,
  type ChatRequestIdentity,
} from "@/lib/ai/chat-history";
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
import { NdjsonDecoder, parseChatEvent } from "@/lib/ai/ndjson";
import { toast } from "@/components/toast-stack";
import type {
  AiScreenContext,
  AiStatus,
  ChatAnswerVersion,
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

/** "Today 12/400", or "Today 12 · unlimited" for a personal key (no cap).
 * Null only when the status carries no usage at all. */
export function aiUsageLabel(status: AiStatus | null): string | undefined {
  const usage = status?.usage;
  if (!usage) return undefined;
  if (!Number.isFinite(usage.limits.requests))
    return `Today ${usage.requests} · unlimited`;
  if (usage.limits.requests <= 0) return undefined;
  return `Today ${usage.requests}/${usage.limits.requests}`;
}

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

/** API shape for the history panel: the stored list plus the
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
 * insight card, and the streaming chat. Finished conversations persist
 * to localStorage (lib/ai/conversations.ts) so the history restores its
 * history across reloads; the in-flight stream still aborts when the workspace
 * unmounts. Everything here fails soft — AI must
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
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase | null>(null);
  const [chatError, setChatError] = useState("");
  const chatAbort = useRef<AbortController | null>(null);
  const activeRequestRef = useRef<ChatRequestIdentity | null>(null);
  const requestKindRef = useRef<"coach" | "chat" | null>(null);
  const versionIndexesRef = useRef<Record<string, number>>({});
  const [versionIndexes, setVersionIndexes] = useState<Record<string, number>>(
    {},
  );

  const clearVersionIndexes = useCallback(() => {
    versionIndexesRef.current = {};
    setVersionIndexes({});
  }, []);

  const updateAssistant = useCallback((id: string, stopped = false) => {
    const next = messagesRef.current.map((message) =>
      message.id === id && message.role === "assistant"
        ? { ...message, ...(stopped ? { stopped: true } : {}) }
        : message,
    );
    messagesRef.current = next;
    setChatMessages(next);
  }, []);

  // Revalidates after quota-consuming actions (coach/chat completion) — the
  // quota ledger may have moved.
  const refreshAiStatus = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: aiKeys.status() });
  }, [queryClient]);
  useEffect(
    () => () => {
      activeRequestRef.current = invalidateChatRequest(
        activeRequestRef.current,
      );
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

  /** Commit a request-scoped transcript. Completion for an obsolete request
   * must not overwrite either the newly selected thread or another request's
   * persisted conversation list. */
  const persistSnapshot = useCallback(
    (conversationId: string | null, messages: ChatMessage[]) => {
      const { list, activeId } = upsertConversation(
        conversationsRef.current,
        conversationId,
        messages,
      );
      conversationsRef.current = list;
      setConversations(list);
      if (activeIdRef.current === conversationId) {
        activeIdRef.current = activeId;
        setActiveConversationId(activeId);
      }
      saveConversations(list);
    },
    [],
  );

  const persistTurn = useCallback(() => {
    persistSnapshot(activeIdRef.current, messagesRef.current);
  }, [persistSnapshot]);

  /** Preserve a partial turn before navigation. Abort is deliberately second:
   * its rejection must belong to the obsolete request, not the new thread. */
  const abortForNavigation = useCallback(() => {
    if (!activeRequestRef.current || !chatAbort.current) return;
    const assistant = messagesRef.current.findLast(
      (message) => message.role === "assistant",
    );
    if (assistant) updateAssistant(assistant.id, true);
    persistTurn();
    activeRequestRef.current = invalidateChatRequest(
      activeRequestRef.current,
    );
    chatAbort.current.abort();
    chatAbort.current = null;
    setChatStreaming(false);
    setChatPhase(null);
    setCoachBusy(false);
  }, [persistTurn, updateAssistant]);

  const clearCoach = useCallback(() => {
    setCoachInsight(null);
    setCoachMeta(null);
  }, []);

  /** The request kind survives completion: Retry remains valid after the
   * transport controller has been cleared. */
  const beginRequest = useCallback(
    (kind: "coach" | "chat", abort: AbortController) => {
      const identity = beginChatRequest(
        activeRequestRef.current?.generation ?? 0,
        activeIdRef.current,
      );
      activeRequestRef.current = identity;
      chatAbort.current = abort;
      requestKindRef.current = kind;
      return identity;
    },
    [],
  );

  const generateCoach = useCallback(async (replay = false) => {
    if (chatAbort.current) return; // a stream is already in flight
    setChatError("");
    setChatStreaming(true);
    const requestId = newId();
    const assistantId = newId();
    const abort = new AbortController();
    const identity = beginRequest("coach", abort);
    const isCurrent = () =>
      isCurrentChatRequest(activeRequestRef.current, identity);
    // The request lands in the visible transcript: the chat context the model
    // sees on follow-ups includes what the insight covered.
    applyMessages((current) => [
      ...chatBaseForSend(current, replay),
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
    try {
      const result = await api<CoachResponse>("/api/ai/coach", {
        method: "POST",
        body: "{}",
        signal: abort.signal,
      });
      if (!isCurrent()) return;
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
      if (!isCurrent()) return;
      const aborted = abort.signal.aborted;
      if (aborted) {
        // Same honesty as a stopped chat stream: mark the turn instead of
        // writing fake prose into the transcript.
        applyMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, stopped: true } : message,
          ),
        );
      } else {
        setCoachError(
          e instanceof Error ? e.message : "Could not generate an insight",
        );
        applyMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content:
                    "I could not read your saved mocks just now. The error shows on the dashboard coach card; try again from there.",
                }
              : message,
          ),
        );
      }
    } finally {
      if (isCurrent()) {
        setChatStreaming(false);
        setCoachBusy(false);
        if (chatAbort.current === abort) chatAbort.current = null;
        persistTurn();
        void refreshAiStatus();
      }
    }
  }, [applyMessages, beginRequest, persistTurn, refreshAiStatus]);

  const openChat = useCallback(() => {
    setChatError("");
  }, []);

  const stopChat = useCallback(() => {
    // A deliberate stop is honest feedback, not a failure: the question and
    // any partial answer stay in the thread, marked `stopped`.
    if (chatAbort.current) {
      chatAbort.current.abort();
      toast.info("Reply stopped", { description: "Your question is still in the thread." });
    }
  }, []);

  const startFreshConversation = useCallback(() => {
    abortForNavigation();
    applyMessages(() => []);
    activeIdRef.current = null;
    setActiveConversationId(null);
    clearVersionIndexes();
    setChatError("");
  }, [abortForNavigation, applyMessages, clearVersionIndexes]);

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
      const conversation = conversationsRef.current.find(
        (entry) => entry.id === id,
      );
      if (!conversation) return;
      abortForNavigation();
      requestKindRef.current = "chat";
      activeIdRef.current = id;
      setActiveConversationId(id);
      applyMessages(() => conversation.messages);
      clearVersionIndexes();
      setChatError("");
    },
    [abortForNavigation, applyMessages, clearVersionIndexes],
  );

  const removeConversation = useCallback(
    (id: string) => {
      if (activeIdRef.current === id) abortForNavigation();
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
        clearVersionIndexes();
      }
    },
    [abortForNavigation, applyMessages, clearVersionIndexes],
  );

  const renameConversationById = useCallback((id: string, title: string) => {
    const next = renameConversation(conversationsRef.current, id, title);
    conversationsRef.current = next;
    setConversations(next);
    saveConversations(next);
  }, []);

  const selectVersion = useCallback(
    (messageId: string, index: number) => {
      if (!Number.isInteger(index) || index < 0 || chatAbort.current) return;
      const message = messagesRef.current.find(
        (entry) => entry.id === messageId && entry.role === "assistant",
      );
      if (!message || index > (message.versions?.length ?? 0)) return;
      const nextIndexes = { ...versionIndexesRef.current };
      // The last pager position is the current answer, not a stored version.
      if (index === (message.versions?.length ?? 0))
        delete nextIndexes[messageId];
      else nextIndexes[messageId] = index;
      versionIndexesRef.current = nextIndexes;
      setVersionIndexes(nextIndexes);
    },
    [],
  );

  const displayedMessages = chatMessages.map((message) => {
    const index = versionIndexes[message.id];
    if (index == null) return message;
    const version: ChatAnswerVersion | undefined = message.versions?.[index];
    return version ? { ...message, ...version } : message;
  });

  const sendChat = useCallback(
    async (
      text: string,
      screen?: AiScreenContext | null,
      retry = false,
      images?: string[],
      preserveVersions = false,
    ) => {
      if (chatAbort.current) return; // a stream is already in flight
      const previousAssistantId = preserveVersions
        ? messagesRef.current.findLast(
            (message) => message.role === "assistant",
          )?.id
        : undefined;
      const base = chatBaseForSend(messagesRef.current, retry);
      const imageOnly = Boolean(!text.trim() && images?.length);
      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        // The wire contract needs a label even for image-only turns; the
        // transcript renders those from the images alone (imageOnly below).
        content: imageOnly ? "Screenshot" : text,
        at: new Date().toISOString(),
        ...(images?.length ? { images } : {}),
        ...(imageOnly ? { imageOnly: true } : {}),
      };
      const assistantId = newId();
      const preservedVersions = preserveVersions
        ? messagesRef.current.findLast(
            (message) => message.role === "assistant",
          )?.versions
        : undefined;
      const abort = new AbortController();
      const identity = beginRequest("chat", abort);
      const isCurrent = () =>
        isCurrentChatRequest(activeRequestRef.current, identity);
      // The user's own setting caps the prompt window; the server still
      // enforces its hard maximum, so a stale value cannot overflow it.
      const turns = aiStatus?.credential?.historyTurns ?? 8;
      const history = trimChatHistory([...base, userMessage], turns);
      applyMessages(() => [
        ...base,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          at: userMessage.at,
          ...(preservedVersions?.length
            ? { versions: preservedVersions }
            : {}),
        },
      ]);
      setChatStreaming(true);
      setChatPhase("connecting");
      setChatError("");
      if (previousAssistantId) {
        const nextIndexes = { ...versionIndexesRef.current };
        delete nextIndexes[previousAssistantId];
        versionIndexesRef.current = nextIndexes;
        setVersionIndexes(nextIndexes);
      }
      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            ...(images?.length ? { images } : {}),
            ...(screen ? { context: screen } : {}),
          }),
          signal: abort.signal,
        });
        if (!isCurrent()) {
          await response.body?.cancel().catch(() => undefined);
          return;
        }
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
          if (!event || !isCurrent()) return;
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
          if (!isCurrent()) {
            await reader.cancel().catch(() => undefined);
            return;
          }
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
        if (!isCurrent()) return;
        if (abort.signal.aborted) {
          // A stop never disappears silently: whatever partial answer exists
          // stays, with an explicit stopped marker on the turn.
          applyMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, stopped: true } : message,
            ),
          );
        } else {
          setChatError(
            e instanceof Error ? e.message : "The coach could not answer.",
          );
        }
      } finally {
        if (isCurrent()) {
          setChatStreaming(false);
          setChatPhase(null);
          if (chatAbort.current === abort) chatAbort.current = null;
          persistTurn();
          void refreshAiStatus();
        }
      }
    },
    [aiStatus, applyMessages, beginRequest, persistTurn, refreshAiStatus],
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
      clearVersionIndexes();
      void sendChat(text, null, false);
    },
    [applyMessages, clearVersionIndexes, sendChat],
  );

  /** Retry replays the request kind that produced the last turn: a coach
   * insight re-runs the coach endpoint, a chat turn re-sends the question. */
  const retryLast = useCallback(() => {
    const kind = requestKindRef.current;
    if (kind === "coach") {
      void generateCoach(true);
      return;
    }
    if (kind === "chat") {
      const lastUser = messagesRef.current.findLast(
        (message) => message.role === "user",
      );
      if (lastUser) void sendChat(lastUser.content, null, true);
    }
  }, [generateCoach, sendChat]);

  /** Regenerate the latest answer on demand. Its complete response is moved
   * into versions before the same user turn is replayed; selecting an older
   * version only changes the view, never duplicates that version on replay. */
  const regenerateLast = useCallback(() => {
    if (chatAbort.current) return;
    const kind = requestKindRef.current ?? "chat";
    if (kind === "coach") {
      void generateCoach(true);
      return;
    }
    const userIndex = messagesRef.current.findLastIndex(
      (message) => message.role === "user",
    );
    if (userIndex < 0) return;
    const lastUser = messagesRef.current[userIndex]!;
    requestKindRef.current = "chat";
    const targetIndex = messagesRef.current.findLastIndex(
      (message) => message.role === "assistant",
    );
    if (targetIndex < userIndex) return;
    const target = messagesRef.current[targetIndex]!;
    applyMessages((current) => preserveAnswerVersion(current, target.id));
    void sendChat(lastUser.content, null, true, lastUser.images, true);
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
      messages: displayedMessages,
      versionIndexes,
      selectVersion,
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