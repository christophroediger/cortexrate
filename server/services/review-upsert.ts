import "server-only";

import { ApiError } from "@/lib/api-error";
import { findCanonicalItemById } from "@/server/repositories/canonical-items";
import {
  createReview,
  findReviewByCanonicalItemAndUser,
  getActiveRatingSummary,
  updateReview
} from "@/server/repositories/reviews";
import type { UpsertReviewResponse } from "@/types/api";

type UpsertReviewInput = {
  canonicalItemId: string;
  userId: string;
  rating: number;
  reviewText?: string;
};

export async function upsertReview(input: UpsertReviewInput): Promise<UpsertReviewResponse> {
  const canonicalItem = await findCanonicalItemById(input.canonicalItemId);

  if (!canonicalItem) {
    throw new ApiError(404, "NOT_FOUND", "Canonical item was not found.");
  }

  const existingReview = await findReviewByCanonicalItemAndUser(input.canonicalItemId, input.userId);

  const review = existingReview
    ? await updateReview(existingReview.id, input.userId, input.rating, input.reviewText)
    : await createReview({
        canonicalItemId: input.canonicalItemId,
        userId: input.userId,
        rating: input.rating,
        reviewText: input.reviewText
      });

  const ratingSummary = await getActiveRatingSummary(input.canonicalItemId);

  return {
    review,
    rating_summary: ratingSummary
  };
}
