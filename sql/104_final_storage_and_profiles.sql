-- ==========================================================
-- ULTIME CORRECTIF : PROFILS & STOCKAGE
-- À exécuter dans le SQL Editor de Supabase
-- ==========================================================

-- 1. SECURITE DES PROFILS : S'assurer que tout le monde peut VOIR les profils
-- (Nécessaire pour le bon fonctionnement des relations dans les requêtes)
drop policy if exists "profiles_select_public" on profiles;
create policy "profiles_select_public" on profiles for select using (true);

-- 2. SECURITE DU STOCKAGE : Bucket 'delivery-proofs'
-- On s'assure d'abord que le bucket est configuré comme PUBLIC dans l'interface Supabase.

-- Autoriser l'insertion (upload) pour tout utilisateur connecté
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'delivery-proofs' );

-- Autoriser la lecture publique
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'delivery-proofs' );

-- 3. VERIFICATION / REPARATION DES PROFILS MANQUANTS
-- Si certains utilisateurs n'ont pas de profil, ce script va tenter d'en créer un de secours
insert into public.profiles (id, full_name, phone, role)
select id, 'Utilisateur ' || id, '', 'client'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- ==========================================================
-- NOTE IMPORTANTE :
-- Allez dans la table 'profiles', trouvez votre compte (ID), 
-- et mettez manuellement 'livreur' dans la colonne 'role'.
-- ==========================================================
