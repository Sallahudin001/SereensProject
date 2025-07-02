-- Migration to improve proposal creation flow and prevent duplicates
-- This addresses the issue of multiple proposals being created with different PRO numbers

-- 1. Create a sequence for sequential proposal numbers
CREATE SEQUENCE IF NOT EXISTS proposal_number_seq START 10000;

-- 2. Add a unique constraint to prevent multiple active drafts per customer/user
-- First, let's handle any existing duplicates by keeping only the most recent one
WITH duplicate_proposals AS (
  SELECT 
    p.id,
    p.customer_id,
    p.user_id,
    p.status,
    p.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY p.customer_id, p.user_id, p.status 
      ORDER BY p.updated_at DESC, p.created_at DESC
    ) as rn
  FROM proposals p
  WHERE p.status IN ('draft', 'draft_in_progress', 'draft_complete')
)
DELETE FROM proposals 
WHERE id IN (
  SELECT id FROM duplicate_proposals WHERE rn > 1
);

-- 3. Create unique index to prevent future duplicates
-- Only one active draft per customer/user combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_draft_per_customer_user 
ON proposals(customer_id, user_id) 
WHERE status IN ('draft', 'draft_in_progress', 'draft_complete');

-- 4. Add better indexes for proposal lookups
CREATE INDEX IF NOT EXISTS idx_proposals_user_status_updated 
ON proposals(user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_customer_user_status 
ON proposals(customer_id, user_id, status);

-- 5. Add a function to generate sequential proposal numbers
CREATE OR REPLACE FUNCTION generate_proposal_number() 
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get next number from sequence
    SELECT nextval('proposal_number_seq') INTO next_num;
    
    -- Return formatted proposal number
    RETURN 'PRO-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. Add a function to find existing draft for customer/user combination
CREATE OR REPLACE FUNCTION find_existing_draft(
    p_customer_email TEXT,
    p_user_id TEXT,
    p_time_window INTERVAL DEFAULT INTERVAL '2 hours'
) 
RETURNS TABLE(proposal_id INTEGER, proposal_number TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.proposal_number
    FROM proposals p
    JOIN customers c ON p.customer_id = c.id
    WHERE c.email = p_customer_email 
    AND p.user_id = p_user_id
    AND p.status IN ('draft', 'draft_in_progress', 'draft_complete')
    AND p.updated_at > NOW() - p_time_window
    ORDER BY p.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 7. Add comments for clarity
COMMENT ON SEQUENCE proposal_number_seq IS 'Sequential counter for proposal numbers to ensure uniqueness';
COMMENT ON INDEX idx_one_draft_per_customer_user IS 'Prevents multiple active drafts per customer/user combination';
COMMENT ON FUNCTION generate_proposal_number() IS 'Generates sequential proposal numbers like PRO-10000, PRO-10001, etc.';
COMMENT ON FUNCTION find_existing_draft(TEXT, TEXT, INTERVAL) IS 'Finds existing draft proposals for a customer/user combination within a time window'; 