"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignUpFormProps = {
  redirectTo: string;
};

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

type SignUpResponseBody = {
  data?: {
    status?: "authenticated" | "confirmation_required";
    redirect_to?: string;
  };
};

function getErrorMessage(responseBody: ErrorResponseBody | SignUpResponseBody) {
  if ("error" in responseBody) {
    return responseBody.error?.message ?? "Sign-up failed.";
  }

  return "Sign-up failed.";
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
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

      const responseBody = (await response.json()) as SignUpResponseBody | ErrorResponseBody;

      if (!response.ok || !("data" in responseBody) || !responseBody.data) {
        setErrorMessage(getErrorMessage(responseBody));
        return;
      }

      if (responseBody.data.status === "authenticated") {
        router.push(responseBody.data.redirect_to || "/");
        router.refresh();
        return;
      }

      setSuccessMessage("Check your email to finish signing up, then log in.");
    } catch {
      setErrorMessage("Sign-up failed.");
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
          minLength={8}
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
        {isPending ? "Signing up..." : "Sign up"}
      </button>

      <p style={{ margin: 0, color: "#a1a1aa", fontSize: 14 }}>
        Already have an account?{" "}
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}
        >
          Log in
        </Link>
      </p>

      {errorMessage ? <p style={{ margin: 0, color: "#fca5a5" }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ margin: 0, color: "#86efac" }}>{successMessage}</p> : null}
    </form>
  );
}
