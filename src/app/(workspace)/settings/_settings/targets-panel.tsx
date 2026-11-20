"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Reveal, RevealItem } from "./_lib/motion-presets";
import { targetsSchema } from "@/components/shared/settings-schema";
import { Panel } from "@/components/dashboard-panels";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsCaption,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/toast";
import { useExamScope } from "@/components/exam-context";
import {
  examsKeys,
  patchTargetsRequest,
  type EffectiveTargetDto,
  type ExamsResponse,
  type TargetEditInput,
} from "@/lib/queries/exams";
import { formatNumber as n } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { usePanelDraft } from "@/components/shared/settings-guard";

/**
 * Targets — three INDEPENDENT systems, kept visibly distinct:
 *
 *  1. A percentile goal per exam. Never computed, never converted from marks,
 *     never a selection probability.
 *  2. A marks target per tier, which may be inherited from a structure
 *     default (shared only with tiers of the identical paper).
 *  3. Per-tier overrides, which reset back to the inherited default.
 *
 * Every field is the tier's own maximum, delivered by the server with the
 * resolved target — so the editor can never disagree with the chart. All
 * editable rows live in one react-hook-form form: the sticky save bar
 * batches every dirty row into one PATCH, while each row keeps an
 * instant single-row save and the inherit/clear actions.
 */
