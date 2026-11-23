/**
 * Pure same-origin policy — no `server-only`, no Next runtime, no clock.
 *
 * CSRF defense in depth: the proxy (edge runtime) and the route layer (Node)
 * must reach the same verdict for the same headers, so the comparison lives
 * here where both can import it and tests can pin it. Dependency-free on
 * purpose, like `middleware-utils.ts`, so the edge bundle stays lean.
 *
 * The `Origin` header is sent by browsers on cross-site fetches and on
 * same-origin non-GET requests. A missing header means a non-browser client
 * (curl, load-balancer probes, address-bar navigation) and passes; an
 * unparsable, non-http(s), or host-mismatched origin fails. Cross-origin
 * requests are denied — never enabled with CORS Allow headers.
 */

export function isSameOrigin(
  originHeader: string | null,
  host: string | null,
): boolean {
  if (!originHeader) return true; // Non-browser clients may omit Origin entirely.
  if (!host) return false;
  let originUrl: URL;
  try {
    originUrl = new URL(originHeader);
  } catch {
    return false;
  }
  if (!["http:", "https:"].includes(originUrl.protocol)) return false;
  return originUrl.host === host;
}

/**
 * Every API response carries this so shared caches never serve an
 * Origin-keyed response to a different origin. Cross-origin traffic is
 * refused upstream; this header only keeps caching honest.
 */
export const VARY_ORIGIN = "Origin";
