-- SQL Migration: Add tarif_local to zones
-- Goal: Allow custom intra-zone pricing (e.g. Ndioum to Ndioum)
-- Date: 2026-05-15

ALTER TABLE zones ADD COLUMN IF NOT EXISTS tarif_local integer DEFAULT 1000;

-- Update existing data for consistency
-- Dakar Centre: Usually 500 or 1000, we'll set 1000 as default but can be changed
UPDATE zones SET tarif_local = 500 WHERE type = 'dakar_centre';
UPDATE zones SET tarif_local = 1500 WHERE name = 'Ndioum'; -- Example for the user's request
