import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrivateWorkspace } from "@/components/private-workspace";
import { WorkspaceChrome } from "@/components/workspace-chrome";
import { QueryProvider } from "@/components/query-provider";
import { ExamScopeProvider } from "@/components/exam-context";
import { ToastProvider } from "@/components/toast";
import { AiWorkspaceProvider } from "@/components/use-ai-workspace";
import { requireUser } from "@/lib/auth/require-user";
import { SessionError } from "@/lib/auth/session-policy";

export const dynamic = "force-dynamic";

/**
 * Auth gate and chrome host for every workspace route.
 *
 *  1. Authenticate. The proxy guards these paths too; this is the second line
 *     of defense (Server Components and direct handler calls can bypass the
 *     proxy matcher).
 *  2. Mount the providers that must outlive a route change: the TanStack cache
 *     (which dies with the session), the exam scope, and toasts.
 *  3. Render the chrome once — sidebar, header, palette, AI drawer — and pass
 *     the routed page through as `children`.
 *
 * The layout does not re-render when only the page segment changes, which is
 * what keeps the sidebar mounted and the AI drawer's transcript alive while
 * /dashboard becomes /history.
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
    if (error instanceof SessionError && error.status === 401) redirect("/sign-in");
    redirect("/sign-in?error=unavailable");
  }
  const defaultSidebarOpen =
    (await cookies()).get("sidebar_state")?.value !== "false";
  return (
    <PrivateWorkspace key={user.id} userId={user.id}>
      <QueryProvider>
        <ExamScopeProvider>
          <ToastProvider>
            <AiWorkspaceProvider>
              <WorkspaceChrome
                defaultSidebarOpen={defaultSidebarOpen}
                userEmail={user.email ?? ""}
                userName={user.name ?? ""}
                userImage={user.image ?? ""}
              >
                {children}
              </WorkspaceChrome>
            </AiWorkspaceProvider>
          </ToastProvider>
        </ExamScopeProvider>
      </QueryProvider>
    </PrivateWorkspace>
  );
}
