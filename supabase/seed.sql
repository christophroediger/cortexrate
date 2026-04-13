do $$
declare
  linked_canonical_id uuid := '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
  linked_observed_id uuid := '6fa459ea-ee8a-4ca4-894e-db77e160355e';
  unresolved_observed_id uuid := '7d444840-9dc0-41b8-8d2e-1c4a1a7b5f29';
begin
  insert into public.canonical_items (
    id,
    type,
    preferred_title,
    preferred_creator,
    source_notes
  )
  values (
    linked_canonical_id,
    'capture',
    'Mesa Rhythm Pack',
    'Jane Doe',
    'Seeded linked example for local manual testing.'
  )
  on conflict (id) do nothing;

  insert into public.observed_item_identities (
    id,
    type,
    observed_title,
    observed_creator,
    normalized_title,
    normalized_creator,
    canonical_item_id,
    source_url,
    source_item_key,
    raw_payload,
    last_seen_at
  )
  values
    (
      linked_observed_id,
      'capture',
      'Mesa Rhythm Pack',
      'Jane Doe',
      'mesa rhythm pack',
      'jane doe',
      linked_canonical_id,
      'https://cloud.neuraldsp.com/items/mesa-rhythm-pack',
      null,
      '{"seed":"linked"}',
      now()
    ),
    (
      unresolved_observed_id,
      'preset',
      'Clean Skyline',
      'John Smith',
      'clean skyline',
      'john smith',
      null,
      'https://cloud.neuraldsp.com/items/clean-skyline',
      null,
      '{"seed":"unresolved"}',
      now()
    )
  on conflict (id) do nothing;
end $$;
