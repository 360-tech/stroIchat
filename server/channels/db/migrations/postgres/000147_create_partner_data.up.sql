-- Create partner data structure in database
-- This migration prepares the database for partner functionality

-- Add partner role columns to schemes table (required for partner permissions system)
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS defaultteampartnerrole VARCHAR(64);
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS defaultchannelpartnerrole VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_schemes_channel_partner_role ON schemes (defaultchannelpartnerrole);
