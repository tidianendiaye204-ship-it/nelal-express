-- Phase 1 : Infrastructure Collaborateurs
-- 1. Ajout du rôle 'agent' (répartiteur)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('client', 'livreur', 'admin', 'agent'));

-- 2. Ajout des notes internes pour la coordination de l'équipe
alter table public.orders add column if not exists internal_notes text;

-- 3. Mise à jour de la fonction is_admin pour inclure les agents dans certaines vues si besoin
-- (Ou créer une fonction is_collaborator)
create or replace function public.is_collaborator()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'agent')
  );
$$;

-- Mettre à jour les politiques RLS pour permettre aux agents de tout voir
drop policy if exists "orders_agent_all" on orders;
create policy "orders_agent_all" on orders
  for all using (public.is_collaborator());

drop policy if exists "profiles_agent_select" on profiles;
create policy "profiles_agent_select" on profiles
  for select using (public.is_collaborator());
