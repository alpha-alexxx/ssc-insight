"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { PlainIcon } from "@/components/icon";
import {
  authFailureCopy,
  EmailAuthError,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/lib/auth/email-client";
import { authClient } from "@/lib/auth/client";
import {
  changePasswordSchema,
  otpResetSchema,
  type ChangePasswordValues,
  type OtpResetValues,
} from "@/lib/auth/email-schemas";
import { useAuthSecurity } from "./use-auth-security";
import { PanelCard } from "./_lib/panel";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { CodeInput } from "@/components/code-input";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/password-input";
import { SegmentedControl } from "@/components/segmented-control";
import { Switch } from "@/components/switch";
import { toast } from "@/components/toast-stack";

/**
 * Sign-in & security: identity, password, two-factor and sessions — every
 * action a reader can take over their own auth account through the managed
 * provider's API. Instant actions with dialogs and toasts, not a staged
 * draft: nothing here edits tracker settings, so no save-bar registration.
 *
 * The two-factor status is feature-detected off the session; when the hosted
 * provider doesn't run the two-factor plugin the card says "Unavailable"
 * instead of pretending an Off state it cannot verify.
 */

export function SecurityPanel({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const { user, actions } = useAuthSecurity();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const name = user?.name ?? userName ?? null;
  const email = user?.email ?? userEmail ?? null;
  const twoFactorEnabled = user?.twoFactorEnabled ?? null;

  return (
    <div className={cn("space-y-4")}>
      {/* ── Account Identity Card ── */}
      <PanelCard
        icon="user"
        title="This account"
        description="Who you are signed in as, and how."
      >
        <div
          className={cn(
            "flex flex-col justify-between gap-4 rounded-xl border border-border/60",
            "bg-muted/25 p-4 sm:flex-row sm:items-center",
          )}
        >
          <div className={cn("flex min-w-0 items-center gap-3.5")}>
            <div className={cn("relative shrink-0")}>
              <Avatar name={name || "Private workspace"} size="lg" />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3 rounded-full",
                  "bg-emerald-500 ring-2 ring-card",
                )}
              />
            </div>

            <div className={cn("min-w-0 flex-1")}>
              <p
                className={cn("truncate text-sm font-semibold text-foreground")}
              >
                {name || "Private workspace"}
              </p>
              <p
                className={cn("mt-0.5 truncate text-xs text-muted-foreground")}
              >
                {email || "Account email unavailable"}
              </p>

              <div className={cn("mt-2.5 flex flex-wrap items-center gap-1.5")}>
                <Badge tone="success" dot>
                  Google
                </Badge>
                {email && user?.emailVerified === false ? (
                  <Badge
                    tone="warning"
                    outline
                    icon={<PlainIcon name="mail" size={12} />}
                  >
                    Email unverified
                  </Badge>
                ) : email && user?.emailVerified === true ? (
                  <Badge
                    tone="success"
                    outline
                    icon={<PlainIcon name="check" size={12} />}
                  >
                    Email verified
                  </Badge>
                ) : null}
                {twoFactorEnabled === true && (
                  <Badge
                    tone="success"
                    outline
                    icon={<PlainIcon name="lock" size={12} />}
                  >
                    2FA active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* ── Password Card ── */}
      <PanelCard
        icon="shield"
        title="Password"
        description="For accounts that sign in with email."
      >
        <div
          className={cn(
            "flex flex-col justify-between gap-4 rounded-xl border border-border/60",
            "bg-muted/20 p-4 sm:flex-row sm:items-center",
          )}
        >
          <div className={cn("flex items-start gap-3")}>
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                "border border-border/70 bg-background text-muted-foreground shadow-2xs",
              )}
            >
              <PlainIcon name="key" size={16} tone="primary" />
            </span>
            <div className={cn("min-w-0 flex-1 space-y-1")}>
              <p className={cn("text-xs font-semibold text-foreground")}>
                Email &amp; password credentials
              </p>
              <p
                className={cn("text-xs leading-relaxed text-muted-foreground")}
              >
                Confirm a change with your current password, or with a code
                emailed to your account address — the emailed code also sets a{" "}
                <span className={cn("font-medium text-foreground")}>first</span>{" "}
                password on a Google-only account. It adds an email way in;
                Google sign-in stays.
              </p>
            </div>
          </div>

          <div className={cn("flex shrink-0 items-center sm:pl-2")}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordOpen(true)}
            >
              Set or change password
            </Button>
          </div>
        </div>
      </PanelCard>

      {/* ── Two-Factor Authentication Card ── */}
      <PanelCard
        icon="timer"
        title="Two-factor authentication"
        description="A 6-digit authenticator code on every email + password sign-in."
      >
        <div
          className={cn(
            "flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center",
            twoFactorEnabled
              ? "border-emerald-500/25 bg-emerald-500/[0.03]"
              : "border-border/60 bg-muted/20",
          )}
        >
          <div className={cn("flex items-start gap-3")}>
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs",
                twoFactorEnabled
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border/70 bg-background text-muted-foreground",
              )}
            >
              <PlainIcon
                name="lock"
                size={16}
                tone={twoFactorEnabled ? "success" : "muted"}
              />
            </span>

            <div className={cn("min-w-0 flex-1 space-y-1")}>
              <div className={cn("flex flex-wrap items-center gap-2")}>
                <p className={cn("text-xs font-semibold text-foreground")}>
                  Authenticator app (TOTP)
                </p>
                {twoFactorEnabled == null ? (
                  <Badge tone="neutral">Unavailable</Badge>
                ) : (
                  <Badge tone={twoFactorEnabled ? "success" : "neutral"} dot>
                    {twoFactorEnabled ? "On" : "Off"}
                  </Badge>
                )}
              </div>

              {twoFactorEnabled == null ? (
                <p
                  className={cn(
                    "text-xs leading-relaxed text-muted-foreground",
                  )}
                >
                  Two-factor isn&apos;t available on this project&apos;s auth
                  provider — the hosted auth service needs the two-factor plugin
                  enabled first.
                </p>
              ) : (
                <p
                  className={cn(
                    "text-xs leading-relaxed text-muted-foreground",
                  )}
                >
                  {twoFactorEnabled
                    ? "On. Password sign-ins ask for an authenticator code; backup codes unlock a lost device."
                    : "Off. Password sign-ins only need the password. Adding an authenticator app protects the email path."}
                </p>
              )}
            </div>
          </div>

          {twoFactorEnabled != null && (
            <div
              className={cn(
                "flex shrink-0 flex-wrap items-center gap-2 sm:pl-2",
              )}
            >
              {twoFactorEnabled ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRegenerateOpen(true)}
                  >
                    New backup codes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDisableOpen(true)}
                  >
                    Turn off
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setEnrollOpen(true)}>
                  Turn on
                </Button>
              )}
            </div>
          )}
        </div>
      </PanelCard>

      {/* ── Active Sessions Card ── */}
      <SessionsCard />

      {/* ── Dialogs ── */}
      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        email={email ?? ""}
        submit={(values) =>
          actions.changePassword({
            currentPassword: values.currentPassword ?? "",
            newPassword: values.newPassword,
            revokeOtherSessions: values.revokeOtherSessions,
          })
        }
      />
      <EnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        enroll={actions.enrollTwoFactor}
        verify={actions.verifyEnrollment}
      />
      <DisableTwoFactorDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        submit={actions.disableTwoFactor}
      />
      <RegenerateCodesDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        submit={actions.regenerateBackupCodes}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sessions Card                                                      */
