import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { SessionError } from "@/lib/auth/session-policy";
import { SettingsRoute } from "./_settings/settings-route";
import { resolveSettingsSection } from "./_settings/sections";

export const dynamic = "force-dynamic";

/**
 * `/settings` — the account workspace.
 *
 * No data prefetch: every panel reads the shared exam/settings payload through
 * its own query (`useExamScope`), which the layout has already mounted, so the
 * panels hydrate from that cache rather than a second server read.
 *
 * The requested section is resolved HERE, from the request's own query string,
 * and handed to the client as a prop. The view used to read
 * `window.location.search` in a `useState` initializer, which the server cannot
 * see: the server painted the default tab and the client hydrated the real one,
 * and React reported a hydration mismatch on every `?section=` deep link.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof SessionError && error.status === 401) redirect("/");
    redirect("/?error=unavailable");
  }
  const { section } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <SettingsRoute
        userName={user.name ?? ""}
        userEmail={user.email ?? ""}
        initialSection={resolveSettingsSection(section)}
      />
    </div>
  );
}
