"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Unsaved-changes guard for Settings.
 *
 * Settings is a set of independent panels, each with its own save action. A
 * panel registers its draft here so (a) the sticky save bar can drive the
 * active panel's save/reset, and (b) navigating away with unsaved edits asks
 * before discarding. Registration is state (not a ref) so the save bar
 * reacts to dirty transitions as they happen.
 *
 * `save` is the panel's own submit — the same handler its (pre-save-bar)
 * button used, now driven by the bar. It is optional: instant-apply panels
 * (Appearance) register nothing at all.
 */

export type PanelDraft = {
  /** True when the panel has edits the user has not saved. */
  isDirty: boolean;
  /** Reverts the panel's draft to its saved values. */
  reset: () => void;
  /** Commits the draft through the panel's real save flow. */
  save: () => Promise<void> | void;
};

type SettingsGuard = {
  /** The section currently being rendered. */
  section: string;
  requestSection: (next: string) => void;
  register: (section: string, draft: PanelDraft | null) => void;
  /** The active section's registered draft, or null (drives the save bar). */
  activeDraft: PanelDraft | null;
  /** True while the discard dialog is open. */
  confirming: boolean;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
  /** The section the user tried to reach, shown in the dialog copy. */
  pendingSection: string | null;
};

const SettingsGuardContext = createContext<SettingsGuard | null>(null);

export function SettingsGuardProvider({
  section,
  onSectionChange,
  children,
}: {
  section: string;
  onSectionChange: (next: string) => void;
  children: ReactNode;
}) {
  const [drafts, setDrafts] = useState<Record<string, PanelDraft>>({});
  const [confirming, setConfirming] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const register = useCallback(
    (key: string, draft: PanelDraft | null) => {
      setDrafts((current) => {
        if (draft) {
          const previous = current[key];
          if (
            previous &&
            previous.isDirty === draft.isDirty &&
            previous.reset === draft.reset &&
            previous.save === draft.save
          ) {
            return current;
          }
          return { ...current, [key]: draft };
        }
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const requestSection = useCallback(
    (next: string) => {
      if (next === section) return;
      const dirty = Object.values(drafts).some((d) => d.isDirty);
      if (!dirty) {
        onSectionChange(next);
        return;
      }
      setPendingSection(next);
      setConfirming(true);
    },
    [drafts, onSectionChange, section],
  );

  const confirmDiscard = useCallback(() => {
    for (const draft of Object.values(drafts)) draft.reset();
    setConfirming(false);
    if (pendingSection) onSectionChange(pendingSection);
    setPendingSection(null);
  }, [drafts, onSectionChange, pendingSection]);

  const cancelDiscard = useCallback(() => {
    setConfirming(false);
    setPendingSection(null);
  }, []);

  // Closing the tab with unsaved edits asks the browser to confirm.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!Object.values(drafts).some((d) => d.isDirty)) return;
      event.preventDefault();
      // Chrome requires returnValue to be set for the prompt to appear.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [drafts]);

  const activeDraft = drafts[section] ?? null;

  const value = useMemo<SettingsGuard>(
    () => ({
      section,
      requestSection,
      register,
      activeDraft,
      confirming,
      confirmDiscard,
      cancelDiscard,
      pendingSection,
    }),
    [
      activeDraft,
      cancelDiscard,
      confirmDiscard,
      confirming,
      pendingSection,
      register,
      requestSection,
      section,
    ],
  );

  return (
    <SettingsGuardContext.Provider value={value}>
      {children}
    </SettingsGuardContext.Provider>
  );
}

export function useSettingsGuard(): SettingsGuard {
  const value = useContext(SettingsGuardContext);
  if (!value)
    throw new Error("useSettingsGuard must be used within SettingsGuardProvider");
  return value;
}

/**
 * The guard, when there is one. Views that render outside Settings (the AI
 * form in the chat sheet) have no provider; their drafts simply stay local.
 */
export function useOptionalSettingsGuard(): SettingsGuard | null {
  return useContext(SettingsGuardContext);
}

/** Register one panel's draft with the guard. Call with `null` on unmount. */
export function usePanelDraft(section: string, draft: PanelDraft | null) {
  const guard = useOptionalSettingsGuard();
  const { isDirty, reset, save } = draft ?? {
    isDirty: false,
    reset: () => {},
    save: () => {},
  };
  useEffect(() => {
    guard?.register(section, { isDirty, reset, save });
  }, [guard, isDirty, reset, save, section]);
  useEffect(() => () => guard?.register(section, null), [guard, section]);
}
