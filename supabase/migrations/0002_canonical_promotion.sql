create or replace function public.promote_observed_identity_to_canonical(
  p_observed_identity_id uuid
)
returns table (
  observed_identity_id uuid,
  observed_type public.item_type,
  observed_title text,
  observed_creator text,
  canonical_item_id uuid,
  canonical_type public.item_type,
  preferred_title text,
  preferred_creator text
)
language plpgsql
security definer
as $$
declare
  v_observed public.observed_item_identities%rowtype;
  v_canonical public.canonical_items%rowtype;
begin
  select *
  into v_observed
  from public.observed_item_identities
  where id = p_observed_identity_id
  for update;

  if not found then
    return;
  end if;

  if v_observed.canonical_item_id is not null then
    select *
    into v_canonical
    from public.canonical_items
    where id = v_observed.canonical_item_id;
  else
    insert into public.canonical_items (
      type,
      preferred_title,
      preferred_creator
    )
    values (
      v_observed.type,
      v_observed.observed_title,
      v_observed.observed_creator
    )
    returning * into v_canonical;

    update public.observed_item_identities
    set canonical_item_id = v_canonical.id
    where id = v_observed.id;
  end if;

  return query
  select
    v_observed.id,
    v_observed.type,
    v_observed.observed_title,
    v_observed.observed_creator,
    v_canonical.id,
    v_canonical.type,
    v_canonical.preferred_title,
    v_canonical.preferred_creator;
end;
$$;
