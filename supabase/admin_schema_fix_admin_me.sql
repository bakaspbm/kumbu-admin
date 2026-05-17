-- Corrige login "sem permissões" quando admin_users existe mas RLS bloqueia o SELECT.
-- Corre no SQL Editor do Supabase e recarrega a página de login.

-- 1) Policy de leitura (se ainda não aplicaste admin_schema_fix_rls.sql)
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 2) Função security definer — o utilizador lê o próprio registo de admin sem RLS circular
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
