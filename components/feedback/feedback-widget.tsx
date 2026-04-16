"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FeedbackWidgetProps = {
  isAuthenticated: boolean;
};

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

function RatingButton({
  value,
  selected,
  onClick,
  disabled
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: "1px solid rgba(244, 244, 245, 0.08)",
        background: selected ? "#fafafa" : "rgba(255, 255, 255, 0.03)",
        color: selected ? "#18181b" : "#e4e4e7",
        font: "inherit",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer"
      }}
      aria-pressed={selected}
      aria-label={`Select feedback rating ${value}`}
    >
      {value}
    </button>
  );
}

export function FeedbackWidget({ isAuthenticated }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginHref = useMemo(() => {
    if (typeof window === "undefined") {
      return "/login";
    }

    return `/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      setErrorMessage("Log in to send feedback.");
      setSuccessMessage(null);
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Please add a short message.");
      setSuccessMessage(null);
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pageUrl =
        typeof window === "undefined" ? null : `${window.location.pathname}${window.location.search}`;
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.trim(),
          rating,
          pageUrl
        })
      });
      const responseBody = (await response.json()) as ErrorResponseBody;

      if (!response.ok) {
        setErrorMessage(responseBody.error?.message ?? "Feedback could not be sent.");
        return;
      }

      setSuccessMessage("Thanks! This really helps improve CortexRate.");
      setMessage("");
      setRating(null);
    } catch {
      setErrorMessage("Feedback could not be sent.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 1000,
          border: "1px solid rgba(244, 244, 245, 0.08)",
          background: "rgba(24, 24, 27, 0.88)",
          color: "#fafafa",
          borderRadius: 999,
          padding: "11px 16px",
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.28)",
          backdropFilter: "blur(14px)",
          cursor: "pointer"
        }}
      >
        Feedback
      </button>

      {isOpen ? (
        <section
          aria-label="Feedback"
          style={{
            position: "fixed",
            right: 18,
            bottom: 68,
            zIndex: 1001,
            width: "min(360px, calc(100vw - 32px))",
            borderRadius: 22,
            border: "1px solid rgba(244, 244, 245, 0.08)",
            background: "linear-gradient(180deg, rgba(39, 39, 42, 0.95), rgba(24, 24, 27, 0.97))",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.38)",
            backdropFilter: "blur(14px)",
            padding: 18,
            color: "#e4e4e7",
            fontFamily:
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: "grid",
            gap: 14
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <strong style={{ color: "#fafafa", fontSize: 16 }}>Feedback</strong>
              <span style={{ color: "#a1a1aa", fontSize: 13 }}>
                Share a quick note about this page.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "#a1a1aa",
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0
              }}
              aria-label="Close feedback"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#d4d4d8" }}>Rating (optional)</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <RatingButton
                    key={value}
                    value={value}
                    selected={rating === value}
                    disabled={isPending}
                    onClick={() => setRating((current) => (current === value ? null : value))}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={1200}
              placeholder="What’s confusing or missing?"
              disabled={isPending}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(244, 244, 245, 0.08)",
                resize: "vertical",
                font: "inherit",
                color: "#fafafa",
                backgroundColor: "rgba(255, 255, 255, 0.025)",
                minHeight: 108
              }}
            />

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
              {isPending ? "Sending..." : "Send feedback"}
            </button>

            {!isAuthenticated ? (
              <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14, lineHeight: 1.5 }}>
                <Link href={loginHref} style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}>
                  Log in
                </Link>{" "}
                to send feedback.
              </p>
            ) : null}
            {errorMessage ? <p style={{ margin: 0, color: "#fca5a5", lineHeight: 1.5 }}>{errorMessage}</p> : null}
            {successMessage ? (
              <p style={{ margin: 0, color: "#86efac", lineHeight: 1.5 }}>{successMessage}</p>
            ) : null}
          </form>
        </section>
      ) : null}
    </>
  );
}
