-- ==========================================
-- MIGRATION 110: CORRECTION DES ALERTES LINTER RLS
-- ==========================================

-- 1. Gestion de PostGIS et spatial_ref_sys
-- Pour faire disparaître l'alerte sur spatial_ref_sys, on tente de déplacer 
-- l'extension postgis vers le schéma 'extensions'.
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$ 
BEGIN
    -- On tente de déplacer l'extension. Si elle est déjà là ou si PostGIS 
    -- ne supporte pas le déplacement sur cette version, on ignore l'erreur.
    ALTER EXTENSION postgis SET SCHEMA extensions;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Note: Impossible de déplacer postgis: %', SQLERRM;
END $$;

-- 2. Correction RLS pour quartiers
ALTER TABLE IF EXISTS public.quartiers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Quartiers are public" ON public.quartiers;
    CREATE POLICY "Quartiers are public"
    ON public.quartiers
    FOR SELECT
    TO public
    USING (true);
END $$;

-- 3. Correction RLS pour conversations
-- On ajoute une politique pour les admins afin de satisfaire le linter
-- et permettre la gestion via le dashboard.
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage conversations" ON public.conversations;
    CREATE POLICY "Admins can manage conversations"
    ON public.conversations
    FOR ALL
    TO authenticated
    USING (
      (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
    );
END $$;
