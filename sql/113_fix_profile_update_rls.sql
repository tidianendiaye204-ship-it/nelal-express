-- MIGRATION 113: FIX PROFILE UPDATE RLS

begin;

-- S'assurer que chaque utilisateur peut au minimum modifier SON PROPRE profil.
-- Sans cette politique de base, un conflit ou une récursion dans is_admin() peut bloquer la mise à jour.
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ( auth.uid() = id );

commit;
