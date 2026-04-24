drop policy if exists "Users can read own backup" on public.studyos_backups;
drop policy if exists "Users can insert own backup" on public.studyos_backups;
drop policy if exists "Users can update own backup" on public.studyos_backups;
drop policy if exists "Public can read backups" on public.studyos_backups;
drop policy if exists "Public can insert backups" on public.studyos_backups;
drop policy if exists "Public can update backups" on public.studyos_backups;

drop table if exists public.studyos_backups;

create table if not exists public.studyos_backups (
  sync_key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.studyos_backups enable row level security;

create policy "Public can read backups"
on public.studyos_backups
for select
to anon, authenticated
using (true);

create policy "Public can insert backups"
on public.studyos_backups
for insert
to anon, authenticated
with check (true);

create policy "Public can update backups"
on public.studyos_backups
for update
to anon, authenticated
using (true)
with check (true);
