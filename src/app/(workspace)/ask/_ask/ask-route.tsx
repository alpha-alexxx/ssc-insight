"use client";
import { AskViewHairline } from "./ask-view-hairline";

/**
 * Client shell for `/ask`.
 *
 * The conversation is the workspace's single AI state (AiWorkspaceProvider,
 * mounted by the layout), so the transcript survives navigation. The account's
 * first name rides through for the greeting.
 */
export function AskRoute({ firstName }: { firstName?: string }) {
  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <AskViewHairline firstName={firstName} />
    </div>
  );
}
