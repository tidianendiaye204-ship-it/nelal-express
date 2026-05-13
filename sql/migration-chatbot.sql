-- ============================================
-- NELAL EXPRESS — Chatbot WhatsApp
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Table pour stocker l'état de chaque conversation
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        text NOT NULL UNIQUE,  -- numéro WhatsApp du client
  step         text NOT NULL DEFAULT 'start',
  data         jsonb NOT NULL DEFAULT '{}',  -- données collectées
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Index pour retrouver rapidement une session par téléphone
CREATE INDEX IF NOT EXISTS idx_chatbot_phone ON chatbot_sessions(phone);

-- Auto-update du updated_at
-- Note: update_updated_at function must exist in public schema
CREATE TRIGGER chatbot_updated_at
  BEFORE UPDATE ON chatbot_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;

-- Seul le service role peut lire/écrire (le webhook Next.js utilise service role)
DROP POLICY IF EXISTS "chatbot_service_only" ON chatbot_sessions;
CREATE POLICY "chatbot_service_only" ON chatbot_sessions
  FOR ALL USING (true);

-- Nettoyer les sessions de plus de 24h (garder propre)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM chatbot_sessions
  WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
