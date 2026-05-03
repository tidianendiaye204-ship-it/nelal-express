-- Ce script ajoute une contrainte UNIQUE sur la colonne "name" de la table "zones"
-- pour empêcher la création de doublons (par exemple Yeumbeul, Guédiawaye, etc.)

ALTER TABLE public.zones ADD CONSTRAINT zones_name_unique UNIQUE (name);

-- On ajoute également la même protection sur les quartiers
ALTER TABLE public.quartiers ADD CONSTRAINT quartiers_nom_unique UNIQUE (nom);
