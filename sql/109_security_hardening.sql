-- ==========================================
-- MIGRATION 109: DURCISSEMENT SÉCURITÉ (LINTER SUPABASE)
-- ==========================================

-- 1. SCHÉMA POUR LES EXTENSIONS
-- Best practice : ne pas laisser les extensions dans le schéma 'public'
CREATE SCHEMA IF NOT EXISTS extensions;

-- Déplacer les extensions (Nécessite des droits superuser)
-- Note: PostGIS ne supporte pas toujours SET SCHEMA dans les versions récentes.
-- On s'occupe donc uniquement de pg_trgm qui est déplaçable.
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
-- ALTER EXTENSION postgis SET SCHEMA extensions; -- Désactivé (non supporté par PostGIS)

-- 2. CORRECTION RLS : whatsapp_logs
-- La politique actuelle "Admin full access" est trop permissive (USING true)
DROP POLICY IF EXISTS "Admin full access" ON whatsapp_logs;

CREATE POLICY "Admin full access" ON whatsapp_logs 
FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. SÉCURITÉ STOCKAGE : Restriction du listing
-- Le linter prévient que "SELECT USING (bucket_id = '...')" permet de lister tous les fichiers.
-- Pour les buckets publics, on n'a besoin de SELECT que si on veut lister via l'API.
-- L'accès aux fichiers via URL publique fonctionne sans ces politiques.

-- Suppression des politiques de lecture large (Listing)
DROP POLICY IF EXISTS "Public Read Colis Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Signatures" ON storage.objects;
DROP POLICY IF EXISTS "Temp Open Select" ON storage.objects;

-- Remplacer par des politiques permettant uniquement la lecture (SÉLECT) aux admins
-- ou aux utilisateurs connectés si nécessaire pour l'interface.
CREATE POLICY "Admins list everything" ON storage.objects
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Optionnel : Si vous voulez que les livreurs voient leurs propres uploads dans l'app
CREATE POLICY "Livreurs select own uploads" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('colis-photos', 'signatures', 'delivery-proofs')
  AND owner = auth.uid()
);
