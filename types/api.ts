import type {
  CanonicalItem,
  ItemType,
  ObservedIdentity,
  PublicReview,
  RatingSummary,
  ResolutionStatus,
  Review
} from "@/types/domain";

export type ResolveIdentityRequest = {
  type: ItemType;
  title: string;
  creator: string;
  source?: {
    url?: string;
    source_item_key?: string | null;
  };
};

export type ResolveIdentityResponse = {
  observed_identity: ObservedIdentity;
  canonical_item: CanonicalItem | null;
  rating_summary: RatingSummary | null;
  resolution: {
    status: ResolutionStatus;
  };
};

export type PromoteCanonicalItemRequest = {
  observed_identity_id: string;
};

export type PromoteCanonicalItemResponse = {
  canonical_item: CanonicalItem;
  linked_observed_identity: {
    id: string;
    canonical_item_id: string;
  };
};

export type UpsertReviewRequest = {
  rating: number;
  review_text?: string;
};

export type UpsertReviewResponse = {
  review: Review;
  rating_summary: RatingSummary;
};

export type GetCanonicalItemResponse = {
  canonical_item: CanonicalItem;
  rating_summary: RatingSummary;
};

export type GetCanonicalItemReviewsResponse = {
  reviews: PublicReview[];
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
};
