-- Rollback: Remove partner data
DO $$
BEGIN
    -- Remove partner_subtype from users.props
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'props' 
          AND data_type = 'jsonb'
          AND table_schema = current_schema()
    ) THEN
        -- Remove partner_subtype key from props
        UPDATE users 
        SET props = props - 'partner_subtype'
        WHERE props IS NOT NULL 
          AND props ? 'partner_subtype';
    END IF;

    -- Remove partner roles from users table
    UPDATE users
    SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(roles, 'system_partner ', '', 'g'),
            ' team_partner ', ' ', 'g'
        ),
        ' channel_partner', '', 'g'
    ))
    WHERE roles LIKE '%system_partner%' 
       OR roles LIKE '%team_partner%' 
       OR roles LIKE '%channel_partner%';

    -- Clean up any remaining partner role references
    UPDATE users
    SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
    WHERE roles LIKE '%partner%';

    -- Remove partner roles from teammembers table if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'teammembers' 
          AND table_schema = current_schema()
    ) THEN
        UPDATE teammembers
        SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(roles, 'system_partner ', '', 'g'),
                ' team_partner ', ' ', 'g'
            ),
            ' channel_partner', '', 'g'
        ))
        WHERE roles LIKE '%system_partner%' 
           OR roles LIKE '%team_partner%' 
           OR roles LIKE '%channel_partner%';

        -- Clean up any remaining partner role references
        UPDATE teammembers
        SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
        WHERE roles LIKE '%partner%';
    END IF;

    -- Remove partner roles from channelmembers table if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'channelmembers' 
          AND table_schema = current_schema()
    ) THEN
        UPDATE channelmembers
        SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(roles, 'system_partner ', '', 'g'),
                ' team_partner ', ' ', 'g'
            ),
            ' channel_partner', '', 'g'
        ))
        WHERE roles LIKE '%system_partner%' 
           OR roles LIKE '%team_partner%' 
           OR roles LIKE '%channel_partner%';

        -- Clean up any remaining partner role references
        UPDATE channelmembers
        SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
        WHERE roles LIKE '%partner%';
    END IF;
END $$;
