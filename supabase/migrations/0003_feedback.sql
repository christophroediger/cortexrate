create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  rating integer check (rating between 1 and 5),
  user_id uuid references auth.users (id) on delete set null,
  page_url text,
  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc);
create index feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

create policy "Authenticated users can insert feedback"
  on public.feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on table public.feedback is
  'Short in-app product feedback submitted by signed-in users.';
