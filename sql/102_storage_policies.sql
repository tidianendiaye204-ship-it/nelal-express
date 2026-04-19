-- Migration 102: Storage Policies for Delivery Proofs
-- Assurez-vous que le bucket 'delivery-proofs' existe déjà dans l'interface Supabase.

-- 1. Autoriser tout le monde (public) à VOIR les photos de preuve (pour le suivi client et admin)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'delivery-proofs' );

-- 2. Autoriser les utilisateurs authentifiés (livreurs) à Uploader des photos
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'delivery-proofs' );

-- 3. Autoriser les admins à supprimer des photos si besoin (maintenance)
CREATE POLICY "Admin delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( 
  bucket_id = 'delivery-proofs' AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
