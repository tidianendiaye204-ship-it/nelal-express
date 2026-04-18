-- SQL Migration: WhatsApp Bot & Enhanced Tracking
-- Date: 2026-04-18

-- 1. Ajout des rôles et colonnes nécessaires
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'livreur', 'admin', 'vendeur'));

-- 2. Amélioration de la table orders pour la sécurité et les preuves
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_code INTEGER,
ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT;

-- 3. Table des conversations pour la machine à états du bot WhatsApp
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wa_id TEXT UNIQUE NOT NULL, -- Numéro de téléphone WhatsApp (ex: 221770000000)
    state TEXT DEFAULT 'IDLE' NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide par numéro
CREATE INDEX IF NOT EXISTS idx_conversations_wa_id ON conversations(wa_id);

-- 4. Table des tokens de suivi courts (pour nelal.sn/t/[token])
CREATE TABLE IF NOT EXISTS tracking_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide par token
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_token ON tracking_tokens(token);

-- 5. RLS pour les nouvelles tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;

-- Les conversations et tokens sont gérés par le serveur (service_role)
-- On autorise la lecture publique des tokens pour le suivi
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public tracking access" ON tracking_tokens;
    CREATE POLICY "Public tracking access" ON tracking_tokens FOR SELECT USING (true);
END $$;

-- 6. Fonction pour la recherche floue de quartiers
CREATE OR REPLACE FUNCTION search_quartiers(search_query TEXT)
RETURNS TABLE (id UUID, nom TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.nom
    FROM quartiers q
    WHERE q.nom % search_query -- Utilise pg_trgm similarity
    OR q.nom ILIKE '%' || search_query || '%'
    ORDER BY similarity(q.nom, search_query) DESC
    LIMIT 1;
END;
$$;
