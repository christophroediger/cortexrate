import type { CanonicalItem, RatingSummary } from "@/types/domain";

type ItemDetailProps = {
  canonicalItem: CanonicalItem;
  ratingSummary: RatingSummary;
};

function formatAverageRating(averageRating: number | null) {
  if (averageRating === null) {
    return "No ratings yet";
  }

  return `${averageRating.toFixed(2)} / 5`;
}

export function ItemDetail({ canonicalItem, ratingSummary }: ItemDetailProps) {
  return (
    <section
      style={{
        border: "1px solid #d4d4d8",
        borderRadius: 12,
        padding: 24,
        backgroundColor: "#ffffff"
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#71717a"
        }}
      >
        {canonicalItem.type}
      </p>
      <h1
        style={{
          margin: "8px 0 4px",
          fontSize: 32,
          lineHeight: 1.1
        }}
      >
        {canonicalItem.preferred_title ?? "Untitled Item"}
      </h1>
      <p
        style={{
          margin: 0,
          color: "#3f3f46",
          fontSize: 16
        }}
      >
        by {canonicalItem.preferred_creator ?? "Unknown creator"}
      </p>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            backgroundColor: "#f4f4f5"
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "#71717a", textTransform: "uppercase" }}>
            Average Rating
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 600 }}>
            {formatAverageRating(ratingSummary.average_rating)}
          </p>
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            backgroundColor: "#f4f4f5"
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "#71717a", textTransform: "uppercase" }}>
            Reviews
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 600 }}>
            {ratingSummary.review_count}
          </p>
        </div>
      </div>
    </section>
  );
}
