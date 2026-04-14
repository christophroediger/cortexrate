"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthStatusProps = {
  isAuthenticated: boolean;
};

type LogoutResponseBody = {
  data?: {
    redirect_to?: string;
  };
};

export function AuthStatus({ isAuthenticated }: AuthStatusProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });
      const responseBody = (await response.json()) as LogoutResponseBody;
      router.push(responseBody.data?.redirect_to || "/");
      router.refresh();
    } catch {
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 1000,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(24, 24, 27, 0.82)",
        border: "1px solid rgba(244, 244, 245, 0.08)",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.28)",
        backdropFilter: "blur(14px)",
        color: "#d4d4d8",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 14
      }}
    >
      {isAuthenticated ? (
        <>
          <span>Logged in</span>
          <span style={{ color: "rgba(212, 212, 216, 0.45)" }}>·</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            style={{
              border: "none",
              background: "transparent",
              color: "#fafafa",
              font: "inherit",
              fontWeight: 600,
              padding: 0,
              cursor: isPending ? "default" : "pointer"
            }}
          >
            {isPending ? "Logging out..." : "Log out"}
          </button>
        </>
      ) : (
        <Link href="/login" style={{ color: "#fafafa", textDecoration: "none", fontWeight: 600 }}>
          Log in
        </Link>
      )}
    </div>
  );
}
