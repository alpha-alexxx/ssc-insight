"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Reveal,
  RevealItem,
  switchBounce,
} from "./_lib/motion-presets";
import { PanelCard } from "./_lib/panel";
import { remindersSchema, type ReminderValues } from "@/components/shared/settings-schema";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Switch } from "@/components/switch";
import { toast } from "@/components/toast-stack";
import { useExamScope } from "@/components/exam-context";
import {
  examsKeys,
  putScopeRequest,
  type ExamsResponse,
  type PreferencesDto,
} from "@/lib/queries/exams";
import { usePanelDraft } from "@/components/shared/settings-guard";

/**
 * Reminders — IN-APP ONLY.
 *
 * This app has no service worker, no push subscription, no email and no
 * background job, so it cannot deliver a notification while it is closed.
 * Saying so plainly is more useful than a toggle that looks like a reminder
 * and silently never fires. Each switch below drives an on-screen signal:
 * overdue emphasis in the shell, a mock-due note on the plan surfaces, and a
 * gap-to-target note on performance views. Quiet hours suppress transient
 * toasts while you are still working.
 *
 * The preferences are one react-hook-form draft synced from the query
 * cache; the sticky save bar owns save/discard.
 */

const EMPTY_PREFERENCES: ReminderValues = {
  overdueEmphasis: false,
  mockDueToday: false,
  targetGap: false,
  quietHours: { enabled: false, start: "22:00", end: "07:00" },
};

export function RemindersPanel() {
  const scope = useExamScope();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const saved = scope.exams?.preferences;
  const values = useMemo<ReminderValues>(
    () =>
      saved
        ? {
            overdueEmphasis: saved.overdueEmphasis,
            mockDueToday: saved.mockDueToday,
            targetGap: saved.targetGap,
            quietHours: {
              enabled: saved.quietHours.enabled,
              start: saved.quietHours.start,
              end: saved.quietHours.end,
            },
          }
        : EMPTY_PREFERENCES,
    [saved],
  );

  const form = useForm<ReminderValues>({
    resolver: zodResolver(remindersSchema),
    defaultValues: values,
    values,
    mode: "onChange",
  });
  const { control, handleSubmit, formState, watch } = form;
  const quietEnabled = watch("quietHours.enabled");

  const savePreferences = useCallback(
    async (draft: ReminderValues) => {
      if (!scope.exams) return;
      const preferences: PreferencesDto = {
        overdueEmphasis: draft.overdueEmphasis,
        mockDueToday: draft.mockDueToday,
        targetGap: draft.targetGap,
        quietHours: {
          enabled: draft.quietHours.enabled,
          start: draft.quietHours.start,
          end: draft.quietHours.end,
        },
      };
      setPending(true);
      setError("");
      try {
        const fresh = await putScopeRequest({
          activeExamId: scope.exams.activeExamId,
          activeTierId: scope.exams.activeTierId,
          enabledTiers: scope.exams.enabledTiers,
          preferences,
        });
        queryClient.setQueryData<ExamsResponse>(examsKeys.current(), fresh);
        toast.success("Reminder preferences saved");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save preferences");
      } finally {
        setPending(false);
      }
    },
    [queryClient, scope.exams],
  );

  const save = useCallback(() => handleSubmit(savePreferences)(), [
    handleSubmit,
    savePreferences,
  ]);
  const reset = useCallback(() => form.reset(), [form]);
  usePanelDraft("reminders", {
    isDirty: formState.isDirty,
    reset,
    save,
  });

  if (!scope.exams || !saved) {
    return (
      <PanelCard icon="bell" title="Reminders" description="Loading…">
        <div className="h-32 animate-pulse rounded-[14px] bg-muted" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      icon="bell"
      title="Reminders"
      description="What the workspace surfaces while you are working in it."
    >
      <Reveal>
        <div className="rounded-[14px] border border-border bg-muted p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              These are in-app signals, not notifications.
            </p>
            <Badge tone="neutral">In-app only · no email</Badge>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            SSC Insight runs entirely in your browser session. It cannot send a
            push notification, an email, or a reminder while it is closed —
            there is no background delivery of any kind. Everything below
            changes what you see on screen while the app is open.
          </p>
        </div>

        <div className="mt-2">
          <RevealItem>
            <ReminderRow
              title="Emphasise overdue tasks"
              description="Marks overdue personal tasks in warning ink in the shell, the dashboard and the plan day."
              control={
                <Controller
                  control={control}
                  name="overdueEmphasis"
                  render={({ field }) => (
                    <BouncingSwitch
                      checked={field.value}
                      disabled={pending}
                      label="Emphasise overdue tasks"
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              }
            />
          </RevealItem>
          <RevealItem>
            <ReminderRow
              title="Show a mock scheduled today"
              description="A quiet note on the plan surfaces naming the mock the schedule expects today."
              control={
                <Controller
                  control={control}
                  name="mockDueToday"
                  render={({ field }) => (
                    <BouncingSwitch
                      checked={field.value}
                      disabled={pending}
                      label="Show a mock scheduled today"
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              }
            />
          </RevealItem>
          <RevealItem>
            <ReminderRow
              title="Keep the gap to target visible"
              description="A one-line gap between your latest result and the target on performance views."
              control={
                <Controller
                  control={control}
                  name="targetGap"
                  render={({ field }) => (
                    <BouncingSwitch
                      checked={field.value}
                      disabled={pending}
                      label="Keep the gap to target visible"
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              }
            />
          </RevealItem>
          <RevealItem>
            <ReminderRow
              title="Quiet hours"
              description="Suppress transient toasts during a window, so a late session is not interrupted by confirmations."
              control={
                <Controller
                  control={control}
                  name="quietHours.enabled"
                  render={({ field }) => (
                    <BouncingSwitch
                      checked={field.value}
                      disabled={pending}
                      label="Quiet hours"
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              }
            />
          </RevealItem>
        </div>

        {quietEnabled && (
          <RevealItem className="mt-2 flex flex-wrap items-end gap-3">
            <Controller
              control={control}
              name="quietHours.start"
              render={({ field }) => (
                <Input
                  type="time"
                  className="max-w-28"
                  label="From"
                  disabled={pending}
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="quietHours.end"
              render={({ field }) => (
                <Input
                  type="time"
                  className="max-w-28"
                  label="Until"
                  disabled={pending}
                  {...field}
                />
              )}
            />
            <p className="text-[13px] text-muted-foreground">
              All times are India Standard Time.
            </p>
          </RevealItem>
        )}

        {formState.errors.quietHours && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {formState.errors.quietHours.start?.message ??
              formState.errors.quietHours.end?.message ??
              "Check the quiet-hours window."}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        )}
      </Reveal>
    </PanelCard>
  );
}

/** One settings row: the explanation on the left, the control on the right. */
function ReminderRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium leading-5 text-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      {control}
    </div>
  );
}

/** The spec's switch micro-interaction: a subtle spring bounce on change. */
function BouncingSwitch({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...(reduce
        ? {}
        : {
            animate: { scale: checked ? 1.06 : 1 },
            transition: switchBounce,
          })}
      className="inline-flex shrink-0"
    >
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onCheckedChange={onCheckedChange}
      />
    </motion.div>
  );
}
