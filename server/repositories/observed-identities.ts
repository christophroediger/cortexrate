import "server-only";

import type { CanonicalItem, ItemType } from "@/types/domain";
import { supabaseRest } from "@/server/db/rest";

type ObservedIdentityRow = {
  id: string;
  type: ItemType;
  observed_title: string;
  observed_creator: string;
  canonical_item_id: string | null;
  canonical_items:
    | {
        id: string;
        type: ItemType;
        preferred_title: string | null;
        preferred_creator: string | null;
      }
    | null;
};

export type ResolvedObservedIdentityRecord = {
  id: string;
  type: ItemType;
  observedTitle: string;
  observedCreator: string;
  canonicalItem: CanonicalItem | null;
};

type FindExactKnownMatchInput = {
  type: ItemType;
  normalizedTitle: string;
  normalizedCreator: string;
};

type CreateObservedIdentityInput = {
  type: ItemType;
  observedTitle: string;
  observedCreator: string;
  normalizedTitle: string;
  normalizedCreator: string;
  sourceUrl?: string;
  sourceItemKey?: string | null;
};

function mapRow(row: ObservedIdentityRow): ResolvedObservedIdentityRecord {
  return {
    id: row.id,
    type: row.type,
    observedTitle: row.observed_title,
    observedCreator: row.observed_creator,
    canonicalItem: row.canonical_items
      ? {
          id: row.canonical_items.id,
          type: row.canonical_items.type,
          preferred_title: row.canonical_items.preferred_title,
          preferred_creator: row.canonical_items.preferred_creator
        }
      : null
  };
}

export async function findExactKnownObservedIdentityMatch(
  input: FindExactKnownMatchInput
): Promise<ResolvedObservedIdentityRecord | null> {
  const rows = await supabaseRest<ObservedIdentityRow[]>(
    `observed_item_identities?select=id,type,observed_title,observed_creator,canonical_item_id,canonical_items(id,type,preferred_title,preferred_creator)&type=eq.${encodeURIComponent(
      input.type
    )}&normalized_title=eq.${encodeURIComponent(input.normalizedTitle)}&normalized_creator=eq.${encodeURIComponent(
      input.normalizedCreator
    )}&order=created_at.asc,id.asc&limit=1`
  );

  if (!rows.length) {
    return null;
  }

  return mapRow(rows[0]);
}

export async function createUnresolvedObservedIdentity(
  input: CreateObservedIdentityInput
): Promise<ResolvedObservedIdentityRecord> {
  const rows = await supabaseRest<ObservedIdentityRow[]>("observed_item_identities?select=id,type,observed_title,observed_creator,canonical_item_id,canonical_items(id,type,preferred_title,preferred_creator)", {
    method: "POST",
    body: JSON.stringify([
      {
        type: input.type,
        observed_title: input.observedTitle,
        observed_creator: input.observedCreator,
        normalized_title: input.normalizedTitle,
        normalized_creator: input.normalizedCreator,
        source_url: input.sourceUrl ?? null,
        source_item_key: input.sourceItemKey ?? null
      }
    ])
  });

  return mapRow(rows[0]);
}

export async function findObservedIdentityById(
  observedIdentityId: string
): Promise<ResolvedObservedIdentityRecord | null> {
  const rows = await supabaseRest<ObservedIdentityRow[]>(
    `observed_item_identities?select=id,type,observed_title,observed_creator,canonical_item_id,canonical_items(id,type,preferred_title,preferred_creator)&id=eq.${encodeURIComponent(
      observedIdentityId
    )}&limit=1`
  );

  if (!rows.length) {
    return null;
  }

  return mapRow(rows[0]);
}
