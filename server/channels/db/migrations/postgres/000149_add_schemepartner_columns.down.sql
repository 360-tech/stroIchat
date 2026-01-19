-- Remove schemepartner column from teammembers and channelmembers tables

DROP INDEX IF EXISTS idx_teammembers_scheme_partner;
DROP INDEX IF EXISTS idx_channelmembers_scheme_partner;

ALTER TABLE teammembers DROP COLUMN IF EXISTS schemepartner;
ALTER TABLE channelmembers DROP COLUMN IF EXISTS schemepartner;
