import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/lib/api-error";
import { ensureCanonicalItemForObservedIdentity } from "@/server/services/canonical-promotion";
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
    await getObservedIdentityForClaim(observedIdentityId);
    const result = await ensureCanonicalItemForObservedIdentity(observedIdentityId);

    redirect(`/items/${result.canonicalItem.id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
