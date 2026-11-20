import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { SessionError } from "@/lib/auth/session-policy";
import { SettingsRoute } from "./_settings/settings-route";

export const dynamic = "force-dynamic";

/**
 * `/settings` — the account workspace.
 *
 * No data prefetch: every panel reads the shared exam/settings payload through
 * its own query (`useExamScope`), which the layout has already mounted, so the
 * panels hydrate from that cache rather than a second server read.
 */
export default async function SettingsPage() {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof SessionError && error.status === 401) redirect("/");
    redirect("/?error=unavailable");
  }
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
      <SettingsRoute
        userName={user.name ?? ""}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
