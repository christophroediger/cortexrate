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

export function ReviewForm({
  canonicalItemId,
  initialRating = 5,
  initialReviewText = ""
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(String(initialRating));
  const [reviewText, setReviewText] = useState(initialReviewText ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setRating(String(initialRating));
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
          rating: Number(rating),
          review_text: reviewText
        })
      });

      const responseBody = (await response.json()) as ErrorResponseBody;

      if (!response.ok) {
        setErrorMessage(responseBody.error?.message ?? "Review could not be saved.");
        return;
      }

      setSuccessMessage("Review saved.");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage("Review could not be saved.");
    } finally {
      setIsPending(false);
    }
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
      <h2 style={{ marginTop: 0 }}>Your Review</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Rating</span>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            disabled={isPending}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #a1a1aa",
              backgroundColor: "#ffffff"
            }}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Review</span>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={5}
            disabled={isPending}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #a1a1aa",
              resize: "vertical"
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: isPending ? "#a1a1aa" : "#18181b",
            color: "#ffffff",
            fontWeight: 600,
            cursor: isPending ? "default" : "pointer"
          }}
        >
          {isPending ? "Saving..." : "Save Review"}
        </button>

        {errorMessage ? <p style={{ margin: 0, color: "#b91c1c" }}>{errorMessage}</p> : null}
        {successMessage ? <p style={{ margin: 0, color: "#15803d" }}>{successMessage}</p> : null}
      </form>
    </section>
  );
}
