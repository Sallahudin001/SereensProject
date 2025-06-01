-- Migration: Fix approval_requests to use users table instead of admin_users
-- This migration updates the foreign key relationships to use the proper users table

-- Step 1: Drop existing foreign key constraints that reference admin_users
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requestor_id_fkey;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_approver_id_fkey;

-- Step 2: Update any existing approval_requests data if there's a mapping between admin_users and users
-- This assumes that admin_users.clerk_id corresponds to users.clerk_id
-- If there are existing approval requests, we need to map them to the users table

-- First, let's add temporary columns to help with the migration
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS temp_requestor_clerk_id VARCHAR(255);
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS temp_approver_clerk_id VARCHAR(255);

-- Map existing requestor_id from admin_users to clerk_id
UPDATE approval_requests 
SET temp_requestor_clerk_id = au.clerk_id
FROM admin_users au 
WHERE approval_requests.requestor_id = au.id 
AND au.clerk_id IS NOT NULL;

-- Map existing approver_id from admin_users to clerk_id  
UPDATE approval_requests 
SET temp_approver_clerk_id = au.clerk_id
FROM admin_users au 
WHERE approval_requests.approver_id = au.id 
AND au.clerk_id IS NOT NULL;

-- Now update the requestor_id to point to users.id based on matching clerk_id
UPDATE approval_requests 
SET requestor_id = u.id
FROM users u 
WHERE approval_requests.temp_requestor_clerk_id = u.clerk_id;

-- Update the approver_id to point to users.id based on matching clerk_id
UPDATE approval_requests 
SET approver_id = u.id
FROM users u 
WHERE approval_requests.temp_approver_clerk_id = u.clerk_id
AND approval_requests.temp_approver_clerk_id IS NOT NULL;

-- Set approver_id to NULL for records where we couldn't find a matching user
UPDATE approval_requests 
SET approver_id = NULL 
WHERE temp_approver_clerk_id IS NOT NULL 
AND approver_id NOT IN (SELECT id FROM users);

-- Drop the temporary columns
ALTER TABLE approval_requests DROP COLUMN IF EXISTS temp_requestor_clerk_id;
ALTER TABLE approval_requests DROP COLUMN IF EXISTS temp_approver_clerk_id;

-- Step 3: Add new foreign key constraints that reference users table
ALTER TABLE approval_requests 
ADD CONSTRAINT approval_requests_requestor_id_fkey 
FOREIGN KEY (requestor_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE approval_requests 
ADD CONSTRAINT approval_requests_approver_id_fkey 
FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 4: Update indexes to maintain performance
DROP INDEX IF EXISTS idx_approval_requests_requestor_id;
DROP INDEX IF EXISTS idx_approval_requests_approver_id;

CREATE INDEX IF NOT EXISTS idx_approval_requests_requestor_id ON approval_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id);

-- Step 5: Add a comment to document the change
COMMENT ON TABLE approval_requests IS 'Approval requests table - references users table for requestor_id and approver_id (migrated from admin_users)'; 