-- ==========================================================
-- CORRECTIF : AUTO-ASSIGNATION LIVREURS
-- Ce script permet aux livreurs de prendre une commande libre.
-- ==========================================================

-- 1. On supprime l'ancienne politique restrictive
drop policy if exists "orders_livreur_update_status" on orders;

-- 2. On crée la nouvelle politique plus flexible
-- Autoriser UPDATE si :
-- - L'utilisateur est le livreur déjà assigné
-- - OU la commande est en attente (libre) et l'utilisateur est un livreur
create policy "orders_livreur_update_status" on orders
  for update using (
    livreur_id = auth.uid() 
    OR 
    (status = 'en_attente' AND livreur_id IS NULL)
  );
