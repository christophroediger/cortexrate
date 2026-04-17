import "server-only";

import type { GetCanonicalItemReviewsResponse } from "@/types/api";
import type { PublicReview, RatingSummary, Review } from "@/types/domain";
import { listAuthAdminUsersByIds } from "@/server/repositories/auth-admin-users";
import { supabaseRest } from "@/server/db/rest";

type ActiveReviewRow = {
  rating: number;
};

type ReviewRow = {
  id: string;
  canonical_item_id: string;
  author_user_id: string;
  rating: number;
  review_text: string | null;
  state: "active" | "flagged" | "hidden";
  created_at: string;
  updated_at: string;
};

type UpsertReviewInput = {
  canonicalItemId: string;
  userId: string;
  rating: number;
  reviewText?: string;
};

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    canonical_item_id: row.canonical_item_id,
    user_id: row.author_user_id,
    rating: row.rating,
    review_text: row.review_text,
    state: row.state,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapPublicReview(row: ReviewRow, displayName: string | null): PublicReview {
  return {
    id: row.id,
    rating: row.rating,
    review_text: row.review_text,
    state: "active",
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: {
      id: row.author_user_id,
      display_name: displayName
    }
  };
}

export async function getActiveRatingSummary(canonicalItemId: string): Promise<RatingSummary> {
  const rows = await supabaseRest<ActiveReviewRow[]>(
    `reviews?select=rating&canonical_item_id=eq.${encodeURIComponent(canonicalItemId)}&state=eq.active`
  );

  if (!rows.length) {
    return {
      average_rating: null,
      review_count: 0
    };
  }

  const total = rows.reduce((sum, row) => sum + row.rating, 0);

  return {
    average_rating: Number((total / rows.length).toFixed(2)),
    review_count: rows.length
  };
}

export async function findReviewByCanonicalItemAndUser(
  canonicalItemId: string,
  userId: string
): Promise<Review | null> {
  const rows = await supabaseRest<ReviewRow[]>(
    `reviews?select=id,canonical_item_id,author_user_id,rating,review_text,state,created_at,updated_at&canonical_item_id=eq.${encodeURIComponent(
      canonicalItemId
    )}&author_user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );

  if (!rows.length) {
    return null;
  }

  return mapReviewRow(rows[0]);
}

export async function createReview(input: UpsertReviewInput): Promise<Review> {
  const rows = await supabaseRest<ReviewRow[]>(
    "reviews?select=id,canonical_item_id,author_user_id,rating,review_text,state,created_at,updated_at",
    {
      method: "POST",
      body: JSON.stringify([
        {
          canonical_item_id: input.canonicalItemId,
          author_user_id: input.userId,
          rating: input.rating,
          review_text: input.reviewText ?? null
        }
      ])
    }
  );

  return mapReviewRow(rows[0]);
}

export async function updateReview(
  reviewId: string,
  userId: string,
  rating: number,
  reviewText?: string
): Promise<Review> {
  const rows = await supabaseRest<ReviewRow[]>(
    `reviews?id=eq.${encodeURIComponent(reviewId)}&author_user_id=eq.${encodeURIComponent(
      userId
    )}&select=id,canonical_item_id,author_user_id,rating,review_text,state,created_at,updated_at`,
    {
      method: "PATCH",
      body: JSON.stringify({
        rating,
        review_text: reviewText ?? null,
        updated_at: new Date().toISOString()
      })
    }
  );

  return mapReviewRow(rows[0]);
}

async function getUserDisplayNames(userIds: string[]): Promise<Map<string, string | null>> {
  if (!userIds.length) {
    return new Map<string, string | null>();
  }

  try {
    return await listAuthAdminUsersByIds(userIds);
  } catch {
    return new Map(userIds.map((userId) => [userId, null]));
  }
}

export async function listActiveReviewsByCanonicalItem(
  canonicalItemId: string,
  limit: number,
  offset: number
): Promise<GetCanonicalItemReviewsResponse> {
  const rows = await supabaseRest<ReviewRow[]>(
    `reviews?select=id,canonical_item_id,author_user_id,rating,review_text,state,created_at,updated_at&canonical_item_id=eq.${encodeURIComponent(
      canonicalItemId
    )}&state=eq.active&order=created_at.desc,id.desc&limit=${limit + 1}&offset=${offset}`
  );

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const userIds = [...new Set(visibleRows.map((row) => row.author_user_id))];
  const displayNames = await getUserDisplayNames(userIds);

  return {
    reviews: visibleRows.map((row) => mapPublicReview(row, displayNames.get(row.author_user_id) ?? null)),
    pagination: {
      limit,
      offset,
      has_more: hasMore
    }
  };
}
