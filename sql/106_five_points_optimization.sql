-- ==========================================
-- MIGRATION 106: OPTIMISATION 5 POINTS
-- ==========================================

-- 1. SIGNATURE NUMÉRIQUE
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS recipient_signature_url TEXT;

-- 2. LIVE TRACKING (Positions des livreurs)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC,
ADD COLUMN IF NOT EXISTS last_location_at TIMESTAMP WITH TIME ZONE;

-- 3. STOCKAGE : Bucket 'signatures'
-- Note: Le bucket lui-même doit être créé via l'interface Supabase ou la commande system.
-- On configure les politiques RLS ici.

-- Insertion autorisée pour les livreurs authentifiés
DROP POLICY IF EXISTS "Livreur Upload Signatures" ON storage.objects;
CREATE POLICY "Livreur Upload Signatures" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'signatures' );

-- Lecture publique pour l'affichage (ex: admin ou client)
DROP POLICY IF EXISTS "Public Read Signatures" ON storage.objects;
CREATE POLICY "Public Read Signatures" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'signatures' );

-- 4. CONFIGURATION DU PORTEFEUILLE (Wallet Lock)
-- On s'assure que les colonnes nécessaires existent
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cash_held INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_cash_limit INTEGER DEFAULT 25000;

-- On initialise les limites pour les livreurs existants
UPDATE profiles SET max_cash_limit = 25000 WHERE max_cash_limit IS NULL AND role = 'livreur';
