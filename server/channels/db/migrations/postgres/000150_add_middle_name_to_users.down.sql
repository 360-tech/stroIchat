DROP INDEX IF EXISTS idx_users_middlename_lower_textpattern;

DROP INDEX IF EXISTS idx_users_all_txt;
DROP INDEX IF EXISTS idx_users_names_txt;

CREATE INDEX IF NOT EXISTS idx_users_all_txt ON users USING gin(to_tsvector('english', username || ' ' || firstname || ' ' || lastname || ' ' || nickname || ' ' || email));
CREATE INDEX IF NOT EXISTS idx_users_names_txt ON users USING gin(to_tsvector('english', username || ' ' || firstname || ' ' || lastname || ' ' || nickname));

ALTER TABLE users DROP COLUMN IF EXISTS middlename;
