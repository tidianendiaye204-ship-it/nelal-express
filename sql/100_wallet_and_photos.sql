-- Migration: Phase 1 - Wallet & Photo Proof

-- Add columns to profiles for cash management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cash_held INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_cash_limit INTEGER DEFAULT 25000;

-- Add column to orders for delivery photo proof
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;

-- Update the existing 'livre_partiel' and 'livre' comments for clarity
COMMENT ON COLUMN orders.ardoise_livreur IS 'Montant restant à payer ou monnaie non rendue';
COMMENT ON COLUMN profiles.cash_held IS 'Total des espèces collectées par le livreur et non encore reversées à l''agence';
