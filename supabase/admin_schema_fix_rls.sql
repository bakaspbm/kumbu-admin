-- Corrige RLS em admin_users: a policy antiga impedia o próprio admin de ler a sua linha
-- (recursão / chicken-and-egg) → login ficava em loop ou ia para /forbidden.

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

notify pgrst, 'reload schema';
