-- Add financing plan columns to proposals table
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS financing_plan_id INTEGER;

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS financing_plan_name VARCHAR(255);

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS merchant_fee DECIMAL(10,2);

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS financing_notes TEXT;

-- Add index for the financing plan relationship
CREATE INDEX IF NOT EXISTS idx_proposals_financing_plan ON proposals(financing_plan_id);

-- Add foreign key constraint if not already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_proposals_financing_plan'
    ) THEN
        ALTER TABLE proposals
        ADD CONSTRAINT fk_proposals_financing_plan
        FOREIGN KEY (financing_plan_id) 
        REFERENCES financing_plans(id)
        ON DELETE SET NULL;
    END IF;
END$$; 