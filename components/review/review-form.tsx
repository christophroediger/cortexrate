"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

type ReviewFormProps = {
  canonicalItemId: string;
  initialRating?: number;
  initialReviewText?: string | null;
};

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

function StarButton({
  filled,
  active,
  onClick,
  onMouseEnter,
  disabled
}: {
  filled: boolean;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      aria-label={filled ? "Selected star" : "Select star"}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        fontSize: 32,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        color: filled ? "#f59e0b" : "#d1d5db",
        transform: active ? "scale(1.08)" : "scale(1)",
        transition: "transform 120ms ease, color 120ms ease"
      }}
    >
      ★
    </button>
  );
}

export function ReviewForm({
  canonicalItemId,
  initialRating = 5,
  initialReviewText = ""
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState(initialReviewText ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setReviewText(initialReviewText ?? "");
  }, [initialRating, initialReviewText]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/v1/items/${canonicalItemId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating,
          review_text: reviewText
        })
      });

      const responseBody = (await response.json()) as ErrorResponseBody;

      if (!response.ok) {
        setErrorMessage(responseBody.error?.message ?? "Your rating could not be saved.");
        return;
      }

      setSuccessMessage("Your rating is saved.");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage("Your rating could not be saved.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      style={{
        borderTop: "1px solid #e5e7eb",
        paddingTop: 24
      }}
    >
      <h2 style={{ margin: 0, fontSize: 24, color: "#111827" }}>How does it sound?</h2>
      <p style={{ margin: "10px 0 0", color: "#6b7280", lineHeight: 1.5 }}>
        Leave a quick rating and, if you like, a short note for other players.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 18, marginTop: 18 }}
        onMouseLeave={() => setHoverRating(null)}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <div
            role="radiogroup"
            aria-label="Choose a rating"
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center"
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <StarButton
                key={value}
                filled={value <= (hoverRating ?? rating)}
                active={value === (hoverRating ?? rating)}
                disabled={isPending}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
              />
            ))}
            <span style={{ marginLeft: 10, color: "#6b7280", fontSize: 14 }}>
              {hoverRating ?? rating} / 5
            </span>
          </div>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Add a short note (optional)</span>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={4}
            maxLength={280}
            placeholder="What stands out to you?"
            disabled={isPending}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #d1d5db",
              resize: "vertical",
              font: "inherit",
              color: "#111827",
              backgroundColor: "#ffffff"
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "12px 18px",
            borderRadius: 999,
            border: "none",
            backgroundColor: isPending ? "#9ca3af" : "#111827",
            color: "#ffffff",
            fontWeight: 600,
            cursor: isPending ? "default" : "pointer",
            justifySelf: "start"
          }}
        >
          {isPending ? "Saving..." : "Save rating"}
        </button>

        {errorMessage ? <p style={{ margin: 0, color: "#b91c1c" }}>{errorMessage}</p> : null}
        {successMessage ? <p style={{ margin: 0, color: "#15803d" }}>{successMessage}</p> : null}
      </form>
    </section>
  );
}
