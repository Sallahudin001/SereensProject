-- Add fields to proposal_offers table to store customizations
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS custom_name VARCHAR(255);
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS custom_description TEXT;
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS custom_discount_amount DECIMAL(10,2);
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS custom_discount_percentage DECIMAL(5,2);
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS custom_free_service TEXT;
ALTER TABLE proposal_offers ADD COLUMN IF NOT EXISTS created_by_user VARCHAR(255);

-- Add index for user tracking
CREATE INDEX IF NOT EXISTS idx_proposal_offers_created_by ON proposal_offers(created_by_user); 