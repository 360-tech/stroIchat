ALTER TABLE users ADD COLUMN IF NOT EXISTS middlename VARCHAR(64);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND table_schema = current_schema()
          AND column_name = 'MiddleName'
    ) THEN
        UPDATE users
        SET middlename = "MiddleName"
        WHERE middlename IS NULL
          AND "MiddleName" IS NOT NULL;

        ALTER TABLE users DROP COLUMN "MiddleName";
    END IF;
END $$;

UPDATE users
SET middlename = ''
WHERE middlename IS NULL;

ALTER TABLE users ALTER COLUMN middlename SET DEFAULT '';
ALTER TABLE users ALTER COLUMN middlename SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_middlename_lower_textpattern ON users (lower(middlename) text_pattern_ops);

DROP INDEX IF EXISTS idx_users_all_txt;
DROP INDEX IF EXISTS idx_users_names_txt;

CREATE INDEX IF NOT EXISTS idx_users_all_txt ON users USING gin(to_tsvector('english', username || ' ' || firstname || ' ' || COALESCE(middlename, '') || ' ' || lastname || ' ' || nickname || ' ' || email));
CREATE INDEX IF NOT EXISTS idx_users_names_txt ON users USING gin(to_tsvector('english', username || ' ' || firstname || ' ' || COALESCE(middlename, '') || ' ' || lastname || ' ' || nickname));
