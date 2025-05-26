-- Add user_id column to proposals table if it doesn't already exist
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Add foreign key constraint
ALTER TABLE proposals
ADD CONSTRAINT fk_proposals_user
FOREIGN KEY (user_id) REFERENCES users(clerk_id)
ON DELETE SET NULL; 