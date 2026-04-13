create extension if not exists pgcrypto;

create type public.item_type as enum ('capture', 'preset');
create type public.review_state as enum ('active', 'flagged', 'hidden');

create table public.canonical_items (
  id uuid primary key default gen_random_uuid(),
  type public.item_type not null,
  preferred_title text,
  preferred_creator text,
  source_notes text,
  merged_into_canonical_item_id uuid references public.canonical_items (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.observed_item_identities (
  id uuid primary key default gen_random_uuid(),
  type public.item_type not null,
  observed_title text not null,
  observed_creator text not null,
  normalized_title text not null,
  normalized_creator text not null,
  canonical_item_id uuid references public.canonical_items (id) on delete set null,
  source_url text,
  source_item_key text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  canonical_item_id uuid not null references public.canonical_items (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  state public.review_state not null default 'active',
  flag_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_item_id, author_user_id)
);

create index canonical_items_type_idx on public.canonical_items (type);
create index observed_item_identities_canonical_item_id_idx
  on public.observed_item_identities (canonical_item_id);
create index observed_item_identities_lookup_idx
  on public.observed_item_identities (type, normalized_title, normalized_creator);
create index reviews_canonical_item_id_idx on public.reviews (canonical_item_id);
create index reviews_public_summary_idx
  on public.reviews (canonical_item_id, state)
  where state = 'active';

comment on table public.canonical_items is
  'Stable review targets. Manual merges only in MVP.';

comment on table public.observed_item_identities is
  'Raw observed Cortex Cloud identities. Unknown items are stored here first and may remain unresolved.';

comment on table public.reviews is
  'One review per auth user per canonical item. Only active reviews count toward public aggregates.';
