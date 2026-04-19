-- SQL Migration: Add Debugging Logs for WhatsApp Webhook
-- Date: 2026-04-19

CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    wa_id TEXT,
    type_webhook TEXT,
    payload JSONB,
    headers JSONB
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON whatsapp_logs(created_at DESC);

-- RLS (Public Read No, Service Role All)
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON whatsapp_logs FOR ALL USING (true);
