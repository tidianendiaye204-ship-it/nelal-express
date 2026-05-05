-- Fix zones and quartiers assignments based on user feedback
-- Date: 2026-05-05

DO $$ 
DECLARE
  v_rufisque UUID;
  v_mbao UUID;
  v_yeumbeul UUID;
  v_diamniadio UUID;
  v_keur_massar UUID;
  v_banlieue UUID;
BEGIN
  -- 1. Récupérer ou créer les zones correctes
  SELECT id INTO v_rufisque FROM zones WHERE name = 'Rufisque' LIMIT 1;
  SELECT id INTO v_mbao FROM zones WHERE name = 'Mbao' LIMIT 1;
  SELECT id INTO v_yeumbeul FROM zones WHERE name = 'Yeumbeul' LIMIT 1;
  SELECT id INTO v_keur_massar FROM zones WHERE name = 'Keur Massar' LIMIT 1;
  SELECT id INTO v_banlieue FROM zones WHERE type = 'banlieue' ORDER BY created_at ASC LIMIT 1;

  -- Création de la zone Diamniadio si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM zones WHERE name = 'Diamniadio') THEN
    INSERT INTO zones (name, type, tarif_base) VALUES ('Diamniadio', 'banlieue', 3000) RETURNING id INTO v_diamniadio;
  ELSE
    SELECT id INTO v_diamniadio FROM zones WHERE name = 'Diamniadio' LIMIT 1;
  END IF;

  -- 2. Réassigner les quartiers aux zones appropriées
  
  -- Bargny -> Rufisque
  IF v_rufisque IS NOT NULL THEN
    UPDATE quartiers SET zone_id = v_rufisque WHERE nom = 'Bargny';
  END IF;
  
  -- Diamniadio & Sebikotane -> Diamniadio
  IF v_diamniadio IS NOT NULL THEN
    UPDATE quartiers SET zone_id = v_diamniadio WHERE nom IN ('Diamniadio', 'Sebikotane');
  END IF;

  -- Mbao -> Zone Mbao
  IF v_mbao IS NOT NULL THEN
    UPDATE quartiers SET zone_id = v_mbao WHERE nom IN ('ZAC Mbao', 'Fass Mbao');
  END IF;
  
  -- Yeumbeul -> Zone Yeumbeul
  IF v_yeumbeul IS NOT NULL THEN
    UPDATE quartiers SET zone_id = v_yeumbeul WHERE nom = 'Yeumbeul';
  END IF;

  -- Keur Massar -> Zone Keur Massar
  IF v_keur_massar IS NOT NULL THEN
    UPDATE quartiers SET zone_id = v_keur_massar WHERE nom LIKE 'Keur Massar%';
  END IF;

  -- 3. Corrections de noms
  -- Note: Fass Mbao est le nom correct (confirmation utilisateur)
  -- On s'assure qu'il n'est plus dans la zone Pikine par défaut
  
  -- S'assurer que les autres quartiers de banlieue ne sont pas tous dans "Pikine" par défaut
  -- (Ceux qui sont restés dans la zone générique banlieue si elle s'appelle Pikine)
  -- Mais on a déjà fait le gros du travail au dessus.

END $$;
