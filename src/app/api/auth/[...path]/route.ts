import { auth } from "@/lib/auth/server";
import { devAuthBypassActive, devSessionPayload } from "@/lib/auth/dev-bypass";
import { RequestError, readBody, apiError } from "@/lib/api";

export const runtime = "nodejs";
type Context = { params: Promise<{ path: string[] }> };

const privateNoStore = { "Cache-Control": "private, no-store" };

// Local development only: minimal Better Auth-shaped answers so the client
// session hooks work without the managed Neon Auth service. See dev-bypass.ts.
async function devHandle(request: Request, context: Context) {
  const { path } = await context.params;
  const route = path.join("/");
  if (request.method === "GET" && route === "get-session") {
    return Response.json(devSessionPayload(), { headers: privateNoStore });
  }
  if (request.method === "POST" && route === "sign-out") {
    return Response.json({ success: true }, { headers: privateNoStore });
  }
  return Response.json(
    {
      error: {
        code: "AUTH_UNAVAILABLE",
        message: "Not available while running with the local dev bypass.",
      },
    },
    { status: 404, headers: privateNoStore },
  );
}

async function handle(request: Request, context: Context) {
  if (devAuthBypassActive()) return devHandle(request, context);
  try {
    if (request.method !== "GET") {
      // Validate same-origin writes and the streamed size without consuming
      // the request that the Neon SDK forwards upstream.
      await readBody(request.clone());
    }
    const method = request.method as
      "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    const response = await auth().handler()[method](
      method === "GET" ? request : withServiceOrigin(request),
      context,
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    if (error instanceof RequestError) return apiError(error);
    return Response.json(
      {
        error: {
          code: "AUTH_UNAVAILABLE",
          message: "Sign-in is temporarily unavailable. Please retry shortly.",
        },
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

/**
 * Present the proxied auth request to the managed Neon Auth service as
 * coming from the service itself, not from the browser.
 *
 * The service runs better-auth's origin check on every cookie-bearing
 * unsafe request against ITS trustedOrigins — a list that cannot know this
 * deployment's origins, let alone per-branch preview URLs, so any cookieed
 * POST (sign-out, change-password, TOTP enrollment, update-user) fails with
 * 403 INVALID_ORIGIN while cookie-less sign-ins and GET session reads sail
 * through. The browser hop into /api/auth is already same-origin-validated
 * here (readBody above), which is where the CSRF decision belongs; the
 * service keeps its own cookie-signature and session validation. The Neon
 * SDK offers no override for the forwarded Origin (it echoes the browser's
 * via getOrigin), so the header is rewritten on a reconstructed request.
 * GETs skip the check upstream and pass through untouched.
 */
function withServiceOrigin(request: Request): Request {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) return request;
  const headers = new Headers(request.headers);
  headers.set("Origin", new URL(baseUrl).origin);
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    duplex: "half",
    signal: request.signal,
  } as RequestInit);
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
