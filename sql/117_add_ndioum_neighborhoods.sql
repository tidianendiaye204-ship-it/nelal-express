-- SQL Migration: Add quartiers for Ndioum
-- Date: 2026-05-15

DO $$ 
DECLARE
  v_ndioum UUID;
BEGIN
  -- 1. Récupérer l'ID de la zone Ndioum
  SELECT id INTO v_ndioum FROM zones WHERE name = 'Ndioum' LIMIT 1;

  IF v_ndioum IS NOT NULL THEN
    -- 2. Insérer les quartiers de Ndioum
    -- On utilise ON CONFLICT si une contrainte unique existe, sinon on vérifie l'existence
    
    INSERT INTO quartiers (nom, zone_id, frais_livraison_base)
    VALUES 
      ('Ndioum Centre / Escale', v_ndioum, 500),
      ('Quartier Cité Alioune Sarr', v_ndioum, 500),
      ('Quartier Polyvalent', v_ndioum, 500),
      ('Ndioum Nord (Vers le fleuve)', v_ndioum, 500),
      ('Ndioum Sud (Vers la route nationale)', v_ndioum, 500),
      ('Darou Salam Ndioum', v_ndioum, 500)
    ON CONFLICT (nom) DO UPDATE SET zone_id = EXCLUDED.zone_id;

    RAISE NOTICE 'Quartiers de Ndioum ajoutés avec succès.';
  ELSE
    RAISE NOTICE 'Zone Ndioum introuvable.';
  END IF;
END $$;
