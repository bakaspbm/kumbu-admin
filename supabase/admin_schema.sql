-- ============================================================================
-- Kumbu Super Admin — Schema & RLS
-- Executa este ficheiro no SQL Editor do Supabase APÓS já teres criado as
-- tabelas da app (users_schema.sql, catalog_schema.sql, app_content_schema.sql
-- e orders_notifications_triggers.sql).
-- ============================================================================

-- 1) Tabela de super admins ---------------------------------------------------
create table if not exists public.admin_users (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  email     text not null,
  role      text not null default 'super_admin'
              check (role in ('super_admin', 'admin', 'support')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_admin_users_email on public.admin_users (email);

alter table public.admin_users enable row level security;

-- Apenas admins conseguem ver / gerir a lista de admins
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

-- 2) Helper: is_admin() -------------------------------------------------------
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

-- 3) Audit log ---------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id         bigserial primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  actor_email text,
  action     text not null,
  entity     text,
  entity_id  text,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
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

-- 4) Policies de ADMIN sobre todas as tabelas existentes ----------------------
-- public.users
drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- public.orders
drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- public.user_notifications
drop policy if exists user_notifications_admin_all on public.user_notifications;
create policy user_notifications_admin_all on public.user_notifications
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- catalog_*
drop policy if exists catalog_categories_admin_all on public.catalog_categories;
create policy catalog_categories_admin_all on public.catalog_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists catalog_subcategories_admin_all on public.catalog_subcategories;
create policy catalog_subcategories_admin_all on public.catalog_subcategories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists catalog_products_admin_all on public.catalog_products;
create policy catalog_products_admin_all on public.catalog_products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- app_*
drop policy if exists app_marketing_blocks_admin_all on public.app_marketing_blocks;
create policy app_marketing_blocks_admin_all on public.app_marketing_blocks
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_support_settings_admin_all on public.app_support_settings;
create policy app_support_settings_admin_all on public.app_support_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_category_sort_filters_admin_all on public.app_category_sort_filters;
create policy app_category_sort_filters_admin_all on public.app_category_sort_filters
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_payment_methods_admin_all on public.app_payment_methods;
create policy app_payment_methods_admin_all on public.app_payment_methods
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5) Bootstrap do primeiro super admin --------------------------------------
-- Substitui o e-mail abaixo pelo do super admin que vai gerir tudo.
-- Esse utilizador precisa de já existir em auth.users (cria-o em Auth → Users
-- ou via sign-up na própria app de admin).
do $$
declare
  v_email constant text := 'admin@kumbu.app';   -- <— EDITAR
  v_uid   uuid;
begin
  select id into v_uid from auth.users where email = v_email limit 1;
  if v_uid is not null then
    insert into public.admin_users (user_id, email, role, created_by)
    values (v_uid, v_email, 'super_admin', v_uid)
    on conflict (user_id) do update set role = 'super_admin', email = excluded.email;
  end if;
end $$;

-- 6) View resumida para o dashboard ------------------------------------------
create or replace view public.admin_overview as
select
  (select count(*) from public.users)                              as users_total,
  (select count(*) from public.users where created_at >= now() - interval '7 days') as users_last_7d,
  (select count(*) from public.orders)                             as orders_total,
  (select count(*) from public.orders where created_at >= now() - interval '7 days') as orders_last_7d,
  (select count(*) from public.orders where status = 'processing') as orders_processing,
  (select count(*) from public.orders where status = 'shipping')   as orders_shipping,
  (select count(*) from public.orders where status = 'delivered')  as orders_delivered,
  (select count(*) from public.orders where status = 'cancelled')  as orders_cancelled,
  (select count(*) from public.catalog_products)                   as products_total,
  (select count(*) from public.catalog_products where is_out_of_stock) as products_out_of_stock,
  (select count(*) from public.catalog_categories)                 as categories_total,
  (select count(*) from public.user_notifications where read_at is null) as notifications_unread;

grant select on public.admin_overview to authenticated;
