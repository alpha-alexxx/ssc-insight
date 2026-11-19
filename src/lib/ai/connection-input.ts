import { z } from "zod";
import {
  AI_AUTH_MODES,
  AI_PROTOCOLS,
  canonicalizeAiEndpoint,
  generationPathFor,
  modelsPathFor,
  normaliseProviderPath,
  type AiAuthMode,
  type AiProtocol,
} from "./protocols";
import { PROVIDER_IDS, providerPreset } from "./providers";

function relativePath(value: string | null | undefined) {
  if (value == null || value.trim() === "") return true;
  try {
    normaliseProviderPath(value);
    return true;
  } catch {
    return false;
  }
}

const connectionFields = {
  provider: z.string().refine((value) => PROVIDER_IDS.has(value), {
    message: "Choose a supported provider.",
  }),
  protocol: z.enum(AI_PROTOCOLS).optional(),
  authMode: z.enum(AI_AUTH_MODES).optional(),
  baseUrl: z.string().trim().min(1).max(300),
  generationPath: z
    .string()
    .trim()
    .max(200)
    .refine(relativePath, "Enter a relative generation path.")
    .optional(),
  modelsPath: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .refine(relativePath, "Enter a relative models path, or leave it blank.")
    .optional(),
  apiKey: z.string().trim().max(400).optional(),
  jsonMode: z.boolean().optional(),
  allowHttp: z.boolean().optional(),
  allowPrivate: z.boolean().optional(),
};

type RawConnection = z.infer<z.ZodObject<typeof connectionFields>>;

type NormalisedConnection = Omit<
  RawConnection,
  "protocol" | "authMode" | "generationPath" | "modelsPath"
> & {
  protocol: AiProtocol;
  authMode: AiAuthMode;
  generationPath: string;
  modelsPath: string | null;
  jsonMode: boolean;
  allowHttp: boolean;
  allowPrivate: boolean;
};

/**
 * Missing protocol fields mean a legacy web client or credential payload, so
 * they intentionally retain the old OpenAI-compatible Chat Completions shape.
 * New clients always submit their selected protocol explicitly.
 */
export function normaliseAiConnectionInput(
  input: RawConnection,
): NormalisedConnection {
  const protocol = input.protocol ?? "openai-chat";
  const endpoint = input.generationPath
    ? {
        baseUrl: input.baseUrl.trim().replace(/\/+$/, ""),
        generationPath: normaliseProviderPath(input.generationPath),
      }
    : canonicalizeAiEndpoint(input.baseUrl, protocol);
  const modelsPath =
    input.modelsPath === null || input.modelsPath?.trim() === ""
      ? null
      : normaliseProviderPath(input.modelsPath ?? modelsPathFor(protocol));
  return {
    ...input,
    baseUrl: endpoint.baseUrl,
    protocol,
    // Legacy payloads always used Bearer auth, including secured local proxies.
    authMode: input.authMode ?? "bearer",
    generationPath:
      endpoint.generationPath || generationPathFor(protocol),
    modelsPath,
    jsonMode: input.jsonMode ?? true,
    allowHttp: input.allowHttp ?? false,
    allowPrivate: input.allowPrivate ?? false,
  };
}

function connectionPolicy(
  value: RawConnection,
  ctx: z.RefinementCtx,
) {
  const preset = providerPreset(value.provider);
  const local = preset?.local === true;
  if ((value.allowPrivate || value.allowHttp) && !local) {
    ctx.addIssue({
      code: "custom",
      message: "Local access is only available for a local provider.",
    });
  }
  if (local && !value.allowPrivate) {
    ctx.addIssue({
      code: "custom",
      message: "A local provider requires the local-access option.",
    });
  }
  if (
    value.protocol &&
    value.provider !== "custom" &&
    preset &&
    !preset.protocols.includes(value.protocol)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["protocol"],
      message: "This provider does not offer the selected API format.",
    });
  }
}

const rawConnectionSchema = z.object(connectionFields);

/** Shared by draft tests, model discovery and saved settings. */
export const aiConnectionSchema = rawConnectionSchema
  .superRefine(connectionPolicy)
  .transform(normaliseAiConnectionInput);

export const aiCredentialSchema = rawConnectionSchema
  .extend({
    model: z.string().trim().min(1, "Choose a model or enter its ID.").max(120),
  })
  .superRefine(connectionPolicy)
  .transform((value) => ({
    ...normaliseAiConnectionInput(value),
    model: value.model,
  }));

export type AiConnectionInput = z.output<typeof aiConnectionSchema>;
export type AiCredentialInput = z.output<typeof aiCredentialSchema>;
