-- Add new proposal statuses to support better draft management
ALTER TABLE proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN (
  'draft',
  'draft_in_progress',
  'draft_complete', 
  'draft_discount_review',
  'ready_to_send',
  'sent',
  'viewed',
  'signed',
  'completed',
  'rejected',
  'abandoned'
));

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_proposals_status_created 
ON proposals(status, created_at);

-- Add index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email 
ON customers(email);

-- Add composite index for finding recent drafts
CREATE INDEX IF NOT EXISTS idx_proposals_customer_status_created 
ON proposals(customer_id, status, created_at DESC);

-- Update any existing proposals with null status to 'draft'
UPDATE proposals 
SET status = 'draft' 
WHERE status IS NULL;

-- Make status column NOT NULL after setting defaults
ALTER TABLE proposals 
ALTER COLUMN status SET NOT NULL; 