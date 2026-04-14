"use client";

import { useState } from "react";

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const responseBody = (await response.json()) as ErrorResponseBody;

      if (!response.ok) {
        setErrorMessage(responseBody.error?.message ?? "We couldn't send the reset link.");
        return;
      }

      setSuccessMessage("Check your email for a password reset link.");
    } catch {
      setErrorMessage("We couldn't send the reset link.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ color: "#d4d4d8", fontSize: 14, fontWeight: 600 }}>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid rgba(244, 244, 245, 0.08)",
            font: "inherit",
            color: "#fafafa",
            backgroundColor: "rgba(255, 255, 255, 0.025)"
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
          backgroundColor: isPending ? "#3f3f46" : "#fafafa",
          color: "#18181b",
          fontWeight: 700,
          cursor: isPending ? "default" : "pointer",
          justifySelf: "start"
        }}
      >
        {isPending ? "Sending..." : "Send reset link"}
      </button>

      {errorMessage ? <p style={{ margin: 0, color: "#fca5a5" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ margin: 0, color: "#86efac" }}>{successMessage}</p> : null}
    </form>
  );
}
