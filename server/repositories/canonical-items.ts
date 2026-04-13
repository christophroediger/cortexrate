import "server-only";

import type { CanonicalItem } from "@/types/domain";
import { supabaseRest } from "@/server/db/rest";

type PromoteObservedIdentityRpcRow = {
  observed_identity_id: string;
  observed_type: CanonicalItem["type"];
  observed_title: string;
  observed_creator: string;
  canonical_item_id: string;
  canonical_type: CanonicalItem["type"];
  preferred_title: string | null;
  preferred_creator: string | null;
};

export type PromoteObservedIdentityResult = {
  canonicalItem: CanonicalItem;
  linkedObservedIdentity: {
    id: string;
    canonical_item_id: string;
  };
};

export async function promoteObservedIdentityToCanonical(
  observedIdentityId: string
): Promise<PromoteObservedIdentityResult | null> {
  const rows = await supabaseRest<PromoteObservedIdentityRpcRow[]>("rpc/promote_observed_identity_to_canonical", {
    method: "POST",
    body: JSON.stringify({
      p_observed_identity_id: observedIdentityId
    })
  });

  if (!rows.length) {
    return null;
  }

  const row = rows[0];

  return {
    canonicalItem: {
      id: row.canonical_item_id,
      type: row.canonical_type,
      preferred_title: row.preferred_title,
      preferred_creator: row.preferred_creator
    },
    linkedObservedIdentity: {
      id: row.observed_identity_id,
      canonical_item_id: row.canonical_item_id
    }
  };
}

type CanonicalItemRow = {
  id: string;
  type: CanonicalItem["type"];
  preferred_title: string | null;
  preferred_creator: string | null;
};

export async function findCanonicalItemById(canonicalItemId: string): Promise<CanonicalItem | null> {
  const rows = await supabaseRest<CanonicalItemRow[]>(
    `canonical_items?select=id,type,preferred_title,preferred_creator&id=eq.${encodeURIComponent(
      canonicalItemId
    )}&limit=1`
  );

  if (!rows.length) {
    return null;
  }

  return {
    id: rows[0].id,
    type: rows[0].type,
    preferred_title: rows[0].preferred_title,
    preferred_creator: rows[0].preferred_creator
  };
}
