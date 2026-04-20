-- Migration 107: Flexible Pricing and Parcel Sizes
-- Description: Adds parcel_size to orders and implements neighborhood pricing logic support.

-- Add parcel_size column to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS parcel_size TEXT DEFAULT 'petit';

COMMENT ON COLUMN orders.parcel_size IS 'petit, moyen, gros (influences regional pricing)';

-- We don't necessarily need a schema change for the pricing logic itself 
-- as it will be handled in the server actions, but ensuring indexes for performance.
CREATE INDEX IF NOT EXISTS idx_orders_quartiers_calc ON orders (quartier_depart_id, quartier_arrivee_id);
CREATE INDEX IF NOT EXISTS idx_orders_zones_calc ON orders (zone_from_id, zone_to_id);
