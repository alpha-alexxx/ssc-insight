"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icon";
import { Settings02Icon } from "@/components/animate-ui/icons/hugeicons/settings-02";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  SettingsGuardProvider,
  useSettingsGuard,
} from "@/components/shared/settings-guard";
import { pageEnter, saveBarSpring, tabSwap } from "./_lib/motion-presets";
import { PanelCard } from "./_lib/panel";
import { ExamsPanel } from "./exams-panel";
import { TargetsPanel } from "./targets-panel";
import { RemindersPanel } from "./reminders-panel";
import { DataPanel } from "./data-panel";
import { AboutPanel } from "./about-panel";
import { SecurityPanel } from "./security-panel";
import { AppearancePanel } from "@/components/appearance-panel";
import { AiSettingsForm } from "@/components/ai-settings-form";

/* ------------------------------------------------------------------ */
/*  Section registry                                                   */
/* ------------------------------------------------------------------ */

export const SETTINGS_SECTIONS = [
  {
    id: "exams",
    label: "Exams & tiers",
    hint: "Pick what you are preparing for",
    icon: "book" as IconName,
  },
  {
    id: "targets",
    label: "Targets",
    hint: "Percentile goal and marks targets",
    icon: "target" as IconName,
  },
  {
    id: "reminders",
    label: "Reminders",
    hint: "In-app nudges only",
    icon: "bell" as IconName,
  },
  {
    id: "appearance",
    label: "Appearance",
    hint: "Palette and visual style",
    icon: "sliders" as IconName,
  },
  {
    id: "ai",
    label: "AI provider",
    hint: "Model, endpoint and key",
    icon: "ai" as IconName,
  },
  {
    id: "security",
    label: "Sign-in & security",
    hint: "Password, 2FA and sessions",
    icon: "lock" as IconName,
  },
  {
    id: "data",
    label: "Data & backup",
    hint: "Export, import and transfer",
    icon: "folder" as IconName,
  },
  {
    id: "about",
    label: "About & account",
    hint: "What this workspace is",
    icon: "user" as IconName,
  },
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

const SECTION_IDS = new Set<string>(SETTINGS_SECTIONS.map((s) => s.id));

const SECTION_GROUPS: { title: string; items: readonly SettingsSection[] }[] = [
  { title: "Study & Prep", items: ["exams", "targets", "reminders"] },
  { title: "Workspace", items: ["appearance", "ai"] },
  { title: "Account & System", items: ["security", "data", "about"] },
];

function isSection(value: string | null): value is SettingsSection {
  return value != null && SECTION_IDS.has(value);
}

function initialSection(): SettingsSection {
  if (typeof window === "undefined") return "exams";
  const value = new URLSearchParams(window.location.search).get("section");
  return isSection(value) ? value : "exams";
}

function getInitials(name: string, email: string): string {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Root view                                                          */
/* ------------------------------------------------------------------ */

export interface SettingsViewProps {
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
  initialSectionOverride,
}: SettingsViewProps) {
  const [section, setSection] = useState<SettingsSection>(
    initialSectionOverride ?? initialSection,
  );

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

/* ------------------------------------------------------------------ */
/*  Body layout                                                        */
/* ------------------------------------------------------------------ */

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
  const guard = useSettingsGuard();
  const isDirty = Boolean(guard.activeDraft?.isDirty);

  const activeMeta = useMemo(
    () =>
      SETTINGS_SECTIONS.find((s) => s.id === section) ?? SETTINGS_SECTIONS[0],
    [section],
  );

  const activeGroupTitle = useMemo(
    () =>
      SECTION_GROUPS.find((g) => g.items.includes(section))?.title ??
      "Settings",
    [section],
  );

  return (
    <motion.div
      {...(reduce ? {} : pageEnter)}
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)] items-start gap-4",
        "lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-6",
        "xl:grid-cols-[272px_minmax(0,1fr)] xl:gap-8",
      )}
    >
      {/* ── Sidebar / Mobile ScrollArea tabs ── */}
      <SettingsNav
        section={section}
        userName={userName}
        userEmail={userEmail}
      />

      {/* ── Content column ── */}
      <div className={cn("min-w-0 max-w-full space-y-4")}>
        {/* Breadcrumb + status */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-xl",
            "border border-border/60 bg-card/50 px-4 py-2.5 backdrop-blur-sm",
          )}
        >
          <nav
            aria-label="Breadcrumb"
            className={cn("flex min-w-0 items-center gap-1.5 text-xs")}
          >
            <span className={cn("truncate font-medium text-muted-foreground")}>
              {activeGroupTitle}
            </span>
            <Icon name="chevronRight" size={12} tone="muted" />
            <span className={cn("truncate font-semibold text-foreground")}>
              {activeMeta.label}
            </span>
          </nav>

          <div className={cn("flex shrink-0 items-center gap-2")}>
            {isDirty ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-amber-500/10",
                  "px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 animate-pulse rounded-full bg-amber-500",
                  )}
                />
                Unsaved edits
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] text-muted-foreground",
                )}
              >
                <span
                  className={cn("size-1.5 rounded-full bg-emerald-500/70")}
                />
                All changes saved
              </span>
            )}
          </div>
        </div>

        {/* Active panel */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            {...(reduce ? {} : tabSwap)}
            className={cn("min-w-0 max-w-full")}
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

        <SaveBar activeSectionLabel={activeMeta.label} />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation rail (desktop) + ScrollArea tab strip (mobile)          */
/* ------------------------------------------------------------------ */

function SettingsNav({
  section,
  userName,
  userEmail,
}: {
  section: SettingsSection;
  userName: string;
  userEmail: string;
}) {
  const guard = useSettingsGuard();
  const reduce = useReducedMotion();
  const isDirty = Boolean(guard.activeDraft?.isDirty);
  const mobileTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const sectionMap = useMemo(
    () => new Map(SETTINGS_SECTIONS.map((item) => [item.id, item])),
    [],
  );

  const initials = useMemo(
    () => getInitials(userName, userEmail),
    [userName, userEmail],
  );

  // Smoothly center the active tab inside the horizontal ScrollArea on mobile
  useEffect(() => {
    const activeEl = mobileTabRefs.current[section];
    if (!activeEl) return;
    activeEl.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [section, reduce]);

  return (
    <>
      {/* ── Mobile: horizontal scrollable tab strip via shadcn ScrollArea ── */}
      <div
        className={cn(
          "w-full min-w-0 max-w-full overflow-hidden",
          "border-b border-border/80 bg-background/95 backdrop-blur-md lg:hidden",
        )}
      >
        <ScrollArea className={cn("w-full max-w-full whitespace-nowrap")}>
          <nav
            aria-label="Settings sections"
            className={cn("flex w-max min-w-full items-center gap-0.5 pb-px")}
          >
            {SETTINGS_SECTIONS.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    mobileTabRefs.current[item.id] = node;
                  }}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => guard.requestSection(item.id)}
                  className={cn(
                    "relative flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 text-[13px] font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={14}
                    tone={active ? "primary" : "muted"}
                  />
                  <span>{item.label}</span>
                  {active && isDirty && (
                    <span
                      className={cn("size-1.5 rounded-full bg-amber-500")}
                      aria-label="Unsaved changes"
                    />
                  )}
                  {active && (
                    <motion.span
                      layoutId={
                        reduce ? undefined : "settings-mobile-underline"
                      }
                      className={cn(
                        "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <ScrollBar orientation="horizontal" className={cn("h-1.5")} />
        </ScrollArea>
      </div>

      {/* ── Desktop: grouped sticky rail ── */}
      <aside className={cn("hidden h-fit lg:sticky lg:top-20 lg:block")}>
        <div
          className={cn(
            "rounded-2xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-sm",
          )}
        >
          {/* User identity card */}
          <div
            className={cn(
              "mb-4 flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                "bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20",
              )}
            >
              {initials}
            </div>
            <div className={cn("min-w-0 flex-1")}>
              <p
                className={cn("truncate text-xs font-semibold text-foreground")}
              >
                {userName || "Workspace Member"}
              </p>
              <p className={cn("truncate text-[11px] text-muted-foreground")}>
                {userEmail || "Personal workspace"}
              </p>
            </div>
            <Icon name="settings" size={14} tone="muted" />
          </div>

          {/* Grouped nav */}
          <nav aria-label="Settings sections" className={cn("space-y-4")}>
            {SECTION_GROUPS.map((group) => (
              <div key={group.title} className={cn("space-y-1")}>
                <p
                  className={cn(
                    "px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60",
                  )}
                >
                  {group.title}
                </p>
                <ul className={cn("flex flex-col gap-0.5")}>
                  {group.items.map((id) => {
                    const item = sectionMap.get(id);
                    if (!item) return null;
                    const active = section === item.id;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={active ? "page" : undefined}
                          onClick={() => guard.requestSection(item.id)}
                          className={cn(
                            "group relative flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                          )}
                        >
                          {/* Animated active background */}
                          {active && (
                            <motion.span
                              layoutId={
                                reduce ? undefined : "settings-desktop-active"
                              }
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 32,
                              }}
                              className={cn(
                                "absolute inset-0 rounded-xl border border-border/80 bg-accent/90 shadow-2xs",
                              )}
                            />
                          )}

                          {/* Left accent bar */}
                          {active && (
                            <motion.span
                              layoutId={
                                reduce ? undefined : "settings-desktop-bar"
                              }
                              className={cn(
                                "absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-primary",
                              )}
                            />
                          )}

                          {/* Icon tile */}
                          <span
                            className={cn(
                              "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              active
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-transparent bg-muted/50 text-muted-foreground group-hover:border-border/60 group-hover:bg-background group-hover:text-foreground",
                            )}
                          >
                            <Icon
                              name={item.icon}
                              size={14}
                              tone={active ? "primary" : "current"}
                            />
                          </span>

                          {/* Label + hint */}
                          <span className={cn("relative z-10 min-w-0 flex-1")}>
                            <span
                              className={cn(
                                "flex items-center justify-between gap-1.5",
                              )}
                            >
                              <span
                                className={cn(
                                  "truncate text-[13px] leading-tight",
                                  active ? "font-semibold" : "font-medium",
                                )}
                              >
                                {item.label}
                              </span>
                              {active && isDirty && (
                                <span
                                  className={cn(
                                    "size-1.5 shrink-0 rounded-full bg-amber-500",
                                  )}
                                  title="Unsaved changes"
                                />
                              )}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground",
                              )}
                            >
                              {item.hint}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky save bar                                                    */
/* ------------------------------------------------------------------ */

function SaveBar({ activeSectionLabel }: { activeSectionLabel: string }) {
  const guard = useSettingsGuard();
  const reduce = useReducedMotion();
  const draft = guard.activeDraft;
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (!draft?.save || saving) return;
    setSaving(true);
    try {
      await draft.save();
    } finally {
      setSaving(false);
    }
  }, [draft, saving]);

  // ⌘S / Ctrl+S shortcut
  useEffect(() => {
    if (!draft?.isDirty) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [draft?.isDirty, save]);

  return (
    <AnimatePresence initial={false}>
      {draft?.isDirty && (
        <motion.div
          key="settings-save-bar"
          initial={reduce ? false : { y: 80, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { y: 80, opacity: 0, scale: 0.98 }}
          transition={saveBarSpring}
          className={cn("sticky bottom-4 z-30 mx-auto mt-6 max-w-3xl")}
        >
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-2xl",
              "border border-border/80 bg-card/90 px-4 py-3 text-card-foreground shadow-lg",
              "ring-1 ring-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 dark:ring-white/10",
            )}
          >
            <div className={cn("flex items-center gap-3")}>
              <span className={cn("relative flex size-2.5 shrink-0")}>
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75",
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-2.5 rounded-full bg-amber-500",
                  )}
                />
              </span>
              <div className={cn("text-sm")}>
                <span className={cn("font-medium text-foreground")}>
                  Unsaved changes
                </span>
                <span className={cn("hidden text-muted-foreground sm:inline")}>
                  {" "}
                  in {activeSectionLabel}
                </span>
              </div>
            </div>

            <div className={cn("ml-auto flex items-center gap-2")}>
              <kbd
                className={cn(
                  "hidden rounded border border-border bg-muted/60 px-1.5 py-0.5",
                  "font-mono text-[10px] font-medium text-muted-foreground sm:inline-block",
                )}
              >
                ⌘S
              </kbd>
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
                Save changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Discard confirmation dialog                                        */
/* ------------------------------------------------------------------ */

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
