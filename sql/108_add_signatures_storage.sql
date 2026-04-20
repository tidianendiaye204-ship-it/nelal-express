-- ==========================================
-- MIGRATION 108: CONFIGURATION STOCKAGE SIGNATURES
-- ==========================================

-- 1. Création du bucket 'signatures' (si non existant via interface)
-- Note: Dans Supabase, il est souvent préférable de le créer via l'UI, 
-- mais voici le SQL pour s'en assurer.
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLITIQUES RLS POUR 'signatures'

-- Autoriser l'insertion (upload) pour tout utilisateur connecté (Livreurs)
DROP POLICY IF EXISTS "Livreur Upload Signatures" ON storage.objects;
CREATE POLICY "Livreur Upload Signatures" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'signatures' );

-- Autoriser la lecture publique pour ce bucket (affichage du reçu)
DROP POLICY IF EXISTS "Public Read Signatures" ON storage.objects;
CREATE POLICY "Public Read Signatures" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'signatures' );

-- Autoriser la suppression pour les admins (maintenance)
DROP POLICY IF EXISTS "Admin Delete Signatures" ON storage.objects;
CREATE POLICY "Admin Delete Signatures" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( 
  bucket_id = 'signatures' 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
