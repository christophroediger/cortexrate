import "server-only";

import { ApiError } from "@/lib/api-error";
import { cleanObservedValue, normalizeIdentityValue } from "@/lib/normalization";
import {
  createUnresolvedObservedIdentity,
  findExactKnownObservedIdentityMatch
} from "@/server/repositories/observed-identities";
import { getActiveRatingSummary } from "@/server/repositories/reviews";
import type { ResolveIdentityRequest, ResolveIdentityResponse } from "@/types/api";

function validateObservedValue(label: string, value: string) {
  const cleanedValue = cleanObservedValue(value);

  if (!cleanedValue) {
    throw new ApiError(400, "BAD_REQUEST", `${label} is required.`);
  }

  return cleanedValue;
}

export async function resolveIdentity(input: ResolveIdentityRequest): Promise<ResolveIdentityResponse> {
  const observedTitle = validateObservedValue("title", input.title);
  const observedCreator = validateObservedValue("creator", input.creator);
  const normalizedTitle = normalizeIdentityValue(observedTitle);
  const normalizedCreator = normalizeIdentityValue(observedCreator);

  const exactMatch = await findExactKnownObservedIdentityMatch({
    type: input.type,
    normalizedTitle,
    normalizedCreator
  });

  if (exactMatch) {
    return {
      observed_identity: {
        id: exactMatch.id,
        type: exactMatch.type,
        title: exactMatch.observedTitle,
        creator: exactMatch.observedCreator
      },
      canonical_item: exactMatch.canonicalItem,
      rating_summary: exactMatch.canonicalItem
        ? await getActiveRatingSummary(exactMatch.canonicalItem.id)
        : null,
      resolution: {
        status: exactMatch.canonicalItem ? "linked" : "unresolved"
      }
    };
  }

  const createdObservedIdentity = await createUnresolvedObservedIdentity({
    type: input.type,
    observedTitle,
    observedCreator,
    normalizedTitle,
    normalizedCreator,
    sourceUrl: input.source?.url,
    sourceItemKey: input.source?.source_item_key ?? null
  });

  return {
    observed_identity: {
      id: createdObservedIdentity.id,
      type: createdObservedIdentity.type,
      title: createdObservedIdentity.observedTitle,
      creator: createdObservedIdentity.observedCreator
    },
    canonical_item: null,
    rating_summary: null,
    resolution: {
      status: "created_unresolved"
    }
  };
}
