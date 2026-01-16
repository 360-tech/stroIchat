-- Set default partner subtype for existing partner users
DO $$
BEGIN
    -- Only proceed if props column exists and is jsonb type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'props' 
          AND data_type = 'jsonb'
          AND table_schema = current_schema()
    ) THEN
        UPDATE users 
        SET props = jsonb_set(
            COALESCE(props, '{}'::jsonb), 
            '{partner_subtype}', 
            '"not_specified"'
        ) 
        WHERE roles LIKE '%system_partner%' 
          AND (
            props IS NULL
            OR (props IS NOT NULL AND (props->>'partner_subtype' IS NULL OR props->>'partner_subtype' = ''))
          );
    END IF;
END $$;
