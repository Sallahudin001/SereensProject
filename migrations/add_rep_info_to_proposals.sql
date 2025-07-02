-- Add rep information fields to proposals table
-- This allows storing sales representative information with each proposal

-- Add rep fields to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS rep_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS rep_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS rep_phone VARCHAR(20);

-- Add indexes for better query performance on rep fields
CREATE INDEX IF NOT EXISTS idx_proposals_rep_name ON proposals(rep_first_name, rep_last_name);
CREATE INDEX IF NOT EXISTS idx_proposals_rep_phone ON proposals(rep_phone);

-- Add comments to explain the new columns
COMMENT ON COLUMN proposals.rep_first_name IS 'Sales representative first name associated with this proposal';
COMMENT ON COLUMN proposals.rep_last_name IS 'Sales representative last name associated with this proposal';
COMMENT ON COLUMN proposals.rep_phone IS 'Sales representative phone number for customer contact'; 