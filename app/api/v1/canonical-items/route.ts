import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { created, errorFromUnknown, ok } from "@/lib/api-response";
import { requireAuthContext } from "@/lib/auth";
import { promoteCanonicalItem } from "@/server/services/canonical-promotion";

const promoteCanonicalItemRequestSchema = z.object({
  observed_identity_id: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const authContext = await requireAuthContext();
    const requestBody = await request.json();
    const parsedBody = promoteCanonicalItemRequestSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid canonical promotion request.");
    }

    const result = await promoteCanonicalItem({
      observedIdentityId: parsedBody.data.observed_identity_id,
      actorUserId: authContext.userId
    });

    if (result.wasCreated) {
      return created(result.response);
    }

    return ok(result.response);
  } catch (error) {
    return errorFromUnknown(error);
  }
}
