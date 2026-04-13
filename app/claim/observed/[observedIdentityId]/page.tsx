import { notFound, redirect } from "next/navigation";

import { ClaimObservedForm } from "@/components/item/claim-observed-form";
import { ApiError } from "@/lib/api-error";
import { getAuthContext } from "@/lib/auth";
import { getObservedIdentityForClaim } from "@/server/services/observed-identity-read";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ClaimObservedPageProps = {
  params: Promise<{
    observedIdentityId: string;
  }>;
};

export default async function ClaimObservedPage({ params }: ClaimObservedPageProps) {
  const { observedIdentityId } = await params;

  try {
    const [authContext, observedIdentity] = await Promise.all([
      getAuthContext(),
      getObservedIdentityForClaim(observedIdentityId)
    ]);

    if (observedIdentity.canonicalItem) {
      redirect(`/items/${observedIdentity.canonicalItem.id}`);
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f4f4f5",
          padding: "48px 20px"
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "grid",
            gap: 24
          }}
        >
          <section
            style={{
              border: "1px solid #d4d4d8",
              borderRadius: 12,
              padding: 24,
              backgroundColor: "#ffffff"
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#71717a"
              }}
            >
              {observedIdentity.type}
            </p>
            <h1 style={{ margin: "8px 0 4px", fontSize: 32, lineHeight: 1.1 }}>
              {observedIdentity.observedTitle}
            </h1>
            <p style={{ margin: 0, color: "#3f3f46", fontSize: 16 }}>
              by {observedIdentity.observedCreator}
            </p>
          </section>

          {authContext ? (
            <ClaimObservedForm observedIdentityId={observedIdentity.id} />
          ) : (
            <section
              style={{
                border: "1px solid #d4d4d8",
                borderRadius: 12,
                padding: 24,
                backgroundColor: "#ffffff"
              }}
            >
              <h2 style={{ marginTop: 0 }}>Create CortexRate Page</h2>
              <p style={{ marginBottom: 0, color: "#52525b" }}>
                Sign in to create a CortexRate page for this item and start rating it.
              </p>
            </section>
          )}
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
