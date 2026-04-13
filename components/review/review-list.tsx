import type { PublicReview } from "@/types/domain";

type ReviewListProps = {
  reviews: PublicReview[];
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <section
        style={{
          border: "1px solid #d4d4d8",
          borderRadius: 12,
          padding: 24,
          backgroundColor: "#ffffff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Reviews</h2>
        <p style={{ marginBottom: 0, color: "#52525b" }}>No active reviews yet.</p>
      </section>
    );
  }

  return (
    <section
      style={{
        border: "1px solid #d4d4d8",
        borderRadius: 12,
        padding: 24,
        backgroundColor: "#ffffff"
      }}
    >
      <h2 style={{ marginTop: 0 }}>Reviews</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {reviews.map((review) => (
          <article
            key={review.id}
            style={{
              paddingTop: 16,
              borderTop: "1px solid #e4e4e7"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap"
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {review.user.display_name ?? "Anonymous"}
                </p>
                <p style={{ margin: "4px 0 0", color: "#71717a", fontSize: 14 }}>
                  {formatReviewDate(review.created_at)}
                </p>
              </div>
              <p style={{ margin: 0, fontWeight: 600 }}>{review.rating} / 5</p>
            </div>
            <p style={{ margin: "12px 0 0", color: "#27272a" }}>
              {review.review_text?.trim() ? review.review_text : "No written review provided."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
