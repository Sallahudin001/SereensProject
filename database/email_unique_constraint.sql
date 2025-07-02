-- This script adds a unique constraint to the email column in the users table
-- First, it checks for and resolves any duplicate emails before adding the constraint

-- Create a temporary table to store duplicates
CREATE TEMP TABLE duplicate_emails AS
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Log the duplicates (this will show in the query output)
SELECT * FROM duplicate_emails;

-- For each duplicate email, keep only the most recently updated record
DO $$
DECLARE
    email_rec RECORD;
    keep_id INTEGER;
    delete_ids INTEGER[];
BEGIN
    FOR email_rec IN SELECT * FROM duplicate_emails LOOP
        -- Get all records with this email, ordered by updated_at descending
        SELECT array_agg(id) INTO delete_ids
        FROM (
            SELECT id, updated_at
            FROM users
            WHERE email = email_rec.email
            ORDER BY updated_at DESC
            OFFSET 1 -- Skip the first record (most recently updated)
        ) AS duplicates;
        
        -- Get the ID of the record to keep
        SELECT id INTO keep_id
        FROM users
        WHERE email = email_rec.email
        ORDER BY updated_at DESC
        LIMIT 1;
        
        -- Log the action
        RAISE NOTICE 'Keeping user ID % for email % and removing % duplicate(s)',
            keep_id, email_rec.email, array_length(delete_ids, 1);
            
        -- Delete duplicate records if any were found
        IF array_length(delete_ids, 1) > 0 THEN
            DELETE FROM users
            WHERE id = ANY(delete_ids);
        END IF;
    END LOOP;
END $$;

-- Add unique constraint to email column
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Log migration in migrations table (create table if it doesn't exist)
CREATE TABLE IF NOT EXISTS migrations (
    name VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO migrations (name, applied_at) 
VALUES ('add_email_unique_constraint', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Final confirmation
SELECT 'Email uniqueness constraint added successfully' AS status; 