/* ------------------------------------------------------------------ */

function SessionsCard() {
  const { sessions, sessionsBusy, actions, refreshSessions } =
    useAuthSecurity();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  return (
    <>
      <PanelCard
        icon="clock"
        title="Active sessions"
        description="Devices signed into this account right now."
      >
        {sessionsBusy && sessions == null ? (
          <div className={cn("space-y-2")} aria-busy="true">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3",
                )}
              >
                <div
                  className={cn("size-8 animate-pulse rounded-lg bg-muted")}
                />
                <div className={cn("flex-1 space-y-1.5")}>
                  <div
                    className={cn("h-3 w-32 animate-pulse rounded bg-muted")}
                  />
                  <div
                    className={cn(
                      "h-2.5 w-20 animate-pulse rounded bg-muted/70",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-xl",
              "border border-border/60 bg-muted/20 px-4 py-3",
            )}
          >
            <p className={cn("text-xs leading-relaxed text-muted-foreground")}>
              The session list isn&apos;t available from this provider.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<PlainIcon name="refresh" size={13} />}
              onClick={() => void refreshSessions()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className={cn("space-y-3")}>
            <ul
              className={cn(
                "divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/15",
              )}
            >
              {sessions.map((session, idx) => (
                <li
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/30",
                  )}
                >
                  <div className={cn("flex min-w-0 items-center gap-3")}>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        "border border-border/70 bg-background text-muted-foreground shadow-2xs",
                      )}
                    >
                      <PlainIcon
                        name="computer"
                        size={15}
                        tone={idx === 0 ? "primary" : "muted"}
                      />
                    </span>

                    <span className={cn("min-w-0 flex-1")}>
                      <span className={cn("flex flex-wrap items-center gap-2")}>
                        <span
                          className={cn(
                            "truncate text-xs font-semibold text-foreground",
                          )}
                        >
                          {describeDevice(session.userAgent)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs tabular-nums text-muted-foreground",
                        )}
                      >
                        {session.createdAt
                          ? `Since ${new Date(
                              session.createdAt,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}`
                          : "Unknown start"}
                      </span>
                    </span>
                  </div>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full",
                      "bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    <span
                      className={cn("size-1.5 rounded-full bg-emerald-500")}
                    />
                    Active
                  </span>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 pt-0.5",
              )}
            >
              <button
                type="button"
                disabled={sessionsBusy}
                onClick={() => void refreshSessions()}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
                  "transition-colors hover:text-foreground disabled:opacity-50",
                )}
              >
                <PlainIcon name="refresh" size={12} />
                <span>Refresh list</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokeOpen(true)}
              >
                Sign out other sessions
              </Button>
            </div>
          </div>
        )}
      </PanelCard>

      <Dialog
        open={revokeOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeOpen(false);
            setRevokeError("");
          }
        }}
        title="Sign out every other device?"
        size="sm"
        description="All sessions except this browser lose access immediately. Any device still open there must sign in again."
        footer={
          <>
            <Button
              variant="outline"
              disabled={sessionsBusy}
              onClick={() => setRevokeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={sessionsBusy}
              onClick={() => {
                void (async () => {
                  const result = await actions.revokeOthers();
                  if (result.ok) {
                    setRevokeOpen(false);
                    setRevokeError("");
                  } else {
                    setRevokeError(
                      result.failure ?? "Could not revoke sessions.",
                    );
                  }
                })();
              }}
            >
              Sign out others
            </Button>
          </>
        }
      >
        {revokeError ? <ErrorBanner message={revokeError} /> : null}
      </Dialog>
    </>
  );
}

