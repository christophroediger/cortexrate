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
          display: "grid",
          gap: 6
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, color: "#fafafa" }}>What people are hearing</h2>
        <p style={{ margin: "8px 0 0", color: "#fafafa", fontWeight: 600 }}>No ratings yet</p>
        <p style={{ margin: 0, color: "#a1a1aa" }}>Be the first to rate this item.</p>
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gap: 16
      }}
    >
      <h2 style={{ margin: 0, fontSize: 24, color: "#fafafa" }}>What people are hearing</h2>
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
              <p style={{ margin: 0, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em" }}>
                {renderStars(review.rating)}
              </p>
              <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14 }}>
                {formatReviewDate(review.created_at)}
              </p>
            </div>
            <p style={{ margin: 0, color: "rgba(250, 250, 250, 0.9)", lineHeight: 1.6 }}>
              {review.review_text?.trim() ? review.review_text : "No note added."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
