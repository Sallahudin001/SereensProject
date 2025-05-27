-- Fix users table by adding missing clerk_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);

-- Add unique index on clerk_id for better performance  
CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id) WHERE clerk_id IS NOT NULL;
 
-- Check the current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 