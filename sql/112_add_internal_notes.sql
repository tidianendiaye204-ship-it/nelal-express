-- migration: 112_add_internal_notes.sql
-- Add internal_notes column to orders table for team coordination

ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Restrict visibility: This column should ideally only be visible to admin and agents.
-- However, since we use 'SELECT *' in many places, we'll handle the filtering 
-- in the application layer for now (Server Components / Actions).
