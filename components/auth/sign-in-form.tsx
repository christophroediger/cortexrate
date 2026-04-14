"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignInFormProps = {
  redirectTo: string;
  initialMessage?: string | null;
};

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

function getErrorMessage(responseBody: ErrorResponseBody | { data?: { redirect_to?: string } }) {
  if ("error" in responseBody) {
    return responseBody.error?.message ?? "Log-in failed.";
  }

  return "Log-in failed.";
}

export function SignInForm({ redirectTo, initialMessage = null }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialMessage);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          redirect_to: redirectTo
        })
      });

      const responseBody = (await response.json()) as
        | { data?: { redirect_to?: string } }
        | ErrorResponseBody;

      if (!response.ok || !("data" in responseBody)) {
        setErrorMessage(getErrorMessage(responseBody));
        return;
      }

      setSuccessMessage("Logged in successfully.");
      window.setTimeout(() => {
        router.push(responseBody.data?.redirect_to || "/");
        router.refresh();
      }, 450);
    } catch {
      setErrorMessage("Log-in failed.");
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

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ color: "#d4d4d8", fontSize: 14, fontWeight: 600 }}>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        {isPending ? "Logging in..." : "Log in"}
      </button>

      <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14 }}>
        Don't have an account?{" "}
        <Link
          href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}
        >
          Sign up
        </Link>
      </p>

      <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14 }}>
        <Link
          href="/reset-password"
          style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}
        >
          Forgot password?
        </Link>
      </p>

      {errorMessage ? (
        <p style={{ margin: 0, color: "#fca5a5", lineHeight: 1.5 }}>{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p style={{ margin: 0, color: "#86efac", lineHeight: 1.5 }}>{successMessage}</p>
      ) : null}
    </form>
  );
}
