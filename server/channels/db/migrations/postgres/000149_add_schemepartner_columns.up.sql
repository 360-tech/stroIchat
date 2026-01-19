-- Add schemepartner column to teammembers and channelmembers tables
-- Required for Partner role functionality

ALTER TABLE teammembers ADD COLUMN IF NOT EXISTS schemepartner BOOLEAN DEFAULT FALSE;
ALTER TABLE channelmembers ADD COLUMN IF NOT EXISTS schemepartner BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_teammembers_scheme_partner ON teammembers (schemepartner);
CREATE INDEX IF NOT EXISTS idx_channelmembers_scheme_partner ON channelmembers (schemepartner);
