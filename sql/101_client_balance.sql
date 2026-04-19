-- Migration: Client Balance (Ardoises)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;

COMMENT ON COLUMN profiles.balance IS 'Crédit du client (ex: ardoises cumulées suites à des manques de monnaie)';