function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : null;
  const os = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad/.test(userAgent)
      ? "iOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  return [browser, os].filter(Boolean).join(" · ") || "Unknown device";
}

/* ------------------------------------------------------------------ */
/*  Change Password Dialog                                             */
/* ------------------------------------------------------------------ */

function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
  submit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  submit: (
    values: ChangePasswordValues & { revokeOtherSessions: boolean },
  ) => Promise<{ ok: boolean; failure?: string }>;
}) {
  const [method, setMethod] = useState<"password" | "code">("password");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function close() {
    onOpenChange(false);
    setError("");
    setMethod("password");
    setCodeStage("request");
    form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  const [codeStage, setCodeStage] = useState<"request" | "verify">("request");
  const [codeBusy, setCodeBusy] = useState(false);
  const resetForm = useForm<OtpResetValues>({
    resolver: zodResolver(otpResetSchema),
    defaultValues: {
      email: email,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (open && resetForm.getValues("email") !== email) {
    resetForm.setValue("email", email);
  }

  async function checkSessionOrExit() {
    const session = await authClient.getSession({
      query: { disableCookieCache: true },
    });
    if (!session.data?.user) window.location.assign("/");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Change password"
      size="sm"
      description={
        method === "password"
          ? "Confirm with your current password; the new one takes effect on the next sign-in."
          : email
            ? `We email a 6-digit code to ${email} to confirm the change.`
            : "We email a 6-digit code to your account address to confirm the change."
      }
    >
      <SegmentedControl
        label="Password confirmation method"
        value={method}
        onValueChange={(next) => {
          setMethod(next as "password" | "code");
          setCodeStage("request");
          setError("");
        }}
        options={[
          { value: "password", label: "Current password" },
          { value: "code", label: "Emailed code" },
        ]}
      />

      {method === "password" ? (
        <form
          className={cn("mt-4 flex flex-col gap-3.5")}
          onSubmit={form.handleSubmit(async (values) => {
            setError("");
            const result = await submit({ ...values, revokeOtherSessions });
            if (result.ok) {
              toast.success("Password updated");
              close();
            } else {
              setError(result.failure ?? "Could not update the password.");
            }
          })}
        >
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            error={form.formState.errors.currentPassword?.message}
            {...form.register("currentPassword")}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            error={form.formState.errors.newPassword?.message}
            {...form.register("newPassword")}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            {...form.register("confirmPassword")}
          />

          <label
            className={cn(
              "flex cursor-pointer items-center justify-between gap-3 rounded-xl",
              "border border-border/70 bg-muted/30 px-3.5 py-2.5 text-xs transition-colors hover:bg-muted/50",
            )}
          >
            <span className={cn("space-y-0.5")}>
              <span className={cn("block font-medium text-foreground")}>
                Sign out other devices
              </span>
              <span className={cn("block text-xs text-muted-foreground")}>
                Require re-login on all other browsers
              </span>
            </span>
            <Switch
              checked={revokeOtherSessions}
              onCheckedChange={setRevokeOtherSessions}
              aria-label="Sign out other devices after changing the password"
            />
          </label>

          {error ? <ErrorBanner message={error} /> : null}

          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
            )}
          >
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save password
            </Button>
          </div>
        </form>
      ) : (
        <div className={cn("mt-4 flex flex-col gap-3.5")}>
          {codeStage === "request" ? (
            <>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-3",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    "border border-border/60 bg-background text-primary",
                  )}
                >
                  <PlainIcon name="mail" size={15} tone="primary" />
                </span>
                <div className={cn("min-w-0 flex-1")}>
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                    )}
                  >
                    Code goes to
                  </p>
                  <p
                    className={cn(
                      "truncate text-sm font-medium text-foreground",
                    )}
                  >
                    {email || "your account address"}
                  </p>
                </div>
              </div>

              {error ? <ErrorBanner message={error} /> : null}

              <div className={cn("flex flex-col gap-2.5")}>
                <Button
                  type="button"
                  loading={codeBusy}
                  disabled={codeBusy || !email}
                  className={cn("w-full justify-center")}
                  onClick={() =>
                    void (async () => {
                      setCodeBusy(true);
                      setError("");
                      try {
                        await requestPasswordResetOtp(email);
                        setCodeStage("verify");
                      } catch (e) {
                        setError(
                          e instanceof EmailAuthError
                            ? authFailureCopy(e.reason, e.retryAfterSeconds)
                            : "Could not send the code.",
                        );
                      } finally {
                        setCodeBusy(false);
                      }
                    })()
                  }
                >
                  Email me a code
                </Button>
                <p
                  className={cn(
                    "rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
                  )}
                >
                  No password yet (Google-only account)? This same code sets
                  your first password.
                </p>
              </div>
            </>
          ) : (
            <form
              className={cn("flex flex-col gap-3.5")}
              onSubmit={resetForm.handleSubmit(async (values) => {
                setError("");
                try {
                  await resetPasswordWithOtp({
                    email: values.email,
                    code: values.code,
                    password: values.newPassword,
                  });
                  toast.success("Password updated");
                  await checkSessionOrExit();
                  close();
                } catch (e) {
                  setError(
                    e instanceof EmailAuthError
                      ? authFailureCopy(e.reason, e.retryAfterSeconds)
                      : "Could not reset the password.",
                  );
                }
              })}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs",
                )}
              >
                <span className={cn("truncate text-muted-foreground")}>
                  Code sent to{" "}
                  <span className={cn("font-medium text-foreground")}>
                    {email}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setCodeStage("request")}
                  className={cn(
                    "shrink-0 font-medium text-primary hover:underline",
                  )}
                >
                  Resend
                </button>
              </div>

              <Input
                label="Code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                inputClassName="tabular-nums text-center text-lg tracking-[0.4em]"
                error={resetForm.formState.errors.code?.message}
                {...resetForm.register("code")}
              />
              <PasswordInput
                label="New password"
                autoComplete="new-password"
                error={resetForm.formState.errors.newPassword?.message}
                {...resetForm.register("newPassword")}
              />
              <PasswordInput
                label="Confirm new password"
                autoComplete="new-password"
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register("confirmPassword")}
              />

              {error ? <ErrorBanner message={error} /> : null}

              <div
                className={cn(
                  "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
                )}
              >
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={resetForm.formState.isSubmitting}
                >
                  Save password
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Two-Factor Dialogs                                                 */
/* ------------------------------------------------------------------ */

