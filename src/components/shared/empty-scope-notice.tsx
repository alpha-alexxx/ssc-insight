"use client";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { useExamScope } from "@/components/exam-context";

/**
 * First-run prompt for an account with no exam tier enabled.
 *
 * `DEFAULT_SETTINGS.enabledTiers` is empty, and every view is scoped to the
 * active tier, so a new signup would otherwise see zeros, empty charts and an
 * empty plan with no way forward. The old workspace shell rendered this on every
 * view except Settings and Trash; deleting the shell dropped it, so it is
 * restored here and mounted once by the layout.
 */
export function EmptyScopeNotice() {
  const router = useRouter();
  return (
    <section className="mx-auto my-6 max-w-2xl rounded-2xl bg-card px-6 py-8 text-center shadow-[inset_0_0_0_1px_var(--border)] sm:px-8">
      <span
        className="mx-auto mb-4 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon name="compass" size={20} tone="primary" />
      </span>
      <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
        Pick your exams to start
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Enable the tiers you are preparing for — Tier 1, Tier 2, or both of an
        exam — and the workspace scopes every chart, list, and form to them.
      </p>
      <div className="mt-5 flex justify-center">
        <Button
          onClick={() => router.push("/settings")}
          icon={<Icon name="settings" size={15} tone="current" />}
        >
          Choose exams
        </Button>
      </div>
    </section>
  );
}

/**
 * Renders its children only when the account has at least one enabled tier.
 * Settings and Trash stay reachable without a scope: one is how you fix it, the
 * other is account-level recovery.
 */
export function ScopeGate({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  const scope = useExamScope();
  const noScope = scope.exams != null && scope.exams.enabledTiers.length === 0;
  if (noScope && pathname !== "/settings" && pathname !== "/trash") {
    return <EmptyScopeNotice />;
  }
  return <>{children}</>;
}
