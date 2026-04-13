import { notFound } from "next/navigation";

import { ItemDetail } from "@/components/item/item-detail";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { ApiError } from "@/lib/api-error";
import { getAuthContext } from "@/lib/auth";
import { getCanonicalItem } from "@/server/services/item-read";
import { getCanonicalItemReviews } from "@/server/services/review-read";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ItemPageProps = {
  params: Promise<{
    canonicalItemId: string;
  }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { canonicalItemId } = await params;

  try {
    const [authContext, itemResponse, reviewsResponse] = await Promise.all([
      getAuthContext(),
      getCanonicalItem(canonicalItemId),
      getCanonicalItemReviews({
        canonicalItemId,
        limit: 20,
        offset: 0
      })
    ]);

    const currentUserReview = authContext
      ? reviewsResponse.reviews.find((review) => review.user.id === authContext.userId)
      : null;

    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f4f4f5",
          padding: "48px 20px"
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gap: 24
          }}
        >
          <ItemDetail
            canonicalItem={itemResponse.canonical_item}
            ratingSummary={itemResponse.rating_summary}
          />

          {authContext ? (
            <ReviewForm
              canonicalItemId={canonicalItemId}
              initialRating={currentUserReview?.rating ?? 5}
              initialReviewText={currentUserReview?.review_text ?? ""}
            />
          ) : (
            <section
              style={{
                border: "1px solid #d4d4d8",
                borderRadius: 12,
                padding: 24,
                backgroundColor: "#ffffff"
              }}
            >
              <h2 style={{ marginTop: 0 }}>Your Review</h2>
              <p style={{ marginBottom: 0, color: "#52525b" }}>
                Sign in to create or edit your review.
              </p>
            </section>
          )}

          <ReviewList reviews={reviewsResponse.reviews} />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
