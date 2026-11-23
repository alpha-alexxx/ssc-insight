"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import type { GroupWithCount } from "./types";

/**
 * Create, rename, and remove groups in one dialog.
 *
 * Removing a group is a move to Trash, not a delete: the group holds its name
 * for 15 days (that is what makes restoring it conflict-free), its tasks keep
 * their membership, and in the meantime they read as Ungrouped because the
 * group list only shows live groups. The copy says all of that before the
 * action.
 *
 * Hairline rebuild: the overlay is the Hairline Dialog; fields are the
 * Hairline Input.
 */
export function GroupsManagerDialog({
  open,
  onOpenChange,
  groups,
  busy,
  onCreate,
  onRename,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: GroupWithCount[];
  busy: boolean;
  onCreate: (name: string) => Promise<boolean>;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function create() {
    const value = name.trim();
    if (!value) return;
    setError("");
    const ok = await onCreate(value);
    if (ok) setName("");
    else setError("Could not create the group. The name may already exist.");
  }

  async function rename(id: string) {
    const value = renameValue.trim();
    if (!value) return;
    setError("");
    const ok = await onRename(id, value);
    if (ok) setRenaming(null);
    else setError("Could not rename. The name may already exist.");
  }

  async function remove(id: string) {
    setError("");
    const ok = await onDelete(id);
    if (ok) setConfirmingDelete(null);
    else setError("Could not remove the group. Try again.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) {
          onOpenChange(false);
          setRenaming(null);
          setConfirmingDelete(null);
          setError("");
        }
      }}
      title="Groups"
      description="Organize tasks by subject or project. Removing a group keeps its tasks under Ungrouped."
    >
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <Input
          aria-label="New group name"
          placeholder="New group, e.g. Maths revision"
          value={name}
          maxLength={80}
          required
          className="flex-1"
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !name.trim()}>
          Create
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="mt-4 max-h-80 space-y-1 overflow-y-auto border-t border-border pt-3">
        {groups.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No groups yet. Create one above, or from any task&apos;s editor.
          </p>
        )}
        {groups.map((group) =>
          renaming === group.id ? (
            <div key={group.id} className="flex gap-2 py-1">
              <Input
                aria-label={`Rename ${group.name}`}
                value={renameValue}
                maxLength={80}
                autoFocus
                className="flex-1"
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void rename(group.id);
                  }
                }}
                disabled={busy}
              />
              <Button
                size="sm"
                disabled={busy || !renameValue.trim()}
                onClick={() => void rename(group.id)}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRenaming(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div
              key={group.id}
              className="flex items-center gap-2 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {group.name}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {group.count} {group.count === 1 ? "task" : "tasks"}
              </span>
              {confirmingDelete === group.id ? (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() => void remove(group.id)}
                  >
                    Move to Trash
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingDelete(null)}
                  >
                    Keep
                  </Button>
                  <p className="basis-full text-[11px] leading-relaxed text-muted-foreground">
                    Recoverable from Trash for 15 days; restoring it brings
                    its tasks back into the group. Until then they stay
                    ungrouped and are never deleted.
                  </p>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setRenaming(group.id);
                      setRenameValue(group.name);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmingDelete(group.id)}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          ),
        )}
      </div>
    </Dialog>
  );
}
