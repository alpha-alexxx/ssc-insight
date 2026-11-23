"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Settings02Icon } from "@/components/animate-ui/icons/hugeicons/settings-02";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { SettingsGuardProvider, useSettingsGuard } from "@/components/shared/settings-guard";
import {
  pageEnter,
  saveBarSpring,
  tabSwap,
} from "./_lib/motion-presets";
import { PanelCard } from "./_lib/panel";
import { ExamsPanel } from "./exams-panel";
import { TargetsPanel } from "./targets-panel";
import { RemindersPanel } from "./reminders-panel";
import { DataPanel } from "./data-panel";
import { AboutPanel } from "./about-panel";
import { SecurityPanel } from "./security-panel";
import { AppearancePanel } from "@/components/appearance-panel";
import { AiSettingsForm } from "@/components/ai-settings-form";

/**
 * Settings — seven groups behind one navigable rail.
 *
 * The section is a real selection: clicking the rail swaps the rendered
 * panel. The selection mirrors to `?section=` so a deep link — "open the
 * percentile target" — can land directly on the group.
 *
 * Each draft-holding panel owns its form and registers { isDirty, reset,
 * save } with the guard. The sticky save bar drives that contract; leaving a
 * section with unsaved edits asks before discarding. The section swap and
 * the save-bar spring are the one settings-scoped motion exception
 * (DESIGN.md); everything still collapses to instant under reduced motion.
 */

export const SETTINGS_SECTIONS = [
  { id: "exams", label: "Exams & tiers", hint: "Pick what you are preparing for" },
  { id: "targets", label: "Targets", hint: "Percentile goal and marks targets" },
  { id: "reminders", label: "Reminders", hint: "In-app nudges only" },
  { id: "appearance", label: "Appearance", hint: "Palette and visual style" },
  { id: "ai", label: "AI provider", hint: "Model, endpoint and key" },
  { id: "security", label: "Sign-in & security", hint: "Password, 2FA and sessions" },
  { id: "data", label: "Data & backup", hint: "Export, import and transfer" },
  { id: "about", label: "About & account", hint: "What this workspace is" },
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

const SECTION_IDS = new Set<string>(SETTINGS_SECTIONS.map((s) => s.id));

function isSection(value: string | null): value is SettingsSection {
  return value != null && SECTION_IDS.has(value);
}

/** Read `?section=` once on mount; unknown values fall back to Exams. */
function initialSection(): SettingsSection {
  if (typeof window === "undefined") return "exams";
  const value = new URLSearchParams(window.location.search).get("section");
  return isSection(value) ? value : "exams";
}

export function SettingsView({
  userName,
  userEmail,
  onDownload,
  onChooseFile,
  fileInput,
  backup,
  onOpenReplace,
  saveTarget,
  busy,
  /** Explicit landing section (a deep link). Defaults to `?section=`. */
  initialSectionOverride,
}: {
  userName: string;
  userEmail: string;
  onDownload: (format: "json" | "csv") => void;
  onChooseFile: () => void;
  fileInput: React.ReactNode;
  backup: Omit<
    ReturnType<typeof import("./use-backup-import").useBackupImport>,
    "busy"
  >;
  onOpenReplace: () => void;
  saveTarget: () => Promise<boolean>;
  busy: boolean;
  initialSectionOverride?: SettingsSection;
}) {
  const [section, setSection] = useState<SettingsSection>(
    initialSectionOverride ?? initialSection,
  );

  // Mirror the section into the URL (replaceState, like the other workspace
  // views) so a reload or a shared link reopens the same group.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (section === "exams") url.searchParams.delete("section");
    else url.searchParams.set("section", section);
    window.history.replaceState(null, "", url);
  }, [section]);

  const changeSection = useCallback((next: string) => {
    if (isSection(next)) setSection(next);
  }, []);

  return (
    <SettingsGuardProvider section={section} onSectionChange={changeSection}>
      <SettingsBody
        section={section}
        userName={userName}
        userEmail={userEmail}
        onDownload={onDownload}
        onChooseFile={onChooseFile}
        fileInput={fileInput}
        backup={backup}
        onOpenReplace={onOpenReplace}
        saveTarget={saveTarget}
        busy={busy}
      />
      <SettingsDiscardDialog />
    </SettingsGuardProvider>
  );
}

