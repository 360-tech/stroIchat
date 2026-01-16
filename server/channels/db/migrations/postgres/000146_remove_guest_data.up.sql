-- Remove all guest data from database
DO $$
BEGIN
    -- Remove guest_subtype from users.props
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'props' 
          AND data_type = 'jsonb'
          AND table_schema = current_schema()
    ) THEN
        -- Remove guest_subtype key from props
        UPDATE users 
        SET props = props - 'guest_subtype'
        WHERE props IS NOT NULL 
          AND props ? 'guest_subtype';
    END IF;

    -- Remove guest roles from users table
    UPDATE users
    SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(roles, 'system_guest ', '', 'g'),
            ' team_guest ', ' ', 'g'
        ),
        ' channel_guest', '', 'g'
    ))
    WHERE roles LIKE '%system_guest%' 
       OR roles LIKE '%team_guest%' 
       OR roles LIKE '%channel_guest%';

    -- Clean up any remaining guest role references
    UPDATE users
    SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
    WHERE roles LIKE '%guest%';

    -- Remove guest roles from teammembers table if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'teammembers' 
          AND table_schema = current_schema()
    ) THEN
        UPDATE teammembers
        SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(roles, 'system_guest ', '', 'g'),
                ' team_guest ', ' ', 'g'
            ),
            ' channel_guest', '', 'g'
        ))
        WHERE roles LIKE '%system_guest%' 
           OR roles LIKE '%team_guest%' 
           OR roles LIKE '%channel_guest%';

        -- Clean up any remaining guest role references
        UPDATE teammembers
        SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
        WHERE roles LIKE '%guest%';
    END IF;

    -- Remove guest roles from channelmembers table if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'channelmembers' 
          AND table_schema = current_schema()
    ) THEN
        UPDATE channelmembers
        SET roles = TRIM(BOTH ' ' FROM REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(roles, 'system_guest ', '', 'g'),
                ' team_guest ', ' ', 'g'
            ),
            ' channel_guest', '', 'g'
        ))
        WHERE roles LIKE '%system_guest%' 
           OR roles LIKE '%team_guest%' 
           OR roles LIKE '%channel_guest%';

        -- Clean up any remaining guest role references
        UPDATE channelmembers
        SET roles = REGEXP_REPLACE(roles, '\s+', ' ', 'g')
        WHERE roles LIKE '%guest%';
    END IF;
END $$;
