-- First, remove any existing constraints if they exist
ALTER TABLE IF EXISTS customers DROP CONSTRAINT IF EXISTS fk_customers_user;
ALTER TABLE IF EXISTS proposals DROP CONSTRAINT IF EXISTS fk_proposals_user;

-- Make sure the user_id columns exist
ALTER TABLE IF EXISTS customers ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE IF EXISTS proposals ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Update existing records - set all user_ids to null to avoid constraint violations
UPDATE customers SET user_id = NULL WHERE user_id IS NOT NULL;
UPDATE proposals SET user_id = NULL WHERE user_id IS NOT NULL;

-- Now we can add the foreign keys safely
ALTER TABLE IF EXISTS customers 
ADD CONSTRAINT fk_customers_user
FOREIGN KEY (user_id) REFERENCES users(clerk_id)
ON DELETE SET NULL;

ALTER TABLE IF EXISTS proposals
ADD CONSTRAINT fk_proposals_user
FOREIGN KEY (user_id) REFERENCES users(clerk_id)
ON DELETE SET NULL; 