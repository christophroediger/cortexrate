import { z } from "zod";

import { ApiError } from "@/lib/api-error";
import { findObservedIdentityById } from "@/server/repositories/observed-identities";

const observedIdentityIdSchema = z.string().uuid();

export async function getObservedIdentityForClaim(observedIdentityId: string) {
  const parsedId = observedIdentityIdSchema.safeParse(observedIdentityId);

  if (!parsedId.success) {
    throw new ApiError(404, "NOT_FOUND", "Observed identity could not be found.");
  }

  const observedIdentity = await findObservedIdentityById(parsedId.data);

  if (!observedIdentity) {
    throw new ApiError(404, "NOT_FOUND", "Observed identity could not be found.");
  }

  return observedIdentity;
}
