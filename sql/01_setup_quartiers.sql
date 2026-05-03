-- 0. Activer l'extension pour l'index de recherche textuelle rapide
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Création de la table quartiers
CREATE TABLE IF NOT EXISTS quartiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT UNIQUE NOT NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL, -- FK vers la table zones
  code_postal TEXT,
  frais_livraison_base INT DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour la recherche rapide (recherche insensible à la casse sur nom)
CREATE INDEX IF NOT EXISTS idx_quartiers_nom ON quartiers USING gin (nom gin_trgm_ops);

-- 2. Ajout des colonnes sur la table orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS quartier_depart_id UUID REFERENCES quartiers(id),
ADD COLUMN IF NOT EXISTS quartier_arrivee_id UUID REFERENCES quartiers(id);

-- 3. Script d'insertion des quartiers avec assignation dynamique des zone_id
DO $$ 
DECLARE
  v_dakar_centre UUID;
  v_banlieue UUID;
  v_interieur UUID;
BEGIN
  -- Récupérer les UUIDs des zones
  SELECT id INTO v_dakar_centre FROM zones WHERE type = 'dakar_centre' LIMIT 1;
  SELECT id INTO v_banlieue FROM zones WHERE type = 'banlieue' LIMIT 1;
  SELECT id INTO v_interieur FROM zones WHERE type = 'interieur' LIMIT 1;

  -- Insertions Dakar Centre
  INSERT INTO quartiers (nom, zone_id, frais_livraison_base) VALUES
  ('Médina', v_dakar_centre, 1000),
  ('Point E', v_dakar_centre, 1000),
  ('Fass', v_dakar_centre, 1000),
  ('Gueule Tapée', v_dakar_centre, 1000),
  ('Plateau', v_dakar_centre, 1000),
  ('Almadies', v_dakar_centre, 1500),
  ('Ngor', v_dakar_centre, 1500),
  ('Yoff', v_dakar_centre, 1500),
  ('Ouakam', v_dakar_centre, 1200),
  ('Mermoz', v_dakar_centre, 1200),
  ('Sacré Cœur 1', v_dakar_centre, 1200),
  ('Sacré Cœur 2', v_dakar_centre, 1200),
  ('Sacré Cœur 3', v_dakar_centre, 1200),
  ('Liberté 1', v_dakar_centre, 1000),
  ('Liberté 2', v_dakar_centre, 1000),
  ('Liberté 3', v_dakar_centre, 1000),
  ('Liberté 4', v_dakar_centre, 1000),
  ('Liberté 5', v_dakar_centre, 1000),
  ('Liberté 6', v_dakar_centre, 1000),
  ('Dieuppeul', v_dakar_centre, 1000),
  ('Castors', v_dakar_centre, 1000),
  ('Baobab', v_dakar_centre, 1000),
  ('Amitié 1', v_dakar_centre, 1000),
  ('Amitié 2', v_dakar_centre, 1000),
  ('Zone de Captage', v_dakar_centre, 1200),
  ('Grand Yoff', v_dakar_centre, 1000),
  ('HLM', v_dakar_centre, 1000),
  ('Colobane', v_dakar_centre, 1000)
  ON CONFLICT (nom) DO NOTHING;

  -- Insertions Banlieue
  INSERT INTO quartiers (nom, zone_id, frais_livraison_base) VALUES
  ('Parcelles Assainies U1 à U6', v_banlieue, 1500),
  ('Parcelles Assainies U7 à U12', v_banlieue, 1500),
  ('Parcelles Assainies U13 à U26', v_banlieue, 1500),
  ('Guédiawaye - Hamo', v_banlieue, 1500),
  ('Guédiawaye - Golf Sud', v_banlieue, 1500),
  ('Guédiawaye - Ndiarème', v_banlieue, 1500),
  ('Pikine Icotaf', v_banlieue, 1500),
  ('Pikine Guinaw Rails', v_banlieue, 1500),
  ('Pikine Tally Boubess', v_banlieue, 1500),
  ('Thiaroye sur Mer', v_banlieue, 1800),
  ('Thiaroye Gare', v_banlieue, 1800),
  ('Keur Massar Village', v_banlieue, 2000),
  ('Keur Massar Cité', v_banlieue, 2000),
  ('Yeumbeul', v_banlieue, 1800),
  ('Malika', v_banlieue, 2000),
  ('Rufisque Centre', v_banlieue, 2500),
  ('Bargny', v_banlieue, 2500),
  ('Diamniadio', v_banlieue, 3000),
  ('Sebikotane', v_banlieue, 3000),
  ('ZAC Mbao', v_banlieue, 2000),
  ('Fass Mbao', v_banlieue, 2000)
  ON CONFLICT (nom) DO NOTHING;

  -- Optionnel: Activer la RLS si elle est utile sur les quartiers
  -- ALTER TABLE public.quartiers ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Quartiers are public" ON public.quartiers FOR SELECT USING (true);
END $$;
