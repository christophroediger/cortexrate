"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PromoteCanonicalItemResponse } from "@/types/api";

type ClaimObservedFormProps = {
  observedIdentityId: string;
};

type ErrorResponseBody = {
  error?: {
    message?: string;
  };
};

function getErrorMessage(responseBody: ErrorResponseBody | { data?: PromoteCanonicalItemResponse }) {
  if ("error" in responseBody) {
    return responseBody.error?.message ?? "CortexRate page could not be created.";
  }

  return "CortexRate page could not be created.";
}

export function ClaimObservedForm({ observedIdentityId }: ClaimObservedFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreatePage() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/canonical-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          observed_identity_id: observedIdentityId
        })
      });

      const responseBody = (await response.json()) as
        | { data?: PromoteCanonicalItemResponse }
        | ErrorResponseBody;

      if (!response.ok || !("data" in responseBody) || !responseBody.data) {
        setErrorMessage(getErrorMessage(responseBody));
        return;
      }

      router.push(`/items/${responseBody.data.canonical_item.id}`);
    } catch {
      setErrorMessage("CortexRate page could not be created.");
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
      <h2 style={{ marginTop: 0 }}>Create CortexRate Page</h2>
      <p style={{ color: "#52525b" }}>
        This item does not have a CortexRate page yet. Create it here to start rating and reviewing
        it.
      </p>
      <button
        type="button"
        onClick={handleCreatePage}
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
        {isPending ? "Creating..." : "Create CortexRate Page"}
      </button>
      {errorMessage ? <p style={{ marginBottom: 0, color: "#b91c1c" }}>{errorMessage}</p> : null}
    </section>
  );
}
