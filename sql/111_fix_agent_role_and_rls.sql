-- ==========================================
-- MIGRATION 111: FIX AGENT ROLE & PROFILES RLS
-- ==========================================

-- 1. S'assurer que le rôle 'agent' est autorisé dans la contrainte
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'livreur', 'admin', 'agent'));

-- 2. Créer la fonction is_admin si elle n'existe pas ou la mettre à jour
-- (Déjà présente mais on s'assure qu'elle est robuste)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Ajouter une politique pour permettre aux admins de modifier n'importe quel profil
-- (Nécessaire pour la gestion d'équipe via le dashboard)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- 4. Ajouter une politique pour permettre aux admins de voir tous les profils (si pas déjà fait)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR true); -- true car on a déjà profiles_select_public

-- 5. S'assurer que les agents sont redirigés correctement ou ont les accès
-- (is_collaborator est déjà défini dans phase_1_collaborateurs.sql)
