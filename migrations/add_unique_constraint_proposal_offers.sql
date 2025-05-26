-- Add unique constraint to existing proposal_offers table
-- This prevents duplicate offer assignments to the same proposal

-- First, remove any existing duplicates (keep the most recent one)
DELETE FROM proposal_offers 
WHERE id NOT IN (
    SELECT DISTINCT ON (proposal_id, offer_type, offer_id) id
    FROM proposal_offers
    ORDER BY proposal_id, offer_type, offer_id, created_at DESC
);

-- Add the unique constraint
ALTER TABLE proposal_offers 
ADD CONSTRAINT unique_proposal_offer 
UNIQUE (proposal_id, offer_type, offer_id);

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposal_offers_expiration ON proposal_offers(expiration_date);
CREATE INDEX IF NOT EXISTS idx_proposal_offers_status ON proposal_offers(status); 