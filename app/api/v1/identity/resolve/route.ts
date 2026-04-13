import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { created, errorFromUnknown, ok } from "@/lib/api-response";
import { getExtensionCorsHeaders, withCors } from "@/lib/cors";
import { resolveIdentity } from "@/server/services/identity-resolution";

const resolveIdentityRequestSchema = z.object({
  type: z.enum(["capture", "preset"]),
  title: z.string(),
  creator: z.string(),
  source: z
    .object({
      url: z.string().url().optional(),
      source_item_key: z.string().nullable().optional()
    })
    .optional()
});

const ALLOWED_METHODS = ["POST", "OPTIONS"];

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: getExtensionCorsHeaders(ALLOWED_METHODS)
  });
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const parsedBody = resolveIdentityRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid identity resolve request.");
    }

    const result = await resolveIdentity(parsedBody.data);

    if (result.resolution.status === "created_unresolved") {
      return withCors(created(result), ALLOWED_METHODS);
    }

    return withCors(ok(result), ALLOWED_METHODS);
  } catch (error) {
    return withCors(errorFromUnknown(error), ALLOWED_METHODS);
  }
}
