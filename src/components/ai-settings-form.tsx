"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "@/components/ui/icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/lib/api-client";
import { useToast } from "./toast";
import { PlainIcon } from "./icon";
import { cn } from "@/lib/utils";
import {
  PROVIDER_PRESETS,
  providerPreset,
  type ProviderId,
} from "@/lib/ai/providers";
import {
  generationPathFor,
  type AiAuthMode,
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
  const toast = useToast();
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
  const [revealKey, setRevealKey] = useState(false);
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState("");
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
  const visibleModels = models.filter((model) =>
    `${model.id} ${model.name}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

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
      setQuery("");
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
    setRevealKey(false);
  }

  function payloadFrom(source: AiValues) {
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
  }

  async function fetchModels() {
    catalogRequest.current?.abort();
    const controller = new AbortController();
    catalogRequest.current = controller;
    setCatalog({ state: "loading", models: [] });
    setQuery("");
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
        setRevealKey(false);
        setTested(false);
        setTestFailed(false);
        setTestResult(null);
        toast.success("AI settings saved", `${data.model} is selected.`);
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
    [isLocal, onChanged, setValue, storageAvailable, toast],
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
      setQuery("");
      setManual(false);
      setTested(false);
      setTestFailed(false);
      setRevealKey(false);
      setConfirmRemove(false);
      toast.info(
        "Personal AI settings removed",
        "The server configuration, if available, will be used instead.",
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
    setRevealKey(false);
    setConfirmRemove(false);
    catalogRequest.current?.abort();
    catalogRequest.current = null;
    setCatalog(EMPTY_CATALOG);
    setQuery("");
  }, [reset, stored]);
  usePanelDraft("ai", { isDirty: dirty, reset: resetDraft, save: submitSave });

  if (loading)
    return (
      <p className="py-6 text-sm text-muted" role="status">
        Loading AI settings…
      </p>
    );
  if (loadFailed)
    return (
      <div className="space-y-3 py-4">
        <p role="alert" className="text-sm text-danger">
          Could not load your AI settings. Your saved configuration is
          unchanged.
        </p>
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
          <h2 className="font-serif text-xl font-medium">AI provider</h2>
        )}
        <p className="max-w-prose text-sm leading-relaxed text-muted">
          Choose the provider and model for your coach and report assistant.
          Your personal settings take priority over the server defaults.
        </p>
        {stored && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <PlainIcon name="check" size={14} /> Saved configuration
            </span>
            <span className="min-w-0 break-all text-muted">
              {providerPreset(stored.provider)?.label ?? stored.provider} ·{" "}
              {stored.model}
            </span>
          </div>
        )}
      </div>

      {!storageAvailable && (
        <p
          role="status"
          className="rounded-control border border-warning bg-warning-soft p-3 text-xs leading-relaxed text-warning"
        >
          Personal key storage is unavailable on this installation. You can
          fetch models and test a key for this session, but saving needs to be
          enabled by the person managing the app.
        </p>
      )}

      <div
        className={cn(
          "grid min-w-0 gap-7",
          !compact &&
            "xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-8",
        )}
      >
        <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-5">
          <legend className="mb-4 font-serif text-lg font-medium text-ink">
            Connection
          </legend>
          <div className="space-y-2">
            <Label htmlFor={`${id}-provider`}>Provider</Label>
            <Select
              value={values.provider}
              onValueChange={(next) => chooseProvider(next as ProviderId)}
            >
              <SelectTrigger id={`${id}-provider`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_PRESETS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {preset?.note && (
              <p className="text-xs leading-relaxed text-muted">
                {preset.note}
              </p>
            )}
          </div>

          {(preset?.protocols.length ?? 0) > 1 && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-protocol`}>API format</Label>
              <Select
                value={values.protocol}
                onValueChange={(next) =>
                  patchFields(
                    { protocol: next as AiProtocol, generationPath: "" },
                    true,
                  )
                }
              >
                <SelectTrigger id={`${id}-protocol`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(preset?.protocols ?? []).map((item) => (
                    <SelectItem key={item} value={item}>
                      {PROTOCOL_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-muted">
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
              <Label htmlFor={`${id}-base`}>API base URL</Label>
              <Input
                id={`${id}-base`}
                type="url"
                value={values.baseUrl}
                onChange={(event) =>
                  patchFields({ baseUrl: event.target.value }, true)
                }
                placeholder="https://your-provider.com/v1"
                autoComplete="off"
                spellCheck={false}
                maxLength={300}
                aria-invalid={Boolean(formState.errors.baseUrl) || undefined}
              />
              {formState.errors.baseUrl && (
                <p role="alert" className="text-xs text-danger">
                  {formState.errors.baseUrl.message}
                </p>
              )}
              {requestPreview && (
                <p className="text-xs leading-relaxed text-muted">
                  Requests will be sent to{" "}
                  <span className="break-all font-medium text-ink">
                    {requestPreview}
                  </span>
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted">
                Use the base URL without the generation path. Pasting a full
                endpoint also works — the matching suffix is moved into the
                path automatically.
              </p>
            </div>
          )}

          {values.authMode === "none" ? (
            <div className="space-y-2">
              <Label htmlFor={`${id}-key`}>API key</Label>
              <p className="text-xs leading-relaxed text-muted">
                This provider is used without authentication. No key is
                required or stored.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`${id}-key`}>
                {keepingKey ? "Replace API key" : "API key"}
              </Label>
              <div className="relative">
                <Input
                  id={`${id}-key`}
                  type={revealKey ? "text" : "password"}
                  className="pr-12"
                  value={values.apiKey}
                  onChange={(event) =>
                    patchFields({ apiKey: event.target.value }, true)
                  }
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
                  aria-describedby={`${id}-key-help`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 w-11"
                  disabled={!values.apiKey}
                  aria-label={revealKey ? "Hide API key" : "Show API key"}
                  aria-pressed={revealKey}
                  onClick={() => setRevealKey((value) => !value)}
                >
                  {revealKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <p
                id={`${id}-key-help`}
                className="text-xs leading-relaxed text-muted"
              >
                {keepingKey
                  ? `Saved key${stored?.keyHint ? ` ending ${stored.keyHint}` : ""}. Leave this blank to keep it.`
                  : "Your key is encrypted when saved and is never returned to the browser."}
              </p>
            </div>
          )}

          <details className="border-t border-rule-soft pt-3">
            <summary className="text-xs font-medium text-ink">
              Advanced connection settings
            </summary>
            <div className="space-y-4 pt-4">
              {values.provider !== "custom" && (
                <div className="space-y-2">
                  <Label htmlFor={`${id}-endpoint`}>API base URL</Label>
                  <Input
                    id={`${id}-endpoint`}
                    className="text-xs"
                    value={values.baseUrl}
                    readOnly
                  />
                  <p className="text-xs text-muted">
                    Choose Custom endpoint to use a different URL.
                  </p>
                </div>
              )}
              <label className="check-row text-xs">
                <input
                  type="checkbox"
                  checked={values.jsonMode}
                  onChange={(event) =>
                    patchFields({ jsonMode: event.target.checked })
                  }
                />
                <span>Request structured JSON responses</span>
              </label>
              <p className="text-xs leading-relaxed text-muted">
                Turn this off if your provider does not support JSON mode.
              </p>
              {isLocal && (
                <label className="check-row items-start text-xs">
                  <input
                    type="checkbox"
                    checked={values.allowPrivate}
                    onChange={(event) =>
                      patchFields(
                        { allowPrivate: event.target.checked },
                        true,
                      )
                    }
                  />
                  <span>
                    Allow access to my local server. It must be reachable from
                    the app’s server.
                  </span>
                </label>
              )}
            </div>
          </details>
        </fieldset>

        <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-4">
          <legend className="mb-4 font-serif text-lg font-medium text-ink">
            Model
          </legend>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-[30ch] flex-1 text-xs leading-relaxed text-muted">
              Fetch the provider’s catalog, then choose a model. Availability
              depends on your account.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!connectionReady || catalog.state === "loading"}
              onClick={() => void fetchModels()}
            >
              {catalog.state === "loading" ? (
                <Loader2
                  size={14}
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <PlainIcon name="refresh" size={14} />
              )}
              {catalog.state === "loading"
                ? "Fetching…"
                : catalog.state === "ready"
                  ? "Refresh models"
                  : "Fetch models"}
            </Button>
          </div>
          {!connectionReady && (
            <p className="text-xs text-muted">
              {isLocal && !values.allowPrivate
                ? "Enable local access in advanced settings to fetch models."
                : "Enter your API key to fetch available models."}
            </p>
          )}
          <div
            role="group"
            aria-label="Model selection method"
            className="flex border-b border-rule-soft"
          >
            {[
              { value: false, label: "Choose from list" },
              { value: true, label: "Enter model ID" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={manual === item.value}
                onClick={() => setManual(item.value)}
                className={cn(
                  "min-h-10 border-b-2 px-3 text-xs font-medium transition-colors",
                  manual === item.value
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {catalog.state === "error" && (
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {catalog.error}
            </p>
          )}
          {manual ? (
            <div className="space-y-2">
              <Label htmlFor={`${id}-model`}>Model ID</Label>
              <Input
                id={`${id}-model`}
                value={values.model}
                onChange={(event) => patchFields({ model: event.target.value })}
                placeholder={
                  preset?.models[0] ?? "Your provider’s exact model ID"
                }
                autoComplete="off"
                spellCheck={false}
                maxLength={120}
                aria-invalid={Boolean(formState.errors.model) || undefined}
              />
              {formState.errors.model && (
                <p role="alert" className="text-xs text-danger">
                  {formState.errors.model.message}
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted">
                Use the exact ID from your provider. You can test it before
                saving.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-control border border-rule-soft">
              <div className="border-b border-rule-soft bg-canvas px-3 py-2">
                <Label htmlFor={`${id}-search`} className="sr-only">
                  Search models
                </Label>
                <div className="flex items-center gap-2">
                  <PlainIcon
                    name="search"
                    size={14}
                    className="shrink-0 text-muted"
                  />
                  <input
                    id={`${id}-search`}
                    type="search"
                    className="min-h-8 min-w-0 border-0 bg-transparent p-0 text-sm shadow-none"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search model name or ID"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div
                className="border-b border-rule-soft px-3 py-2 text-xs text-muted"
                role="status"
                aria-live="polite"
              >
                {catalog.state === "loading"
                  ? "Loading models from your provider…"
                  : catalog.state === "ready"
                    ? `${catalog.models.length} models fetched · ${visibleModels.length} shown`
                    : "Suggestions · availability not checked"}
              </div>
              <div
                className="max-h-60 overflow-y-auto overscroll-contain"
                aria-busy={catalog.state === "loading"}
              >
                {catalog.state === "loading" ? (
                  <p className="p-5 text-center text-sm text-muted">
                    Fetching your model list…
                  </p>
                ) : visibleModels.length ? (
                  visibleModels.map((model) => (
                    <label
                      key={model.id}
                      className={cn(
                        "check-row m-0 min-h-12 cursor-pointer border-b border-rule-soft px-3 py-3 last:border-b-0 hover:bg-canvas",
                        values.model === model.id && "bg-accent-soft",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${id}-models`}
                        className="size-4! w-4! shrink-0 accent-accent"
                        value={model.id}
                        checked={values.model === model.id}
                        onChange={() => patchFields({ model: model.id })}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block break-all text-sm font-medium text-ink">
                          {model.name}
                        </span>
                        {model.name !== model.id && (
                          <span className="mt-0.5 block break-all text-xs font-normal text-muted">
                            {model.id}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="space-y-2 p-5 text-center text-xs leading-relaxed text-muted">
                    <p>
                      {query.trim()
                        ? "No models match your search."
                        : catalog.state === "ready"
                          ? "This provider returned no models."
                          : "Fetch a model list or enter an ID manually."}
                    </p>
                    {query.trim() && (
                      <button
                        type="button"
                        className="text-ink underline underline-offset-4"
                        onClick={() => setQuery("")}
                      >
                        Clear search
                      </button>
                    )}
                    <button
                      type="button"
                      className="block w-full text-ink underline underline-offset-4"
                      onClick={() => setManual(true)}
                    >
                      Enter a model ID
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="break-all text-xs leading-relaxed text-muted">
            {values.model ? (
              <>
                <span className="font-medium text-ink">Selected: </span>
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
              <p className="text-xs leading-relaxed text-muted">
                Your selected model is not in this catalog. Keep its ID or
                choose another model.
              </p>
            )}

          <div className="space-y-4 border-t border-rule-soft pt-4">
            <legend className="sr-only">Model behavior</legend>
            <p className="section-label">Model behavior</p>
            <div className="space-y-2">
              <Label htmlFor={`${id}-thinking`}>Thinking effort</Label>
              <Select
                value={values.thinking}
                onValueChange={(next) =>
                  patchFields({
                    thinking: next as AiValues["thinking"],
                  })
                }
              >
                <SelectTrigger id={`${id}-thinking`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THINKING_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {THINKING_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-muted">
                Asks the model to reason before answering. What the provider
                does with this depends on the model — its own thinking is
                always shown collapsed above the answer when it streams any.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${id}-max-output`}>Max reply tokens</Label>
                <Input
                  id={`${id}-max-output`}
                  type="number"
                  inputMode="numeric"
                  min={256}
                  max={32000}
                  step={128}
                  value={values.maxOutputTokens}
                  onChange={(event) =>
                    patchFields({ maxOutputTokens: event.target.value })
                  }
                  placeholder="Default"
                  autoComplete="off"
                  aria-invalid={
                    Boolean(formState.errors.maxOutputTokens) || undefined
                  }
                />
                {formState.errors.maxOutputTokens ? (
                  <p role="alert" className="text-xs text-danger">
                    {formState.errors.maxOutputTokens.message}
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-muted">
                    256–32000. Reasoning counts toward this.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-history`}>Conversation memory</Label>
                <Input
                  id={`${id}-history`}
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={16}
                  step={1}
                  value={values.historyTurns}
                  onChange={(event) =>
                    patchFields({ historyTurns: event.target.value })
                  }
                  placeholder="Default (8 turns)"
                  autoComplete="off"
                  aria-invalid={
                    Boolean(formState.errors.historyTurns) || undefined
                  }
                />
                {formState.errors.historyTurns ? (
                  <p role="alert" className="text-xs text-danger">
                    {formState.errors.historyTurns.message}
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-muted">
                    2–16 earlier turns sent with each question.
                  </p>
                )}
              </div>
            </div>
            <label className="check-row items-start text-xs">
              <input
                type="checkbox"
                checked={values.visionEnabled}
                onChange={(event) =>
                  patchFields({ visionEnabled: event.target.checked })
                }
              />
              <span>
                <span className="font-medium text-ink">
                  Allow image input
                </span>
                <span className="mt-0.5 block leading-relaxed text-muted">
                  Attach screenshots in the chat and read scorecard images in
                  the Log tab. Images are downscaled before sending.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <div className="space-y-3 border-t border-rule-soft pt-4">
        {error && (
          <p role="alert" className="text-sm leading-relaxed text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {busy === "test" && (
            <Badge variant="secondary">
              <Loader2
                size={12}
                className="animate-spin motion-reduce:animate-none"
              />
              Testing…
            </Badge>
          )}
          {tested && !busy && testResult?.streaming !== false && (
            <Badge variant="default">Connected</Badge>
          )}
          {testFailed && !busy && <Badge variant="destructive">Failed</Badge>}
          {tested && testResult?.streaming === false && !busy && (
            <Badge variant="secondary">Chat streaming unavailable</Badge>
          )}
          {tested && !busy && (
            <p role="status" className="text-xs leading-relaxed text-positive">
              {dirty
                ? "Connection verified for these settings. Save to use them."
                : "Connection verified for your saved settings."}
            </p>
          )}
        </div>
        {tested && testResult && !busy && (
          <ul
            className="space-y-1.5 text-xs text-muted"
            aria-label="Connection diagnostics"
          >
            <li className="flex items-center gap-2">
              <PlainIcon name="check" size={13} className="text-positive" />
              <span className="text-ink">Completion</span>
              <span>· {testResult.latencyMs} ms</span>
              <span>· {testResult.replyChars} chars</span>
            </li>
            <li className="flex items-center gap-2">
              {testResult.streaming ? (
                <PlainIcon
                  name="check"
                  size={13}
                  className="text-positive"
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-block size-[13px] rounded-full bg-danger-soft"
                />
              )}
              <span className="text-ink">Streaming</span>
              {testResult.streaming ? (
                <span>
                  · first byte {testResult.streamLatencyMs ?? "—"} ms
                </span>
              ) : (
                <span className="text-danger">
                  · no stream data — chat will fall back to errors
                  {testResult.streamError ? ` (${testResult.streamError})` : ""}
                </span>
              )}
            </li>
            <li className="flex items-center gap-2">
              {testResult.thinkingObserved ? (
                <PlainIcon
                  name="check"
                  size={13}
                  className="text-positive"
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-block size-[13px] rounded-full bg-canvas"
                />
              )}
              <span className="text-ink">Thinking</span>
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
            <Button type="submit" disabled={!canSave}>
              {busy === "save" ? "Saving…" : "Save AI settings"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(busy) || !connectionReady || !values.model.trim()}
            onClick={() => void test()}
          >
            {busy === "test" ? "Testing…" : "Test connection"}
          </Button>
          <span role="status" className="text-xs text-muted">
            {dirty
              ? "Unsaved changes"
              : stored
                ? "All changes saved"
                : "Not configured"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Testing sends one short request to the selected model and may use
          provider credits. It does not save your settings.
        </p>
        {stored && (
          <div className="pt-1">
            {confirmRemove ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="w-full text-xs text-muted">
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
                className="min-h-9 text-xs text-muted underline underline-offset-4 hover:text-danger disabled:opacity-50"
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
