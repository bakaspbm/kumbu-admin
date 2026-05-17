-- ============================================================================
-- Kumbu — Schema base da app (utilizadores, catálogo, pedidos, notificações)
-- Corre PRIMEIRO no SQL Editor, depois admin_schema_minimal.sql e analytics_schema.sql
-- ============================================================================

-- Utilizadores da app (perfil; id = auth.users.id)
create table if not exists public.users (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  display_name      text,
  phone             text,
  photo_url         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  cart              jsonb not null default '[]'::jsonb,
  favorites         jsonb not null default '[]'::jsonb,
  delivery_address  jsonb,
  deleted_at        timestamptz,
  gender            text,
  birth_date        date,
  city              text,
  region            text,
  country           text
);

create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_created on public.users (created_at desc);

-- Catálogo
create table if not exists public.catalog_categories (
  id          text primary key,
  name        text not null,
  icon_key    text not null default 'category',
  accent_hex  text not null default 'C62828',
  sort_order  int not null default 0,
  kind        text not null default 'product' check (kind in ('product', 'stay'))
);

create table if not exists public.catalog_subcategories (
  category_id text not null references public.catalog_categories (id) on delete cascade,
  id          text not null,
  label       text not null,
  sort_order  int not null default 0,
  primary key (category_id, id)
);

create table if not exists public.catalog_products (
  id               text primary key,
  category_id      text not null references public.catalog_categories (id) on delete restrict,
  subcategory_id   text,
  title            text not null,
  rating           numeric(3,2) not null default 4.5,
  price_label      text not null,
  old_price_label  text,
  discount_percent int,
  delivery_text    text,
  image_color      bigint,
  is_featured      boolean not null default false,
  is_out_of_stock  boolean not null default false,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index if not exists idx_catalog_products_category
  on public.catalog_products (category_id);

-- Pedidos
create table if not exists public.orders (
  id           text primary key,
  user_id      uuid not null references public.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  items_count  int not null default 1,
  total_label  text not null,
  status       text not null default 'processing'
    check (status in ('processing', 'shipping', 'delivered', 'cancelled')),
  show_track   boolean not null default true
);

create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_orders_created on public.orders (created_at desc);

-- Notificações in-app
create table if not exists public.user_notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  title        text not null,
  body         text not null,
  icon_key     text not null default 'notifications_outlined',
  created_at   timestamptz not null default now(),
  read_at      timestamptz,
  hidden_at    timestamptz,
  broadcast_id uuid
);

create index if not exists idx_user_notifications_user
  on public.user_notifications (user_id, created_at desc);

-- Conteúdo da app
create table if not exists public.app_marketing_blocks (
  id            text primary key,
  kind          text not null check (kind in ('hero', 'offers')),
  title         text not null,
  subtitle      text not null default '',
  gradient_from text not null,
  gradient_to   text not null,
  sort_order    int not null default 0
);

create table if not exists public.app_support_settings (
  id                 text primary key default 'default',
  welcome_message    text not null default 'Olá! Como podemos ajudar?',
  quick_actions      jsonb not null default '[]'::jsonb,
  auto_reply_message text not null default ''
);

insert into public.app_support_settings (id)
values ('default')
on conflict (id) do nothing;

create table if not exists public.app_payment_methods (
  id          text primary key,
  label       text not null,
  icon_key    text not null default 'payment',
  sort_order  int not null default 0,
  is_default  boolean not null default false
);

create table if not exists public.app_category_sort_filters (
  id         text primary key,
  label      text not null,
  sort_mode  text not null default 'default'
    check (sort_mode in ('default', 'rating_desc', 'price_asc')),
  sort_order int not null default 0
);

-- RLS (requer public.is_admin() — corre admin_schema_minimal.sql antes ou a seguir)
alter table public.users enable row level security;
alter table public.catalog_categories enable row level security;
alter table public.catalog_subcategories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.orders enable row level security;
alter table public.user_notifications enable row level security;
alter table public.app_marketing_blocks enable row level security;
alter table public.app_support_settings enable row level security;
alter table public.app_payment_methods enable row level security;
alter table public.app_category_sort_filters enable row level security;

-- Utilizador: o próprio perfil
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select to authenticated using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update to authenticated using (auth.uid() = id);

-- Admin: acesso total (ignora se is_admin ainda não existir — corre minimal depois)
do $policy$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute 'drop policy if exists users_admin_all on public.users';
    execute 'create policy users_admin_all on public.users for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists orders_admin_all on public.orders';
    execute 'create policy orders_admin_all on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists catalog_categories_admin_all on public.catalog_categories';
    execute 'create policy catalog_categories_admin_all on public.catalog_categories for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists catalog_subcategories_admin_all on public.catalog_subcategories';
    execute 'create policy catalog_subcategories_admin_all on public.catalog_subcategories for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists catalog_products_admin_all on public.catalog_products';
    execute 'create policy catalog_products_admin_all on public.catalog_products for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists user_notifications_admin_all on public.user_notifications';
    execute 'create policy user_notifications_admin_all on public.user_notifications for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists app_marketing_blocks_admin_all on public.app_marketing_blocks';
    execute 'create policy app_marketing_blocks_admin_all on public.app_marketing_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists app_support_settings_admin_all on public.app_support_settings';
    execute 'create policy app_support_settings_admin_all on public.app_support_settings for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists app_payment_methods_admin_all on public.app_payment_methods';
    execute 'create policy app_payment_methods_admin_all on public.app_payment_methods for all to authenticated using (public.is_admin()) with check (public.is_admin())';

    execute 'drop policy if exists app_category_sort_filters_admin_all on public.app_category_sort_filters';
    execute 'create policy app_category_sort_filters_admin_all on public.app_category_sort_filters for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $policy$;

-- Notificações: utilizador vê só as suas (não ocultas)
drop policy if exists user_notifications_select_own on public.user_notifications;
create policy user_notifications_select_own on public.user_notifications
  for select to authenticated
  using (auth.uid() = user_id and hidden_at is null);

drop policy if exists user_notifications_update_own on public.user_notifications;
create policy user_notifications_update_own on public.user_notifications
  for update to authenticated using (auth.uid() = user_id);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;

notify pgrst, 'reload schema';
