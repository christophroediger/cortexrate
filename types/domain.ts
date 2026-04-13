export type ItemType = "capture" | "preset";

export type ResolutionStatus = "linked" | "unresolved" | "created_unresolved";

export type CanonicalItem = {
  id: string;
  type: ItemType;
  preferred_title: string | null;
  preferred_creator: string | null;
};

export type ObservedIdentity = {
  id: string;
  type: ItemType;
  title: string;
  creator: string;
};

export type RatingSummary = {
  average_rating: number | null;
  review_count: number;
};

export type Review = {
  id: string;
  canonical_item_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  state: "active" | "flagged" | "hidden";
  created_at: string;
  updated_at: string;
};

export type PublicReview = {
  id: string;
  rating: number;
  review_text: string | null;
  state: "active";
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    display_name: string | null;
  };
};
