create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 2 and 32),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invites (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  invite_code text not null unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.map_documents (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  drawings jsonb not null default '[]'::jsonb check (jsonb_typeof(drawings) = 'array'),
  locations jsonb not null default '[]'::jsonb check (jsonb_typeof(locations) = 'array'),
  layers jsonb not null default '{}'::jsonb check (jsonb_typeof(layers) = 'object'),
  version bigint not null default 0,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.map_revisions (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version bigint not null,
  drawings jsonb not null,
  locations jsonb not null,
  layers jsonb not null,
  edited_by uuid not null references public.profiles(id),
  edited_at timestamptz not null default now(),
  unique (workspace_id, version)
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_workspace(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace
      and user_id = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

create or replace function public.share_workspace(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = other_user or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs using (workspace_id)
    where mine.user_id = auth.uid() and theirs.user_id = other_user
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.map_documents enable row level security;
alter table public.map_revisions enable row level security;

drop policy if exists "Members can read related profiles" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Members can read workspaces" on public.workspaces;
drop policy if exists "Members can read memberships" on public.workspace_members;
drop policy if exists "Owners can read invite codes" on public.workspace_invites;
drop policy if exists "Members can read map documents" on public.map_documents;
drop policy if exists "Members can read revisions" on public.map_revisions;

create policy "Members can read related profiles" on public.profiles
  for select to authenticated using (public.share_workspace(id));
create policy "Users can update their profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Members can read workspaces" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
create policy "Members can read memberships" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Owners can read invite codes" on public.workspace_invites
  for select to authenticated using (
    exists (select 1 from public.workspace_members where workspace_id = workspace_invites.workspace_id and user_id = auth.uid() and role = 'owner')
  );
create policy "Members can read map documents" on public.map_documents
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Members can read revisions" on public.map_revisions
  for select to authenticated using (public.is_workspace_member(workspace_id));

create or replace function public.create_map_workspace(workspace_name text, display_name text)
returns table (workspace_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace uuid;
  new_code text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(display_name)) not between 2 and 32 then raise exception 'INVALID_USERNAME'; end if;
  if char_length(trim(workspace_name)) not between 2 and 80 then raise exception 'INVALID_WORKSPACE_NAME'; end if;
  if exists (select 1 from public.workspaces) then raise exception 'WORKSPACE_ALREADY_EXISTS'; end if;

  insert into public.profiles (id, username, updated_at)
  values (auth.uid(), trim(display_name), now())
  on conflict (id) do update set username = excluded.username, updated_at = now();

  insert into public.workspaces (name, created_by)
  values (trim(workspace_name), auth.uid()) returning id into new_workspace;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace, auth.uid(), 'owner');
  new_code := upper(encode(extensions.gen_random_bytes(6), 'hex'));
  insert into public.workspace_invites (workspace_id, invite_code) values (new_workspace, new_code);
  insert into public.map_documents (workspace_id, updated_by) values (new_workspace, auth.uid());
  return query select new_workspace, new_code;
end;
$$;

create or replace function public.join_map_workspace(join_code text, display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_workspace uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(display_name)) not between 2 and 32 then raise exception 'INVALID_USERNAME'; end if;

  select workspace_id into target_workspace
  from public.workspace_invites
  where invite_code = upper(trim(join_code));
  if target_workspace is null then raise exception 'INVALID_INVITE_CODE'; end if;

  insert into public.profiles (id, username, updated_at)
  values (auth.uid(), trim(display_name), now())
  on conflict (id) do update set username = excluded.username, updated_at = now();
  insert into public.workspace_members (workspace_id, user_id, role)
  values (target_workspace, auth.uid(), 'editor')
  on conflict (workspace_id, user_id) do nothing;
  return target_workspace;
end;
$$;

create or replace function public.save_map_document(
  target_workspace uuid,
  expected_version bigint,
  new_drawings jsonb,
  new_locations jsonb,
  new_layers jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_version bigint;
begin
  if not public.can_edit_workspace(target_workspace) then raise exception 'EDIT_PERMISSION_REQUIRED'; end if;
  if jsonb_typeof(new_drawings) <> 'array' or jsonb_typeof(new_locations) <> 'array' or jsonb_typeof(new_layers) <> 'object' then
    raise exception 'INVALID_MAP_DOCUMENT';
  end if;

  update public.map_documents
  set drawings = new_drawings,
      locations = new_locations,
      layers = new_layers,
      version = version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where workspace_id = target_workspace and version = expected_version
  returning version into next_version;

  if next_version is null then raise exception 'MAP_VERSION_CONFLICT'; end if;

  insert into public.map_revisions (workspace_id, version, drawings, locations, layers, edited_by)
  values (target_workspace, next_version, new_drawings, new_locations, new_layers, auth.uid());

  delete from public.map_revisions
  where workspace_id = target_workspace
    and id not in (
      select id from public.map_revisions
      where workspace_id = target_workspace
      order by version desc limit 50
    );
  return next_version;
end;
$$;

revoke all on function public.create_map_workspace(text, text) from public;
revoke all on function public.join_map_workspace(text, text) from public;
revoke all on function public.save_map_document(uuid, bigint, jsonb, jsonb, jsonb) from public;
grant execute on function public.create_map_workspace(text, text) to authenticated;
grant execute on function public.join_map_workspace(text, text) to authenticated;
grant execute on function public.save_map_document(uuid, bigint, jsonb, jsonb, jsonb) to authenticated;

alter table public.map_documents replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'map_documents'
  ) then
    alter publication supabase_realtime add table public.map_documents;
  end if;
end $$;
