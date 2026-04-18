-- SQL Migration: Add Ndioum to quartiers
-- Zone: Interieur (v_interieur)

DO $$ 
DECLARE
  v_interieur UUID;
BEGIN
  -- Récupérer l'UUID de la zone Intérieur
  SELECT id INTO v_interieur FROM zones WHERE type = 'interieur' LIMIT 1;

  -- Vérifier si Ndioum existe déjà pour éviter l'erreur ON CONFLICT sans contrainte unique
  IF NOT EXISTS (SELECT 1 FROM quartiers WHERE nom = 'Ndioum') THEN
    INSERT INTO quartiers (nom, zone_id, frais_livraison_base)
    VALUES ('Ndioum', v_interieur, 5000);
  ELSE
    UPDATE quartiers SET zone_id = v_interieur WHERE nom = 'Ndioum';
  END IF;

END $$;
