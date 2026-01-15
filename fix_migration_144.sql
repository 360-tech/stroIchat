-- Script to fix migration 144 issue
-- This script removes the migration record if the migration wasn't fully applied
-- Run this script manually if you get "duplicate key value violates unique constraint" error

-- First, check if migration 144 is in db_migrations
SELECT * FROM db_migrations WHERE version = 144;

-- Check if the migration was actually applied (check if guest_subtype exists in any user's props)
SELECT COUNT(*) as users_with_guest_subtype
FROM users 
WHERE roles LIKE '%system_guest%' 
  AND props IS NOT NULL 
  AND props->>'guest_subtype' IS NOT NULL;

-- If the migration wasn't applied (users_with_guest_subtype = 0), 
-- remove the record from db_migrations:
-- DELETE FROM db_migrations WHERE version = 144;

-- After removing the record, restart the server and it will re-apply the migration
