import { create } from "zustand";
import { istTodayIso } from "@/lib/plan/view-model";

/**
 * A reviewed mock draft handed from the AI panel to /add.
 *
 * Declared structurally rather than importing `LogMockPayload` from the sheet:
 * the store must not depend on a component module (it would pull the whole AI
 * panel into every consumer's graph). `LogMockPayload` is assignable to this.
 */
export type MockPrefillDraft = {
  values: Record<string, unknown>;
  date: string;
};

/**
 * Global shell UI state, on Zustand.
 *
 * Scope rules (see docs/state-audit.md and AGENTS.md):
 * - Server data NEVER lives here — every API resource belongs to the
 *   TanStack Query cache. This store carries only what multiple surfaces
 *   read and write: palette visibility, the planner date the calendar/day
 *   views share, and the quick-add handoff from the `n` shortcut (replacing
 *   the ssc:tasks-quick-add window event).
 * - No persistence middleware: every field is session UI state and must
 *   reset on reload; anything durable already has a home (theme tokens in
 *   localStorage, the sidebar in its cookie, task-view prefs in their own
 *   storage key).
 * - Select fields with narrow selectors (`useUiStore((s) => s.searchOpen)`)
 *   so streaming chat tokens and drawer state changes do not re-render
 *   unrelated panels.
 */

type UiState = {
  /** ⌘K command palette visibility (keyboard shortcuts, header, shell). */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  /** The planner date shared by the dashboard week strip, the calendar
   * selection, and the /plan/<date> fallback. */
  plannerDate: string;
  setPlannerDate: (date: string) => void;

  /** Monotonic counter bumped to ask My Tasks to focus its quick-add bar.
   * Consumers track consumption so a remount never re-fires an old request. */
  quickAddNonce: number;
  consumedQuickAddNonce: number;
  requestQuickAdd: () => void;
  consumeQuickAdd: () => void;

  /**
   * One-shot reviewed mock draft handed from the AI panel to /add.
   *
   * It lives here, not in the URL: the draft contains the user's own mock
   * content, and a query parameter would put it in browser history, in any
   * proxy log, and in a shared link. `MockForm` stays the sole save path.
   */
  mockPrefill: MockPrefillDraft | null;
  requestMockPrefill: (draft: MockPrefillDraft) => void;
  consumeMockPrefill: () => void;

  /**
   * The record id whose detail dialog is open, or null.
   *
   * The dialog lives in the chrome (so every surface shares one overlay and one
   * delete path); routes open it by id. Storing an id rather than the object
   * keeps server data out of the store — the chrome reads the record from the
   * query cache.
   */
  openAttemptId: string | null;
  openAttempt: (id: string) => void;
  closeAttempt: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  plannerDate: istTodayIso(),
  setPlannerDate: (date) => set({ plannerDate: date }),

  quickAddNonce: 0,
  consumedQuickAddNonce: 0,
  requestQuickAdd: () =>
    set((state) => ({ quickAddNonce: state.quickAddNonce + 1 })),
  consumeQuickAdd: () =>
    set((state) => ({ consumedQuickAddNonce: state.quickAddNonce })),

  mockPrefill: null,
  requestMockPrefill: (draft) => set({ mockPrefill: draft }),
  consumeMockPrefill: () => set({ mockPrefill: null }),

  openAttemptId: null,
  openAttempt: (id) => set({ openAttemptId: id }),
  closeAttempt: () => set({ openAttemptId: null }),
}));
