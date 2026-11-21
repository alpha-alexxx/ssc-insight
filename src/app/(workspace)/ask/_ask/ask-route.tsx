"use client";
import { AskView } from "./ask-view";

/**
 * Client shell for `/ask`. The conversation is the workspace's single AI
 * state (AiWorkspaceProvider, mounted by the layout), so the sheet and this
 * page share one transcript; opening the sheet mid-conversation keeps every
 * turn. The account's first name rides through for the greeting.
 */
export function AskRoute({ firstName }: { firstName?: string }) {
  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <AskView firstName={firstName} />
    </div>
  );
}
