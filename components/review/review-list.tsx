import type { PublicReview } from "@/types/domain";

type ReviewListProps = {
  reviews: PublicReview[];
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <section
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: 24
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, color: "#111827" }}>What people are hearing</h2>
        <p style={{ margin: "12px 0 4px", color: "#111827", fontWeight: 600 }}>No ratings yet</p>
        <p style={{ margin: 0, color: "#6b7280" }}>Be the first to rate this item.</p>
      </section>
    );
  }

  return (
    <section
      style={{
        borderTop: "1px solid #e5e7eb",
        paddingTop: 24
      }}
    >
      <h2 style={{ margin: 0, fontSize: 24, color: "#111827" }}>What people are hearing</h2>
      <div style={{ display: "grid", gap: 20, marginTop: 18 }}>
        {reviews.map((review) => (
          <article
            key={review.id}
            style={{
              display: "grid",
              gap: 8
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "space-between"
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em" }}>
                {renderStars(review.rating)}
              </p>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                {formatReviewDate(review.created_at)}
              </p>
            </div>
            <p style={{ margin: 0, color: "#111827", lineHeight: 1.6 }}>
              {review.review_text?.trim() ? review.review_text : "No note added."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
