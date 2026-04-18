-- Table pour stocker les abonnements push de chaque utilisateur/appareil
-- Exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour chercher rapidement les subscriptions d'un user
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON push_subscriptions(user_id);

-- RLS : chaque utilisateur ne peut gérer que ses propres subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique : INSERT (un user peut s'abonner)
CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : DELETE (un user peut se désabonner)
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Politique : SELECT pour le service_role (envoi de push côté serveur)
-- Le service_role bypass RLS par défaut, donc pas besoin de politique spéciale.
-- Mais on ajoute un SELECT pour que l'utilisateur puisse vérifier ses propres subs.
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
