"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
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
    <>
      <PanelCard icon="user" title="This account" description="Who you are signed in as, and how.">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={name || "Private workspace"} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{name || "Private workspace"}</p>
            <p className="truncate text-xs text-muted-foreground">{email || "Account email unavailable"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="success" dot>
                Google
              </Badge>
              {email && user?.emailVerified === false ? (
                <Badge tone="warning" outline icon={<PlainIcon name="mail" size={12} />}>
                  Email unverified
                </Badge>
              ) : email && user?.emailVerified === true ? (
                <Badge tone="success" outline icon={<PlainIcon name="check" size={12} />}>
                  Email verified
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard icon="shield" title="Password" description="For accounts that sign in with email.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
            Confirm a change with your current password, or with a code emailed
            to your account address — the emailed code also sets a{" "}
            <span className="text-foreground">first</span> password on a Google-only
            account. It adds an email way in; Google sign-in stays.
          </p>
          <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
            Set or change password
          </Button>
        </div>
      </PanelCard>

      <PanelCard
        icon="timer"
        title="Two-factor authentication"
        description="A 6-digit authenticator code on every email + password sign-in."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {twoFactorEnabled == null ? (
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
              Two-factor isn&apos;t available on this project&apos;s auth provider — the
              hosted auth service needs the two-factor plugin enabled first.
            </p>
          ) : (
            <>
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
                {twoFactorEnabled
                  ? "On. Password sign-ins ask for an authenticator code; backup codes unlock a lost device."
                  : "Off. Password sign-ins only need the password. Adding an authenticator app protects the email path."}
              </p>
              <Badge tone={twoFactorEnabled ? "success" : "neutral"}>
                {twoFactorEnabled ? "On" : "Off"}
              </Badge>
              <div className="flex flex-wrap items-center gap-2">
                {twoFactorEnabled ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRegenerateOpen(true)}
                    >
                      New backup codes
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDisableOpen(true)}>
                      Turn off
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setEnrollOpen(true)}>
                    Turn on
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </PanelCard>

      <SessionsCard />

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
      <EnrollDialog open={enrollOpen} onOpenChange={setEnrollOpen} enroll={actions.enrollTwoFactor} verify={actions.verifyEnrollment} />
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
    </>
  );
}

/* -------------------------------------------------------------- sessions */

function SessionsCard() {
  const { sessions, sessionsBusy, actions, refreshSessions } = useAuthSecurity();
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
          <p className="text-xs text-muted-foreground" aria-busy="true">
            Loading sessions…
          </p>
        ) : !sessions || sessions.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            The session list isn&apos;t available from this provider.{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-foreground"
              onClick={() => void refreshSessions()}
            >
              Retry
            </button>
          </p>
        ) : (
          <div>
            <ul className="divide-y divide-border border-y border-border">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center gap-3 py-2.5">
                  <PlainIcon name="battery" size={14} tone="muted" className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {describeDevice(session.userAgent)}
                    </span>
                    <span className="block tabular-nums text-[13px] text-muted-foreground">
                      {session.createdAt
                        ? `Since ${new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                        : "Unknown start"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setRevokeOpen(true)}>
                Sign out other sessions
              </Button>
            </div>
          </div>
        )}
      </PanelCard>
      <Dialog
        open={revokeOpen}
        onOpenChange={(open) => !open && setRevokeOpen(false)}
        title="Sign out every other device?"
        size="sm"
        description="All sessions except this browser lose access immediately. Any device still open there must sign in again."
        footer={
          <>
            <Button variant="outline" disabled={sessionsBusy} onClick={() => setRevokeOpen(false)}>
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
                    setRevokeError(result.failure ?? "Could not revoke sessions.");
                  }
                })();
              }}
            >
              Sign out others
            </Button>
          </>
        }
      >
        {revokeError ? (
          <p role="alert" className="text-xs text-destructive">
            {revokeError}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}

function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  // A quiet parse: the product names matter, the full UA string never shows.
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

/* -------------------------------------------------------------- password */

/**
 * The password dialog with two confirmation methods: the account's current
 * password, or a 6-digit code emailed to the account address. The code path
 * rides better-auth's email-otp reset endpoints and CREATES a credential
 * account when none exists — it is how a Google-only account sets a first
 * password. After a code-path change the session may have been revoked by
 * the provider's managed config, so the dialog re-checks the session and
 * bounces to the landing sign-in when it died.
 */
function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
  submit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The signed-in account's email — the reset code goes here, locked. */
  email: string;
  submit: (values: ChangePasswordValues & { revokeOtherSessions: boolean }) => Promise<{ ok: boolean; failure?: string }>;
}) {
  const [method, setMethod] = useState<"password" | "code">("password");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function close() {
    onOpenChange(false);
    setError("");
    setMethod("password");
    setCodeStage("request");
    form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  /* ---- emailed-code state (kept at the dialog level so both stages share close()) ---- */
  const [codeStage, setCodeStage] = useState<"request" | "verify">("request");
  const [codeBusy, setCodeBusy] = useState(false);
  const resetForm = useForm<OtpResetValues>({
    resolver: zodResolver(otpResetSchema),
    defaultValues: { email: email, code: "", newPassword: "", confirmPassword: "" },
  });

  // Re-sync the locked email whenever the dialog reopens with a fresh user.
  if (open && resetForm.getValues("email") !== email) {
    resetForm.setValue("email", email);
  }

  async function checkSessionOrExit() {
    // The provider may revoke every session on a reset (its managed config
    // decides). If ours died, get out of the dead workspace immediately.
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
          className="mt-4 flex flex-col gap-3"
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
          <label className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            Sign out other devices
            <Switch
              checked={revokeOtherSessions}
              onCheckedChange={setRevokeOtherSessions}
              aria-label="Sign out other devices after changing the password"
            />
          </label>
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save password
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {codeStage === "request" ? (
            <>
              <div className="rounded-[14px] border border-border bg-muted px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Code goes to
                </p>
                <p className="truncate text-sm text-foreground">
                  {email || "your account address"}
                </p>
              </div>
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  loading={codeBusy}
                  disabled={codeBusy || !email}
                  className="w-full justify-center"
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
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  No password yet (Google-only account)? This same code sets
                  your first password.
                </p>
              </div>
            </>
          ) : (
            <form
              className="flex flex-col gap-3"
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
              <p className="text-xs text-muted-foreground">
                Code sent to <span className="text-foreground">{email}</span>.
              </p>
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
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" loading={resetForm.formState.isSubmitting}>
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

/* ------------------------------------------------------------- two-factor */

type EnrollStep = "password" | "scan" | "verify" | "codes";

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

  function close() {
    onOpenChange(false);
    setStep("password");
    setPassword("");
    setEnrollment(null);
    setQrDataUrl(null);
    setCode("");
    setError("");
    setCopied(false);
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
      {step === "password" ? (
        <form
          className="flex flex-col gap-3"
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
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
        <div className="flex flex-col items-center gap-3">
          {qrDataUrl ? (
            // A QR code needs a light quiet zone to scan; bg-white is functional, not decorative.
            // eslint-disable-next-line @next/next/no-img-element -- locally generated QR data URL
            <img
              src={qrDataUrl}
              alt="Two-factor QR code to scan with your authenticator app"
              className="size-44 rounded-[14px] border border-border bg-white p-2"
            />
          ) : null}
          {enrollment?.secret ? (
            <div className="w-full">
              <p className="text-[12.5px] font-medium text-foreground">Secret key</p>
              <p
                className="mt-1 rounded-[14px] border border-border bg-muted px-3 py-2 text-center font-mono text-xs tabular-nums text-foreground"
              >
                {enrollment.secret}
              </p>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => setStep("verify")}>Next</Button>
          </div>
        </div>
      ) : null}

      {step === "verify" ? (
        <form
          className="flex flex-col gap-3"
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
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px] border border-border bg-muted px-3 py-3">
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
              {(enrollment?.backupCodes ?? []).map((backup, index) => (
                <li key={`${backup}-${index}`} className="font-mono text-xs tabular-nums text-foreground">
                  {backup}
                </li>
              ))}
            </ol>
            {enrollment && enrollment.backupCodes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                The provider didn&apos;t return backup codes — you can generate a
                set later.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
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
        className="flex flex-col gap-3"
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
        {error ? (
          <p role="alert" className="text-xs leading-relaxed text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
      title={codes == null ? "Generate new backup codes?" : "Your new backup codes"}
      size="sm"
      description={
        codes == null
          ? "The current codes stop working the moment the new set appears."
          : "Shown once — copy them now."
      }
    >
      {codes == null ? (
        <form
          className="flex flex-col gap-3"
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
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} disabled={!password}>
              Generate
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px] border border-border bg-muted px-3 py-3">
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
              {codes.map((backup, index) => (
                <li key={`${backup}-${index}`} className="font-mono text-xs tabular-nums text-foreground">
                  {backup}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
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
