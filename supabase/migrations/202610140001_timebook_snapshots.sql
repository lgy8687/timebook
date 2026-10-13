-- One private snapshot per authenticated account. Apply only after user approval.
create table if not exists public.timebook_snapshots (
    user_id uuid primary key references auth.users(id) on delete cascade,
    revision bigint not null default 1 check (revision > 0),
    payload jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.timebook_snapshots enable row level security;
revoke all on table public.timebook_snapshots from anon, public;
grant select, insert, update, delete on table public.timebook_snapshots to authenticated;

drop policy if exists "Users can read their own timebook snapshot" on public.timebook_snapshots;
create policy "Users can read their own timebook snapshot"
    on public.timebook_snapshots for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own timebook snapshot" on public.timebook_snapshots;
create policy "Users can insert their own timebook snapshot"
    on public.timebook_snapshots for insert to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own timebook snapshot" on public.timebook_snapshots;
create policy "Users can update their own timebook snapshot"
    on public.timebook_snapshots for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own timebook snapshot" on public.timebook_snapshots;
create policy "Users can delete their own timebook snapshot"
    on public.timebook_snapshots for delete to authenticated
    using ((select auth.uid()) = user_id);