export function TargetsPanel({
  saveTarget,
  busy,
}: {
  saveTarget: () => Promise<boolean>;
  busy: boolean;
}) {
  const scope = useExamScope();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("tiers");

  const exams = scope.exams;
  const enabledTierKeys = useMemo(() => exams?.enabledTiers ?? [], [exams]);

  // Each field's ceiling comes from the server-resolved target, so the
  // schema can never accept a value above its own paper.
  const maxima = useMemo(() => {
    const map: Record<string, number> = {};
    if (!exams) return map;
    for (const [key, target] of Object.entries(exams.resolvedTargets)) {
      map[`tier:${key}`] = target.maxScore;
    }
    for (const [signature, peers] of Object.entries(exams.targetPeers)) {
      const target = peers
        .map((key) => exams.resolvedTargets[key])
        .find(Boolean);
      if (target) map[`default:${signature}`] = target.maxScore;
    }
    return map;
  }, [exams]);

  const values = useMemo<Record<string, string>>(() => {
    if (!exams) return {};
    const map: Record<string, string> = {};
    for (const key of exams.enabledTiers) {
      const target = exams.resolvedTargets[key];
      if (target) map[`tier:${key}`] = target.marks == null ? "" : String(target.marks);
    }
    for (const [signature, peers] of Object.entries(exams.targetPeers)) {
      const target = peers
        .map((key) => exams.resolvedTargets[key])
        .find(Boolean);
      if (target) {
        map[`default:${signature}`] =
          target.marks == null ? "" : String(target.marks);
      }
    }
    for (const exam of [...exams.builtIn, ...exams.customExams]) {
      const percentile = exams.percentiles[exam.id];
      map[`pct:${exam.id}`] = percentile == null ? "" : String(percentile);
    }
    return map;
  }, [exams]);

  const schema = useMemo(() => targetsSchema(maxima), [maxima]);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues: values,
    values,
    mode: "onChange",
  });
  const { control, handleSubmit, formState } = form;

  const resetDraft = useCallback(() => form.reset(), [form]);

  const commit = useCallback(
    async (edits: TargetEditInput[], message: string) => {
      setPending(true);
      setError("");
      try {
        const fresh = await patchTargetsRequest(edits);
        queryClient.setQueryData<ExamsResponse>(examsKeys.current(), fresh);
        // The dashboard draws the target, so its payload is now stale.
        await queryClient.invalidateQueries({ queryKey: ["analytics"] });
        toast.success(message);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the target");
      } finally {
        setPending(false);
      }
    },
    [queryClient, toast],
  );

  /** One row's instant save (the row's own button). */
  const commitField = useCallback(
    (field: string, build: (value: string) => TargetEditInput, message: string) => {
      void form
        .trigger(field)
        .then((valid) => {
          if (!valid) return;
          void commit([build(form.getValues(field) ?? "")], message);
        });
    },
    [commit, form],
  );

  /** The sticky bar's save: every dirty row becomes one edit, batched. */
  const save = useCallback(() => {
    void handleSubmit((allValues) => {
      const edits: TargetEditInput[] = [];
      for (const [field, dirty] of Object.entries(formState.dirtyFields)) {
        if (!dirty) continue;
        const value = allValues[field] ?? "";
        if (field.startsWith("tier:")) {
          edits.push({
            kind: "override",
            tierKey: field.slice(5),
            marks: value.trim() === "" ? null : Number(value),
          });
        } else if (field.startsWith("default:")) {
          edits.push({
            kind: "default",
            signature: field.slice(8),
            marks: value.trim() === "" ? null : Number(value),
          });
        } else if (field.startsWith("pct:")) {
          edits.push({
            kind: "percentile",
            examId: field.slice(4),
            percentile: value.trim() === "" ? null : Number(value),
          });
        }
      }
      if (edits.length > 0) void commit(edits, "Targets saved");
    })();
  }, [commit, formState.dirtyFields, handleSubmit]);

  usePanelDraft("targets", {
    isDirty: formState.isDirty,
    reset: resetDraft,
    save,
  });

  if (!exams) {
    return (
      <Panel dense icon="target" title="Targets" description="Loading…">
        <div className="px-4 pb-4">
          <div className="h-24 animate-pulse rounded-control bg-soft" />
        </div>
      </Panel>
    );
  }

  const activeExam = exams.builtIn.find((e) => e.id === exams.activeExamId);
  const activeCustom = exams.customExams.find(
    (e) => e.id === exams.activeExamId,
  );

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={setTab}>
        <Panel
          dense
          icon="target"
          title="Targets"
          description="A percentile goal per exam, and a marks target per tier."
        >
          <div className="px-4 pb-4">
            <TabsList aria-label="Target type">
              <TabsTrigger value="tiers">Per tier</TabsTrigger>
              <TabsTrigger value="defaults">Structure defaults</TabsTrigger>
              <TabsTrigger value="percentile">Percentile goal</TabsTrigger>
            </TabsList>

            {/* ---- per-tier marks ---- */}
            <TabsContent value="tiers">
              <TabsCaption>
                Each tier has its own maximum. A tier shows where its number
                came from, and can be reset to the shared default.
              </TabsCaption>
              {enabledTierKeys.length === 0 ? (
                <p className="mt-3 rounded-control bg-soft p-3 text-xs text-muted">
                  No tiers are enabled yet. Enable one under Exams &amp; tiers to
                  set a target.
                </p>
              ) : (
                <Reveal>
                  <ul className="mt-3 divide-y divide-rule-soft">
                    {enabledTierKeys.map((key) => {
                      const target = exams.resolvedTargets[key];
                      if (!target) return null;
                      const field = `tier:${key}`;
                      return (
                        <RevealItem key={key}>
                          <Controller
                            control={control}
                            name={field}
                            render={({ field: bound, fieldState }) => (
                              <TierTargetRow
                                target={target}
                                label={tierLabel(exams, key)}
                                value={bound.value}
                                pending={pending || busy}
                                invalid={!!fieldState.error}
                                error={fieldState.error?.message}
                                onChange={bound.onChange}
                                onSave={() =>
                                  commitField(
                                    field,
                                    (value) => ({
                                      kind: "override",
                                      tierKey: key,
                                      marks:
                                        value.trim() === ""
                                          ? null
                                          : Number(value),
                                    }),
                                    "Target saved",
                                  )
                                }
                                onInherit={() =>
                                  void commit(
                                    [{ kind: "inherit", tierKey: key }],
                                    "Target reset to the structure default",
                                  )
                                }
                              />
                            )}
                          />
                        </RevealItem>
                      );
                    })}
                  </ul>
                </Reveal>
              )}
            </TabsContent>

            {/* ---- structure defaults ---- */}
            <TabsContent value="defaults">
              <TabsCaption>
                A default applies to every tier with the identical paper
                (same subjects, counts and marking). It can never cross a
                different maximum.
              </TabsCaption>
              <Reveal>
                <ul className="mt-3 divide-y divide-rule-soft">
                  {Object.entries(exams.targetPeers).map(
                    ([signature, peers]) => {
                      const field = `default:${signature}`;
                      return (
                        <RevealItem key={signature}>
                          <Controller
                            control={control}
                            name={field}
                            render={({ field: bound, fieldState }) => (
                              <DefaultRow
                                signature={signature}
                                peers={peers}
                                target={targetForSignature(exams, peers)}
                                labelFor={(key) => tierLabel(exams, key)}
                                value={bound.value}
                                pending={pending || busy}
                                invalid={!!fieldState.error}
                                error={fieldState.error?.message}
                                onChange={bound.onChange}
                                onSave={() =>
                                  commitField(
                                    field,
                                    (value) => ({
                                      kind: "default",
                                      signature,
                                      marks:
                                        value.trim() === ""
                                          ? null
                                          : Number(value),
                                    }),
                                    "Default saved",
                                  )
                                }
                                onClear={() =>
                                  void commit(
                                    [{ kind: "default", signature, marks: null }],
                                    "Default removed",
                                  )
                                }
                              />
                            )}
                          />
                        </RevealItem>
                      );
                    },
                  )}
                </ul>
              </Reveal>
            </TabsContent>

            {/* ---- percentile goal ---- */}
            <TabsContent value="percentile">
              <PercentileExplainer />
              <Reveal>
                <ul className="mt-3 divide-y divide-rule-soft">
                  {[
                    ...exams.builtIn.map((e) => ({
                      id: e.id,
                      name: e.name,
                      enabled: exams.enabledTiers.some((k) =>
                        k.startsWith(`${e.id}:`),
                      ),
                    })),
                    ...exams.customExams.map((e) => ({
                      id: e.id,
                      name: e.name,
                      enabled: exams.enabledTiers.some((k) =>
                        k.startsWith(`${e.id}:`),
                      ),
                    })),
                  ].map((exam) => {
                    const field = `pct:${exam.id}`;
                    return (
                      <RevealItem key={exam.id}>
                        <Controller
                          control={control}
                          name={field}
                          render={({ field: bound, fieldState }) => (
                            <PercentileRow
                              name={exam.name}
                              enabled={exam.enabled}
                              value={bound.value}
                              pending={pending || busy}
                              invalid={!!fieldState.error}
                              error={fieldState.error?.message}
                              onChange={bound.onChange}
                              onSave={() =>
                                commitField(
                                  field,
                                  (value) => ({
                                    kind: "percentile",
                                    examId: exam.id,
                                    percentile:
                                      value.trim() === ""
                                        ? null
                                        : Number(value),
                                  }),
                                  "Percentile goal saved",
                                )
                              }
                            />
                          )}
                        />
                      </RevealItem>
                    );
                  })}
                </ul>
              </Reveal>
            </TabsContent>

            {error && (
              <p role="alert" className="mt-3 text-[11px] text-danger">
                {error}
              </p>
            )}
          </div>
        </Panel>
      </Tabs>

      {/* The quick single-field editor the dashboard's target action uses.
          Kept so the header/dashboard "Set target" affordance still exists. */}
      <ActiveTargetCard
        examName={activeExam?.name ?? activeCustom?.name ?? "this exam"}
        target={scope.activeTarget}
        onSave={saveTarget}
        busy={busy}
      />
    </div>
  );
}

