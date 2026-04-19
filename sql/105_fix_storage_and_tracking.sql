-- ==========================================
-- MIGRATION 105: CORRECTIF RLS STOCKAGE & SUIVI
-- ==========================================

-- 1. STOCKAGE : Bucket 'colis-photos'
-- Assurez-vous que le bucket 'colis-photos' est créé dans l'interface Supabase.

-- Autoriser l'insertion (upload) pour tout utilisateur connecté (Livreurs)
DROP POLICY IF EXISTS "Livreur Upload Photos" ON storage.objects;
CREATE POLICY "Livreur Upload Photos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'colis-photos' );

-- Autoriser la lecture publique pour ce bucket
DROP POLICY IF EXISTS "Public Read Colis Photos" ON storage.objects;
CREATE POLICY "Public Read Colis Photos" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'colis-photos' );


-- 2. COMMANDES : Autoriser le Suivi Public
-- Indispensable pour que la page de suivi (/suivi/[id]) fonctionne pour les clients non connectés.

-- Autoriser la lecture des commandes par tout le monde (accès via UUID)
DROP POLICY IF EXISTS "Public Order Tracking" ON orders;
CREATE POLICY "Public Order Tracking" 
ON orders FOR SELECT 
USING ( true );

-- S'assurer que les relations sont aussi lisibles publiquement
DROP POLICY IF EXISTS "Public Zones Read" ON zones;
CREATE POLICY "Public Zones Read" 
ON zones FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Public Status History Read" ON order_status_history;
CREATE POLICY "Public Status History Read" 
ON order_status_history FOR SELECT 
USING ( true );

-- Les profils ont déjà une politique 'profiles_select_public' dans le fichier 104,
-- mais on la renforce ici au cas où.
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
