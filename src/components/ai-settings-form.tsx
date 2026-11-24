"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Combobox, type ComboboxOption } from "./combobox";
import { Input } from "./input";
import { PasswordInput } from "./password-input";
import { SegmentedControl } from "./segmented-control";
import { Select } from "./select";
import { api } from "@/lib/api-client";
import { toast } from "./toast-stack";
import { PlainIcon } from "./icon";
import {
  PROVIDER_PRESETS,
  providerPreset,
  type ProviderId,
} from "@/lib/ai/providers";
import {
  generationPathFor,
  type AiProtocol,
} from "@/lib/ai/protocols";
import { joinProviderUrl } from "@/lib/ai/protocols";
import { sameCredentialTarget } from "@/lib/ai/connection-target";
import type {
  AiCredentialSummary,
  AiModelsResponse,
  AiSettingsResponse,
  AiTestResponse,
} from "@/lib/ai/client-types";
import { aiSchema, type AiValues } from "@/components/shared/settings-schema";
import { usePanelDraft } from "@/components/shared/settings-guard";

type Props = {
  onChanged?: (credential: AiCredentialSummary | null) => void;
  variant?: "settings" | "panel";
  showHeading?: boolean;
};

const EMPTY_FORM: AiValues = {
  provider: "openai",
  protocol: "openai-responses",
  authMode: "bearer",
  baseUrl: "https://api.openai.com/v1",
  generationPath: "",
  model: "",
  apiKey: "",
  jsonMode: true,
  allowPrivate: false,
  thinking: "default",
  maxOutputTokens: "",
  historyTurns: "",
  visionEnabled: false,
};

type Catalog = {
  state: "idle" | "loading" | "ready" | "error";
  models: AiModelsResponse["models"];
  error?: string;
};
const EMPTY_CATALOG: Catalog = { state: "idle", models: [] };

function credentialToValues(credential: AiCredentialSummary): AiValues {
  return {
    provider: credential.provider,
    protocol: credential.protocol,
    authMode: credential.authMode,
    baseUrl: credential.baseUrl,
    generationPath: credential.generationPath ?? "",
    model: credential.model,
    apiKey: "",
    jsonMode: credential.jsonMode,
    allowPrivate: credential.allowPrivate,
    thinking: THINKING_LEVELS.includes(credential.thinking as AiValues["thinking"])
      ? (credential.thinking as AiValues["thinking"])
      : "default",
    maxOutputTokens:
      credential.maxOutputTokens != null
        ? String(credential.maxOutputTokens)
        : "",
    historyTurns:
      credential.historyTurns != null ? String(credential.historyTurns) : "",
    visionEnabled: credential.visionEnabled,
  };
}

const THINKING_LEVELS = ["default", "off", "low", "medium", "high"] as const;

const THINKING_LABELS: Record<AiValues["thinking"], string> = {
  default: "Provider default",
  off: "Off — don't ask for reasoning",
  low: "Low",
  medium: "Medium",
  high: "High — deepest, slowest",
};

const PROTOCOL_LABELS: Record<AiProtocol, string> = {
  "openai-responses": "OpenAI Responses (/responses)",
  "openai-chat": "Chat Completions (/chat/completions)",
  "openai-completions": "Legacy Completions (/completions)",
  "anthropic-messages": "Anthropic Messages (/messages)",
};

/** Shared by Settings and the narrow chat sheet. Keys remain write-only.
 * Field state is one react-hook-form draft validated by `_lib/schema.ts`;
 * the save/test/model flows are the real API calls. In Settings the sticky
 * save bar drives save; the chat sheet keeps its own button. */
