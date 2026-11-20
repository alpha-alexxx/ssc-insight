import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrivateWorkspace } from "@/components/private-workspace";
import { WorkspaceShell } from "@/components/workspace-shell";
import { QueryProvider } from "@/components/query-provider";
import { ExamScopeProvider } from "@/components/exam-context";
import { ToastProvider } from "@/components/toast";
import { requireUser } from "@/lib/auth/require-user";
import { SessionError } from "@/lib/auth/session-policy";

export const dynamic = "force-dynamic";

/**
 * Auth gate and provider host for every workspace route.
 *
 * Responsibilities, in order:
 *  1. Authenticate. The proxy guards these paths too; this is the second line
 *     of defense (Server Components and direct handler calls can bypass the
 *     proxy matcher).
 *  2. Mount the providers that must outlive a route change: the TanStack cache
 *     (which dies with the session), the exam scope, and toasts.
 *  3. Render the chrome once and pass the routed page through as `children`.
 *
 * The providers used to live inside `WorkspaceShell`, which also discarded
 * `children` and rendered every view itself. Mounting them here instead means a
 * route page is a real Server Component that can prefetch and hydrate its own
 * data, while the sidebar and the AI drawer stay mounted across navigation
 * (the layout is not re-rendered when only the page segment changes).
 */
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof SessionError && error.status === 401) redirect("/");
    redirect("/?error=unavailable");
  }
  const defaultSidebarOpen =
    (await cookies()).get("sidebar_state")?.value !== "false";
  return (
    <PrivateWorkspace key={user.id} userId={user.id}>
      <QueryProvider>
        <ExamScopeProvider>
          <ToastProvider>
            <WorkspaceShell
              defaultSidebarOpen={defaultSidebarOpen}
              authEnabled={process.env.GOOGLE_AUTH_ENABLED === "true"}
              userEmail={user.email ?? ""}
              userName={user.name ?? ""}
              userImage={user.image ?? ""}
            >
              {children}
            </WorkspaceShell>
          </ToastProvider>
        </ExamScopeProvider>
      </QueryProvider>
    </PrivateWorkspace>
  );
}
