"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

type ReviewFormProps = {
  canonicalItemId: string;
  initialRating?: number;
  initialReviewText?: string | null;
  isAuthenticated: boolean;
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
        fontSize: 30,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        color: filled ? "#f59e0b" : "rgba(228, 228, 231, 0.42)",
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
  isAuthenticated,
  initialRating = 5,
  initialReviewText = ""
}: ReviewFormProps) {
  const router = useRouter();
  const pathname = usePathname();
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

    if (!isAuthenticated) {
      setErrorMessage("Log in to leave a rating");
      setSuccessMessage(null);
      return;
    }

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
        display: "grid",
        gap: 8
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22, color: "#fafafa", fontWeight: 700 }}>How does it sound?</h2>
      <p style={{ margin: 0, color: "#a1a1aa", lineHeight: 1.5, fontSize: 15 }}>
        Leave a quick rating and, if you like, a short note for other players.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 14, marginTop: 10 }}
        onMouseLeave={() => setHoverRating(null)}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <div
            role="radiogroup"
            aria-label="Choose a rating"
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap"
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
            <span style={{ marginLeft: 10, color: "#71717a", fontSize: 13 }}>
              {hoverRating ?? rating} / 5
            </span>
          </div>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600, color: "#d4d4d8", fontSize: 14 }}>
            Add a short note (optional)
          </span>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={4}
            maxLength={280}
            placeholder="What stands out to you?"
            disabled={isPending}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(244, 244, 245, 0.08)",
              resize: "vertical",
              font: "inherit",
              color: "#fafafa",
              backgroundColor: "rgba(255, 255, 255, 0.025)",
              minHeight: 112
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isPending || !isAuthenticated}
          style={{
            padding: "11px 16px",
            borderRadius: 999,
            border: "none",
            backgroundColor: isPending || !isAuthenticated ? "#3f3f46" : "#fafafa",
            color: isPending || !isAuthenticated ? "#d4d4d8" : "#18181b",
            fontWeight: 600,
            cursor: isPending || !isAuthenticated ? "default" : "pointer",
            justifySelf: "start"
          }}
        >
          {isPending ? "Saving..." : "Save rating"}
        </button>

        {!isAuthenticated ? (
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14 }}>
            <Link
              href={`/login?redirectTo=${encodeURIComponent(pathname || `/items/${canonicalItemId}`)}`}
              style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}
            >
              Log in
            </Link>{" "}
            to leave a rating
          </p>
        ) : null}
        {errorMessage ? <p style={{ margin: 0, color: "#fca5a5" }}>{errorMessage}</p> : null}
        {successMessage ? <p style={{ margin: 0, color: "#86efac" }}>{successMessage}</p> : null}
      </form>
    </section>
  );
}