export function AiSettingsForm({
  onChanged,
  variant = "settings",
  showHeading = true,
}: Props) {
  const id = useId();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState<"save" | "test" | "remove" | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [stored, setStored] = useState<AiCredentialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);
  const [testFailed, setTestFailed] = useState(false);
  const [testResult, setTestResult] = useState<AiTestResponse | null>(null);
  const [manual, setManual] = useState(false);
  const [catalog, setCatalog] = useState<Catalog>(EMPTY_CATALOG);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const catalogRequest = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  const form = useForm<AiValues>({
    resolver: zodResolver(aiSchema),
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });
  const { getValues, handleSubmit, reset, setValue, watch, formState } = form;
  const values = watch();

  const load = useCallback(() => {
    return api<AiSettingsResponse>("/api/ai/settings")
      .then((data) => {
        if (!mounted.current) return;
        setStorageAvailable(data.storageAvailable);
        setStored(data.credential);
        if (data.credential) {
          const credential = data.credential;
          reset(credentialToValues(credential));
          setManual(
            !providerPreset(credential.provider)?.models.includes(
              credential.model,
            ),
          );
        }
      })
      .catch(() => {
        if (mounted.current) setLoadFailed(true);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [reset]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
      catalogRequest.current?.abort();
    };
  }, [load]);

  // Any field change invalidates a previous verification and the
  // remove-confirmation, exactly like the pre-RHF change() did.
  useEffect(() => {
    const subscription = watch(() => {
      setTested(false);
      setTestFailed(false);
      setTestResult(null);
      setConfirmRemove(false);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const compact = variant === "panel";
  const preset = providerPreset(values.provider);
  const isLocal = Boolean(preset?.local);
  const keepingKey = Boolean(
    values.authMode !== "none" && stored && sameCredentialTarget(stored, values),
  );
  const hasCredential =
    values.authMode === "none" ||
    Boolean(values.apiKey.trim() || keepingKey);
  const connectionReady = Boolean(
    hasCredential &&
      values.baseUrl.trim() &&
      (!isLocal || values.allowPrivate),
  );
  const dirty = !stored
    ? Boolean(values.apiKey.trim() || values.model) || values.authMode === "none"
    : !sameCredentialTarget(stored, values) ||
      stored.model !== values.model.trim() ||
      stored.jsonMode !== values.jsonMode ||
      stored.allowPrivate !== values.allowPrivate ||
      stored.thinking !== values.thinking ||
      (stored.maxOutputTokens != null
        ? String(stored.maxOutputTokens)
        : "") !== values.maxOutputTokens.trim() ||
      (stored.historyTurns != null ? String(stored.historyTurns) : "") !==
        values.historyTurns.trim() ||
      stored.visionEnabled !== values.visionEnabled ||
      Boolean(values.apiKey.trim());
  const canSave =
    !busy &&
    connectionReady &&
    Boolean(values.model.trim()) &&
    dirty &&
    storageAvailable;
  const effectiveGenerationPath =
    values.generationPath.trim() || generationPathFor(values.protocol);
  const requestPreview = values.baseUrl.trim()
    ? joinProviderUrl(values.baseUrl, effectiveGenerationPath)
    : null;
  const suggestions = (preset?.models ?? []).map((model) => ({
    id: model,
    name: model,
  }));
  const models = catalog.state === "ready" ? catalog.models : suggestions;

  function patchFields(patch: Partial<AiValues>, resetCatalog = false) {
    for (const [key, value] of Object.entries(patch)) {
      setValue(key as keyof AiValues, value as AiValues[keyof AiValues]);
    }
    setError(null);
    setTested(false);
    setTestFailed(false);
    setTestResult(null);
    setConfirmRemove(false);
    if (resetCatalog) {
      catalogRequest.current?.abort();
      catalogRequest.current = null;
      setCatalog(EMPTY_CATALOG);
    }
  }

  function chooseProvider(provider: ProviderId) {
    if (provider === values.provider) return;
    const next = providerPreset(provider);
    patchFields(
      {
        provider,
        protocol: next?.protocol ?? "openai-chat",
        authMode: next?.authMode ?? "bearer",
        baseUrl: next?.baseUrl ?? "",
        generationPath: "",
        model: "",
        apiKey: "",
        allowPrivate: Boolean(next?.local),
      },
      true,
    );
    setManual(provider === "custom");
  }

  // Memoized: it sits in `save`'s dependency array, and `save` reaches the
  // settings guard's draft registration through `submitSave`. A fresh identity
  // here re-registers the draft on every render — the register/unregister
  // ping-pong that exceeds React's update depth on this panel.
  const payloadFrom = useCallback((source: AiValues) => {
    const maxOutput = source.maxOutputTokens.trim();
    const turns = source.historyTurns.trim();
    return {
      provider: source.provider,
      protocol: source.protocol,
      authMode: source.authMode,
      baseUrl: source.baseUrl.trim(),
      generationPath: source.generationPath.trim() || undefined,
      model: source.model.trim(),
      ...(source.apiKey.trim() ? { apiKey: source.apiKey.trim() } : {}),
      jsonMode: source.jsonMode,
      allowHttp: isLocal,
      allowPrivate: source.allowPrivate,
      thinking: source.thinking,
      maxOutputTokens: maxOutput === "" ? null : Number(maxOutput),
      historyTurns: turns === "" ? null : Number(turns),
      visionEnabled: source.visionEnabled,
    };
  }, [isLocal]);

  async function fetchModels() {
    catalogRequest.current?.abort();
    const controller = new AbortController();
    catalogRequest.current = controller;
    setCatalog({ state: "loading", models: [] });
    try {
      const data = await api<AiModelsResponse>("/api/ai/models", {
        method: "POST",
        body: JSON.stringify(payloadFrom(getValues())),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setCatalog({ state: "ready", models: data.models });
      setManual(false);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setCatalog({
        state: "error",
        models: [],
        error:
          cause instanceof Error
            ? cause.message
            : "Could not fetch models. Try again or enter a model ID.",
      });
    }
  }

  const save = useCallback(
    async (source: AiValues) => {
      if (!storageAvailable) return;
      setBusy("save");
      setError(null);
      try {
        const data = await api<AiCredentialSummary>("/api/ai/settings", {
          method: "PUT",
          body: JSON.stringify(payloadFrom(source)),
        });
        if (!mounted.current) return;
        setStored(data);
        setValue("apiKey", "");
        setTested(false);
        setTestFailed(false);
        setTestResult(null);
        toast.success("AI settings saved", {
          description: `${data.model} is selected.`,
        });
        onChanged?.(data);
      } catch (cause) {
        if (mounted.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not save AI settings. Try again.",
          );
      } finally {
        if (mounted.current) setBusy(null);
      }
    },
    [onChanged, payloadFrom, setValue, storageAvailable],
  );

  const submitSave = useCallback(() => handleSubmit((source) => save(source))(), [
    handleSubmit,
    save,
  ]);

  async function test() {
    setBusy("test");
    setError(null);
    setTested(false);
    setTestFailed(false);
    setTestResult(null);
    try {
      const data = await api<AiTestResponse>("/api/ai/test", {
        method: "POST",
        body: JSON.stringify(payloadFrom(getValues())),
      });
      if (!mounted.current) return;
      setTested(true);
      setTestResult(data);
    } catch (cause) {
      if (mounted.current) {
        setTestFailed(true);
        setError(
          cause instanceof Error
            ? cause.message
            : "The provider did not respond. Check the key and model.",
        );
      }
    } finally {
      if (mounted.current) setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    setError(null);
    try {
      await api("/api/ai/settings", { method: "DELETE" });
      if (!mounted.current) return;
      catalogRequest.current?.abort();
      setStored(null);
      reset(EMPTY_FORM);
      setCatalog(EMPTY_CATALOG);
      setManual(false);
      setTested(false);
      setTestFailed(false);
      setConfirmRemove(false);
      toast.info(
        "Personal AI settings removed",
        {
          description:
            "The server configuration, if available, will be used instead.",
        },
      );
      onChanged?.(null);
    } catch {
      if (mounted.current)
        setError("Could not remove your settings. Try again.");
    } finally {
      if (mounted.current) setBusy(null);
    }
  }

  const resetDraft = useCallback(() => {
    if (stored) {
      reset(credentialToValues(stored));
      setManual(
        !providerPreset(stored.provider)?.models.includes(stored.model),
      );
    } else {
      reset(EMPTY_FORM);
      setManual(false);
    }
    setError(null);
    setTested(false);
    setTestFailed(false);
    setTestResult(null);
    setConfirmRemove(false);
    catalogRequest.current?.abort();
    catalogRequest.current = null;
    setCatalog(EMPTY_CATALOG);
  }, [reset, stored]);
  usePanelDraft("ai", { isDirty: dirty, reset: resetDraft, save: submitSave });

  if (loading)
    return (
      <p className="py-6 text-sm text-muted-foreground" role="status">
        Loading AI settings…
      </p>
    );
  if (loadFailed)
    return (
      <div className="space-y-3 py-4">
        <Alert tone="danger" title="Could not load your AI settings.">
          Your saved configuration is unchanged.
        </Alert>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setLoading(true);
            setLoadFailed(false);
            void load();
          }}
        >
          Retry loading
        </Button>
      </div>
    );

  const modelOptions: ComboboxOption[] = models.map((model) => ({
    value: model.id,
    label: model.name,
    description: model.name !== model.id ? model.id : undefined,
  }));
  const currentModel =
    modelOptions.find((option) => option.value === values.model) ??
    (values.model ? { value: values.model, label: values.model } : null);

  return (
    <form
      aria-label="AI provider settings"
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        submitSave();
      }}
    >
      <div className="space-y-2">
        {showHeading && (
          <h2 className="text-base font-semibold text-foreground">AI provider</h2>
        )}
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Choose the provider and model for your coach and report assistant.
          Your personal settings take priority over the server defaults.
        </p>
        {stored && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <PlainIcon name="check" size={14} tone="success" /> Saved configuration
            </span>
            <span className="min-w-0 break-all text-muted-foreground">
              {providerPreset(stored.provider)?.label ?? stored.provider} ·{" "}
              {stored.model}
            </span>
          </div>
        )}
      </div>

      {!storageAvailable && (
        <Alert tone="warning" title="Personal key storage is unavailable on this installation.">
          You can fetch models and test a key for this session, but saving needs
          to be enabled by the person managing the app.
        </Alert>
      )}

      <div
        className={cn(
          "grid min-w-0 gap-7",
          !compact &&
            "xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-8",
        )}
      >
        <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-5">
          <legend className="mb-4 text-[15px] font-semibold text-foreground">
            Connection
          </legend>
          <div className="space-y-2">
            <Select
              id={`${id}-provider`}
              label="Provider"
              value={values.provider}
              onValueChange={(next) => chooseProvider(next as ProviderId)}
              options={PROVIDER_PRESETS.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
            {preset?.note && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {preset.note}
              </p>
            )}
          </div>

          {(preset?.protocols.length ?? 0) > 1 && (
            <div className="space-y-2">
              <Select
                id={`${id}-protocol`}
                label="API format"
                value={values.protocol}
                onValueChange={(next) =>
                  patchFields(
                    { protocol: next as AiProtocol, generationPath: "" },
                    true,
                  )
                }
                options={(preset?.protocols ?? []).map((item) => ({
                  value: item,
                  label: PROTOCOL_LABELS[item],
                }))}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {values.protocol === "openai-responses"
                  ? "Recommended for OpenAI. Newer models and native structured output."
                  : values.protocol === "openai-chat"
                    ? "The most widely compatible format."
                    : values.protocol === "openai-completions"
                      ? "Legacy prompt-only format; no structured output."
                      : "Uses the Messages API with your Anthropic key."}
              </p>
            </div>
          )}

          {values.provider === "custom" && (
            <div className="space-y-2">
              <Input
                id={`${id}-base`}
                label="API base URL"
                type="url"
                value={values.baseUrl}
                onValueChange={(baseUrl) =>
                  patchFields({ baseUrl }, true)
                }
                placeholder="https://your-provider.com/v1"
                autoComplete="off"
                spellCheck={false}
                maxLength={300}
                error={formState.errors.baseUrl?.message}
              />
              {requestPreview && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Requests will be sent to{" "}
                  <span className="break-all font-medium text-foreground">
                    {requestPreview}
                  </span>
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use the base URL without the generation path. Pasting a full
                endpoint also works — the matching suffix is moved into the
                path automatically.
              </p>
            </div>
          )}

          {values.authMode === "none" ? (
            <div className="space-y-2">
              <p className="text-[12.5px] font-medium text-foreground">API key</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This provider is used without authentication. No key is
                required or stored.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <PasswordInput
                id={`${id}-key`}
                label={keepingKey ? "Replace API key" : "API key"}
                value={values.apiKey}
                onValueChange={(apiKey) => patchFields({ apiKey }, true)}
                placeholder={
                  keepingKey
                    ? "Leave blank to keep saved key"
                    : isLocal
                      ? "Your local server key"
                      : "Paste your provider’s API key"
                }
                autoComplete="off"
                spellCheck={false}
                maxLength={400}
                hint={
                  keepingKey
                    ? `Saved key${stored?.keyHint ? ` ending ${stored.keyHint}` : ""}. Leave this blank to keep it.`
                    : "Your key is encrypted when saved and is never returned to the browser."
                }
              />
            </div>
          )}

          <details className="border-t border-border pt-3">
            <summary className="text-xs font-medium text-foreground">
              Advanced connection settings
            </summary>
            <div className="space-y-4 pt-4">
              {values.provider !== "custom" && (
                <div className="space-y-2">
                  <Input
                    id={`${id}-endpoint`}
                    label="API base URL"
                    className="text-xs"
                    value={values.baseUrl}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose Custom endpoint to use a different URL.
                  </p>
                </div>
              )}
              <Checkbox
                checked={values.jsonMode}
                onCheckedChange={(checked) =>
                  patchFields({ jsonMode: checked })
                }
                label="Request structured JSON responses"
                description="Turn this off if your provider does not support JSON mode."
              />
              {isLocal && (
                <Checkbox
                  checked={values.allowPrivate}
                    onCheckedChange={(checked) =>
                    patchFields({ allowPrivate: checked }, true)
                  }
                  label="Allow access to my local server"
                  description="It must be reachable from the app’s server."
                />
              )}
            </div>
          </details>
        </fieldset>

        <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-4">
          <legend className="mb-4 text-[15px] font-semibold text-foreground">
            Model
          </legend>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-[30ch] flex-1 text-xs leading-relaxed text-muted-foreground">
              Fetch the provider’s catalog, then choose a model. Availability
              depends on your account.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={catalog.state === "loading"}
              disabled={!connectionReady || catalog.state === "loading"}
              icon={<PlainIcon name="refresh" size={14} />}
              onClick={() => void fetchModels()}
            >
              {catalog.state === "ready" ? "Refresh models" : "Fetch models"}
            </Button>
          </div>
          {!connectionReady && (
            <p className="text-xs text-muted-foreground">
              {isLocal && !values.allowPrivate
                ? "Enable local access in advanced settings to fetch models."
                : "Enter your API key to fetch available models."}
            </p>
          )}
          <SegmentedControl
            label="Model selection method"
            size="sm"
            value={manual ? "manual" : "list"}
            onValueChange={(next) => setManual(next === "manual")}
            options={[
              { value: "list", label: "Choose from list" },
              { value: "manual", label: "Enter model ID" },
            ]}
          />

          {catalog.state === "error" && (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {catalog.error}
            </p>
          )}
          {manual ? (
            <div className="space-y-2">
              <Input
                id={`${id}-model`}
                label="Model ID"
                value={values.model}
                onValueChange={(model) => patchFields({ model })}
                placeholder={
                  preset?.models[0] ?? "Your provider’s exact model ID"
                }
                autoComplete="off"
                spellCheck={false}
                maxLength={120}
                error={formState.errors.model?.message}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use the exact ID from your provider. You can test it before
                saving.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Combobox
                label="Model"
                placeholder="Choose a model"
                searchPlaceholder="Search model name or ID"
                options={modelOptions}
                value={currentModel}
                onValueChange={(option) =>
                  patchFields({ model: option?.value ?? "" })
                }
                emptyMessage={(q) =>
                  q
                    ? "No models match your search."
                    : catalog.state === "ready"
                      ? "This provider returned no models."
                      : "Fetch a model list or enter an ID manually."
                }
              />
              <p
                role="status"
                aria-live="polite"
                className="text-xs text-muted-foreground"
              >
                {catalog.state === "loading"
                  ? "Loading models from your provider…"
                  : catalog.state === "ready"
                    ? `${catalog.models.length} models fetched`
                    : "Suggestions · availability not checked"}
              </p>
            </div>
          )}
          <p className="break-all text-xs leading-relaxed text-muted-foreground">
            {values.model ? (
              <>
                <span className="font-medium text-foreground">Selected: </span>
                {values.model}
              </>
            ) : (
              "No model selected yet."
            )}
          </p>
          {!manual &&
            catalog.state === "ready" &&
            values.model &&
            !catalog.models.some((model) => model.id === values.model) && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your selected model is not in this catalog. Keep its ID or
                choose another model.
              </p>
            )}

          <div className="space-y-4 border-t border-border pt-4">
            <legend className="sr-only">Model behavior</legend>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Model behavior
            </p>
            <div className="space-y-2">
              <Select
                id={`${id}-thinking`}
                label="Thinking effort"
                value={values.thinking}
                onValueChange={(next) =>
                  patchFields({
                    thinking: next as AiValues["thinking"],
                  })
                }
                options={THINKING_LEVELS.map((level) => ({
                  value: level,
                  label: THINKING_LABELS[level],
                }))}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Asks the model to reason before answering. What the provider
                does with this depends on the model — its own thinking is
                always shown collapsed above the answer when it streams any.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id={`${id}-max-output`}
                label="Max reply tokens"
                type="number"
                inputMode="numeric"
                className="max-w-40"
                inputClassName="appearance-none"
                min={256}
                max={32000}
                step={128}
                value={values.maxOutputTokens}
                onValueChange={(maxOutputTokens) =>
                  patchFields({ maxOutputTokens })
                }
                placeholder="Default"
                autoComplete="off"
                error={formState.errors.maxOutputTokens?.message}
                hint={
                  formState.errors.maxOutputTokens
                    ? undefined
                    : "256–32000. Reasoning counts toward this."
                }
              />
              <Input
                id={`${id}-history`}
                label="Conversation memory"
                type="number"
                inputMode="numeric"
                className="max-w-40"
                inputClassName="appearance-none"
                min={2}
                max={16}
                step={1}
                value={values.historyTurns}
                onValueChange={(historyTurns) =>
                  patchFields({ historyTurns })
                }
                placeholder="Default (8 turns)"
                autoComplete="off"
                error={formState.errors.historyTurns?.message}
                hint={
                  formState.errors.historyTurns
                    ? undefined
                    : "2–16 earlier turns sent with each question."
                }
              />
            </div>
            <Checkbox
              checked={values.visionEnabled}
              onCheckedChange={(checked) =>
                patchFields({ visionEnabled: checked })
              }
              label="Allow image input"
              description="Attach screenshots in the chat and read scorecard images in the Log tab. Images are downscaled before sending."
            />
          </div>
        </fieldset>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        {error && (
          <p role="alert" className="text-sm leading-relaxed text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {busy === "test" && (
            <Badge tone="neutral">Testing…</Badge>
          )}
          {tested && !busy && testResult?.streaming !== false && (
            <Badge tone="success">Connected</Badge>
          )}
          {testFailed && !busy && <Badge tone="danger">Failed</Badge>}
          {tested && testResult?.streaming === false && !busy && (
            <Badge tone="warning">Chat streaming unavailable</Badge>
          )}
          {tested && !busy && (
            <p role="status" className="text-xs leading-relaxed text-success">
              {dirty
                ? "Connection verified for these settings. Save to use them."
                : "Connection verified for your saved settings."}
            </p>
          )}
        </div>
        {tested && testResult && !busy && (
          <ul
            className="space-y-1.5 text-xs text-muted-foreground"
            aria-label="Connection diagnostics"
          >
            <li className="flex items-center gap-2">
              <PlainIcon name="check" size={13} tone="success" />
              <span className="text-foreground">Completion</span>
              <span>· {testResult.latencyMs} ms</span>
              <span>· {testResult.replyChars} chars</span>
            </li>
            <li className="flex items-center gap-2">
              {testResult.streaming ? (
                <PlainIcon name="check" size={13} tone="success" />
              ) : (
                <span
                  aria-hidden
                  className="inline-block size-[13px] rounded-full bg-destructive/30"
                />
              )}
              <span className="text-foreground">Streaming</span>
              {testResult.streaming ? (
                <span>
                  · first byte {testResult.streamLatencyMs ?? "—"} ms
                </span>
              ) : (
                <span className="text-destructive">
                  · no stream data — chat will fall back to errors
                  {testResult.streamError ? ` (${testResult.streamError})` : ""}
                </span>
              )}
            </li>
            <li className="flex items-center gap-2">
              {testResult.thinkingObserved ? (
                <PlainIcon name="check" size={13} tone="success" />
              ) : (
                <span
                  aria-hidden
                  className="inline-block size-[13px] rounded-full bg-muted"
                />
              )}
              <span className="text-foreground">Thinking</span>
              <span>
                ·{" "}
                {testResult.thinkingObserved
                  ? "the model streams its reasoning; it will be shown collapsed"
                  : "no reasoning streamed at this level; answers appear directly"}
              </span>
            </li>
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {variant === "panel" && (
            <Button type="submit" disabled={!canSave} loading={busy === "save"}>
              Save AI settings
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            loading={busy === "test"}
            disabled={Boolean(busy) || !connectionReady || !values.model.trim()}
            onClick={() => void test()}
          >
            Test connection
          </Button>
          <span role="status" className="text-xs text-muted-foreground">
            {dirty
              ? "Unsaved changes"
              : stored
                ? "All changes saved"
                : "Not configured"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Testing sends one short request to the selected model and may use
          provider credits. It does not save your settings.
        </p>
        {stored && (
          <div className="pt-1">
            {confirmRemove ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="w-full text-xs text-muted-foreground">
                  Remove your saved provider and encrypted key?
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={Boolean(busy)}
                  onClick={() => void remove()}
                >
                  {busy === "remove" ? "Removing…" : "Remove personal settings"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={Boolean(busy)}
                  onClick={() => setConfirmRemove(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="min-h-9 text-xs text-muted-foreground underline underline-offset-4 hover:text-destructive disabled:opacity-50"
                disabled={Boolean(busy)}
                onClick={() => setConfirmRemove(true)}
              >
                Remove personal settings
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
