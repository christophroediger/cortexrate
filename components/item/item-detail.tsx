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
        gap: 14
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "grid", gap: 8, minWidth: 260, flex: "1 1 320px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(244, 244, 245, 0.52)"
            }}
          >
            {formatItemType(canonicalItem.type)}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#fafafa"
            }}
          >
            {canonicalItem.preferred_title ?? "Untitled item"}
          </h1>
          <p
            style={{
              margin: 0,
              color: "rgba(244, 244, 245, 0.72)",
              fontSize: 17,
              lineHeight: 1.35,
              fontWeight: 500
            }}
          >
            by {canonicalItem.preferred_creator ?? "Unknown creator"}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 6,
            justifyItems: "end",
            alignSelf: "center",
            minWidth: 190
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 38,
              letterSpacing: "0.1em",
              fontWeight: 700,
              color: "#f59e0b",
              lineHeight: 1
            }}
          >
            {renderStars(ratingSummary.average_rating)}
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#e4e4e7",
                fontSize: 15,
                fontWeight: 600
              }}
            >
              {formatAverageRating(ratingSummary.average_rating)}
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(244, 244, 245, 0.5)",
                fontSize: 14
              }}
            >
              {ratingSummary.review_count}{" "}
              {ratingSummary.review_count === 1 ? "rating" : "ratings"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
