import {
  generationPathFor,
  modelsPathFor,
  type AiAuthMode,
  type AiProtocol,
} from "./protocols";

type CredentialTarget = {
  provider: string;
  baseUrl: string;
  protocol?: AiProtocol;
  authMode?: AiAuthMode;
  generationPath?: string | null;
  modelsPath?: string | null;
};

function canonicalTarget(value: CredentialTarget) {
  // Missing fields identify a legacy row/client and therefore use the old
  // Chat Completions + Bearer target, not a preset's new-user default.
  const protocol = value.protocol ?? "openai-chat";
  return {
    provider: value.provider,
    baseUrl: value.baseUrl.trim().replace(/\/+$/, ""),
    protocol,
    authMode: value.authMode ?? "bearer",
    generationPath:
      value.generationPath?.trim().replace(/^\/+|\/+$/g, "") ||
      generationPathFor(protocol),
    modelsPath:
      value.modelsPath === null
        ? null
        : value.modelsPath?.trim().replace(/^\/+|\/+$/g, "") ||
          modelsPathFor(protocol),
  };
}

/** Never forward a saved key to a newly selected provider or endpoint. */
export function sameCredentialTarget(
  a: CredentialTarget,
  b: CredentialTarget,
): boolean {
  const left = canonicalTarget(a);
  const right = canonicalTarget(b);
  return (
    left.provider === right.provider &&
    left.baseUrl === right.baseUrl &&
    left.protocol === right.protocol &&
    left.authMode === right.authMode &&
    left.generationPath === right.generationPath &&
    left.modelsPath === right.modelsPath
  );
}
