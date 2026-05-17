-- ============================================================================
-- Kumbu Admin — Analytics & notificações avançadas
--
-- ORDEM no SQL Editor:
--   1) supabase/foundation_schema.sql   ← cria public.users e resto
--   2) supabase/admin_schema_minimal.sql
--   3) este ficheiro (analytics_schema.sql)
-- ============================================================================

-- Perfil / estatísticas de utilizadores (colunas extra se foundation já correu)
alter table public.users add column if not exists deleted_at timestamptz;
alter table public.users add column if not exists gender text;
alter table public.users add column if not exists birth_date date;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists region text;
alter table public.users add column if not exists country text;

-- Histórico de contas eliminadas (app ou admin)
create table if not exists public.user_deletion_events (
  id         bigserial primary key,
  user_id    uuid not null,
  email      text,
  deleted_at timestamptz not null default now(),
  source     text not null default 'unknown'
    check (source in ('app', 'admin', 'unknown'))
);

create index if not exists idx_user_deletion_events_deleted
  on public.user_deletion_events (deleted_at desc);

alter table public.user_deletion_events enable row level security;
drop policy if exists user_deletion_events_admin on public.user_deletion_events;
create policy user_deletion_events_admin on public.user_deletion_events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Produtos: datas para gráficos
alter table public.catalog_products
  add column if not exists created_at timestamptz not null default now();
alter table public.catalog_products
  add column if not exists deleted_at timestamptz;

-- Notificações: ocultar na app + agrupar envios
alter table public.user_notifications
  add column if not exists hidden_at timestamptz;
alter table public.user_notifications
  add column if not exists broadcast_id uuid;

create index if not exists idx_user_notifications_hidden
  on public.user_notifications (hidden_at);

-- Séries temporais para o painel (security definer)
create or replace function public.admin_analytics_series(
  p_period text,
  p_metric text
)
returns table (bucket text, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_trunc text;
begin
  v_start := case p_period
    when 'day' then now() - interval '30 days'
    when 'week' then now() - interval '12 weeks'
    when 'month' then now() - interval '12 months'
    when 'year' then now() - interval '5 years'
    else now() - interval '30 days'
  end;

  v_trunc := case p_period
    when 'day' then 'day'
    when 'week' then 'week'
    when 'month' then 'month'
    when 'year' then 'year'
    else 'day'
  end;

  if p_metric = 'user_signups' then
    return query
      select to_char(date_trunc(v_trunc, u.created_at), 'YYYY-MM-DD') as bucket,
             count(*)::bigint
        from public.users u
       where u.created_at >= v_start
         and u.deleted_at is null
       group by 1
       order by 1;
  elsif p_metric = 'user_deletions' then
    return query
      select to_char(date_trunc(v_trunc, d.deleted_at), 'YYYY-MM-DD') as bucket,
             count(*)::bigint
        from (
          select deleted_at from public.user_deletion_events where deleted_at >= v_start
          union all
          select deleted_at from public.users where deleted_at is not null and deleted_at >= v_start
        ) d
       group by 1
       order by 1;
  elsif p_metric = 'product_created' then
    return query
      select to_char(date_trunc(v_trunc, p.created_at), 'YYYY-MM-DD') as bucket,
             count(*)::bigint
        from public.catalog_products p
       where p.created_at >= v_start
         and p.deleted_at is null
       group by 1
       order by 1;
  elsif p_metric = 'product_deleted' then
    return query
      select to_char(date_trunc(v_trunc, p.deleted_at), 'YYYY-MM-DD') as bucket,
             count(*)::bigint
        from public.catalog_products p
       where p.deleted_at is not null
         and p.deleted_at >= v_start
       group by 1
       order by 1;
  else
    return;
  end if;
end;
$$;

revoke all on function public.admin_analytics_series(text, text) from public;
grant execute on function public.admin_analytics_series(text, text) to authenticated;

create or replace function public.admin_analytics_demographics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'total_users', (select count(*) from public.users where deleted_at is null),
    'deleted_users', (select count(*) from public.users where deleted_at is not null)
      + (select count(*) from public.user_deletion_events),
    'avg_age', (
      select round(avg(extract(year from age(current_date, birth_date)))::numeric, 1)
        from public.users
       where birth_date is not null and deleted_at is null
    ),
    'gender', (
      select coalesce(jsonb_object_agg(coalesce(nullif(trim(gender), ''), 'Não indicado'), cnt), '{}'::jsonb)
        from (
          select coalesce(nullif(trim(gender), ''), 'Não indicado') as gender, count(*) as cnt
            from public.users
           where deleted_at is null
           group by 1
        ) g
    ),
    'cities', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', cnt)), '[]'::jsonb)
        from (
          select coalesce(nullif(trim(city), ''), 'Sem cidade') as name, count(*)::int as cnt
            from public.users
           where deleted_at is null
           group by 1
           order by cnt desc
           limit 8
        ) c
    ),
    'countries', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', cnt)), '[]'::jsonb)
        from (
          select coalesce(nullif(trim(country), ''), 'Sem país') as name, count(*)::int as cnt
            from public.users
           where deleted_at is null
           group by 1
           order by cnt desc
           limit 8
        ) co
    )
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function public.admin_analytics_demographics() from public;
grant execute on function public.admin_analytics_demographics() to authenticated;

notify pgrst, 'reload schema';