function tierLabel(exams: ExamsResponse, key: string): string {
  const sep = key.indexOf(":");
  const examId = key.slice(0, sep);
  const tierId = key.slice(sep + 1);
  const name =
    exams.builtIn.find((e) => e.id === examId)?.name ??
    exams.customExams.find((e) => e.id === examId)?.name ??
    examId;
  const label =
    exams.builtIn
      .find((e) => e.id === examId)
      ?.tiers.find((t) => t.id === tierId)?.label ??
    exams.customExams
      .find((e) => e.id === examId)
      ?.tiers.find((t) => t.id === tierId)?.label ??
    tierId;
  return `${name} · ${label}`;
}

/** The shared structure a set of peer tiers describes. */
function targetForSignature(
  exams: ExamsResponse,
  peers: string[],
): EffectiveTargetDto | null {
  return peers.map((key) => exams.resolvedTargets[key]).find(Boolean) ?? null;
}

function sourceLabel(target: EffectiveTargetDto): string {
  if (target.source === "override") return "Your target";
  if (target.source === "tier-default") return "Inherited default";
  return "No target";
}

function TierTargetRow({
  target,
  label,
  value,
  pending,
  invalid,
  error,
  onChange,
  onSave,
  onInherit,
}: {
  target: EffectiveTargetDto;
  label: string;
  value: string;
  pending: boolean;
  invalid?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onInherit: () => void;
}) {
  return (
    <li className="py-3 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-[0.6875rem] text-muted">
          <span
            className={cn(
              target.source === "override" && "text-ink",
              target.source === "none" && "text-muted",
            )}
          >
            {sourceLabel(target)}
          </span>
          {" · out of "}
          {target.maxScore}
        </p>
      </div>
      {target.outOfRange && (
        <p className="mt-1 text-[0.6875rem] leading-relaxed text-warning">
          Your saved {n(target.marks)} is above this paper&apos;s current
          maximum of {target.maxScore}. The paper changed after you set it —
          adjust it or reset to the default.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-[0.6875rem] text-muted">
          Target marks
          <Input
            type="number"
            inputMode="decimal"
            className="no-spin mt-0.5 block w-32"
            min={0}
            max={target.maxScore}
            step="0.01"
            placeholder={`up to ${target.maxScore}`}
            value={value}
            disabled={pending}
            aria-invalid={invalid || undefined}
            aria-label={`Target marks for ${label}`}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <Button
          size="sm"
          variant="outline"
          className="h-9"
          disabled={pending || invalid}
          onClick={onSave}
        >
          Save
        </Button>
        {target.source !== "none" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9"
            disabled={pending}
            onClick={onInherit}
            title="Remove this tier's own target and use the structure default"
          >
            <PlainIcon name="refresh" size={13} /> Use default
          </Button>
        )}
        {invalid && error && (
          <p role="alert" className="text-[0.6875rem] text-danger">
            {error}
          </p>
        )}
      </div>
      {target.marks != null && target.maxScore > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Progress
            value={(target.marks / target.maxScore) * 100}
            label={`${label} target`}
            className="max-w-56"
          />
          <span className="text-[0.6875rem] tabular text-muted">
            {n((target.marks / target.maxScore) * 100)}% of the paper
          </span>
        </div>
      )}
    </li>
  );
}

