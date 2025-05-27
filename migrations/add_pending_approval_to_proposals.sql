-- Add pending_approval_request_id column to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pending_approval_request_id INTEGER REFERENCES approval_requests(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_pending_approval ON proposals(pending_approval_request_id);

-- Comment explaining the change
COMMENT ON COLUMN proposals.pending_approval_request_id IS 'Reference to approval_requests to track proposals with pending approvals'; 