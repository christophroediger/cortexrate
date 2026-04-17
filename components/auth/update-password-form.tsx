"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

function readRecoveryTokens() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);

  const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
  const tokenHash = searchParams.get("token_hash");
  const type = hashParams.get("type") || searchParams.get("type");

  return {
    accessToken,
    refreshToken,
    tokenHash,
    type
  };
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSettingSession, setIsSettingSession] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeRecoverySession() {
      const { accessToken, refreshToken, tokenHash, type } = readRecoveryTokens();

      if (type !== "recovery" || (!accessToken && !tokenHash)) {
        if (isMounted) {
          setIsRecoveryReady(false);
          setIsSettingSession(false);
          setErrorMessage("Open the password reset link from your email to continue.");
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/recovery-session", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            tokenHash
              ? {
                  token_hash: tokenHash,
                  type
                }
              : {
                  access_token: accessToken,
                  refresh_token: refreshToken
                }
          )
        });

        const responseBody = (await response.json()) as ErrorResponseBody;

        if (!response.ok) {
          if (isMounted) {
            setIsRecoveryReady(false);
            setErrorMessage(responseBody.error?.message ?? "Your reset link is no longer valid.");
          }
          return;
        }

        if (isMounted) {
          setIsRecoveryReady(true);
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.hash = "";
        cleanUrl.searchParams.delete("access_token");
        cleanUrl.searchParams.delete("refresh_token");
        cleanUrl.searchParams.delete("token_hash");
        cleanUrl.searchParams.delete("type");
        window.history.replaceState({}, "", cleanUrl.toString());
      } catch {
        if (isMounted) {
          setIsRecoveryReady(false);
          setErrorMessage("Your reset link is no longer valid.");
        }
      } finally {
        if (isMounted) {
          setIsSettingSession(false);
        }
      }
    }

    void initializeRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isRecoveryReady) {
      setErrorMessage("Open the password reset link from your email to continue.");
      setSuccessMessage(null);
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password
        })
      });

      const responseBody = (await response.json()) as ErrorResponseBody;

      if (!response.ok) {
        setErrorMessage(responseBody.error?.message ?? "We couldn't update your password.");
        return;
      }

      setSuccessMessage("Password updated successfully.");
      window.setTimeout(() => {
        router.push("/login?message=password-updated");
        router.refresh();
      }, 450);
    } catch {
      setErrorMessage("We couldn't update your password.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ color: "#d4d4d8", fontSize: 14, fontWeight: 600 }}>New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSettingSession || isPending || !isRecoveryReady}
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
        disabled={isSettingSession || isPending || !isRecoveryReady}
        style={{
          padding: "12px 18px",
          borderRadius: 999,
          border: "none",
          backgroundColor:
            isSettingSession || isPending || !isRecoveryReady ? "#3f3f46" : "#fafafa",
          color: "#18181b",
          fontWeight: 700,
          cursor:
            isSettingSession || isPending || !isRecoveryReady ? "default" : "pointer",
          justifySelf: "start"
        }}
      >
        {isSettingSession ? "Preparing..." : isPending ? "Saving..." : "Set new password"}
      </button>

      {errorMessage ? (
        <p style={{ margin: 0, color: "#fca5a5", lineHeight: 1.5 }}>{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p style={{ margin: 0, color: "#86efac", lineHeight: 1.5 }}>{successMessage}</p>
      ) : null}
    </form>
  );
}
