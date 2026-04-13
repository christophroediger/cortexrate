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

function formatItemType(type: CanonicalItem["type"]) {
  return type === "preset" ? "Preset" : "Capture";
}

function renderStars(averageRating: number | null) {
  if (averageRating === null) {
    return "☆☆☆☆☆";
  }

  const filledStars = Math.round(averageRating);
  return "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
}

export function ItemDetail({ canonicalItem, ratingSummary }: ItemDetailProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: 20
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "#6b7280"
          }}
        >
          {formatItemType(canonicalItem.type)}
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 42,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: "#111827"
          }}
        >
          {canonicalItem.preferred_title ?? "Untitled item"}
        </h1>
        <p
          style={{
            margin: 0,
            color: "#4b5563",
            fontSize: 18,
            lineHeight: 1.4
          }}
        >
          by {canonicalItem.preferred_creator ?? "Unknown creator"}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 6
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 26,
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: "#f59e0b"
          }}
        >
          {renderStars(ratingSummary.average_rating)}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <p
            style={{
              margin: 0,
              color: "#111827",
              fontSize: 18,
              fontWeight: 600
            }}
          >
            {formatAverageRating(ratingSummary.average_rating)}
          </p>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: 15
            }}
          >
            {ratingSummary.review_count}{" "}
            {ratingSummary.review_count === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: "#e5e7eb"
        }}
      />
    </section>
  );
}
