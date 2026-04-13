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
          backgroundColor: "#fcfcfb",
          padding: "56px 20px"
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "grid",
            gap: 28
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
                borderTop: "1px solid #e5e7eb",
                paddingTop: 24
              }}
            >
              <h2 style={{ margin: 0, fontSize: 24, color: "#111827" }}>
                How does it sound to you?
              </h2>
              <p style={{ margin: "12px 0 0", color: "#6b7280" }}>
                Sign in to leave a rating and a short note.
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
