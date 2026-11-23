import type { ReactNode } from "react";
import { PlainIcon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";
import { MOCK_LABEL } from "./data-parts";

/**
 * The signed-in workspace, drawn at mockup scale.
 *
 * This is the shell every product mockup sits inside: a paper sidebar
 * collapsing to a header-only layout in narrow frames, the sticky header
 * strip, and a content column on the canvas with a page head. It mirrors
 * `app-shell.tsx` / `page-header.tsx` closely enough to be recognisable, but
 * it is static and hook-free — no sidebar state, no routing, no session.
 */

const NAV: { label: string; icon: IconName }[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Study calendar", icon: "calendar" },
  { label: "Today's plan", icon: "layers" },
  { label: "My tasks", icon: "check" },
];

const RESULTS: { label: string; icon: IconName }[] = [
  { label: "Mock history", icon: "history" },
  { label: "Compare mocks", icon: "compare" },
];

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: IconName;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-[0.55em] rounded-full px-[0.6em] py-[0.42em] text-[0.9em]",
        active
          ? "bg-primary font-medium text-primary-foreground"
          : "text-muted-foreground",
      )}
    >
      <PlainIcon name={icon} size={14} tone="current" />
      <span className="truncate">{label}</span>
    </div>
  );
}

export function MockSidebar({ active }: { active: string }) {
  return (
    <aside className="hidden w-[9.5em] shrink-0 flex-col border-r border-border bg-card px-[0.7em] py-[0.9em] @[600px]:flex">
      <div className="px-[0.6em] pb-[0.9em]">
        <p className="font-serif text-[1.25em] leading-none tracking-[-0.02em] text-foreground">
          ssc<span className="text-primary">insight</span>
          <span className="text-primary">.</span>
        </p>
        <p className={cn(MOCK_LABEL, "mt-1 text-[0.72em]")}>Mock workspace</p>
      </div>
      <p className={cn(MOCK_LABEL, "px-[0.6em] pb-[0.35em]")}>Study planner</p>
      <div className="flex flex-col gap-[0.1em]">
        {NAV.map((item) => (
          <NavItem key={item.label} {...item} active={item.label === active} />
        ))}
      </div>
      <p className={cn(MOCK_LABEL, "mt-[0.9em] px-[0.6em] pb-[0.35em]")}>Results</p>
      <div className="flex flex-col gap-[0.1em]">
        {RESULTS.map((item) => (
          <NavItem key={item.label} {...item} active={item.label === active} />
        ))}
      </div>
      <div className="mt-[0.9em] rounded-full bg-primary px-[0.6em] py-[0.45em] text-center text-[0.85em] font-medium text-primary-foreground">
        + Log a mock
      </div>
      <div className="mt-auto pt-[1em]">
        <div className="flex items-center gap-[0.5em] px-[0.6em] text-[0.82em] text-muted-foreground">
          <span className="flex size-[1.4em] items-center justify-center rounded-full bg-primary/10 text-[0.72em] font-semibold text-primary">
            LD
          </span>
          <span className="truncate">Local Developer</span>
        </div>
        <p className={cn(MOCK_LABEL, "mt-[0.5em] px-[0.6em] text-[0.68em]")}>
          SSC CGL Tier 2 · dates in IST
        </p>
      </div>
    </aside>
  );
}

export function MockTopBar({
  view,
  actions,
}: {
  view: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex h-[2.8em] items-center gap-[0.8em] border-b border-border bg-card px-[1em]">
      <div className="flex min-w-0 items-center gap-[0.45em]">
        <span aria-hidden="true" className="flex w-[1em] flex-col gap-[2px]">
          <span className="h-px bg-foreground" />
          <span className="h-px bg-foreground" />
          <span className="h-px bg-foreground" />
        </span>
        <span className={cn(MOCK_LABEL, "truncate")}>Workspace</span>
        <span className="text-muted-foreground">›</span>
        <span className="truncate text-[0.9em] font-medium text-foreground">{view}</span>
      </div>
      <div className="ml-auto flex items-center gap-[0.6em]">
        <span className="hidden items-center gap-[0.35em] rounded-full px-[0.5em] py-[0.2em] text-[0.8em] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] @[520px]:flex">
          Search…
          <span className="rounded-[2px] px-[0.25em] shadow-[inset_0_0_0_1px_var(--border)] text-[0.85em]">
            ⌘K
          </span>
        </span>
        <span className="hidden text-[0.82em] text-muted-foreground @[420px]:inline">Ask coach</span>
        {actions}
        <span className="flex size-[1.35em] items-center justify-center rounded-full bg-primary/10 text-[0.68em] font-semibold text-primary">
          LD
        </span>
      </div>
    </div>
  );
}

/** The content head: serif title, muted subtitle, one hairline, actions. */
export function MockPageHead({
  title,
  subtitle,
  meta,
  actions,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border px-[1.1em] pb-[0.7em] pt-[1.1em]">
      <div className="flex flex-wrap items-start justify-between gap-[0.6em]">
        <div className="min-w-0">
          <h3 className="text-[1.75em] font-[450] tracking-[-0.03em] text-foreground">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-[0.2em] text-[0.85em] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-[0.4em]">{actions}</div>
        ) : null}
      </div>
      {meta ? <p className={cn(MOCK_LABEL, "mt-[0.55em]")}>{meta}</p> : null}
    </div>
  );
}

export function MockPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl bg-card shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      {title ? (
        <div className="flex items-start justify-between gap-[0.6em] px-[0.9em] pb-[0.4em] pt-[0.75em]">
          <div className="min-w-0">
            <h4 className="text-[1.1em] font-[450] text-foreground">{title}</h4>
            {description ? (
              <p className="mt-[0.15em] text-[0.78em] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0 text-[0.8em]">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("px-[0.9em] pb-[0.9em]", !title && "pt-[0.9em]", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * The full frame: sidebar + top bar + a content column. `children` render
 * inside the canvas area, below whatever page head the screen provides.
 */
export function WorkspaceFrame({
  view,
  active,
  children,
  actions,
}: {
  view: string;
  /** The sidebar row to highlight. */
  active: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="@container flex min-h-[22em] bg-background">
      <MockSidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopBar view={view} actions={actions} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