function DefaultRow({
  signature,
  peers,
  target,
  labelFor,
  value,
  pending,
  invalid,
  error,
  onChange,
  onSave,
  onClear,
}: {
  signature: string;
  peers: string[];
  target: EffectiveTargetDto | null;
  labelFor: (key: string) => string;
  value: string;
  pending: boolean;
  invalid?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
}) {
  const maxScore = target?.maxScore ?? 0;
  return (
    <li className="py-3 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-ink">
          {describeSignature(signature)}
        </p>
        <p className="text-[0.6875rem] text-muted">
          Applies to {peers.length} tier{peers.length === 1 ? "" : "s"} · out of{" "}
          {maxScore}
        </p>
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-muted">
        {peers.map((key) => (
          <li key={key}>{labelFor(key)}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-[0.6875rem] text-muted">
          Default target marks
          <Input
            type="number"
            inputMode="decimal"
            className="no-spin mt-0.5 block w-32"
            min={0}
            max={maxScore}
            step="0.01"
            placeholder={`up to ${maxScore}`}
            value={value}
            disabled={pending}
            aria-invalid={invalid || undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <Button
          size="sm"
          variant="outline"
          className="h-9"
          disabled={pending || invalid}
          onClick={onSave}
        >
          Save default
        </Button>
        {target?.source === "tier-default" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9"
            disabled={pending}
            onClick={onClear}
          >
            Remove default
          </Button>
        )}
        {invalid && error && (
          <p role="alert" className="text-[0.6875rem] text-danger">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

/** "4 parts · 25 Q each · +2/−0.5" from the signature's own encoding. */
function describeSignature(signature: string): string {
  const merit = signature.match(/m:([^|]*)/)?.[1] ?? "";
  const marking = signature.match(/mk:([^|]*)/)?.[1] ?? "";
  const parts = merit ? merit.split(",").length : 0;
  const questions = merit
    ? merit
        .split(",")
        .reduce(
          (sum, entry) => sum + Number(entry.replace(/^[a-z]+/, "") || 0),
          0,
        )
    : 0;
  const [correct, incorrect] = marking.split("/");
  return `${parts} parts · ${questions} Q · +${correct}/${incorrect === "0" ? "no negative" : `−${incorrect}`}`;
}

function PercentileRow({
  name,
  enabled,
  value,
  pending,
  invalid,
  error,
  onChange,
  onSave,
}: {
  name: string;
  enabled: boolean;
  value: string;
  pending: boolean;
  invalid?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  const numeric = value.trim() === "" ? 0 : Number(value);
  return (
    <li className="py-3 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-ink">
          {name}
          {!enabled && (
            <span className="ml-2 text-[0.625rem] uppercase tracking-wide text-muted">
              not enabled
            </span>
          )}
        </p>
        <p className="text-[0.6875rem] text-muted">Goal percentile</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Slider
          value={[Math.min(100, Math.max(0, Number.isFinite(numeric) ? numeric : 0))]}
          min={0}
          max={100}
          step={1}
          disabled={pending}
          aria-label={`${name} goal percentile`}
          onValueChange={([next]) => onChange(String(next))}
          className="max-w-56"
        />
        <Input
          type="number"
          inputMode="numeric"
          className="no-spin block w-20"
          min={0}
          max={100}
          step="1"
          placeholder="e.g. 95"
          value={value}
          disabled={pending}
          aria-invalid={invalid || undefined}
          aria-label={`${name} goal percentile value`}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={pending || invalid}
          onClick={onSave}
        >
          Save
        </Button>
        {invalid && error && (
          <p role="alert" className="text-[0.6875rem] text-danger">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

function PercentileExplainer() {
  return (
    <div className="mt-3 rounded-control border border-rule-soft bg-canvas p-3">
      <p className="text-[0.6875rem] font-medium text-ink">
        A percentile goal is not any of these
      </p>
      <ul className="mt-1 grid gap-0.5 text-[0.6875rem] leading-relaxed text-muted sm:grid-cols-2">
        <li>Not a percentage of a paper.</li>
        <li>Not a raw-marks equivalent.</li>
        <li>Not a normalized score.</li>
        <li>Not an official cutoff or a chance of selection.</li>
      </ul>
      <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-muted">
        The app never estimates a percentile for you — it only records what a
        platform or result sheet reported.
      </p>
    </div>
  );
}

/** The single target the dashboard's action writes, for the active tier. */
function ActiveTargetCard({
  examName,
  target,
  onSave,
  busy,
}: {
  examName: string;
  target: EffectiveTargetDto | null;
  onSave: () => Promise<boolean>;
  busy: boolean;
}) {
  const [saving, setSaving] = useState(false);
  if (!target) return null;
  const percent =
    target.marks == null || target.maxScore === 0
      ? null
      : (target.marks / target.maxScore) * 100;
  return (
    <Panel
      dense
      icon="award"
      title="Today's reference"
      description={`${examName} · ${target.source === "none" ? "no target set" : sourceLabel(target)}`}
    >
      <div className="px-4 pb-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-serif text-[1.75rem] leading-none tabular">
            {target.marks == null ? "—" : n(target.marks)}
          </span>
          <span className="text-xs text-muted">/ {target.maxScore}</span>
          {percent != null && (
            <span className="text-xs tabular text-muted">
              · {n(percent)}% of the paper
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.6875rem] text-muted">
          The dashboard draws this as a reference line on the charts for this tier.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          disabled={busy || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave();
            } finally {
              setSaving(false);
            }
          }}
        >
          <PlainIcon name="target" size={13} /> Set from dashboard value
        </Button>
      </div>
    </Panel>
  );
}

export { PercentileExplainer, targetForSignature, tierLabel };