type EnrollStep = "password" | "scan" | "verify" | "codes";

const ENROLL_STEPS: { id: EnrollStep; label: string }[] = [
  { id: "password", label: "Confirm" },
  { id: "scan", label: "Scan QR" },
  { id: "verify", label: "Verify" },
  { id: "codes", label: "Backup" },
];

function EnrollDialog({
  open,
  onOpenChange,
  enroll,
  verify,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enroll: (password: string) => Promise<{
    uri: string | null;
    secret: string | null;
    backupCodes: string[];
  }>;
  verify: (code: string) => Promise<{ ok: boolean; failure?: string }>;
}) {
  const [step, setStep] = useState<EnrollStep>("password");
  const [password, setPassword] = useState("");
  const [enrollment, setEnrollment] = useState<{
    uri: string | null;
    secret: string | null;
    backupCodes: string[];
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  function close() {
    onOpenChange(false);
    setStep("password");
    setPassword("");
    setEnrollment(null);
    setQrDataUrl(null);
    setCode("");
    setError("");
    setCopied(false);
    setSecretCopied(false);
  }

  async function copyCodes() {
    if (!enrollment) return;
    try {
      await navigator.clipboard.writeText(enrollment.backupCodes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy", {
        description: "Select the codes and copy them manually.",
      });
    }
  }

  async function copySecret() {
    if (!enrollment?.secret) return;
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setSecretCopied(true);
      window.setTimeout(() => setSecretCopied(false), 1600);
    } catch {
      // Ignore clipboard failure
    }
  }

  const currentStepIdx = ENROLL_STEPS.findIndex((s) => s.id === step);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title={
        step === "password"
          ? "Turn on two-factor"
          : step === "scan"
            ? "Scan, or enter the key"
            : step === "verify"
              ? "Verify one code"
              : "Save your backup codes"
      }
      size="sm"
      description={
        step === "password"
          ? "Confirm your password to start enrolling an authenticator app."
          : step === "scan"
            ? "In your authenticator app, add an account with this QR code — or type the key below."
            : step === "verify"
              ? "Enter the 6-digit code your authenticator shows now — it proves the app was set up right."
              : "Each code works once, instead of the authenticator, when the device is lost. They are shown once — copy them now."
      }
    >
      {/* Stepper Indicator */}
      <div aria-hidden="true" className={cn("mb-4 grid grid-cols-4 gap-1.5")}>
        {ENROLL_STEPS.map((item, idx) => {
          const done = idx < currentStepIdx;
          const active = idx === currentStepIdx;
          return (
            <div key={item.id} className={cn("space-y-1")}>
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  done || active ? "bg-primary" : "bg-muted",
                )}
              />
              <p
                className={cn(
                  "truncate text-xs font-medium",
                  active
                    ? "text-foreground"
                    : done
                      ? "text-primary"
                      : "text-muted-foreground/60",
                )}
              >
                {idx + 1}. {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {step === "password" ? (
        <form
          className={cn("flex flex-col gap-3.5")}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const data = await enroll(password);
              setEnrollment(data);
              if (data.uri) {
                try {
                  setQrDataUrl(await QRCode.toDataURL(data.uri, { margin: 1 }));
                } catch {
                  setQrDataUrl(null);
                }
              }
              setStep("scan");
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not start enrollment.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            autoFocus
          />
          {error ? <ErrorBanner message={error} /> : null}
          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
            )}
          >
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} disabled={!password}>
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {step === "scan" ? (
        <div className={cn("flex flex-col items-center gap-4")}>
          {qrDataUrl ? (
            <div
              className={cn(
                "rounded-2xl border border-border/80 bg-muted/30 p-3 shadow-2xs",
              )}
            >
              {/* A QR code needs a light quiet zone to scan; bg-white is functional, not decorative. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- locally generated QR data URL */}
              <img
                src={qrDataUrl}
                alt="Two-factor QR code to scan with your authenticator app"
                className={cn("size-44 rounded-xl bg-white p-2")}
              />
            </div>
          ) : null}

          {enrollment?.secret ? (
            <div className={cn("w-full space-y-1.5")}>
              <div className={cn("flex items-center justify-between")}>
                <p className={cn("text-xs font-medium text-foreground")}>
                  Secret key
                </p>
                <button
                  type="button"
                  onClick={() => void copySecret()}
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline",
                  )}
                >
                  <PlainIcon
                    name={secretCopied ? "check" : "copy"}
                    size={12}
                    tone={secretCopied ? "success" : "primary"}
                  />
                  <span>{secretCopied ? "Copied" : "Copy key"}</span>
                </button>
              </div>
              <p
                className={cn(
                  "select-all break-all rounded-xl border border-border bg-muted/50",
                  "px-3 py-2.5 text-center font-mono text-xs tabular-nums tracking-wider text-foreground",
                )}
              >
                {enrollment.secret}
              </p>
            </div>
          ) : null}

          {error ? <ErrorBanner message={error} /> : null}

          <div
            className={cn(
              "flex w-full flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
            )}
          >
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => setStep("verify")}>Next</Button>
          </div>
        </div>
      ) : null}

      {step === "verify" ? (
        <form
          className={cn("flex flex-col gap-3.5")}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            const result = await verify(code);
            setBusy(false);
            if (result.ok) {
              setStep("codes");
            } else {
              setError(result.failure ?? "Could not verify the code.");
            }
          }}
        >
          <CodeInput
            label="Code"
            length={6}
            value={code}
            onValueChange={setCode}
            autoFocus
          />
          {error ? <ErrorBanner message={error} /> : null}
          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
            )}
          >
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} disabled={code.length !== 6}>
              Verify
            </Button>
          </div>
        </form>
      ) : null}

      {step === "codes" ? (
        <div className={cn("flex flex-col gap-3.5")}>
          <BackupCodesGrid codes={enrollment?.backupCodes ?? []} />
          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between",
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={
                copied ? (
                  <PlainIcon name="check" size={13} tone="success" />
                ) : (
                  <PlainIcon name="copy" size={13} />
                )
              }
              onClick={() => void copyCodes()}
            >
              {copied ? "Copied" : "Copy all"}
            </Button>
            <Button onClick={close}>I saved the codes</Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

function DisableTwoFactorDialog({
  open,
  onOpenChange,
  submit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submit: (password: string) => Promise<{ ok: boolean; failure?: string }>;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    onOpenChange(false);
    setPassword("");
    setError("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Turn off two-factor?"
      size="sm"
      description="Password sign-ins will stop asking for the authenticator code. Your account is less protected on the email path."
    >
      <form
        className={cn("flex flex-col gap-3.5")}
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const result = await submit(password);
          setBusy(false);
          if (result.ok) close();
          else setError(result.failure ?? "Could not turn off two-factor.");
        }}
      >
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          value={password}
          onValueChange={setPassword}
          autoFocus
        />
        {error ? <ErrorBanner message={error} /> : null}
        <div
          className={cn(
            "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
          )}
        >
          <Button type="button" variant="outline" onClick={close}>
            Keep it on
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={busy}
            disabled={!password}
            icon={<PlainIcon name="danger" size={14} />}
          >
            Turn off
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function RegenerateCodesDialog({
  open,
  onOpenChange,
  submit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submit: (password: string) => Promise<{
    uri: string | null;
    secret: string | null;
    backupCodes: string[];
  }>;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  function close() {
    onOpenChange(false);
    setPassword("");
    setError("");
    setCodes(null);
    setCopied(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title={
        codes == null ? "Generate new backup codes?" : "Your new backup codes"
      }
      size="sm"
      description={
        codes == null
          ? "The current codes stop working the moment the new set appears."
          : "Shown once — copy them now."
      }
    >
      {codes == null ? (
        <form
          className={cn("flex flex-col gap-3.5")}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const result = await submit(password);
              setCodes(result.backupCodes);
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not generate new codes.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            autoFocus
          />
          {error ? <ErrorBanner message={error} /> : null}
          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
            )}
          >
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} disabled={!password}>
              Generate
            </Button>
          </div>
        </form>
      ) : (
        <div className={cn("flex flex-col gap-3.5")}>
          <BackupCodesGrid codes={codes} />
          <div
            className={cn(
              "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between",
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={
                copied ? (
                  <PlainIcon name="check" size={13} tone="success" />
                ) : (
                  <PlainIcon name="copy" size={13} />
                )
              }
              onClick={() =>
                void navigator.clipboard
                  .writeText(codes.join("\n"))
                  .then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  })
                  .catch(() => undefined)
              }
            >
              {copied ? "Copied" : "Copy all"}
            </Button>
            <Button onClick={close}>I saved the codes</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI Helpers                                                  */
/* ------------------------------------------------------------------ */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-destructive/30",
        "bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive",
      )}
    >
      <PlainIcon
        name="danger"
        size={14}
        tone="destructive"
        className={cn("mt-0.5 shrink-0")}
      />
      <span>{message}</span>
    </div>
  );
}

function BackupCodesGrid({ codes }: { codes: string[] }) {
  if (codes.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground",
        )}
      >
        The provider didn&apos;t return backup codes — you can generate a set
        later.
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border/80 bg-muted/35 p-3")}>
      <ol className={cn("grid grid-cols-2 gap-2")}>
        {codes.map((backup, index) => (
          <li
            key={`${backup}-${index}`}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border/60",
              "bg-background/80 px-2.5 py-1.5 font-mono text-xs tabular-nums text-foreground",
            )}
          >
            <span
              className={cn("select-none text-xs text-muted-foreground/70")}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={cn("select-all font-medium")}>{backup}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default SecurityPanel;
