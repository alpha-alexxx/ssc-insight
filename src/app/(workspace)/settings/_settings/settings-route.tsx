"use client";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Alert } from "@/components/alert";
import { useBackupImport } from "./use-backup-import";
import { SettingsView } from "./settings-view";
import type { SettingsSection } from "./sections";

/**
 * Client shell for `/settings`.
 *
 * The settings panels own their own drafts (react-hook-form + the settings
 * guard). This wrapper owns only the account-level backup flow — the file
 * input, the preview/fingerprint/confirm sequence, and the export download —
 * which used to live in the workspace shell because the hidden file input was
 * rendered there.
 */
export function SettingsRoute({
  userName,
  userEmail,
  initialSection,
}: {
  userName: string;
  userEmail: string;
  /**
   * The tab named by `?section=`, resolved on the server. Passing it down is
   * what keeps the first paint and the hydrated tree on the same tab.
   */
  initialSection?: SettingsSection;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const download = useCallback(
    async (format: "json" | "csv"): Promise<boolean> => {
      try {
        const response = await fetch(`/api/backup?format=${format}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (response.status === 401)
            window.dispatchEvent(new Event("ssc:session-ended"));
          if (body?.error?.code === "AUTH_UNAVAILABLE")
            window.dispatchEvent(new Event("ssc:auth-unavailable"));
          throw new Error(body?.error?.message ?? "Export failed");
        }
        const blob =
          format === "json"
            ? new Blob([await response.text()], { type: "application/json" })
            : await response.blob();
        const date = new Date().toISOString().slice(0, 10);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download =
          format === "json"
            ? `ssc-insight-backup-${date}.json`
            : `ssc-insight-export-${date}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  /** Re-read the server payload after an import applied incoming settings. */
  const reloadSettings = useCallback(async () => {
    window.location.reload();
  }, []);

  const backup = useBackupImport({
    download,
    refresh: reloadSettings,
    onTargetApplied: () => void reloadSettings(),
    setBusy,
    fileRef,
  });

  const saveTarget = useCallback(async () => true, []);

  return (
    <>
      <SettingsView
        userName={userName}
        userEmail={userEmail}
        initialSectionOverride={initialSection}
        saveTarget={saveTarget}
        busy={busy}
        onDownload={(format) => void download(format)}
        onChooseFile={() => fileRef.current?.click()}
        fileInput={
          <input
            className="hidden"
            type="file"
            accept=".json,application/json"
            ref={fileRef}
            aria-label="Choose backup file"
            onChange={(event) =>
              void backup.readBackup(event.target.files?.[0])
            }
          />
        }
        backup={backup}
        onOpenReplace={() => backup.setReplaceOpen(true)}
      />
      <Dialog
        open={backup.replaceOpen && backup.preview !== null}
        onOpenChange={backup.setReplaceOpen}
        title="Replace this account’s data?"
        size="md"
        description={`Signed in as ${userEmail || "the current account"}. This action cannot be undone from the app.`}
        footer={({ close }) => (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => close()}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy || !backup.safetyDownloaded}
              onClick={() => void backup.commitImport(true)}
            >
              Replace account data
            </Button>
          </>
        )}
      >
        {backup.preview && (
          <div className="space-y-3 text-sm">
            <p>
              This permanently deletes{" "}
              <strong className="tabular-nums">
                {backup.preview.willDelete}
              </strong>{" "}
              existing mocks in this account and imports{" "}
              <strong className="tabular-nums">
                {backup.preview.importable}
              </strong>{" "}
              mocks from the backup.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Settings:{" "}
              {backup.applyTarget && backup.preview.settings.available
                ? backup.preview.settings.changed
                  ? "apply the backup's exam scope and targets"
                  : "same as the current scope"
                : "keep the current exam scope and targets"}
              .{" "}
              {backup.safetyDownloaded
                ? "A safety backup was downloaded."
                : "Download a safety backup first."}
            </p>
            <Alert tone="danger" title="Keep the downloaded safety backup until you have verified the imported data.">
              This cannot be undone from the app. Your Trash is not affected.
            </Alert>
          </div>
        )}
      </Dialog>
    </>
  );
}
