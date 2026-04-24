-- Table pour stocker les codes OTP WhatsApp
-- À exécuter dans le SQL Editor de Supabase Dashboard

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  code text NOT NULL,
  full_name text,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide par téléphone
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);

-- Activer RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Seul le service_role (backend) peut lire/écrire dans cette table
-- Aucun client ne doit y accéder directement
CREATE POLICY "Service role only" ON otp_codes
  FOR ALL USING (false);

-- Nettoyage automatique des codes expirés (optionnel, via pg_cron si activé)
-- SELECT cron.schedule('clean-expired-otp', '*/30 * * * *', 'DELETE FROM otp_codes WHERE expires_at < now()');
