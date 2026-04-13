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
          margin: 0,
          background:
            "radial-gradient(circle at top, rgba(82, 82, 91, 0.16), transparent 36%), #09090b",
          padding: "32px 20px 40px",
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
      >
        <div
          style={{
            maxWidth: 740,
            margin: "0 auto",
            borderRadius: 24,
            padding: "24px 22px 26px",
            background:
              "linear-gradient(180deg, rgba(39, 39, 42, 0.92), rgba(24, 24, 27, 0.94))",
            border: "1px solid rgba(244, 244, 245, 0.07)",
            boxShadow:
              "0 18px 50px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(14px)",
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
                display: "grid",
                gap: 8
              }}
            >
              <h2 style={{ margin: 0, fontSize: 22, color: "#fafafa", fontWeight: 700 }}>
                How does it sound?
              </h2>
              <p style={{ margin: 0, color: "#a1a1aa", lineHeight: 1.5, fontSize: 15 }}>
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
