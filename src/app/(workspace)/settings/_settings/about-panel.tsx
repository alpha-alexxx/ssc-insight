"use client";

import { PanelCard } from "./_lib/panel";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { useExamScope } from "@/components/exam-context";
import { CATALOG_VERSION } from "@/lib/exams";

/**
 * About & account — describes the workspace from the ACTIVE catalog entry
 * rather than from hardcoded copy. The previous version told a CPO user their
 * workspace was "SSC CGL Tier 2, 390 marks, +3 and −1", which was simply
 * false. Everything here is read from the exam the user is actually on, with
 * the notice it came from.
 */
export function AboutPanel({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const scope = useExamScope();
  const exams = scope.exams;
  const exam = exams?.builtIn.find((e) => e.id === scope.activeExamId);
  const custom = exams?.customExams.find((e) => e.id === scope.activeExamId);
  const tierId =
    scope.activeTierId === "all"
      ? (exam?.defaultTierId ?? exam?.primaryTierId ?? scope.activeTierId)
      : scope.activeTierId;
  const tier =
    exam?.tiers.find((t) => t.id === tierId) ??
    custom?.tiers.find((t) => t.id === tierId);
  // Built-in and custom tiers carry slightly different fields; read only the
  // ones both share, and treat the optional descriptors as absent for custom
  // exams (which never declare a label or a duration).
  const subjectLabel = (entry: {
    subjectId: string;
    label?: string;
  }): string => entry.label ?? entry.subjectId;
  const merit = tier?.subjects.filter((s) => !s.qualifying) ?? [];
  const qualifying = tier?.subjects.filter((s) => s.qualifying) ?? [];
  const maxScore = tier
    ? merit.reduce((sum, s) => sum + s.questions, 0) * tier.marking.correct
    : null;
  const duration = (tier as { durationMinutes?: number } | undefined)
    ?.durationMinutes;

  return (
    <div className="flex flex-col gap-4">
      <PanelCard icon="user" title="Account" description="Your private workspace.">
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-muted p-3">
          <Avatar
            aria-hidden="true"
            name={userName || "SSC"}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Signed in as
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {userName || "Private workspace"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail || "Account email unavailable"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Mocks, comparisons, targets and planner work are private to your
          Google account. A different Google account is a separate workspace
          — to move data, export a JSON backup here and import it there.
        </p>
      </PanelCard>

      <PanelCard
        icon="book"
        title="Your exam"
        description={
          exam
            ? `${exam.name} · ${exam.source.cycle}`
            : custom
              ? `${custom.name} · custom exam`
              : "Nothing enabled yet"
        }
      >
        <div className="text-xs leading-relaxed text-muted-foreground">
          {tier ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em]">
                  Paper
                </dt>
                <dd className="text-foreground">{tier.label}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em]">
                  Maximum
                </dt>
                <dd className="text-foreground tabular-nums">{maxScore} marks</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em]">
                  Marking
                </dt>
                <dd className="text-foreground tabular-nums">
                  +{tier.marking.correct} correct
                  {tier.marking.incorrect
                    ? ` · −${tier.marking.incorrect} incorrect`
                    : " · no negative marking"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em]">
                  Duration
                </dt>
                <dd className="text-foreground tabular-nums">
                  {duration ? `${duration} minutes` : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.1em]">
                  Merit subjects
                </dt>
                <dd className="text-foreground">
                  {merit
                    .map(
                      (s) =>
                        `${subjectLabel(s)} ${s.questions}Q · ${s.questions * tier.marking.correct} marks`,
                    )
                    .join(" · ")}
                </dd>
              </div>
              {qualifying.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.1em]">
                    Qualifying (excluded from the merit total)
                  </dt>
                  <dd className="text-foreground">
                    {qualifying
                      .map((s) => `${subjectLabel(s)} ${s.questions}Q`)
                      .join(" · ")}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p>
              No exam tier is active. Enable one under Exams &amp; tiers to see
              its paper here.
            </p>
          )}

          {exam && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-xs leading-relaxed">
              <span>
                Pattern read from the{" "}
                <a
                  href={exam.source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline decoration-border underline-offset-2 hover:text-primary"
                >
                  official {exam.source.cycle} notice
                </a>{" "}
                on {exam.source.retrievedAt}. SSC changes its patterns between
                cycles, so a correction ships as a new catalog version rather
                than rewriting saved history.
              </span>
              <Badge tone="neutral">{`Catalog v${CATALOG_VERSION}`}</Badge>
            </p>
          )}

          {custom && (
            <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed">
              This is a custom exam you defined. Its tiers, marks and marking
              are exactly what you entered — they are not official SSC
              patterns.
            </p>
          )}
        </div>
      </PanelCard>

      <PanelCard
        icon="shield"
        title="How scoring works"
        description="Derived values are never stored."
      >
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p>
            A score is derived from the counts you enter: correct × marks per
            correct − incorrect × penalty. Accuracy is correct ÷ attempted.
            Percentage is score ÷ maximum. Skipped counts are questions minus
            attempted.
          </p>
          <p className="mt-2">
            Each saved mock keeps the marking scheme and question counts it was
            entered with, so a later catalog correction never changes a past
            result. Percentile and rank are stored only when you record them —
            the app never estimates either.
          </p>
        </div>
      </PanelCard>
    </div>
  );
}
