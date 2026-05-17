-- ============================================================================
-- Kumbu Admin — schema MÍNIMO (só para criar o primeiro admin pelo formulário)
-- Cola no SQL Editor do Supabase e clica Run.
-- Depois: Settings → API → "Reload schema cache" (se existir) ou espera ~1 min.
-- ============================================================================

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'super_admin'
               check (role in ('super_admin', 'admin', 'support')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_admin_users_email on public.admin_users (email);

alter table public.admin_users enable row level security;

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists admin_users_insert on public.admin_users;
create policy admin_users_insert on public.admin_users
  for insert to authenticated
  with check (exists (select 1 from public.admin_users a
                       where a.user_id = auth.uid()
                         and a.role = 'super_admin'));

drop policy if exists admin_users_update on public.admin_users;
create policy admin_users_update on public.admin_users
  for update to authenticated
  using (exists (select 1 from public.admin_users a
                  where a.user_id = auth.uid()
                    and a.role = 'super_admin'))
  with check (exists (select 1 from public.admin_users a
                       where a.user_id = auth.uid()
                         and a.role = 'super_admin'));

drop policy if exists admin_users_delete on public.admin_users;
create policy admin_users_delete on public.admin_users
  for delete to authenticated
  using (exists (select 1 from public.admin_users a
                  where a.user_id = auth.uid()
                    and a.role = 'super_admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
     where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;

create table if not exists public.admin_audit_log (
  id          bigserial primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null,
  entity      text,
  entity_id   text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_log_select on public.admin_audit_log;
create policy admin_audit_log_select on public.admin_audit_log
  for select to authenticated using (public.is_admin());

drop policy if exists admin_audit_log_insert on public.admin_audit_log;
create policy admin_audit_log_insert on public.admin_audit_log
  for insert to authenticated with check (public.is_admin());

-- Expõe tabelas à API REST (PostgREST)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.admin_users to postgres, service_role;
grant all on public.admin_audit_log to postgres, service_role;
grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated, service_role;

create or replace function public.admin_me()
returns table (user_id uuid, email text, role text)
language sql
stable
security definer
set search_path = public
as $$
  select a.user_id, a.email, a.role
    from public.admin_users a
   where a.user_id = auth.uid()
   limit 1;
$$;

revoke all on function public.admin_me() from public;
grant execute on function public.admin_me() to authenticated;

notify pgrst, 'reload schema';
