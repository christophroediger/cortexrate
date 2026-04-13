import "server-only";

import { ApiError } from "@/lib/api-error";
import { findObservedIdentityById } from "@/server/repositories/observed-identities";
import { promoteObservedIdentityToCanonical } from "@/server/repositories/canonical-items";
import type { PromoteCanonicalItemResponse } from "@/types/api";

type PromoteCanonicalItemInput = {
  observedIdentityId: string;
  actorUserId: string;
};

export type PromoteCanonicalItemResult = {
  response: PromoteCanonicalItemResponse;
  wasCreated: boolean;
};

export async function ensureCanonicalItemForObservedIdentity(observedIdentityId: string) {
  const observedIdentity = await findObservedIdentityById(observedIdentityId);

  if (!observedIdentity) {
    throw new ApiError(404, "NOT_FOUND", "Observed identity was not found.");
  }

  if (observedIdentity.canonicalItem) {
    return {
      canonicalItem: observedIdentity.canonicalItem,
      linkedObservedIdentity: {
        id: observedIdentity.id,
        canonical_item_id: observedIdentity.canonicalItem.id
      }
    };
  }

  const promotionResult = await promoteObservedIdentityToCanonical(observedIdentityId);

  if (!promotionResult) {
    throw new ApiError(500, "INTERNAL_ERROR", "Canonical promotion did not return a result.");
  }

  return promotionResult;
}

export async function promoteCanonicalItem(
  input: PromoteCanonicalItemInput
): Promise<PromoteCanonicalItemResult> {
  if (!input.actorUserId) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required for this endpoint.");
  }

  const observedIdentity = await findObservedIdentityById(input.observedIdentityId);

  if (!observedIdentity) {
    throw new ApiError(404, "NOT_FOUND", "Observed identity was not found.");
  }

  const promotionResult = await promoteObservedIdentityToCanonical(input.observedIdentityId);

  if (!promotionResult) {
    throw new ApiError(500, "INTERNAL_ERROR", "Canonical promotion did not return a result.");
  }

  return {
    response: {
      canonical_item: promotionResult.canonicalItem,
      linked_observed_identity: promotionResult.linkedObservedIdentity
    },
    wasCreated: !observedIdentity.canonicalItem
  };
}
