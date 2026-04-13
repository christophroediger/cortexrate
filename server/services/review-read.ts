import "server-only";

import { ApiError } from "@/lib/api-error";
import { findCanonicalItemById } from "@/server/repositories/canonical-items";
import { listActiveReviewsByCanonicalItem } from "@/server/repositories/reviews";
import type { GetCanonicalItemReviewsResponse } from "@/types/api";

type GetCanonicalItemReviewsInput = {
  canonicalItemId: string;
  limit: number;
  offset: number;
};

export async function getCanonicalItemReviews(
  input: GetCanonicalItemReviewsInput
): Promise<GetCanonicalItemReviewsResponse> {
  const canonicalItem = await findCanonicalItemById(input.canonicalItemId);

  if (!canonicalItem) {
    throw new ApiError(404, "NOT_FOUND", "Canonical item was not found.");
  }

  return listActiveReviewsByCanonicalItem(input.canonicalItemId, input.limit, input.offset);
}