function SettingsBody({
  section,
  userName,
  userEmail,
  onDownload,
  onChooseFile,
  fileInput,
  backup,
  onOpenReplace,
  saveTarget,
  busy,
}: {
  section: SettingsSection;
  userName: string;
  userEmail: string;
  onDownload: (format: "json" | "csv") => void;
  onChooseFile: () => void;
  fileInput: React.ReactNode;
  backup: Omit<
    ReturnType<typeof import("./use-backup-import").useBackupImport>,
    "busy"
  >;
  onOpenReplace: () => void;
  saveTarget: () => Promise<boolean>;
  busy: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...(reduce ? {} : pageEnter)}
      className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]"
    >
      <SettingsNav section={section} />
      <div className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            {...(reduce ? {} : tabSwap)}
          >
            {section === "exams" && <ExamsPanel />}
            {section === "targets" && (
              <TargetsPanel saveTarget={saveTarget} busy={busy} />
            )}
            {section === "reminders" && <RemindersPanel />}
            {section === "appearance" && <AppearancePanel />}
            {section === "ai" && (
              <PanelCard
                icon="sparkles"
                title="AI provider"
                description="Optional. The tracker stays fully usable without it."
              >
                <AiSettingsForm showHeading={false} />
              </PanelCard>
            )}
            {section === "security" && (
              <SecurityPanel userName={userName} userEmail={userEmail} />
            )}
            {section === "data" && (
              <DataPanel
                onDownload={onDownload}
                onChooseFile={onChooseFile}
                fileInput={fileInput}
                backup={backup}
                busy={busy}
                onOpenReplace={onOpenReplace}
              />
            )}
            {section === "about" && (
              <AboutPanel userName={userName} userEmail={userEmail} />
            )}
          </motion.div>
        </AnimatePresence>
        <SaveBar />
      </div>
    </motion.div>
  );
}

/**
 * The one save affordance for every draft-holding section. Sticky at the
 * bottom of the content column; slides in when the active panel's draft is
 * dirty and drives its registered reset/save.
 */
function SaveBar() {
  const guard = useSettingsGuard();
  const reduce = useReducedMotion();
  const draft = guard.activeDraft;
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!draft?.save) return;
    setSaving(true);
    try {
      await draft.save();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {draft?.isDirty && (
        <motion.div
          key="settings-save-bar"
          initial={reduce ? false : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: 80, opacity: 0 }}
          transition={saveBarSpring}
          className="sticky bottom-4 z-30 mx-auto mt-5 max-w-3xl"
        >
          <div
            role="status"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-card px-4 py-3 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => draft.reset()}
              >
                Discard
              </Button>
              <Button
                size="sm"
                loading={saving}
                disabled={saving}
                icon={
                  <Settings02Icon size={14} animateOnView animateOnViewOnce />
                }
                onClick={() => void save()}
              >
                Save
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingsNav({ section }: { section: SettingsSection }) {
  const guard = useSettingsGuard();
  return (
    <>
      {/* Rail on desktop; a ruled tab strip on phones. Both are the same
          set of controls, and both actually change the panel. */}
      <nav
        aria-label="Settings sections"
        className="-mx-3 flex gap-1 overflow-x-auto border-b border-border px-3 pb-px lg:hidden"
      >
        {SETTINGS_SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => guard.requestSection(item.id)}
              className={cn(
                "-mb-px min-h-11 shrink-0 whitespace-nowrap border-b-2 px-3 text-[13px] font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <nav
        aria-label="Settings sections"
        className="hidden h-fit lg:sticky lg:top-20 lg:block"
      >
        <ul className="flex flex-col gap-0.5">
          {SETTINGS_SECTIONS.map((item) => {
            const active = section === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => guard.requestSection(item.id)}
                  className={cn(
                    "w-full rounded-full px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="block text-[13px] font-medium">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] leading-snug",
                      active ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {item.hint}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/**
 * Rendered at the SettingsView root (outside the animated content column)
 * so the dirty-confirm dialog never unmounts mid-swap; it portals itself.
 */
function SettingsDiscardDialog() {
  const guard = useSettingsGuard();
  const label =
    SETTINGS_SECTIONS.find((s) => s.id === guard.pendingSection)?.label ??
    "another section";
  return (
    <Dialog
      open={guard.confirming}
      onOpenChange={(open) => !open && guard.cancelDiscard()}
      title="Discard unsaved changes?"
      size="sm"
      description={`You have edits in this section that have not been saved. Moving to ${label} will discard them.`}
      footer={
        <>
          <Button variant="outline" onClick={guard.cancelDiscard}>
            Keep editing
          </Button>
          <Button variant="destructive" onClick={guard.confirmDiscard}>
            Discard and continue
          </Button>
        </>
      }
    />
  );
}
