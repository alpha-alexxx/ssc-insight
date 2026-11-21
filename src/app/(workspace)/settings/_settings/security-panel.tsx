"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import {
  BadgeCheck,
  Check,
  Copy,
  Loader2,
  MailWarning,
  MonitorSmartphone,
  ShieldOff,
} from "lucide-react";
import { authFailureCopy, EmailAuthError } from "@/lib/auth/email-client";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/auth/email-schemas";
import { useAuthSecurity } from "./use-auth-security";
import { Panel } from "@/components/dashboard-panels";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/toast";

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
  const toast = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const name = user?.name ?? userName ?? null;
  const email = user?.email ?? userEmail ?? null;
  const twoFactorEnabled = user?.twoFactorEnabled ?? null;

  return (
    <>
      <Panel icon="user" title="This account" description="Who you are signed in as, and how.">
        <div className="flex flex-wrap items-center gap-4 px-4 py-1 sm:px-5">
          <Avatar className="size-12">
            <AvatarFallback className="bg-canvas text-sm">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{name || "Private workspace"}</p>
            <p className="truncate text-xs text-muted">{email || "Account email unavailable"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1">
                <span aria-hidden className="size-1.5 rounded-full bg-positive" />
                Google
              </Badge>
              {email && user?.emailVerified === false ? (
                <Badge variant="outline" className="gap-1 text-warning">
                  <MailWarning size={11} aria-hidden /> Email unverified
                </Badge>
              ) : email && user?.emailVerified === true ? (
                <Badge variant="outline" className="gap-1 text-positive">
                  <BadgeCheck size={11} aria-hidden /> Email verified
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>

      <Panel icon="shield" title="Password" description="For accounts that sign in with email.">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-1 sm:px-5">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
            A Google-only account has no password. Adding one doesn&apos;t replace
            Google sign-in — it adds an email + password way in.
          </p>
          <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
            Set or change password
          </Button>
        </div>
      </Panel>

      <Panel
        icon="timer"
        title="Two-factor authentication"
        description="A 6-digit authenticator code on every email + password sign-in."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-1 sm:px-5">
          {twoFactorEnabled == null ? (
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
              Two-factor isn&apos;t available on this project&apos;s auth provider — the
              hosted auth service needs the two-factor plugin enabled first.
            </p>
          ) : (
            <>
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
                {twoFactorEnabled
                  ? "On. Password sign-ins ask for an authenticator code; backup codes unlock a lost device."
                  : "Off. Password sign-ins only need the password. Adding an authenticator app protects the email path."}
              </p>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "On" : "Off"}
              </Badge>
              <div className="flex flex-wrap gap-2">
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
      </Panel>

      <SessionsCard />

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        hasEmail={Boolean(email)}
        submit={(values) =>
          actions.changePassword({
            currentPassword: values.currentPassword ?? "",
            newPassword: values.newPassword,
            revokeOtherSessions: values.revokeOtherSessions,
          })
        }
      />
      <EnrollDialog open={enrollOpen} onOpenChange={setEnrollOpen} enroll={actions.enrollTwoFactor} verify={actions.verifyEnrollment} toast={toast} />
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

function initialsOf(name: string | null): string {
  if (!name) return "SSC";
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join("") || "SSC";
}

/* -------------------------------------------------------------- sessions */

function SessionsCard() {
  const { sessions, sessionsBusy, actions, refreshSessions } = useAuthSecurity();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  return (
    <>
      <Panel
        icon="clock"
        title="Active sessions"
        description="Devices signed into this account right now."
      >
        {sessionsBusy && sessions == null ? (
          <p className="px-4 py-1 text-xs text-muted sm:px-5" aria-busy="true">
            Loading sessions…
          </p>
        ) : !sessions || sessions.length === 0 ? (
          <p className="px-4 py-1 text-xs leading-relaxed text-muted sm:px-5">
            The session list isn&apos;t available from this provider.{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-ink"
              onClick={() => void refreshSessions()}
            >
              Retry
            </button>
          </p>
        ) : (
          <div className="px-4 py-1 sm:px-5">
            <ul className="divide-y divide-rule-soft border-y border-rule-soft">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center gap-3 py-2.5">
                  <MonitorSmartphone size={14} aria-hidden className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-ink">
                      {describeDevice(session.userAgent)}
                    </span>
                    <span className="tabular-nums block text-[0.625rem] text-muted">
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
      </Panel>
      <AlertDialog open={revokeOpen} onOpenChange={(open) => !open && setRevokeOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out every other device?</AlertDialogTitle>
            <AlertDialogDescription>
              All sessions except this browser lose access immediately. Any
              device still open there must sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {revokeError ? (
            <p role="alert" className="text-xs text-danger">
              {revokeError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sessionsBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={sessionsBusy}
              onClick={(event) => {
                event.preventDefault();
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function ChangePasswordDialog({
  open,
  onOpenChange,
  hasEmail,
  submit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasEmail: boolean;
  submit: (values: ChangePasswordValues & { revokeOtherSessions: boolean }) => Promise<{ ok: boolean; failure?: string }>;
}) {
  const toast = useToast();
  const [noPasswordYet, setNoPasswordYet] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function close() {
    onOpenChange(false);
    setError("");
    form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
            {noPasswordYet ? "Set a password" : "Change password"}
          </DialogTitle>
          <DialogDescription>
            {noPasswordYet
              ? hasEmail
                ? "Adds an email + password way into this account, beside Google."
                : "Adds an email + password way into this account."
              : "The new password takes effect on the next sign-in."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
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
          {!noPasswordYet ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-current-password">Current password</Label>
              <Input
                id="auth-current-password"
                type="password"
                autoComplete="current-password"
                {...form.register("currentPassword")}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="auth-new-password">New password</Label>
            <Input
              id="auth-new-password"
              type="password"
              autoComplete="new-password"
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword ? (
              <p className="text-xs text-danger">{form.formState.errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="auth-confirm-password">Confirm new password</Label>
            <Input
              id="auth-confirm-password"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-xs text-danger">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            <Switch
              checked={revokeOtherSessions}
              onCheckedChange={setRevokeOtherSessions}
              aria-label="Sign out other devices after changing the password"
            />
            Sign out other devices
          </label>
          <button
            type="button"
            className="text-left text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
            onClick={() => setNoPasswordYet((value) => !value)}
          >
            {noPasswordYet
              ? "I do have a password — ask for it"
              : "I don't have a password yet (Google-only account)"}
          </button>
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden /> Saving…
                </>
              ) : (
                "Save password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
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
  toast,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enroll: (password: string) => Promise<{
    uri: string | null;
    secret: string | null;
    backupCodes: string[];
  }>;
  verify: (code: string) => Promise<{ ok: boolean; failure?: string }>;
  toast: ReturnType<typeof useToast>;
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
      toast.error("Couldn't copy", "Select the codes and copy them manually.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        {step === "password" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Turn on two-factor
              </DialogTitle>
              <DialogDescription>
                Confirm your password to start enrolling an authenticator app.
              </DialogDescription>
            </DialogHeader>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-enroll-password">Password</Label>
                <Input
                  id="auth-enroll-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoFocus
                />
              </div>
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !password}>
                  {busy ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden /> Starting…
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : null}

        {step === "scan" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Scan, or enter the key
              </DialogTitle>
              <DialogDescription>
                In your authenticator app, add an account with this QR code —
                or type the key below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- locally generated QR data URL
                <img
                  src={qrDataUrl}
                  alt="Two-factor QR code to scan with your authenticator app"
                  className="size-44 rounded-card border border-rule-soft bg-white p-2"
                />
              ) : null}
              {enrollment?.secret ? (
                <div className="w-full">
                  <Label htmlFor="auth-totp-secret">Secret key</Label>
                  <p
                    id="auth-totp-secret"
                    className="tabular-nums mt-1 rounded-control border border-rule-soft bg-canvas px-3 py-2 text-center font-mono text-xs text-ink"
                  >
                    {enrollment.secret}
                  </p>
                </div>
              ) : null}
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("verify")}>Next</Button>
              </div>
            </div>
          </>
        ) : null}

        {step === "verify" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Verify one code
              </DialogTitle>
              <DialogDescription>
                Enter the 6-digit code your authenticator shows now — it proves
                the app was set up right.
              </DialogDescription>
            </DialogHeader>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-totp-verify">Code</Label>
                <Input
                  id="auth-totp-verify"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="tabular-nums text-center text-lg tracking-[0.4em]"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  autoFocus
                />
              </div>
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || code.length !== 6}>
                  {busy ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden /> Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : null}

        {step === "codes" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Save your backup codes
              </DialogTitle>
              <DialogDescription>
                Each code works once, instead of the authenticator, when the
                device is lost. They are shown once — copy them now.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-card border border-rule-soft bg-canvas px-3 py-3">
              <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
                {(enrollment?.backupCodes ?? []).map((backup, index) => (
                  <li key={`${backup}-${index}`} className="tabular-nums font-mono text-xs text-ink">
                    {backup}
                  </li>
                ))}
              </ol>
              {enrollment && enrollment.backupCodes.length === 0 ? (
                <p className="text-xs text-muted">
                  The provider didn&apos;t return backup codes — you can generate a
                  set later.
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copyCodes()}>
                {copied ? (
                  <>
                    <Check size={13} aria-hidden /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} aria-hidden /> Copy all
                  </>
                )}
              </Button>
              <Button onClick={close}>I saved the codes</Button>
            </div>
          </>
        ) : null}
      </DialogContent>
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
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
            Turn off two-factor?
          </DialogTitle>
          <DialogDescription>
            Password sign-ins will stop asking for the authenticator code. Your
            account is less protected on the email path.
          </DialogDescription>
        </DialogHeader>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="auth-disable-password">Password</Label>
            <Input
              id="auth-disable-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          </div>
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Keep it on
            </Button>
            <Button type="submit" variant="destructive" disabled={busy || !password}>
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden /> Turning off…
                </>
              ) : (
                <>
                  <ShieldOff size={14} aria-hidden /> Turn off
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
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
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        {codes == null ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Generate new backup codes?
              </DialogTitle>
              <DialogDescription>
                The current codes stop working the moment the new set appears.
              </DialogDescription>
            </DialogHeader>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-regen-password">Password</Label>
                <Input
                  id="auth-regen-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoFocus
                />
              </div>
              {error ? (
                <p role="alert" className="text-xs leading-relaxed text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !password}>
                  {busy ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden /> Generating…
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                Your new backup codes
              </DialogTitle>
              <DialogDescription>Shown once — copy them now.</DialogDescription>
            </DialogHeader>
            <div className="rounded-card border border-rule-soft bg-canvas px-3 py-3">
              <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
                {codes.map((backup, index) => (
                  <li key={`${backup}-${index}`} className="tabular-nums font-mono text-xs text-ink">
                    {backup}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                {copied ? (
                  <>
                    <Check size={13} aria-hidden /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} aria-hidden /> Copy all
                  </>
                )}
              </Button>
              <Button onClick={close}>I saved the codes</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
