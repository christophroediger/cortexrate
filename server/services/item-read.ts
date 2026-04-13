import "server-only";

import { ApiError } from "@/lib/api-error";
import { findCanonicalItemById } from "@/server/repositories/canonical-items";
import { getActiveRatingSummary } from "@/server/repositories/reviews";
import type { GetCanonicalItemResponse } from "@/types/api";

export async function getCanonicalItem(canonicalItemId: string): Promise<GetCanonicalItemResponse> {
  const canonicalItem = await findCanonicalItemById(canonicalItemId);

  if (!canonicalItem) {
    throw new ApiError(404, "NOT_FOUND", "Canonical item was not found.");
  }

  return {
    canonical_item: canonicalItem,
    rating_summary: await getActiveRatingSummary(canonicalItemId)
  };
}
