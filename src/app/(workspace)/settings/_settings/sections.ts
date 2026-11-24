import type { IconName } from "@/components/icon";

/**
 * The settings section registry — the one list of sections, their labels and
 * their icons.
 *
 * It lives in its own module, free of any "use client" boundary, because two
 * sides of the same render need it:
 *
 * - the Server Component page validates `?section=` against it before the
 *   first paint, so the server and the client agree on the active tab;
 * - the client view renders the rail from it.
 *
 * Reading the query string in the view's own `useState` initializer (the old
 * `initialSection()`) is a server/client branch: the server has no query
 * string, so it rendered "exams" and the client immediately hydrated
 * "security", which React reports as a hydration mismatch. Validating here and
 * passing the result down as a prop keeps one source of truth.
 */

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

export const SETTINGS_SECTION_IDS = new Set<string>(
  SETTINGS_SECTIONS.map((s) => s.id),
);

export const SECTION_GROUPS: {
  title: string;
  items: readonly SettingsSection[];
}[] = [
  { title: "Study & Prep", items: ["exams", "targets", "reminders"] },
  { title: "Workspace", items: ["appearance", "ai"] },
  { title: "Account & System", items: ["security", "data", "about"] },
];

/** The default section, and the one that leaves `?section=` out of the URL. */
export const DEFAULT_SETTINGS_SECTION: SettingsSection = "exams";

/** Narrow an untrusted query-string value. */
export function isSettingsSection(
  value: string | null | undefined,
): value is SettingsSection {
  return value != null && SETTINGS_SECTION_IDS.has(value);
}

/** A `?section=` value, or the default. Safe on the server. */
export function resolveSettingsSection(
  value: string | string[] | null | undefined,
): SettingsSection {
  const single = Array.isArray(value) ? value[0] : value;
  return isSettingsSection(single) ? single : DEFAULT_SETTINGS_SECTION;
}
